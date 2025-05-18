const OrderModel = require('../../models/ordersModel');
const OrderDetailsModel = require('../../models/orderDetailsModel');
const ProductVariantsModel = require('../../models/productVariantsModel');
const ProductModel = require('../../models/productsModel');
const UserModel = require('../../models/usersModel');
const { Op } = require('sequelize');
const axios = require('axios');

class OrderController {

    static async get(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;

            const offset = (page - 1) * limit;

            const orders = await OrderModel.findAndCountAll({
                order: [['created_at', 'DESC']],
                limit: limit,
                offset: offset,
                include: [
                    {
                        model: OrderDetailsModel,
                        as: 'orderDetails',
                        attributes: ['quantity', 'price'],
                        include: [
                            {
                                model: ProductVariantsModel,
                                as: 'productVariant',
                                attributes: ['price'],
                                include: [
                                    {
                                        model: ProductModel,
                                        as: 'variantProduct',
                                        attributes: ['name']
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        model: UserModel,
                        as: 'user',
                        attributes: ['id', 'name', 'email', 'phone']
                    }
                ]
            });

            const result = orders.rows.map(order => {
                const orderData = order.toJSON();
                delete orderData.user_id;
                return orderData;
            });

            res.status(200).json({
                status: 200,
                message: "Lấy danh sách thành công",
                data: result,
                totalPages: Math.ceil(orders.count / limit),
                currentPage: page,
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getById(req, res) {
        try {
            const { id } = req.params;
            const order = await OrderModel.findByPk(id, {
                include: [
                    {
                        model: OrderDetailsModel,
                        as: 'orderDetails',
                        attributes: ['quantity', 'price'],
                        include: [
                            {
                                model: ProductVariantsModel,
                                as: 'productVariant',
                                attributes: ['price'],
                                include: [
                                    {
                                        model: ProductModel,
                                        as: 'variantProduct',
                                        attributes: ['name']
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        model: UserModel,
                        as: 'user',
                        attributes: ['id', 'name', 'email', 'phone']
                    }
                ],
            });

            if (!order) {
                return res.status(404).json({ message: "Id không tồn tại" });
            }

            const orderData = order.toJSON();
            delete orderData.user_id;

            res.status(200).json({
                status: 200,
                message: "Lấy danh sách thành công",
                data: orderData,
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
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
                payment_method_id
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
            if (payment_method_id !== undefined) order.payment_method_id = payment_method_id;

            await order.save();

            res.status(200).json({
                status: 200,
                message: "Cập nhật thành công",
                data: order
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

            if (order.status !== "Chờ xác nhận") {
                return res.status(400).json({ message: "Chỉ được hủy đơn hàng có trạng thái là 'Chờ xác nhận'" });
            }

            order.status = "Đã hủy";
            await order.save();

            res.status(200).json({
                status: 200,
                message: "Hủy đơn hàng thành công",
                data: order
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async searchOrders(req, res) {
        try {
            const { searchTerm } = req.query;

            if (!searchTerm || searchTerm.trim() === '') {
                return res.status(400).json({ message: "Vui lòng nhập mã đơn hàng để tìm kiếm." });
            }

            const orders = await OrderModel.findAll({
                where: {
                    [Op.or]: [
                        {
                            order_code: {
                                [Op.like]: `%${searchTerm}%`,
                            },
                        },
                        {
                            '$user.name$': {
                                [Op.like]: `%${searchTerm}%`,
                            },
                        },
                    ],
                },
                order: [['created_at', 'DESC']],
                include: [
                    {
                        model: OrderDetailsModel,
                        as: 'orderDetails',
                        attributes: ['quantity', 'price'],
                        include: [
                            {
                                model: ProductVariantsModel,
                                as: 'productVariant',
                                attributes: ['price'],
                                include: [
                                    {
                                        model: ProductModel,
                                        as: 'variantProduct',
                                        attributes: ['name'],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        model: UserModel,
                        as: 'user',
                        attributes: ['id', 'name', 'email', 'phone'],
                    },
                ],
            });

            if (orders.length === 0) {
                return res.status(404).json({
                    status: 200,
                    message: "Không tìm thấy đơn hàng nào.",
                    data: order
                });
            }

            res.status(200).json({
                status: 200,
                message: 'Tìm kiếm thành công',
                data: orders,
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async trackOrder(req, res) {
        try {
            const { orderCode } = req.params;

            const order = await OrderModel.findOne({ where: { order_code: orderCode } });

            if (!order) {
                return res.status(404).json({ message: 'Không tìm thấy đơn hàng trong hệ thống' });
            }

            if (!order.shipping_code) {
                return res.status(200).json({
                    status: 200,
                    message: 'Đơn hàng nội bộ - chưa gửi GHN',
                    data: {
                        order_code: order.order_code,
                        status: order.status,
                        updated_date: order.updated_at,
                        locations: [
                            {
                                time: order.updated_at,
                                location: 'Kho nội bộ',
                                note: 'Đơn hàng chưa gửi GHN',
                            }
                        ],
                        leadtime: null
                    }
                });
            }

            const response = await axios.post(
                'https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/track',
                { order_code: order.shipping_code },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Token': '1f73c4c8-3184-11f0-b930-ca8d03ab5418',
                        'ShopId': '5778611'
                    },
                }
            );

            const trackingData = response.data.data;
            const history = trackingData.order_tracking || [];

            // Chuyển đổi dữ liệu để frontend dễ dùng: lấy thời gian, trạng thái, ghi chú (nếu có)
            const locations = history.map(item => ({
                time: item.time || item.updated_at,     // thời gian trạng thái (tùy API trả về)
                status: item.status_name || '',
                location: item.status_name || '',       // thường status_name chính là vị trí/trạng thái
                note: item.note || ''
            }));

            res.status(200).json({
                status: 200,
                message: 'Lấy lịch sử vị trí đơn hàng thành công',
                data: {
                    order_code: order.order_code,
                    status: order.status,
                    updated_date: order.updated_at,
                    locations,   // tất cả vị trí trạng thái đơn hàng
                    raw_tracking_data: trackingData
                }
            });

        } catch (error) {
            console.error('Lỗi theo dõi đơn hàng:', error?.response?.data || error.message);
            res.status(500).json({
                message: 'Không thể lấy thông tin đơn hàng',
                error: error?.response?.data || error.message,
            });
        }
    }

}

module.exports = OrderController;