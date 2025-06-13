const axios = require("axios");
const OrderModel = require("../../models/ordersModel");
const OrderDetail = require("../../models/orderDetailsModel");
const UserModel = require("../../models/usersModel");
const Product = require("../../models/productsModel");
const PromotionModel = require("../../models/promotionsModel");
const { Op } = require("sequelize");

require("dotenv").config();
const nodemailer = require("nodemailer");

const { BACKEND_URL } = require("../../config/url");
const crypto = require("crypto");

class OrderController {
    static async get(req, res) {
        const userId = req.query.userId;

        if (!userId) {
            return res
                .status(401)
                .json({ success: false, message: "Chưa đăng nhập" });
        }

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

            res.status(200).json({
                status: 200,
                message: "Lấy danh sách thành công",
                data: rows,
                pagination: {
                    totalItems: count,
                    currentPage,
                    totalPages: Math.ceil(count / perPage),
                },
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

    static async delete(req, res) {
        try {
            const { id } = req.params;

            const order = await OrderModel.findByPk(id);
            if (!order) {
                return res.status(404).json({ message: "Id không tồn tại" });
            }

            if (order.status !== "pending") {
                return res.status(400).json({
                    message: "Chỉ được hủy đơn hàng có trạng thái là 'Chờ xác nhận'",
                });
            }

            order.status = "cancelled";
            await order.save();

            res.status(200).json({
                status: 200,
                message: "Hủy đơn hàng thành công",
                data: order,
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async create(req, res) {
        try {
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
            } = req.body;

            if (!products || products.length === 0) {
                return res.status(400).json({ message: "Giỏ hàng trống." });
            }

            let totalPrice = 0;
            const detailedCart = [];

            for (const item of products) {
                const variant = item.variant;
                if (!variant) {
                    return res
                        .status(400)
                        .json({ message: "Thông tin biến thể sản phẩm bị thiếu." });
                }
                const price = variant.price;
                totalPrice += price * item.quantity;

                detailedCart.push({
                    product_id: variant.id,
                    name: variant.sku,
                    price: price,
                    quantity: item.quantity,
                    total: price * item.quantity,
                });
            }

            if (req.body.promotion) {
                let selectedVoucher = null;

                selectedVoucher = await PromotionModel.findByPk(req.body.promotion);

                if (selectedVoucher) {
                    let discount = 0;

                    if (selectedVoucher.discount_type === "fixed") {
                        discount = Math.min(selectedVoucher.discount_value, totalPrice);
                    } else if (selectedVoucher.discount_type === "percentage") {
                        const maxPrice = selectedVoucher.max_price || Infinity;
                        discount = Math.min(
                            (totalPrice * selectedVoucher.discount_value) / 100,
                            maxPrice
                        );
                    }

                    totalPrice -= discount;
                }
            }

            if (!user_id) {
                return res
                    .status(400)
                    .json({ message: "Thiếu user_id trong yêu cầu." });
            }

            const currentDateTime = new Date(
                new Date().getTime() + 7 * 60 * 60 * 1000
            );
            const order_code = `ORD-${Date.now()}`;

            const newOrder = await OrderModel.create({
                user_id,
                promotion_id: req.body.promotion || null,
                name,
                phone,
                email,
                address,
                total_price: totalPrice,
                payment_method,
                order_code,
                shipping_address: address,
                note: note,
                shipping_fee: 0,
                status: "pending",
                cancellation_reason: null,
                shipping_code: null,
            });

            const orderDetails = detailedCart.map((item) => ({
                order_id: newOrder.id,
                product_variant_id: item.product_id,
                quantity: item.quantity,
                price: item.price,
            }));

            await OrderDetail.bulkCreate(orderDetails);
            await OrderController.sendOrderConfirmationEmail(
                newOrder,
                { name, phone },
                products,
                email,
                currentDateTime
            );

            return res.status(201).json({
                success: true,
                message: "Đặt hàng thành công.",
                data: {
                    order: newOrder,
                },
            });
        } catch (error) {
            console.error("Lỗi khi tạo đơn hàng:", error.message);
            return res.status(500).json({
                success: false,
                message: "Lỗi máy chủ khi tạo đơn hàng.",
                error: error.message,
            });
        }
    }

    static async createMomoUrl(req, res) {
        try {
            const { products, user_id, name, phone, email, address, note } = req.body;

            if (!products || products.length === 0) {
                return res.status(400).json({ message: "Giỏ hàng trống." });
            }

            let totalPrice = 0;
            for (const item of products) {
                const variant = item.variant;
                if (!variant) {
                    return res.status(400).json({ message: "Thiếu biến thể sản phẩm." });
                }
                totalPrice += variant.price * item.quantity;
            }

            const endpoint = "https://test-payment.momo.vn/v2/gateway/api/create";
            const partnerCode = "MOMOBKUN20180529";
            const accessKey = "klm05TvNBzhg7h7j";
            const secretKey = "at67qH6mk8w5Y1nAyMoYKMWACiEi2bsa";
            const amount = totalPrice.toString();
            const orderId = `ORD-${Date.now()}`;
            const requestId = Date.now().toString();
            const extraData = Buffer.from(JSON.stringify({
                user_id,
                name,
                phone,
                email,
                address,
                note,
                products
            })).toString("base64");

            const rawSignature =
                `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${BACKEND_URL}/payment-notification&orderId=${orderId}&orderInfo=Thanh toán bằng momo&partnerCode=${partnerCode}&redirectUrl=${BACKEND_URL}/cart&requestId=${requestId}&requestType=payWithATM`;

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
                orderInfo: "Thanh toán bằng momo",
                redirectUrl: `${BACKEND_URL}/cart`,
                ipnUrl: `${BACKEND_URL}/payment-notification`,
                requestType: "payWithATM",
                extraData,
                lang: "vi",
                signature
            };

            let response;
            try {
                response = await axios.post(endpoint, momoData, {
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
            } catch (err) {
                const momoError = err.response?.data;

                console.error("LỖI TỪ AXIOS:", {
                    status: err.response?.status,
                    data: momoError,
                    message: err.message,
                });

                if (
                    momoError?.resultCode === 22 &&
                    momoError?.message?.includes("số tiền giao dịch")
                ) {
                    return res.status(400).json({
                        success: false,
                        message: "Số tiền thanh toán không hợp lệ: từ 10.000đ đến 50.000.000đ.",
                    });
                }

                if (
                    momoError?.message?.includes("Giao dịch bị từ chối") &&
                    momoError?.message?.includes("nhà phát hành")
                ) {
                    return res.status(400).json({
                        success: false,
                        message: "Giao dịch bị từ chối bởi ngân hàng. Vui lòng thử lại hoặc chọn phương thức khác.",
                    });
                }

                return res.status(400).json({
                    success: false,
                    message: momoError?.message || "Lỗi khi tạo thanh toán.",
                });
            }

            const result = response.data;

            if (result?.payUrl) {
                return res.json({
                    success: true,
                    data: {
                        payUrl: result.payUrl,
                        order_code: orderId,
                    },
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: "Không thể tạo URL thanh toán MoMo.",
                    detail: result,
                });
            }
        } catch (error) {
            console.error("Lỗi:", error.message);
            return res.status(500).json({
                success: false,
                message: "Lỗi máy chủ khi tạo thanh toán.",
            });
        }
    }

    static async momoPaymentNotification(req, res) {
        const {
            resultCode,
            orderId,
            amount,
            extraData
        } = req.body;

        if (resultCode !== 0) {
            return res.status(200).json({ message: "Thanh toán thất bại hoặc bị hủy." });
        }

        try {
            const orderExists = await OrderModel.findOne({ where: { order_code: orderId } });
            if (orderExists) {
                return res.status(200).json({ message: "Đơn hàng đã tồn tại." });
            }

            const decoded = JSON.parse(Buffer.from(extraData, "base64").toString("utf-8"));

            const newOrder = await OrderModel.create({
                user_id: decoded.user_id,
                promotion: null,
                name: decoded.name,
                phone: decoded.phone,
                email: decoded.email,
                address: decoded.address,
                total_price: amount,
                payment_method: "Momo",
                order_code: orderId,
                shipping_address: decoded.address,
                note: decoded.note,
                shipping_fee: 0,
                status: "pending",
                cancellation_reason: null,
                shipping_code: null,
                payment_url: null,
            });

            await OrderController.sendOrderConfirmationEmail(
                newOrder,
                decoded,
                decoded.products,
                decoded.email,
                new Date()
            );

            return res.status(200).json({ message: "Đơn hàng đã được tạo sau khi thanh toán thành công." });
        } catch (err) {
            console.error("Lỗi xử lý ipn:", err);
            return res.status(500).json({ message: "Lỗi xử lý thông báo thanh toán." });
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

            const currentDateTimeUTC = new Date(
                currentDateTime.getTime() - 7 * 60 * 60 * 1000
            );
            const formattedDate = currentDateTimeUTC.toLocaleString("vi-VN", {
                hour12: false,
            });
            const formattedPrice = new Intl.NumberFormat("vi-VN").format(
                order.total_price
            );
            const formattedShipping = new Intl.NumberFormat("vi-VN").format(
                order.shipping_fee || 0
            );

            let productHTML = "<p>";
            if (products && products.length > 0) {
                for (const item of products) {
                    const variant = item.variant;
                    const productName = variant?.sku || "Sản phẩm không xác định";
                    const price = new Intl.NumberFormat("vi-VN").format(variant?.price || 0);
                    productHTML += `
                                    <p><strong>Tên sản phẩm:</strong> ${productName} </p>
                                    <p><strong>Số lượng:</strong> ${item.quantity} </p>
                                    <p><strong>Đơn giá:</strong> ${price} VND </p>
        `;
                }
                productHTML += "</p>";
            } else {
                productHTML = "<p>Không có sản phẩm nào.</p>";
            }

            const emailContent = `
            <h3>Cảm ơn bạn đã đặt hàng!</h3>
            <p><strong>Thông tin đơn hàng:</strong></p>
            <p><strong>Mã đơn hàng:</strong> ${order.order_code}</p>
            <p><strong>Ngày tạo:</strong> ${formattedDate}</p>
            <p><strong>Danh sách sản phẩm:</strong></p>
            ${productHTML}
            <p><strong>Tổng tiền:</strong> ${formattedPrice} VND</p>
            <p><strong>Phí vận chuyển:</strong> ${formattedShipping} VND</p>
            <p><strong>Phương thức thanh toán:</strong> ${order.payment_method}</p>
            <p><strong>Thông tin giao hàng:</strong></p>
            <p><strong>Họ tên:</strong> ${user.name || "Không có thông tin"}</p>
            <p><strong>Số điện thoại:</strong> ${user.phone || "Không có thông tin"}</p>
            <p><strong>Địa chỉ:</strong> ${order.shipping_address || order.address}</p>
            <p>Cảm ơn bạn đã ủng hộ chúng tôi!</p>
        `;

            let mailOptions = {
                from: `"Cửa hàng của chúng tôi" <${process.env.EMAIL_USER}>`,
                to: customerEmail,
                subject: `Xác nhận đơn hàng #${order.id}`,
                html: emailContent,
            };

            await transporter.sendMail(mailOptions);
        } catch (error) {
            console.error("Lỗi gửi email xác nhận đơn hàng:", error);
            throw new Error("Không thể gửi email xác nhận đơn hàng.");
        }
    }
}

module.exports = OrderController;
