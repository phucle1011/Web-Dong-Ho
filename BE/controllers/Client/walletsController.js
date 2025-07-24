const WithdrawRequestsModel = require('../../models/withdrawRequestsModel');
const UserModel = require('../../models/usersModel');
const OrderModel = require('../../models/ordersModel');

const sequelize = require('../../config/database');
const { Op } = require('sequelize');

class WalletsController {

  static async get(req, res) {
    const userId = req.user.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Không xác định được người dùng.',
      });
    }
    try {
      const users = await UserModel.findAll({
        where: { id: userId },
        include: [
          {
            model: WithdrawRequestsModel,
            as: 'withdrawRequests',
          },
          {
            model: OrderModel,
            as: 'orders',
            attributes: ['id', 'total_price', 'status', 'created_at'],
            where: {
              status: {
                [Op.in]: ['completed', 'cancelled']
              }
            },
            required: false
          }
        ],
        order: [['created_at', 'DESC']]
      });

      res.status(200).json({
        success: true,
        message: 'Danh sách ví',
        data: users
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy danh sách ví',
        error: error.message
      });
    }
  }


  static async requestWithdraw(req, res) {
    try {
      const { amount, method, bank_account, note, bank_name } = req.body;
      const userId = req.user.id;

      if (!amount || !method || !bank_account || !bank_name) {
        return res.status(400).json({
          success: false,
          message: "Thiếu thông tin rút tiền"
        });
      }

      const wallet = await UserModel.findOne({ where: { id: userId } });
      if (!wallet || amount > wallet.balance) {
        return res.status(400).json({
          success: false,
          message: "Số dư không đủ để thực hiện rút tiền"
        });
      }

      await WithdrawRequestsModel.create({
        user_id: userId,
        amount,
        method: "bank",
        bank_account,
        bank_name,
        note: note || 'Yêu cầu rút tiền',
        status: 'pending',
        type: 'withdraw'
      });

      res.status(200).json({
        success: true,
        message: "Yêu cầu rút tiền đã được gửi, đang chờ xử lý."
      });
    } catch (err) {
      console.error("Lỗi tạo yêu cầu rút tiền:", err);
      res.status(500).json({
        success: false,
        message: "Lỗi máy chủ"
      });
    }
  }

}

module.exports = WalletsController;