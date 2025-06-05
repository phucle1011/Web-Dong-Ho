const OrderModel = require('../../models/ordersModel');
const UserModel = require('../../models/usersModel');
const { Op } = require('sequelize');

class OrderController {

    static async get(req, res) {
        const userId = 1;

        if (!userId) {
            return res.status(401).json({ success: false, message: "Chưa đăng nhập" });
        }

        const {
            page = 1,
            limit = 10,
            status,
            startDate,
            endDate
        } = req.query;

        const currentPage = parseInt(page, 10);
        const perPage = parseInt(limit, 10);
        const offset = (currentPage - 1) * perPage;

        try {
            const whereClause = {
                user_id: userId
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

            if (status && status !== 'all') {
                whereClause.status = status;
            }

            const { count, rows } = await OrderModel.findAndCountAll({
                where: whereClause,
                include: [{ model: UserModel, as: 'user' }],
                order: [['created_at', 'DESC']],
                offset,
                limit: perPage
            });

            res.status(200).json({
                status: 200,
                message: "Lấy danh sách thành công",
                data: rows,
                pagination: {
                    totalItems: count,
                    currentPage,
                    totalPages: Math.ceil(count / perPage),
                }
            });

        } catch (error) {
            console.error("Lỗi khi lấy danh sách đơn hàng:", error.message, error.stack);
            res.status(500).json({
                success: false,
                message: "Lỗi máy chủ."
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

            if (order.status !== "pending") {
                return res.status(400).json({ message: "Chỉ được hủy đơn hàng có trạng thái là 'Chờ xác nhận'" });
            }

            order.status = "cancelled";
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

}

module.exports = OrderController;