const { Op, Sequelize } = require("sequelize");
const ProductVariantsModel = require("../../models/productVariantsModel");
const ProductModel = require("../../models/productsModel");
const PromotionProductModel = require("../../models/promotionProductsModel");
const PromotionModel = require("../../models/promotionsModel");
const sequelize = require('../../config/database');

class PromotionProductController {
  static async getAll(req, res) {
    const { searchTerm = "", page = 1, limit = 10, promotion_id } = req.query;
    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);

    try {
      const whereCondition = {};
      if (searchTerm) {
        whereCondition[Op.or] = [
          { '$variant.product.name$': { [Op.like]: `%${searchTerm}%` } },
          { '$promotion.name$': { [Op.like]: `%${searchTerm}%` } },
          { '$variant.sku$': { [Op.like]: `%${searchTerm}%` } },
          { '$promotion.status$': { [Op.like]: `%${searchTerm}%` } },
        ];
      }
      if (promotion_id) {
        whereCondition.promotion_id = parseInt(promotion_id, 10);
      }

      const allRows = await PromotionProductModel.findAll({
        where: whereCondition,
        include: [
          {
            model: ProductVariantsModel,
            as: 'variant',
            attributes: ['id', 'sku', 'price', 'stock'],
            include: [{ model: ProductModel, as: 'product', attributes: ['name'] }],
            required: false,
          },
          {
            model: PromotionModel,
            as: 'promotion',
            attributes: {
              include: [
                'id',
                'name',
                'start_date',
                'end_date',
                'discount_value',
                'discount_type',
                'quantity',
                [
                  Sequelize.literal(
                    '(SELECT COUNT(DISTINCT pp.product_variant_id) FROM promotion_products AS pp WHERE pp.promotion_id = promotion.id AND pp.product_variant_id IS NOT NULL)'
                  ),
                  'variant_count'
                ]
              ],
              exclude: []
            }
          }
        ],
        order: [['promotion', 'id', 'ASC']],
        subQuery: false
      });

      const grouped = {};
      allRows.forEach(item => {
        const promoId = item.promotion?.id;
        if (!promoId) return;
        if (!grouped[promoId]) grouped[promoId] = [];
        grouped[promoId].push(item);
      });

      const promoIds = Object.keys(grouped).map(id => parseInt(id, 10));
      const totalPromotions = promoIds.length;
      const totalPages = Math.ceil(totalPromotions / pageSize);

      const startIndex = (pageNumber - 1) * pageSize;
      const pagePromoIds = promoIds.slice(startIndex, startIndex + pageSize);
      const rows = pagePromoIds.flatMap(id => grouped[id]);

      return res.json({
        data: rows,
        pagination: {
          total: totalPromotions,
          page: pageNumber,
          limit: pageSize,
          totalPages
        }
      });
    } catch (err) {
      console.error('Error fetching promotion_products:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  static async getById(req, res) {
    try {
      const id = req.params.id;
      const data = await PromotionProductModel.findByPk(id, {
        include: [
          {
            model: ProductVariantsModel,
            as: "variant",
            attributes: ["sku", "price", "stock"],
            include: [
              {
                model: ProductModel,
                as: "product",
                attributes: ["name"],
              },
            ],
          },
          {
            model: PromotionModel,
            as: "promotion",
            attributes: ["name", "start_date", "end_date", "status"],
          },
        ],
      });

      if (!data) {
        return res.status(404).json({ message: "Promotion product not found" });
      }

      res.json(data);
    } catch (err) {
      console.error("Error in getById:", err);
      res.status(500).json({ error: err.message });
    }
  }

  static async create(req, res) {
    try {
      const { product_variant_id, promotion_id } = req.body;
      // console.log("Received payload:", { product_variant_id, promotion_id });

      const variantIds = Array.isArray(product_variant_id) ? product_variant_id : [product_variant_id];
      const promotionIds = Array.isArray(promotion_id) ? promotion_id : [promotion_id];

      if (variantIds.length === 0 || promotionIds.length === 0) {
        return res.status(400).json({
          error: "Vui lòng cung cấp ít nhất 1 promotion và 1 product_variant",
        });
      }

      if (variantIds.some(id => isNaN(id) || id <= 0) || promotionIds.some(id => isNaN(id) || id <= 0)) {
        return res.status(400).json({ error: "ID khuyến mãi hoặc biến thể không hợp lệ" });
      }

      const variants = await ProductVariantsModel.findAll({
        where: { id: variantIds },
      });
      if (variants.length !== variantIds.length) {
        const missingIds = variantIds.filter(id => !variants.some(v => v.id === id));
        return res.status(400).json({ error: `Các biến thể sản phẩm không tồn tại: ${missingIds.join(', ')}` });
      }

      const promotions = await PromotionModel.findAll({
        where: { id: promotionIds },
      });
      if (promotions.length !== promotionIds.length) {
        const missingIds = promotionIds.filter(id => !promotions.some(p => p.id === id));
        return res.status(400).json({ error: `Các khuyến mãi không tồn tại: ${missingIds.join(', ')}` });
      }

      const payloads = [];
      for (const promoId of promotionIds) {
        for (const variantId of variantIds) {
          payloads.push({
            promotion_id: parseInt(promoId),
            product_variant_id: parseInt(variantId),
          });
        }
      }

      const existingRecords = await PromotionProductModel.findAll({
        where: {
          promotion_id: promotionIds,
          product_variant_id: variantIds,
        },
      });

      const existingPairs = new Set(
        existingRecords.map(item => `${item.promotion_id}-${item.product_variant_id}`)
      );

      const filteredPayloads = payloads.filter(
        p => !existingPairs.has(`${p.promotion_id}-${p.product_variant_id}`)
      );

      if (filteredPayloads.length === 0) {
        return res.status(409).json({ error: "Tất cả các cặp promotion-product đã tồn tại" });
      }

      await sequelize.transaction(async t => {
        await PromotionProductModel.bulkCreate(filteredPayloads, { transaction: t });

        const countByPromo = filteredPayloads.reduce((acc, cur) => {
          acc[cur.promotion_id] = (acc[cur.promotion_id] || 0) + 1;
          return acc;
        }, {});

        for (const [promoId, decCount] of Object.entries(countByPromo)) {
          const promo = await PromotionModel.findByPk(promoId, { transaction: t });
          if (!promo) {
            console.error(`Promotion ${promoId} not found`);
            throw new Error(`Khuyến mãi ${promoId} không tồn tại`);
          }
          if (promo.quantity < decCount) {
            console.error(`Promotion ${promoId} has insufficient quantity: ${promo.quantity} < ${decCount}`);
            throw new Error(`Khuyến mãi ${promoId} chỉ còn ${promo.quantity} lượt, không đủ để thêm ${decCount} biến thể`);
          }
          await PromotionModel.decrement(
            { quantity: decCount },
            { where: { id: promoId }, transaction: t }
          );
        }
      });

      const data = await PromotionProductModel.findAll({
        where: { promotion_id: promotionIds },
        include: [
          { model: PromotionModel, as: 'promotion' },
          { model: ProductVariantsModel, as: 'variant' },
        ],
      });

      return res.status(201).json({ message: "Thêm promotion-product thành công", data });
    } catch (err) {
      console.error("Error in create:", {
        message: err.message,
        stack: err.stack,
        payload: req.body,
      });
      return res.status(500).json({ error: err.message || "Lỗi khi thêm sản phẩm khuyến mãi" });
    }
  }

  static async update(req, res) {
    try {
      const { promotion_id, product_variant_ids, status } = req.body;

      if (!promotion_id || !Array.isArray(product_variant_ids)) {
        return res.status(400).json({
          error: 'promotion_id và product_variant_ids là bắt buộc, product_variant_ids phải là mảng',
        });
      }

      const promotion = await PromotionModel.findByPk(promotion_id);
      if (!promotion) {
        return res.status(404).json({ error: 'Không tìm thấy khuyến mãi' });
      }

      const variants = await ProductVariantsModel.findAll({
        where: { id: product_variant_ids },
      });
      if (variants.length !== product_variant_ids.length) {
        return res.status(400).json({ error: 'Một hoặc nhiều biến thể sản phẩm không tồn tại' });
      }

      const existingRecords = await PromotionProductModel.findAll({
        where: { promotion_id },
      });
      const existingVariantIds = existingRecords.map(record => record.product_variant_id);

      const newVariantIds = product_variant_ids.filter(id => !existingVariantIds.includes(id));
      const removedVariantIds = existingVariantIds.filter(id => !product_variant_ids.includes(id));
      const variantCountChange = newVariantIds.length - removedVariantIds.length;

      if (variantCountChange > 0 && promotion.quantity < variantCountChange) {
        return res.status(400).json({
          error: `Khuyến mãi ${promotion_id} chỉ còn ${promotion.quantity} lượt, không đủ để thêm ${variantCountChange} biến thể`,
        });
      }

      await sequelize.transaction(async t => {
        await PromotionProductModel.destroy({
          where: { promotion_id },
          transaction: t,
        });

        const newRecords = product_variant_ids
          .filter(variant_id => variant_id && !isNaN(variant_id))
          .map(variant_id => ({
            promotion_id,
            product_variant_id: parseInt(variant_id),
          }));

        await PromotionProductModel.bulkCreate(newRecords, { transaction: t });

        if (variantCountChange !== 0) {
          if (variantCountChange > 0) {
            await PromotionModel.decrement(
              { quantity: variantCountChange },
              { where: { id: promotion_id }, transaction: t },
            );
          } else {
            await PromotionModel.increment(
              { quantity: Math.abs(variantCountChange) },
              { where: { id: promotion_id }, transaction: t },
            );
          }
        }

        await PromotionModel.update(
          { status: status || promotion.status, variant_count: newRecords.length },
          { where: { id: promotion_id }, transaction: t },
        );
      });

      const updatedRecords = await PromotionProductModel.findAll({
        where: { promotion_id },
        include: [
          { model: PromotionModel, as: 'promotion' },
          { model: ProductVariantsModel, as: 'variant' },
        ],
      });

      return res.status(200).json({
        message: 'Cập nhật khuyến mãi thành công',
        data: updatedRecords,
      });
    } catch (err) {
      console.error('Lỗi khi cập nhật khuyến mãi:', {
        message: err.message,
        stack: err.stack,
        payload: req.body,
      });
      return res.status(500).json({ error: err.message || 'Lỗi server' });
    }
  }

  static async remove(req, res) {
    const { id } = req.params;

    try {
      const transaction = await sequelize.transaction();

      try {
        const promotionProduct = await PromotionProductModel.findByPk(id, {
          transaction,
        });

        if (!promotionProduct) {
          await transaction.rollback();
          return res.status(404).json({ message: 'Không tìm thấy bản ghi khuyến mãi.' });
        }

        const promotionId = promotionProduct.promotion_id;

        await promotionProduct.destroy({ transaction });

        await PromotionModel.increment('quantity', {
          by: 1,
          where: { id: promotionId },
          transaction,
        });

        await transaction.commit();

        return res.status(200).json({ message: 'Xóa thành công! Đã hoàn lại 1 lượt sử dụng.' });
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      console.error('Lỗi khi xóa bản ghi khuyến mãi:', error);
      return res.status(500).json({ message: 'Xóa thất bại: ' + error.message });
    }
  }

  static async getAllPromotion(req, res) {
    try {
      const now = new Date();

      const promotionProducts = await PromotionModel.findAll({
        where: {
          status: {
            [Op.in]: ["active", "upcoming"],
          },
          applicable_to: "product",
        },
      });

      res.status(200).json({
        success: true,
        data: promotionProducts,
      });
    } catch (error) {
      console.error("Lỗi khi lấy danh sách promotion:", error.message);
      res.status(500).json({
        success: false,
        message: "Lỗi máy chủ.",
      });
    }
  }
}

module.exports = PromotionProductController;