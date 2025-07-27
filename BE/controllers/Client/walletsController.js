const WithdrawRequestsModel = require('../../models/withdrawRequestsModel');
const UserModel = require('../../models/usersModel');
const OrderModel = require('../../models/ordersModel');

const { Op } = require('sequelize');

require("dotenv").config();
const nodemailer = require("nodemailer");

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

      await WalletsController.sendWithdrawEmail(wallet, amount, bank_name, bank_account);

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

  static async sendWithdrawEmail(wallet, amount, bankName, bankAccount) {
    try {
      const formattedAmount = new Intl.NumberFormat("vi-VN").format(amount);
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: wallet.email,
        subject: "Xác nhận yêu cầu rút tiền",
        html: `
          <p>Chào ${wallet.name || "bạn"},</p>
          <p>Bạn vừa gửi yêu cầu rút <strong>${formattedAmount}₫</strong> về tài khoản ngân hàng.</p>
          <p><strong>Ngân hàng:</strong> ${bankName.toUpperCase()}</p>
          <p><strong>Số tài khoản:</strong> ${bankAccount}</p>
          <p><strong>Trạng thái hiện tại:</strong> Đang chờ duyệt</p>
          <p>Chúng tôi sẽ xử lý trong thời gian sớm nhất. Cảm ơn bạn!</p>
          <p>-- Hệ thống Đồng Hồ TimesMaster --</p>
        `,
      };

      await transporter.sendMail(mailOptions);
    } catch (err) {
      console.error("Gửi email thất bại:", err);
    }
  }

  static async getTopupHistory(req, res) {
    const userId = req.query.userId || req.user.id;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    try {
      const topups = await WithdrawRequestsModel.findAll({
        where: {
          user_id: userId,
          note: 'Nạp tiền từ Stripe',
          type: 'recharge'
        },
        order: [['created_at', 'DESC']],
        limit,
        offset
      });

      const totalTopups = await WithdrawRequestsModel.count({
        where: {
          user_id: userId,
          note: 'Nạp tiền từ Stripe',
          type: 'recharge'
        }
      });

      return res.status(200).json({
        success: true,
        message: 'Lịch sử nạp tiền Stripe',
        data: topups,
        pagination: {
          total: totalTopups,
          page,
          totalPages: Math.ceil(totalTopups / limit)
        }
      });
    } catch (error) {
      console.error("Lỗi lấy lịch sử nạp tiền:", error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ',
        error: error.message
      });
    }
  }

}

module.exports = WalletsController;