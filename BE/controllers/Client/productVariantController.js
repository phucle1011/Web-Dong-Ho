// controllers/productVariantController.js

const { Op } = require('sequelize');
const ProductVariantModel = require('../../models/productVariantsModel');
const PromotionProductModel = require('../../models/promotionProductsModel');
const PromotionModel = require('../../models/promotionsModel');

class ProductVariantController {
  static async getProductVariantDetail(req, res) {
    try {
      const { id } = req.params;

      // Lấy biến thể sản phẩm
      const productVariant = await ProductVariantModel.findByPk(id);

      if (!productVariant) {
        return res.status(404).json({ message: 'Không tìm thấy biến thể sản phẩm' });
      }

      // Tìm khuyến mãi áp dụng cho sản phẩm
      const promotionProduct = await PromotionProductModel.findOne({
        where: { product_variant_id: id },
        include: [
          {
            model: PromotionModel,
            as: 'promotion',
            where: {
              status: 'active',
              start_date: { [Op.lte]: new Date() },
              end_date: { [Op.gte]: new Date() },
            },
          },
        ],
      });

      let finalPrice = parseFloat(productVariant.price);
      let promotionData = null;

      if (promotionProduct && promotionProduct.promotion) {
        const promo = promotionProduct.promotion;

        if (promo.discount_type === 'percentage') {
          finalPrice -= (finalPrice * promo.discount_value) / 100;
        } else {
          finalPrice -= promo.discount_value;
        }

        // Đảm bảo giá không âm
        if (finalPrice < 0) finalPrice = 0;

        promotionData = {
          id: promo.id,
          code: promo.code,
          discount_type: promo.discount_type,
          discount_value: parseFloat(promo.discount_value),
          discounted_price: parseFloat(finalPrice.toFixed(2)),
        };
      }

      return res.json({
        id: productVariant.id,
        name: productVariant.name,
        price: parseFloat(productVariant.price),
        promotion: promotionData,
      });
    } catch (error) {
      console.error('Error in getProductVariantDetail:', error);
      return res.status(500).json({ message: 'Lỗi máy chủ' });
    }
  }
}

module.exports = ProductVariantController;
 