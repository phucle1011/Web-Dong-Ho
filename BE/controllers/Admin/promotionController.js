const { Op } = require('sequelize');
const PromotionModel = require('../../models/promotionsModel');

class PromotionController {
  static async getAll(req, res) {
    const { searchTerm = '', page = 1, limit = 10 } = req.query;
    const currentPage = parseInt(page, 10);
    const perPage = parseInt(limit, 10);
    const offset = (currentPage - 1) * perPage;

    try {
      const whereClause = {};
      if (searchTerm) {
        whereClause.name = {
          [Op.and]: [
            { [Op.not]: null },
            { [Op.like]: `%${searchTerm}%` }
          ]
        };
      }
      const { rows: promotions, count: totalItems } = await PromotionModel.findAndCountAll({
        where: whereClause,
        order: [['created_at', 'DESC']],
        limit: perPage,
        offset: offset
      });

      const now = new Date();

      for (const promo of promotions) {
        let newStatus = promo.status;
        if (promo.status === 'inactive') {
          newStatus = 'inactive';
        } else if (promo.quantity === 0) {
          newStatus = 'exhausted';
        } else if (now < promo.start_date) {
          newStatus = 'upcoming';
        } else if (now >= promo.start_date && now <= promo.end_date) {
          newStatus = 'active';
        } else {
          newStatus = 'expired';
        }
        if (promo.status !== newStatus) {
          await promo.update({ status: newStatus });
          promo.status = newStatus;
        }
      }
      res.status(200).json({
        success: true,
        data: promotions,
        pagination: {
          totalItems,
          currentPage,
          totalPages: Math.ceil(totalItems / perPage),
        }
      });
    } catch (error) {
      console.error("Lỗi khi lấy danh sách khuyến mãi:", error.message, error.stack);
      res.status(500).json({
        success: false,
        message: "Lỗi máy chủ."
      });
    }
  }

  static async create(req, res) {
    try {
      const {
        name,
        description,
        discount_type,
        discount_value,
        quantity,
        start_date,
        end_date,
        status,
        applicable_to = 'all_products',
        min_price_threshold = 0,
        user_ids = [],
      } = req.body;

      if (!name) {
        return res.status(400).json({ success: false, message: 'Tên khuyến mãi không được để trống.' });
      }
      if (!applicable_to) {
        return res.status(400).json({ success: false, message: 'Trường applicable_to không được để trống.' });
      }
      const exists = await PromotionModel.findOne({ where: { name } });
      if (exists) {
        return res.status(409).json({ success: false, message: 'Tên khuyến mãi đã tồn tại.' });
      }
      if (new Date(start_date) > new Date(end_date)) {
        return res.status(400).json({ success: false, message: 'Ngày bắt đầu phải trước ngày kết thúc.' });
      }

      const now = new Date();
      const start = new Date(start_date);
      const end = new Date(end_date);

      let promoStatus;
      if (status === 'inactive') {
        promoStatus = 'inactive';
      } else {
        promoStatus = now < start ? 'upcoming' : (now <= end ? 'active' : 'expired');
      }
      const promotion = await PromotionModel.create({
        name,
        description,
        discount_type,
        discount_value: Number(discount_value),
        quantity: Number(quantity),
        start_date,
        end_date,
        status: promoStatus,
        applicable_to,
        min_price_threshold: Number(min_price_threshold),
      });

      if (Array.isArray(user_ids) && user_ids.length > 0) {
        await promotion.setUsers(user_ids);
      }

      res.status(201).json({ success: true, data: promotion });
    } catch (error) {
      console.error('Lỗi khi tạo khuyến mãi:', error);
      res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }
  }



  static async getById(req, res) {
    const { id } = req.params;
    try {
      const promotion = await PromotionModel.findByPk(id);
      if (!promotion) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy khuyến mãi.",
        });
      }
      res.status(200).json({ success: true, data: promotion });
    } catch (error) {
      console.error("Lỗi khi lấy khuyến mãi theo ID:", error);
      res.status(500).json({ success: false, message: "Lỗi máy chủ." });
    }
  }

  static async update(req, res) {
    const { id } = req.params;

    try {
      const {
        name,
        description,
        discount_type,
        discount_value,
        quantity,
        start_date,
        end_date,
        status,
        applicable_to,
        min_price_threshold
      } = req.body;

      const promotion = await PromotionModel.findByPk(id);
      if (!promotion) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy khuyến mãi.' });
      }
      const currentStatus = promotion.status;
      if (currentStatus === 'expired') {
        return res.status(403).json({ success: false, message: 'Khuyến mãi đã hết hạn, không thể sửa.' });
      }
      if (currentStatus === 'active') {
        const forbiddenFields = ['id', 'created_at', 'updated_at'];
        const keysToUpdate = Object.keys(req.body);
        const disallowedFields = keysToUpdate.filter(k => forbiddenFields.includes(k));
        if (disallowedFields.length > 0) {
          return res.status(403).json({ success: false, message: `Không được phép sửa trường: ${disallowedFields.join(', ')}` });
        }
      }
      if (start_date && end_date && new Date(start_date) > new Date(end_date)) {
        return res.status(400).json({ success: false, message: 'Ngày bắt đầu phải trước ngày kết thúc.' });
      }
      const now = new Date();
      const start = new Date(start_date);
      const end = new Date(end_date);
      let promoStatus = (status === 'inactive')
        ? 'inactive'
        : (now < start ? 'upcoming' : (now <= end ? 'active' : 'expired'));
      await promotion.update({
        name,
        description,
        discount_type,
        discount_value: discount_value !== undefined ? Number(discount_value) : promotion.discount_value,
        quantity: quantity !== undefined ? Number(quantity) : promotion.quantity,
        start_date: start_date || promotion.start_date,
        end_date: end_date || promotion.end_date,
        status: promoStatus,
        applicable_to,
        min_price_threshold: min_price_threshold !== undefined ? Number(min_price_threshold) : promotion.min_price_threshold
      });
      res.status(200).json({ success: true, data: promotion });
    } catch (error) {
      console.error("Lỗi khi cập nhật khuyến mãi:", error);
      res.status(500).json({ success: false, message: "Lỗi máy chủ khi cập nhật khuyến mãi." });
    }
  }



  static async delete(req, res) {
    const { id } = req.params;
    try {
      const promotion = await PromotionModel.findByPk(id);
      if (!promotion) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy khuyến mãi để xóa.",
        });
      }
      if (promotion.status !== "upcoming") {
        return res.status(400).json({
          success: false,
          message: "Chỉ có thể xóa khuyến mãi khi trạng thái là 'Sắp diễn ra'.",
        });
      }
      if (promotion.used_count > 0) {
        return res.status(400).json({
          success: false,
          message: "Không thể xóa vì khuyến mãi đã được áp dụng cho đơn hàng.",
        });
      }
      await promotion.destroy();
      return res.status(200).json({
        success: true,
        message: "Xóa khuyến mãi thành công.",
      });
    } catch (error) {
      console.error("Lỗi khi xóa khuyến mãi:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi máy chủ khi xóa khuyến mãi.",
      });
    }
  }

}

module.exports = PromotionController;
