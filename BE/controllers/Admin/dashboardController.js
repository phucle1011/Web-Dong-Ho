const OrderModel = require('../../models/ordersModel');
const { Op, fn, col, where } = require('sequelize');

class DashboardController {
    // Lấy tổng doanh thu theo tháng và năm (qua query string ?month=5&year=2025)
    static async getTotalRevenue(req, res) {
        try {
            const month = parseInt(req.query.month);
            const year = parseInt(req.query.year);

            if (!month || !year) {
                return res.status(400).json({ message: "Vui lòng cung cấp tháng và năm" });
            }

            const totalRevenue = await OrderModel.sum('total_price', {
                where: {
                    status: 'Đã giao hàng thành công',
                    is_deleted: 0,
                    [Op.and]: [
                        where(fn('MONTH', col('created_at')), month),
                        where(fn('YEAR', col('created_at')), year)
                    ]
                }
            });

            res.status(200).json({
                message: "Lấy doanh thu thành công",
                revenue: totalRevenue || 0
            });

        } catch (error) {
            res.status(500).json({ message: "Lỗi máy chủ", error: error.message });
        }
    }
}

module.exports = DashboardController;
