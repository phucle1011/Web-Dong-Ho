const OrderModel = require('../../models/ordersModel');
const OrderDetailsModel = require('../../models/orderDetailsModel');
const ProductVariantsModel = require('../../models/productVariantsModel');
const ProductModel = require('../../models/productsModel');
const UserModel = require('../../models/usersModel');
const { Op } = require('sequelize');

class OrderHistory {

    static async get(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;

            const orders = await OrderModel.findAndCountAll({
                where: { status: 'Đã giao hàng thành công' },
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
                message: "Lấy danh sách đơn hàng đã giao thành công thành công",
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
                where: { status: 'Đã giao hàng thành công' },
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

            if (!order) {
                return res.status(404).json({
                    status: 200,
                    message: "Đơn hàng không tồn tại hoặc không ở trạng thái 'Đã giao hàng thành công'",
                    data: order
                });
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

    static async searchOrderHistory(req, res) {
        try {
            const { searchTerm } = req.query;

            if (!searchTerm || searchTerm.trim() === '') {
                return res.status(400).json({ message: "Vui lòng nhập mã đơn hàng để tìm kiếm." });
            }

            const orders = await OrderModel.findAll({
                where: {
                    [Op.and]: [
                        { status: 'Đã giao hàng thành công' },
                        {
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
                return res.status(404).json({ message: "Không tìm thấy đơn hàng nào." });
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
}

module.exports = OrderHistory;