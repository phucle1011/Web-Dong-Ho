const Sequelize = require('sequelize');
const { Op } = Sequelize;
const UserModel = require('../../models/usersModel');
const CommentModel = require('../../models/commentsModel');
const CategoryModel = require('../../models/categoriesModel');
const ProductModel = require('../../models/productsModel');
const OrderModel = require('../../models/ordersModel');
const PromotionModel = require('../../models/promotionsModel');
const OrderDetailModel = require('../../models/orderDetailsModel');

class DashboardController {
  static async getCounts(req, res) {
    try {
      const total_user = await UserModel.count();
      const total_comment = await CommentModel.count();
      const total_category = await CategoryModel.count();
      const total_product = await ProductModel.count();
      const total_order = await OrderModel.count();
      const total_promotion = await PromotionModel.count();

      const total_revenue_result = await OrderDetailModel.findOne({
        attributes: [
          [Sequelize.fn('SUM', Sequelize.literal('price * quantity')), 'totalRevenue']
        ],
        include: [
          {
            model: OrderModel,
            as: 'order',
            where: { status: 'delivered' },
            attributes: [],
          },
        ],
        raw: true,
      });
      const total_revenue = total_revenue_result?.totalRevenue || 0;

      const now = new Date();

      const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

      const startOfCurrentYear = new Date(now.getFullYear(), 0, 1);
      const endOfCurrentYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);

      const startOfLastYear = new Date(now.getFullYear() - 1, 0, 1);
      const endOfLastYear = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);

      async function getRevenueByDateRange(startDate, endDate) {
        const result = await OrderDetailModel.findOne({
          attributes: [
            [Sequelize.fn('SUM', Sequelize.literal('price * quantity')), 'revenue']
          ],
          include: [
            {
              model: OrderModel,
              as: 'order',
              where: {
                status: 'delivered',
                created_at: {
                  [Op.between]: [startDate, endDate]
                }
              },
              attributes: [],
            }
          ],
          raw: true,
        });
        return result?.revenue || 0;
      }

      const revenueCurrentMonth = await getRevenueByDateRange(startOfCurrentMonth, endOfCurrentMonth);
      const revenueLastMonth = await getRevenueByDateRange(startOfLastMonth, endOfLastMonth);
      const revenueCurrentYear = await getRevenueByDateRange(startOfCurrentYear, endOfCurrentYear);
      const revenueLastYear = await getRevenueByDateRange(startOfLastYear, endOfLastYear);

      return res.status(200).json({
        status: 200,
        message: "Lấy danh sách thành công",
        data: {
          total_user,
          total_comment,
          total_category,
          total_product,
          total_order,
          total_promotion,
          total_revenue,
          revenueCurrentMonth,
          revenueLastMonth,
          revenueCurrentYear,
          revenueLastYear,
        },
      });
    } catch (error) {
      console.error('Error in DashboardController.getCounts:', error);
      return res.status(500).json({ success: false, message: 'Lỗi server khi đếm dữ liệu' });
    }
  }

  static async getRevenueByMonthsInYear(req, res) {
  try {
    const { year } = req.query; // yyyy
    if (!year) {
      return res.status(400).json({ status: 400, message: 'Thiếu tham số year' });
    }

    const yearNum = parseInt(year, 10);

    // Mảng doanh thu theo tháng, mặc định 0
    const revenueByMonth = Array(12).fill(0);

    const startDate = new Date(yearNum, 0, 1);
    const endDate = new Date(yearNum, 11, 31, 23, 59, 59, 999);

    const revenueResults = await OrderDetailModel.findAll({
      attributes: [
        [Sequelize.fn('MONTH', Sequelize.col('order.created_at')), 'month'],
        [Sequelize.fn('SUM', Sequelize.literal('price * quantity')), 'revenue'],
      ],
      include: [
        {
          model: OrderModel,
          as: 'order',
          where: {
            status: 'delivered',
            created_at: { [Op.between]: [startDate, endDate] }
          },
          attributes: [],
        }
      ],
      group: ['month'],
      raw: true,
    });

    revenueResults.forEach(item => {
      const monthIndex = item.month - 1;
      revenueByMonth[monthIndex] = parseInt(item.revenue, 10) || 0;
    });

    return res.status(200).json({
      status: 200,
      message: 'Lấy doanh thu theo tháng thành công',
      data: {
        labels: Array.from({ length: 12 }, (_, i) => `Tháng ${i + 1}`),
        revenue: revenueByMonth,
      },
    });
  } catch (error) {
    console.error('Error in getRevenueByMonthsInYear:', error);
    return res.status(500).json({ status: 500, message: 'Lỗi server khi lấy doanh thu theo tháng' });
  }
}

static async getRevenueByDaysInMonth(req, res) {
  try {
    const { year, month } = req.query; // yyyy, mm
    if (!year || !month) {
      return res.status(400).json({ status: 400, message: 'Thiếu tham số year hoặc month' });
    }

    const yearNum = parseInt(year, 10);
    const monthNum = parseInt(month, 10) - 1; // vì JS tính tháng từ 0

    const daysInMonth = new Date(yearNum, monthNum + 1, 0).getDate();

    // Khởi tạo mảng doanh thu cho từng ngày, mặc định 0
    const revenueByDay = Array(daysInMonth).fill(0);

    // Lấy ngày đầu và cuối tháng
    const startDate = new Date(yearNum, monthNum, 1);
    const endDate = new Date(yearNum, monthNum, daysInMonth, 23, 59, 59, 999);

    // Lấy dữ liệu doanh thu theo ngày
    const revenueResults = await OrderDetailModel.findAll({
      attributes: [
        [Sequelize.fn('DAY', Sequelize.col('order.created_at')), 'day'],
        [Sequelize.fn('SUM', Sequelize.literal('price * quantity')), 'revenue'],
      ],
      include: [
        {
          model: OrderModel,
          as: 'order',
          where: {
            status: 'delivered',
            created_at: { [Op.between]: [startDate, endDate] }
          },
          attributes: [],
        }
      ],
      group: ['day'],
      raw: true,
    });

    // Gán dữ liệu vào mảng doanh thu theo ngày
    revenueResults.forEach(item => {
      const dayIndex = item.day - 1;
      revenueByDay[dayIndex] = parseInt(item.revenue, 10) || 0;
    });

    return res.status(200).json({
      status: 200,
      message: 'Lấy doanh thu theo ngày thành công',
      data: {
        labels: Array.from({ length: daysInMonth }, (_, i) => `Ngày ${i + 1}`),
        revenue: revenueByDay,
      },
    });
  } catch (error) {
    console.error('Error in getRevenueByDaysInMonth:', error);
    return res.status(500).json({ status: 500, message: 'Lỗi server khi lấy doanh thu theo ngày' });
  }
}

}

module.exports = DashboardController;
