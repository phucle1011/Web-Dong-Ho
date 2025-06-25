const { Op } = require('sequelize');
const PromotionModel = require('../../models/promotionsModel');

class PromotionController {
  static async getAll(req, res) {
    const {
      searchTerm = '',
      page = 1,
      limit = 10,
      code,
      status,
      startDate,
      endDate,
      discount_type,
      quantity,
      special_promotion,
    } = req.query;

    const currentPage = parseInt(page, 10);
    const perPage = parseInt(limit, 10);
    const offset = (currentPage - 1) * perPage;

    try {

      const baseWhereClause = {};

      if (searchTerm) {
        baseWhereClause.name = {
          [Op.and]: [
            { [Op.not]: null },
            { [Op.like]: `%${searchTerm}%` },
          ],
        };
      }

      if (code) {
        baseWhereClause.code = {
          [Op.like]: `%${code}%`,
        };
      }

      if (startDate) {
        baseWhereClause.start_date = {
          ...(baseWhereClause.start_date || {}),
          [Op.gte]: new Date(startDate),
        };
      }

      if (endDate) {
        baseWhereClause.end_date = {
          ...(baseWhereClause.end_date || {}),
          [Op.lte]: new Date(endDate),
        };
      }

      if (discount_type) {
        baseWhereClause.discount_type = discount_type;
      }

      if (quantity !== undefined) {
        baseWhereClause.quantity = {
          [Op.gte]: parseInt(quantity, 10),
        };
      }

      const allPromotions = await PromotionModel.findAll({
        where: baseWhereClause,
        order: [['created_at', 'DESC']],
      });

      const now = new Date();
      const statusCounts = {
        all: 0,
        active: 0,
        expired: 0,
        upcoming: 0,
        exhausted: 0,
        inactive: 0,
        special: 0,
      };

      for (const promo of allPromotions) {
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

        const updateData = {};
        if (promo.status !== newStatus) {
          updateData.status = newStatus;
        }

        if (newStatus === 'exhausted' && promo.quantity !== 0) {
          updateData.quantity = 0;
        }

        if (Object.keys(updateData).length > 0) {
          await promo.update(updateData);
          Object.assign(promo, updateData);
        }

        statusCounts[newStatus] = (statusCounts[newStatus] || 0) + 1;

        if (
          promo.special_promotion &&
          promo.status === 'active' &&
          promo.quantity > 0 &&
          new Date(promo.start_date) <= now &&
          new Date(promo.end_date) >= now
        ) {
          statusCounts.special = (statusCounts.special || 0) + 1;
        }

      }

      statusCounts.all = allPromotions.length;

      let filteredPromotions = allPromotions;
      if (special_promotion !== undefined) {
        const isSpecial = special_promotion === 'true';
        filteredPromotions = filteredPromotions.filter(promo => promo.special_promotion === isSpecial);
      }

      if (status) {
        const statusArray = typeof status === 'string' ? status.split(',') : [status];
        filteredPromotions = filteredPromotions.filter(promo =>
          statusArray.includes(promo.status)
        );
      }

      const totalFilteredItems = filteredPromotions.length;
      const paginatedPromotions = filteredPromotions.slice(offset, offset + perPage);

      res.status(200).json({
        success: true,
        data: paginatedPromotions,
        pagination: {
          totalItems: totalFilteredItems,
          currentPage,
          totalPages: Math.ceil(totalFilteredItems / perPage),
        },
        statusCounts,
      });
    } catch (error) {
      console.error("Lỗi khi lấy danh sách khuyến mãi:", error.message, error.stack);
      res.status(500).json({
        success: false,
        message: "Lỗi máy chủ.",
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
        max_price = null,
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
      end.setHours(23, 59, 59, 999);

      let promoStatus;
      if (status === 'inactive') {
        promoStatus = 'inactive';
      } else {
        promoStatus = now < start ? 'upcoming' : (now <= end ? 'active' : 'expired');
      }

      const code = await PromotionController.generateUniquePromoCode();
      const isSpecial = Array.isArray(user_ids) && user_ids.length > 0;


      const promotion = await PromotionModel.create({
        name,
        description,
        discount_type,
        discount_value: Number(discount_value),
        quantity: Number(quantity),
        start_date: start,
        end_date: end,
        status: promoStatus,
        applicable_to,
        min_price_threshold: Number(min_price_threshold),
        max_price: max_price !== null ? Number(max_price) : null,
        code,
        special_promotion: isSpecial,
      });

      if (Array.isArray(user_ids) && user_ids.length > 0) {
        await promotion.setUsers(user_ids);
      }

      if (isSpecial) {
        await promotion.setUsers(user_ids);
      }

      res.status(201).json({ success: true, data: promotion });
    } catch (error) {
      console.error('Lỗi khi tạo khuyến mãi:', error);
      res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }
  }

  static async generateUniquePromoCode(length = 8) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code;

    let isUnique = false;
    while (!isUnique) {
      code = Array.from({ length }, () => characters[Math.floor(Math.random() * characters.length)]).join('');
      const existing = await PromotionModel.findOne({ where: { code } });
      if (!existing) {
        isUnique = true;
      }
    }

    return code;
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
        min_price_threshold,
        max_price = null,
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
      end.setHours(23, 59, 59, 999);
      let promoStatus = (status === 'inactive')
        ? 'inactive'
        : (now < start ? 'upcoming' : (now <= end ? 'active' : 'expired'));
      await promotion.update({
        name,
        description,
        discount_type,
        discount_value: discount_value !== undefined ? Number(discount_value) : promotion.discount_value,
        quantity: quantity !== undefined ? Number(quantity) : promotion.quantity,
        start_date: start_date ? start : promotion.start_date,
        end_date: end_date ? end : promotion.end_date,
        status: promoStatus,
        applicable_to,
        min_price_threshold: min_price_threshold !== undefined ? Number(min_price_threshold) : promotion.min_price_threshold,
        max_price: max_price !== undefined ? Number(max_price) : promotion.max_price
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
