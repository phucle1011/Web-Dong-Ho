const PromotionUserModel = require('../../models/promotionUsersModel');
const UserModel = require('../../models/usersModel');
const PromotionModel = require('../../models/promotionsModel');
const { Op } = require('sequelize');

class PromotionUserController {
  static async get(req, res) {
    try {
      const {
        searchTerm = '',
        page = 1,
        limit = 10,
        promotionId,
      } = req.query;

      const currentPage = Math.max(parseInt(page, 10), 1);
      const currentLimit = Math.max(parseInt(limit, 10), 1);
      const offset = (currentPage - 1) * currentLimit;

      const userWhere = searchTerm
        ? {
          [Op.or]: [
            { name: { [Op.like]: `%${searchTerm}%` } },
            { email: { [Op.like]: `%${searchTerm}%` } },
            { phone: { [Op.like]: `%${searchTerm}%` } },
          ],
        }
        : {};

      const promotionUserWhere = {};
      if (promotionId) {
        promotionUserWhere.promotion_id = promotionId;
      }

      const includePromotionUser = {
        model: PromotionUserModel,
        as: 'promotionUsers',
        where: promotionUserWhere,
        required: true,
        include: [
          {
            model: PromotionModel,
            as: 'Promotion',
            attributes: [
              'id',
              'name',
              'discount_type',
              'discount_value',
              'special_promotion',
              'status',
            ],
            where: {
              special_promotion: true,
            },
          },
        ],
        attributes: ['id', 'created_at', 'email_sent'],
      };

      const { count, rows } = await UserModel.findAndCountAll({
        where: userWhere,
        include: [includePromotionUser],
        attributes: ['id', 'name', 'email', 'phone'],
        distinct: true,
        limit: currentLimit,
        offset,
        order: [['id', 'DESC']],
        subQuery: false,
      });

      const formatted = rows.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        promotions: user.promotionUsers.map((pu) => ({
          promotionUserId: pu.id,
          promotionId: pu.Promotion?.id || null,
          promotionName: pu.Promotion?.name || '',
          promotionType: pu.Promotion?.discount_type || '',
          promotionValue: pu.Promotion?.discount_value || 0,
          isSpecialPromotion: Boolean(pu.Promotion?.special_promotion),
          promotionReceivedDate: pu.created_at,
          emailSent: pu.email_sent || false,
          status: pu.Promotion?.status || 'inactive',
        })),
      }));

      res.status(200).json({
        status: 200,
        message: 'Lấy danh sách người dùng với các mã giảm đặc biệt thành công',
        data: formatted,
        pagination: {
          totalPages: Math.ceil(count / currentLimit),
          currentPage,
          totalRecords: count,
        },
      });
    } catch (error) {
      console.error('Lỗi khi lấy danh sách promotion-user:', error);
      res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
  }

  static async checkPromotionExpiry(req, res) {
    try {
      const { promotionId } = req.body;
      if (!promotionId) {
        return res.status(400).json({ message: 'Thiếu promotionId' });
      }

      const promotion = await PromotionModel.findByPk(promotionId);
      if (!promotion) {
        return res.status(404).json({ message: 'Không tìm thấy mã giảm giá' });
      }

      const isExpired = promotion.end_date && new Date(promotion.end_date) < new Date();
      res.status(200).json({
        isExpired,
        message: isExpired ? 'Mã giảm giá đã hết hạn' : 'Mã giảm giá còn hiệu lực',
      });
    } catch (error) {
      console.error('Lỗi khi kiểm tra trạng thái mã giảm:', error);
      res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
  }
}

module.exports = PromotionUserController;
