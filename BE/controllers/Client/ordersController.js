const axios = require("axios");
const OrderModel = require("../../models/ordersModel");
const OrderDetail = require("../../models/orderDetailsModel");
const UserModel = require("../../models/usersModel");
const CartModel = require("../../models/cartDetailsModel");
const PromotionModel = require("../../models/promotionsModel");
const ProductVariantModel = require("../../models/productVariantsModel");

const requestIp = require('request-ip');
const moment = require('moment');
const { Op } = require("sequelize");
const sequelize = require('../../config/database');

require("dotenv").config();
const nodemailer = require("nodemailer");

const { BACKEND_URL } = require("../../config/url");
const { FRONTEND_URL } = require("../../config/url");

const crypto = require("crypto");

const mongoose = require('mongoose');

// Định nghĩa schema Mongoose cho Payment
const paymentSchema = new mongoose.Schema({
    orderId: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    transactionId: { type: String }, // Mã giao dịch từ VNPay
    responseCode: { type: String }, // Mã phản hồi từ VNPay
    orderInfo: { type: String }, // Thông tin đơn hàng
    paymentDate: { type: Date, default: Date.now }, // Thời gian thanh toán
    status: { type: String, enum: ['success', 'failed'], default: 'success' }, // Trạng thái giao dịch
    ipAddr: { type: String }, // Địa chỉ IP của client
    bankCode: { type: String }, // Mã ngân hàng
});

const Payment = mongoose.model('Payment', paymentSchema);

class OrderController {

    static async get(req, res) {
        const userId = req.user.id;

        const { page = 1, limit = 10, status, startDate, endDate } = req.query;

        const currentPage = parseInt(page, 10);
        const perPage = parseInt(limit, 10);
        const offset = (currentPage - 1) * perPage;

        try {
            const whereClause = {
                user_id: userId,
            };

            if (startDate || endDate) {
                whereClause.created_at = {};

                if (startDate) {
                    whereClause.created_at[Op.gte] = new Date(startDate);
                }

                if (endDate) {
                    const endOfDay = new Date(endDate);
                    endOfDay.setHours(23, 59, 59, 999);
                    whereClause.created_at[Op.lte] = endOfDay;
                }
            }

            if (status && status !== "all") {
                whereClause.status = status;
            }

            const { count, rows } = await OrderModel.findAndCountAll({
                where: whereClause,
                include: [{ model: UserModel, as: "user" }],
                order: [["created_at", "DESC"]],
                offset,
                limit: perPage,
            });

            const filteredOrders = await OrderModel.findAll({
                where: whereClause,
                include: [{ model: UserModel, as: "user" }],
                order: [["created_at", "DESC"]],
            });

            const statusCounts = {
                all: filteredOrders.length,
                pending: 0,
                confirmed: 0,
                shipping: 0,
                completed: 0,
                delivered: 0,
                cancelled: 0
            };

            filteredOrders.forEach(order => {
                if (statusCounts.hasOwnProperty(order.status)) {
                    statusCounts[order.status]++;
                }
            });

            res.status(200).json({
                status: 200,
                message: "Lấy danh sách thành công",
                data: rows,
                pagination: {
                    totalItems: count,
                    currentPage,
                    totalPages: Math.ceil(count / perPage),
                },
                statusCounts
            });
        } catch (error) {
            console.error(
                "Lỗi khi lấy danh sách đơn hàng:",
                error.message,
                error.stack
            );
            res.status(500).json({
                success: false,
                message: "Lỗi máy chủ.",
            });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const {
                name,
                status,
                address,
                phone,
                email,
                total_price,
                payment_method_id,
            } = req.body;

            const order = await OrderModel.findByPk(id);
            if (!order) {
                return res.status(404).json({ message: "Id không tồn tại" });
            }

            if (name !== undefined) order.name = name;
            if (status !== undefined) order.status = status;
            if (address !== undefined) order.address = address;
            if (phone !== undefined) order.phone = phone;
            if (email !== undefined) order.email = email;
            if (total_price !== undefined) order.total_price = total_price;
            if (payment_method_id !== undefined)
                order.payment_method_id = payment_method_id;

            await order.save();

            res.status(200).json({
                status: 200,
                message: "Cập nhật thành công",
                data: order,
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async cancelOrder(req, res) {
        const t = await sequelize.transaction();
        try {
            const { id } = req.params;
            const { cancellation_reason } = req.body;

            const order = await OrderModel.findByPk(id);

            if (!order) {
                return res.status(404).json({ message: "Id không tồn tại" });
            }

            if (order.status !== "pending") {
                return res.status(400).json({
                    message: "Chỉ được hủy đơn hàng có trạng thái là 'Chờ xác nhận'",
                });
            }

            const orderDetails = await OrderDetail.findAll({
                where: { order_id: order.id },
                transaction: t
            });

            for (const detail of orderDetails) {
                const productVariant = await ProductVariantModel.findByPk(detail.product_variant_id, {
                    transaction: t,
                    lock: t.LOCK.UPDATE
                });

                if (productVariant) {
                    productVariant.stock += detail.quantity;
                    await productVariant.save({ transaction: t });
                }
            }

            const promo = await PromotionModel.findByPk(order.promotion_id);
            if (promo) {
                await promo.increment('quantity');

                if (promo.special_promotion) {
                    await PromotionUser.update(
                        { used: false },
                        {
                            where: {
                                promotion_id: promo.id,
                                user_id: order.user_id
                            }
                        }
                    );
                }
            }

            order.status = "cancelled";
            order.cancellation_reason = cancellation_reason || null;
            await order.save();
            await t.commit();

            res.status(200).json({
                status: 200,
                message: "Hủy đơn hàng thành công",
                data: order,
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async confirmDelivered(req, res) {
        try {
            const { id } = req.params;

            const order = await OrderModel.findByPk(id);
            if (!order) {
                return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
            }

            if (order.status !== "completed") {
                return res.status(400).json({
                    message: "Chỉ được xác nhận giao hàng cho đơn hàng có trạng thái 'Hoàn thành'",
                });
            }

            order.status = "delivered";
            await order.save();

            res.status(200).json({
                status: 200,
                message: "Xác nhận giao hàng thành công",
                data: order,
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async create(req, res) {
        const {
            products,
            user_id,
            name,
            phone,
            email,
            address,
            payment_method,
            promotion,
            note,
            shipping_fee,
            cancellation_reason,
            promo_discount
        } = req.body;

        if (!products || products.length === 0) {
            return res.status(400).json({ message: "Giỏ hàng trống." });
        }

        if (!user_id) {
            return res.status(400).json({ message: "Thiếu user_id trong yêu cầu." });
        }

        const t = await sequelize.transaction();
        try {
            let totalPrice = 0;
            const detailedCart = [];

            for (const item of products) {
                const variant = item.variant;
                if (!variant) {
                    await t.rollback();
                    return res.status(400).json({ message: "Thông tin biến thể sản phẩm bị thiếu." });
                }

                const productVariant = await ProductVariantModel.findByPk(variant.id, {
                    transaction: t,
                    lock: t.LOCK.UPDATE,
                });

                if (!productVariant) {
                    await t.rollback();
                    return res.status(400).json({ message: `Biến thể sản phẩm với ID ${variant.id} không tồn tại.` });
                }

                if (productVariant.stock < item.quantity) {
                    await t.rollback();
                    return res.status(400).json({ message: `Sản phẩm ${variant.sku} không đủ số lượng tồn kho.` });
                }

                const price = parseFloat(variant.price);
                totalPrice += price * item.quantity;

                detailedCart.push({
                    variant: variant.id,
                    name: variant.sku,
                    price: price,
                    quantity: item.quantity,
                    total: price * item.quantity,
                });

                productVariant.stock -= item.quantity;
                await productVariant.save({ transaction: t });

            }

            let selectedVoucher = null;
            let specialDiscount = parseFloat(promo_discount) || 0;
            let discountAmount = 0;

            if (promotion) {
                selectedVoucher = await PromotionModel.findByPk(promotion, { transaction: t, lock: t.LOCK.UPDATE });
                if (selectedVoucher) {
                    const now = new Date();
                    if (
                        selectedVoucher.status !== 'active' ||
                        now < selectedVoucher.start_date ||
                        now > selectedVoucher.end_date ||
                        selectedVoucher.quantity <= 0 ||
                        totalPrice < selectedVoucher.min_price_threshold
                    ) {
                        await t.rollback();
                        return res.status(400).json({ message: "Mã khuyến mãi không hợp lệ hoặc không đủ điều kiện." });
                    }

                    if (selectedVoucher.special_promotion) {
                        const promoUser = await PromotionModel.findOne({
                            where: {
                                promotion_id: selectedVoucher.id,
                                user_id,
                                email_sent: true,
                                used: { [Op.not]: true },
                            },
                            transaction: t,
                            lock: t.LOCK.UPDATE,
                        });

                        if (!promoUser) {
                            await t.rollback();
                            return res.status(403).json({ message: "Bạn không đủ điều kiện sử dụng mã khuyến mãi." });
                        }

                        promoUser.used = true;
                        await promoUser.save({ transaction: t });
                    }

                    if (selectedVoucher.discount_type === 'fixed') {
                        discountAmount = Math.min(selectedVoucher.discount_value, totalPrice);
                    } else if (selectedVoucher.discount_type === 'percentage') {
                        const maxPrice = selectedVoucher.max_price || Infinity;
                        discountAmount = Math.min((totalPrice * selectedVoucher.discount_value) / 100, maxPrice);
                    }

                    totalPrice -= discountAmount;
                    selectedVoucher.quantity -= 1;
                    await selectedVoucher.save({ transaction: t });
                }
            }

            if (specialDiscount > 0) {
                specialDiscount = Math.min(specialDiscount, totalPrice);
                totalPrice -= specialDiscount;
            }

            const order_code = `ORD-${Date.now()}`;
            const currentDateTime = new Date(Date.now() + 7 * 60 * 60 * 1000);
            const finalTotal = totalPrice + (shipping_fee || 0);

            const newOrder = await OrderModel.create({
                user_id,
                promotion_id: promotion || null,
                name,
                phone,
                email,
                address,
                total_price: finalTotal,
                payment_method,
                order_code,
                shipping_address: address,
                note: note,
                shipping_fee: shipping_fee || 0,
                status: "pending",
                cancellation_reason: note || null,
                shipping_code: null,
                discount_amount: discountAmount,
                special_discount_amount: specialDiscount
            }, { transaction: t });

            const orderDetails = detailedCart.map((item) => ({
                order_id: newOrder.id,
                product_variant_id: item.variant,
                quantity: item.quantity,
                price: item.price,
            }));

            await OrderDetail.bulkCreate(orderDetails, { transaction: t });

            await t.commit();

            await OrderController.sendOrderConfirmationEmail(
                newOrder,
                { name, phone },
                products,
                email,
                currentDateTime
            );

            const successfullyOrderedProductIds = products.map(p => p.variant.id);

            return res.status(201).json({
                success: true,
                message: "Đặt hàng thành công.",
                data: {
                    order: newOrder,
                    successfullyOrderedProductIds
                },
            });
        } catch (error) {
            await t.rollback();
            console.error("Lỗi khi tạo đơn hàng:", error.message);
            return res.status(500).json({
                success: false,
                message: "Lỗi máy chủ khi tạo đơn hàng.",
                error: error.message,
            });
        }
    }

    static async createMomoUrl(req, res) {
        const {
            products,
            user_id,
            name,
            phone,
            email,
            address,
            note,
            payment_method,
            shipping_fee,
            promotion,
            orderId,
            promo_discount
        } = req.body;

        if (!products || products.length === 0) {
            return res.status(400).json({ message: "Giỏ hàng trống." });
        }

        if (!user_id) {
            return res.status(400).json({ message: "Thiếu user_id trong yêu cầu." });
        }

        try {
            let totalPrice = 0;
            const detailedCart = [];

            for (const item of products) {
                const variant = item.variant;

                if (!variant) {
                    return res.status(400).json({ message: "Thông tin biến thể sản phẩm bị thiếu." });
                }

                const price = parseFloat(variant.price);
                totalPrice += price * item.quantity;

                detailedCart.push({
                    product_id: variant.id,
                    name: variant.sku,
                    price: price,
                    quantity: item.quantity,
                    total: price * item.quantity,
                });
            }

            let selectedVoucher = null;
            let discountAmount = 0;
            let finalAmount = totalPrice;
            let specialDiscount = parseFloat(promo_discount) || 0;

            if (promotion) {
                selectedVoucher = await PromotionModel.findByPk(promotion);
                if (selectedVoucher) {
                    const now = new Date();
                    if (
                        selectedVoucher.status !== 'active' ||
                        now < selectedVoucher.start_date ||
                        now > selectedVoucher.end_date ||
                        selectedVoucher.quantity <= 0 ||
                        totalPrice < parseFloat(selectedVoucher.min_price_threshold)
                    ) {
                        return res.status(400).json({ message: "Mã khuyến mãi không hợp lệ hoặc không đủ điều kiện." });
                    }

                    if (selectedVoucher.special_promotion) {
                        const promoUser = await PromotionModel.findOne({
                            where: {
                                promotion_id: selectedVoucher.id,
                                user_id,
                                email_sent: true,
                                used: { [Op.not]: true },
                            }
                        });

                        if (!promoUser) {
                            return res.status(403).json({ message: "Bạn không đủ điều kiện sử dụng mã khuyến mãi." });
                        }
                    }

                    if (selectedVoucher.discount_type === 'fixed') {
                        discountAmount = Math.min(parseFloat(selectedVoucher.discount_value), totalPrice);
                    } else if (selectedVoucher.discount_type === 'percentage') {
                        const maxPrice = parseFloat(selectedVoucher.max_price || '999999999');
                        discountAmount = Math.min(
                            (totalPrice * parseFloat(selectedVoucher.discount_value)) / 100,
                            maxPrice
                        );
                    }

                    finalAmount = totalPrice - discountAmount;
                }
            }

            if (specialDiscount > 0) {
    specialDiscount = Math.min(specialDiscount, finalAmount);
    finalAmount -= specialDiscount;
}

            const finalTotalWithShipping = finalAmount + (parseFloat(shipping_fee) || 0);

            const simplifiedProducts = products.map(item => ({
                variant: {
                    id: item.variant.id,
                    sku: item.variant.sku,
                    price: parseFloat(item.variant.price)
                },
                quantity: item.quantity
            }));

            const order_code = req.body.orderId;

            const extraData = Buffer.from(JSON.stringify({
                user_id,
                name,
                phone,
                email,
                address,
                note,
                products: simplifiedProducts,
                promotion,
                orderId: order_code,
                amount: finalTotalWithShipping,
                originalAmount: totalPrice,
                discountAmount: discountAmount,
                specialDiscount: specialDiscount,
                shipping_fee: shipping_fee || 0
            })).toString("base64");

            const endpoint = "https://test-payment.momo.vn/v2/gateway/api/create";
            const partnerCode = "MOMOBKUN20180529";
            const accessKey = "klm05TvNBzhg7h7j";
            const secretKey = "at67qH6mk8w5Y1nAyMoYKMWACiEi2bsa";
            const amount = finalTotalWithShipping.toString();
            const orderId = order_code;
            const requestId = Date.now().toString();

            const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${BACKEND_URL}/payment-notification&orderId=${orderId}&orderInfo=MoMo&partnerCode=${partnerCode}&redirectUrl=${FRONTEND_URL}/cart&requestId=${requestId}&requestType=payWithATM`;

            const signature = crypto
                .createHmac("sha256", secretKey)
                .update(rawSignature)
                .digest("hex");

            const momoData = {
                partnerCode,
                partnerName: "Test",
                storeId: "MomoTestStore",
                requestId,
                amount,
                orderId,
                orderInfo: "MoMo",
                redirectUrl: `${FRONTEND_URL}/cart`,
                ipnUrl: `${BACKEND_URL}/payment-notification`,
                requestType: "payWithATM",
                extraData,
                lang: "vi",
                signature
            };

            const response = await axios.post(endpoint, momoData, {
                headers: { "Content-Type": "application/json" },
            });

            if (response.data && response.data.payUrl) {
                return res.json({
                    success: true,
                    data: {
                        payUrl: response.data.payUrl,
                        order_code: order_code,
                        originalAmount: totalPrice,
                        discountAmount: discountAmount,
                        specialDiscount: specialDiscount,
                        finalAmount: finalAmount
                    }
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: "Không thể tạo URL thanh toán MoMo.",
                    error: response.data
                });
            }
        } catch (error) {
            if (error.response) {
                const momoError = error.response.data;
                console.error("Lỗi phản hồi MoMo:", momoError);

                if (momoError?.resultCode === 22) {
                    return res.status(400).json({
                        message: "Số tiền thanh toán không hợp lệ: phải từ 10.000đ đến 50.000.000đ.",
                        error: momoError
                    });
                }

                return res.status(400).json({
                    message: "Giao dịch bị từ chối bởi MoMo.",
                    error: momoError
                });
            } else {
                console.error("Lỗi khác:", error.message);

                return res.status(500).json({
                    message: "Lỗi máy chủ khi tạo thanh toán.",
                    error: error.message
                });
            }
        }
    }

    static async momoPaymentNotification(req, res) {
        const { resultCode, orderId, amount, extraData } = req.body;

        if (resultCode !== 0) {
            return res.status(200).json({ message: "Thanh toán thất bại hoặc bị hủy." });
        }

        const t = await sequelize.transaction();
        try {
            const decoded = JSON.parse(Buffer.from(extraData, "base64").toString("utf-8"));

            const {
                user_id,
                name,
                phone,
                email,
                address,
                note,
                products,
                promotion,
                shipping_fee,
                specialDiscount
            } = decoded;

            let totalPrice = 0;
            const detailedCart = [];

            for (const item of products) {
                const variant = item.variant;
                if (!variant) {
                    console.error("Thiếu variant trong product:", item);
                    await t.rollback();
                    return res.status(400).json({ message: "Thông tin biến thể sản phẩm bị thiếu." });
                }

                const variantExists = await ProductVariantModel.findByPk(variant.id, { transaction: t });
                if (!variantExists) {
                    console.error("Biến thể sản phẩm không tồn tại:", variant.id);
                    await t.rollback();
                    return res.status(400).json({ message: "Biến thể sản phẩm không tồn tại." });
                }

                const price = parseFloat(variant.price);
                totalPrice += price * item.quantity;
                detailedCart.push({
                    product_id: variant.id,
                    name: variant.sku,
                    price: price,
                    quantity: item.quantity,
                    total: price * item.quantity,
                });
            }

            let finalSpecialDiscount = parseFloat(specialDiscount) || 0;
            if (finalSpecialDiscount > 0) {
                finalSpecialDiscount = Math.min(finalSpecialDiscount, totalPrice);
                totalPrice -= finalSpecialDiscount;
            }

            let selectedVoucher = null;
            let discountAmount = 0;

            if (promotion) {
                selectedVoucher = await PromotionModel.findByPk(promotion, {
                    transaction: t,
                    lock: t.LOCK.UPDATE,
                });

                if (selectedVoucher) {
                    const now = new Date();
                    if (
                        selectedVoucher.status !== 'active' ||
                        now < selectedVoucher.start_date ||
                        now > selectedVoucher.end_date ||
                        selectedVoucher.quantity <= 0 ||
                        totalPrice < selectedVoucher.min_price_threshold
                    ) {
                        await t.rollback();
                        return res.status(400).json({ message: "Mã khuyến mãi không hợp lệ hoặc không đủ điều kiện." });
                    }

                    if (selectedVoucher.special_promotion) {
                        const promoUser = await PromotionModel.findOne({
                            where: {
                                promotion_id: selectedVoucher.id,
                                user_id,
                                email_sent: true,
                                used: { [Op.not]: true },
                            },
                            transaction: t,
                            lock: t.LOCK.UPDATE,
                        });

                        if (!promoUser) {
                            await t.rollback();
                            return res.status(403).json({ message: "Bạn không đủ điều kiện sử dụng mã khuyến mãi." });
                        }

                        promoUser.used = true;
                        await promoUser.save({ transaction: t });
                    }

                    if (selectedVoucher.discount_type === 'fixed') {
                        discountAmount = Math.min(parseFloat(selectedVoucher.discount_value), totalPrice);
                    } else if (selectedVoucher.discount_type === 'percentage') {
                        const maxPrice = parseFloat(selectedVoucher.max_price || '999999999');
                        discountAmount = Math.min(
                            (totalPrice * parseFloat(selectedVoucher.discount_value)) / 100,
                            maxPrice
                        );
                    }

                    totalPrice -= discountAmount;

                    selectedVoucher.quantity -= 1;
                    await selectedVoucher.save({ transaction: t });
                }
            }
            const finalTotalWithShipping = totalPrice + (parseFloat(shipping_fee) || 0);

            if (parseFloat(amount) !== finalTotalWithShipping) {
                console.error("Số tiền không khớp:", { amount, finalTotalWithShipping });
                await t.rollback();
                return res.status(400).json({ message: "Số tiền thanh toán không khớp với tổng tiền đơn hàng." });
            }

            const newOrder = await OrderModel.create({
                user_id,
                promotion_id: promotion || null,
                name,
                phone,
                email,
                address,
                total_price: parseFloat(amount),
                payment_method: "Momo",
                order_code: orderId,
                shipping_address: address,
                note: note || "",
                shipping_fee: parseFloat(shipping_fee) || 0,
                status: "pending",
                cancellation_reason: null,
                shipping_code: null,
                discount_amount: discountAmount,
                special_discount_amount: finalSpecialDiscount
            }, { transaction: t });

            const orderDetails = detailedCart.map((item) => ({
                order_id: newOrder.id,
                product_variant_id: item.product_id,
                quantity: item.quantity,
                price: item.price,
            }));

            await OrderDetail.bulkCreate(orderDetails, { transaction: t });

            const successfullyOrderedProductIds = products.map(p => p.variant.id);

            await CartModel.destroy({
                where: {
                    user_id,
                    product_variant_id: successfullyOrderedProductIds,
                },
                transaction: t
            });

            await t.commit();

            await OrderController.sendOrderConfirmationEmail(
                newOrder,
                { name, phone },
                products,
                email,
                new Date()
            );

            return res.status(200).json({
                success: true,
                message: "Đơn hàng đã được tạo sau khi thanh toán thành công.",
                data: {
                    order: newOrder,
                    successfullyOrderedProductIds
                }
            });
        } catch (err) {
            await t.rollback();
            console.error("Lỗi xử lý ipn:", err);
            return res.status(500).json({ message: "Lỗi xử lý thông báo thanh toán.", error: err.message });
        }
    }

    static sortObject(obj) {
        const ordered = {};
        const keys = [
            'vnp_Version', 'vnp_Command', 'vnp_TmnCode',
            'vnp_Locale', 'vnp_CurrCode', 'vnp_TxnRef',
            'vnp_OrderInfo', 'vnp_Amount', 'vnp_ReturnUrl',
            'vnp_IpAddr', 'vnp_CreateDate', 'vnp_BankCode',
            'vnp_OrderType'
        ].sort();
        keys.forEach(key => {
            if (obj[key] !== undefined && obj[key] !== null && obj[key] !== '') {
                ordered[key] = obj[key];
            }
        });
        return ordered;
    }

static async createVNPayUrl(req, res) {
        try {
            const requiredEnvVars = ['VNPAY_TMN_CODE', 'VNPAY_HASH_SECRET', 'VNPAY_PAYMENT_URL', 'VNPAY_RETURN_URL'];
            for (const envVar of requiredEnvVars) {
                if (!process.env[envVar]) {
                    throw new Error(`Thiếu biến môi trường bắt buộc: ${envVar}`);
                }
            }

            let ipAddr = requestIp.getClientIp(req) || '127.0.0.1';

            const tmnCode = process.env.VNPAY_TMN_CODE.trim();
            const secretKey = process.env.VNPAY_HASH_SECRET.trim();
            const vnpUrl = process.env.VNPAY_PAYMENT_URL.trim();
            const returnUrl = process.env.VNPAY_RETURN_URL.trim();

            const amount = Math.floor(Number(req.body.amount));
            if (isNaN(amount) || amount <= 0 || amount > 9999999999) {
                return res.status(400).json({ code: '03', message: 'Số tiền không hợp lệ' });
            }

            const createDate = moment().format("YYYYMMDDHHmmss");
            const orderId = req.body.orderId || `VNPAY-${Date.now()}`;

            const orderInfo = (req.body.orderDescription || `Thanh toán đơn hàng ${orderId}`)
                .substring(0, 255);

            const vnpParams = {
                vnp_Version: '2.1.0',
                vnp_Command: 'pay',
                vnp_TmnCode: tmnCode,
                vnp_Amount: amount * 100,
                vnp_CreateDate: createDate,
                vnp_CurrCode: 'VND',
                vnp_IpAddr: ipAddr,
                vnp_Locale: 'vn',
                vnp_OrderInfo: orderInfo,
                vnp_OrderType: req.body.orderType || 'other',
                vnp_ReturnUrl: returnUrl,
                vnp_TxnRef: orderId,
                vnp_BankCode: req.body.bankCode || ''
            };

            const sortedParams = OrderController.sortObject(vnpParams);

            const signData = Object.entries(sortedParams)
                .map(([key, val]) => `${key}=${encodeURIComponent(val).replace(/%20/g, '+')}`)
                .join('&');

            const hmac = crypto.createHmac("sha512", secretKey);
            hmac.update(Buffer.from(signData, 'utf-8'));
            const signed = hmac.digest('hex');

            sortedParams.vnp_SecureHash = signed;

            const queryString = Object.entries(sortedParams)
                .map(([key, val]) => `${key}=${encodeURIComponent(val).replace(/%20/g, '+')}`)
                .join('&');
            const paymentUrl = `${vnpUrl}?${queryString}`;

            return res.json({
                success: true,
                paymentUrl
            });

        } catch (error) {
            console.error('Lỗi VNPay:', error);
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    static async handleVNPayCallback(req, res) {
        try {
            const vnpParams = req.query;
            const secureHash = vnpParams.vnp_SecureHash;
            const orderId = vnpParams.vnp_TxnRef;
            const amount = vnpParams.vnp_Amount ? (vnpParams.vnp_Amount / 100) : 0;

            // Xóa các tham số liên quan đến chữ ký để kiểm tra
            delete vnpParams.vnp_SecureHash;
            delete vnpParams.vnp_SecureHashType;

            const sortedParams = OrderController.sortObject(vnpParams);
            const signData = Object.entries(sortedParams)
                .map(([key, val]) => `${key}=${encodeURIComponent(val).replace(/%20/g, '+')}`)
                .join('&');

            const secretKey = process.env.VNPAY_HASH_SECRET.trim();
            const hmac = crypto.createHmac('sha512', secretKey);
            const calculatedHash = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

            if (calculatedHash !== secureHash) {
                console.error('Chữ ký không khớp!');
                return res.redirect(`${process.env.FRONTEND_URL}/payment/failed?error=Invalid_signature&orderId=${orderId}`);
            }

            if (vnpParams.vnp_ResponseCode !== '00') {
                console.error('Giao dịch thất bại với mã:', vnpParams.vnp_ResponseCode);
                // Lưu thông tin giao dịch thất bại vào cơ sở dữ liệu
                await Payment.create({
                    orderId,
                    amount,
                    transactionId: vnpParams.vnp_TransactionNo,
                    responseCode: vnpParams.vnp_ResponseCode,
                    orderInfo: vnpParams.vnp_OrderInfo,
                    status: 'failed',
                    ipAddr: vnpParams.vnp_IpAddr,
                    bankCode: vnpParams.vnp_BankCode,
                });

                return res.redirect(`${process.env.FRONTEND_URL}/payment/failed?error=Transaction_failed&code=${vnpParams.vnp_ResponseCode}&orderId=${orderId}`);
            }

            // Lưu thông tin giao dịch thành công vào cơ sở dữ liệu
            await Payment.create({
                orderId,
                amount,
                transactionId: vnpParams.vnp_TransactionNo,
                responseCode: vnpParams.vnp_ResponseCode,
                orderInfo: vnpParams.vnp_OrderInfo,
                status: 'success',
                ipAddr: vnpParams.vnp_IpAddr,
                bankCode: vnpParams.vnp_BankCode,
            });

            return res.redirect(`${process.env.FRONTEND_URL}/payment/success?orderId=${orderId}&amount=${amount}`);

        } catch (error) {
            console.error('Lỗi callback:', error);
            const orderId = req.query.vnp_TxnRef || 'unknown';
            return res.redirect(`${process.env.FRONTEND_URL}/payment/failed?error=Callback_error&orderId=${orderId}`);
        }
    }

    static async sendOrderConfirmationEmail(order, user, products, customerEmail, currentDateTime) {
        try {
            let transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });

            const currentDateTimeUTC = new Date();
            const formattedDate = currentDateTimeUTC.toLocaleString("vi-VN", {
                timeZone: "Asia/Ho_Chi_Minh",
                hour12: false,
            });
            const formattedPrice = new Intl.NumberFormat("vi-VN").format(
                order.total_price
            );
            const formattedShipping = new Intl.NumberFormat("vi-VN").format(
                order.shipping_fee || 0
            );

            const productsHTML = products.map(item => {
                const variant = item.variant;
                const productName = variant?.product?.name || "Sản phẩm không xác định";
                const price = new Intl.NumberFormat("vi-VN").format(variant?.price || 0);
                const imageUrl = variant?.images?.[0]?.image_url;
                const attributeValues = variant?.attributeValues ?? [];
                const attributes = Array.isArray(attributeValues) ? attributeValues.map(attr => attr.value).join(' - ') : 'Không xác định';

                return `
            <div class="product">
                <img src="${imageUrl}" alt="${productName}">
                <div class="product-info">
                <p style="margin-left: 10px;"><strong>${productName} (${attributes})</strong></p>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-left: 10px; margin-top: 4px;">
                    <span style="font-size: 14px;">${price}₫</span>
                <span style="font-size: 13px; color: #555; margin-left: auto;">×${item.quantity}</span>
                </div>
                </div>
            </div>
            `;
            }).join('');

            const subtotal = products.reduce((sum, item) => sum + (item.variant.price * item.quantity), 0);
            const discount = order.discount_amount || 0;
            const shippingFee = order.shipping_fee || 0;
            const total = subtotal + shippingFee - discount;

            const htmlContent = `
        <!DOCTYPE html>
        <html lang="vi">
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
            <title>Xác nhận đơn hàng</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background: #f5f5f5;
                    padding: 20px;
                    color: #333;
                }
                .order-container {
                    max-width: 400px;
                    margin: auto;
                    background: #fff;
                    border-radius: 8px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    padding: 16px;
                }
                .shop-name {
                    font-weight: bold;
                    font-size: 16px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    margin-bottom: 12px;
                }
                .product {
                    display: flex;
                    gap: 10px;
                    margin: 16px 0;
                    border-bottom: 1px solid #eee;
                    padding-bottom: 16px;
                }
                .product img {
                    width: 80px;
                    height: 80px;
                    object-fit: cover;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                }
                .product-info {
                    flex-grow: 1;
                    font-size: 13px;
                }
                .price {
                    font-weight: bold;
                    font-size: 14px;
                    margin-top: 4px;
                }
                .summary {
                    margin-top: 20px;
                }
                .summary-title {
                    font-weight: bold;
                    margin-bottom: 10px;
                    font-size: 15px;
                }
                .summary-row {
                    display: flex;
                    justify-content: space-between;
                    font-size: 14px;
                    margin: 6px 0;
                }
                .total {
                    font-weight: bold;
                    font-size: 15px;
                    border-top: 1px solid #ddd;
                    padding-top: 10px;
                }
                .discount {
                    color: #008000;
                }
            </style>
        </head>
        <body>
            <div class="order-container">

                ${productsHTML}

                <div style="border-bottom: 1px solid #eee; padding-bottom: 12px; margin-bottom: 16px;">
                    <div style="display: flex; justify-content: space-between; width: 100%; margin-bottom: 8px;">
                        <span style="color: #666;">Mã đơn hàng:</span>
                        <span style="font-size: 13px; color: #555; margin-left: auto;"">${order.order_code}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; width: 100%; margin-bottom: 8px;">
                        <span style="color: #666;">Ngày đặt hàng:</span>
                        <span style="font-size: 13px; color: #555; margin-left: auto;"">${formattedDate}</span>
                    </div>
                </div>

                <div class="summary">
                    <div class="summary-title">Tóm tắt kiện hàng</div>

                    <div class="summary-row">
                        <span>Tổng phụ</span>
                        <span style="font-size: 13px; color: #555; margin-left: auto;">${new Intl.NumberFormat("vi-VN").format(subtotal)}₫</span>
                    </div>

                    <div class="summary-row">
                        <span>Vận chuyển</span>
                        <span style="font-size: 13px; color: #555; margin-left: auto;">+ ${new Intl.NumberFormat("vi-VN").format(shippingFee)}₫</span>
                    </div>

                    ${discount > 0 ? `
                    <div class="summary-row">
                        <span>Phiếu giảm giá</span>
                        <span style="font-size: 13px; color: #555; margin-left: auto;">- ${new Intl.NumberFormat("vi-VN").format(discount)}₫</span>
                    </div>
                    ` : ''}

                    <div class="summary-row total">
                        <span>Tổng (${products.length} mặt hàng)</span>
                        <span style="font-size: 13px; color: #555; margin-left: auto;">${new Intl.NumberFormat("vi-VN").format(total)}₫</span>
                    </div>
                    </div>
            </div>
        </body>
        </html>
        `;

            const mailOptions = {
                from: `"Cửa hàng của bạn" <${process.env.EMAIL_USER}>`,
                to: customerEmail,
                subject: `Xác nhận đơn hàng #${order.order_code}`,
                html: htmlContent
            };

            await transporter.sendMail(mailOptions);
        } catch (error) {
            console.error("Lỗi gửi email xác nhận đơn hàng:", error);
            throw new Error("Không thể gửi email xác nhận đơn hàng.");
        }
    }
}

module.exports = OrderController;
