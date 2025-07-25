const UserModel = require('../../models/usersModel');
const WithdrawRequestsModel = require('../../models/withdrawRequestsModel');
const OrderDetailsModel = require('../../models/orderDetailsModel');
const ProductVariantsModel = require('../../models/productVariantsModel');
const ProductModel = require('../../models/productsModel');
const OrderModel = require('../../models/ordersModel');

const { Op } = require('sequelize');

class WalletsController {
    static async getAll(req, res) {
  const {
    searchTerm = '',
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
    const whereClause = {};

    if (status && status !== 'all') {
      whereClause.status = status;
    }

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

    const allRequests = await WithdrawRequestsModel.findAll({ attributes: ['status'] });
    const statusCounts = {
      all: allRequests.length,
      pending: 0,
      approved: 0,
      rejected: 0
    };
    allRequests.forEach(req => {
      if (statusCounts.hasOwnProperty(req.status)) {
        statusCounts[req.status]++;
      }
    });

    const requests = await WithdrawRequestsModel.findAll({
      where: whereClause,
      include: [
        {
          model: UserModel,
          as: 'user',
          where: searchTerm
            ? {
              [Op.or]: [
                { name: { [Op.like]: `%${searchTerm}%` } },
                { email: { [Op.like]: `%${searchTerm}%` } }
              ]
            }
            : {},
          required: true
        },
        {
          model: OrderModel,
          as: 'order',
          include: [
            {
              model: UserModel,
              as: 'user',
              attributes: ['id', 'name', 'email', 'phone']
            },
            {
              model: OrderDetailsModel,
              as: 'orderDetails',
              attributes: ['quantity', 'price'],
              include: [
                {
                  model: ProductVariantsModel,
                  as: 'variant',
                  attributes: ['sku'],
                  include: [
                    {
                      model: ProductModel,
                      as: 'product',
                      attributes: ['name']
                    }
                  ]
                }
              ]
            }
          ]
        }
      ],
      order: [['created_at', 'DESC']]
    });

    // Nhóm theo user
    const userMap = new Map();
    for (const r of requests) {
      const userId = r.user.id;

      if (!userMap.has(userId)) {
        userMap.set(userId, {
          id: r.id,
          user: r.user,
          amount: r.amount,
          status: r.status,
          type: r.type,
          method: r.method,
          bank_account: r.bank_account,
          note: r.note,
          order: r.order,
          created_at: r.created_at,
          updated_at: r.updated_at,
          latestCreatedAt: r.created_at,
          refundCount: 0,
          withdrawCount: 0,
          hasPending: false
        });
      }

      const userData = userMap.get(userId);
      if (r.type === 'refund') userData.refundCount++;
      if (r.type === 'withdraw') userData.withdrawCount++;
      if (r.status === 'pending') userData.hasPending = true;

      if (new Date(r.created_at) > new Date(userData.latestCreatedAt)) {
        userData.latestCreatedAt = r.created_at;
      }
    }

    // Phân trang sau khi group
    const allUsers = Array.from(userMap.values());
    const paginated = allUsers.slice(offset, offset + perPage);

    res.status(200).json({
      status: 200,
      message: "Lấy danh sách yêu cầu rút tiền thành công",
      data: paginated.map(r => ({
        id: r.id,
        amount: r.amount,
        status: r.status,
        type: r.type,
        method: r.method,
        bank_account: r.bank_account,
        note: r.note,
        created_at: r.created_at,
        updated_at: r.updated_at,
        latestCreatedAt: r.latestCreatedAt,
        hasPending: r.hasPending,
        user: {
          id: r.user.id,
          name: r.user.name,
          email: r.user.email,
          balance: r.user.balance,
          created_at: r.user.created_at,
          refundCount: r.refundCount,
          withdrawCount: r.withdrawCount,
        },
        order: r.order ? {
          id: r.order.id,
          total_price: r.order.total_price,
          payment_method: r.order.payment_method,
          shipping_address: r.order.shipping_address,
          created_at: r.order.created_at,
          shipping_fee: r.order.shipping_fee,
          discount_amount: r.order.discount_amount,
          special_discount_amount: r.order.special_discount_amount,
          user: r.order.user ? {
            name: r.order.user.name,
            phone: r.order.user.phone,
          } : null,
          orderDetails: r.order.orderDetails?.map(od => ({
            quantity: od.quantity,
            price: od.price,
            variant: {
              sku: od.variant?.sku,
              product: {
                name: od.variant?.product?.name
              }
            }
          }))
        } : null
      })),
      pagination: {
        totalItems: allUsers.length,
        currentPage,
        totalPages: Math.ceil(allUsers.length / perPage),
      },
      statusCounts
    });

  } catch (error) {
    console.error("Lỗi khi lấy danh sách rút tiền:", error.message, error.stack);
    res.status(500).json({
      success: false,
      message: "Lỗi máy chủ khi lấy danh sách rút tiền"
    });
  }
}

  static async getId(req, res) {
  const { id } = req.params;

  try {
    const request = await WithdrawRequestsModel.findOne({
      where: { id },
      include: [
        {
          model: UserModel,
          as: 'user',
          attributes: ['id', 'name', 'email', 'balance', 'created_at']
        },
        {
          model: OrderModel,
          as: 'order',
          include: [
            {
              model: UserModel,
              as: 'user',
              attributes: ['id', 'name', 'email', 'phone']
            },
            {
              model: OrderDetailsModel,
              as: 'orderDetails',
              attributes: ['quantity', 'price'],
              include: [
                {
                  model: ProductVariantsModel,
                  as: 'variant',
                  attributes: ['sku'],
                  include: [
                    {
                      model: ProductModel,
                      as: 'product',
                      attributes: ['name']
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    });

    if (!request) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy yêu cầu.' });
    }

    return res.json({ success: true, data: request });
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết yêu cầu:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
}

  static async updateWithdrawStatus(req, res) {
    const { id } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Trạng thái không hợp lệ.' });
    }

    try {
      const request = await WithdrawRequestsModel.findByPk(id);
      if (!request) return res.status(404).json({ error: 'Yêu cầu không tồn tại.' });
      if (request.status !== 'pending') return res.status(400).json({ error: 'Chỉ xử lý yêu cầu đang chờ duyệt.' });

      const user = await UserModel.findByPk(request.user_id);
      if (!user) return res.status(404).json({ error: 'Người dùng không tồn tại.' });

      const amount = parseFloat(request.amount);
      const currentBalance = parseFloat(user.balance || 0);

      if (status === 'approved') {
        if (request.type === 'withdraw') {
          if (amount > currentBalance) {
            return res.status(400).json({ error: 'Số dư không đủ để thực hiện rút tiền.' });
          }
          user.balance = currentBalance - amount;
          await user.save();
        } else if (request.type === 'refund') {
          user.balance = currentBalance + amount;
          await user.save();

          if (request.order_id) {
            const order = await OrderModel.findByPk(request.order_id);
            if (order && order.status !== 'cancelled') {
              order.status = 'cancelled';
              await order.save();
            }
          }
        }

        await request.update({ status: 'approved' });
      } else if (status === 'rejected') {
        await request.update({ status: 'rejected' });
      }

      return res.json({ message: `Yêu cầu đã được cập nhật.` });
    } catch (err) {
      console.error("Lỗi xử lý yêu cầu:", err);
      return res.status(500).json({ error: 'Đã xảy ra lỗi.' });
    }
  }

}

module.exports = WalletsController;
