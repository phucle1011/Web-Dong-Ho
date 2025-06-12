const { Op } = require("sequelize");
const Product = require("../../models/productsModel");
const ProductVariant = require("../../models/productVariantsModel");
const ProductVariantAttributeValue = require("../../models/productVariantAttributeValuesModel");
const ProductAttribute = require("../../models/productAttributesModel");
const VariantImage = require("../../models/variantImagesModel");
const BrandModel = require("../../models/brandsModel");
const CategoryModel = require("../../models/categoriesModel");
const PromotionProductModel = require("../../models/promotionProductsModel");
const PromotionModel = require("../../models/promotionsModel");

class ProductClientController {
static async getAll(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const whereCondition = {};
    if (req.query.status) whereCondition.status = req.query.status;
    if (req.query.category_id) whereCondition.category_id = req.query.category_id;
    if (req.query.brand_id) whereCondition.brand_id = req.query.brand_id;

    const totalProducts = await Product.count({ where: whereCondition });

    const products = await Product.findAll({
      where: whereCondition,
      order: [["created_at", "DESC"]],
      limit: limit,
      offset: offset,
      include: [
        {
          model: ProductVariant,
          as: "variants",
          include: [
            {
              model: ProductVariantAttributeValue,
              as: "attributeValues",
              include: [{ model: ProductAttribute, as: "attribute" }],
            },
            { model: VariantImage, as: "images" },
            {
              model: PromotionProductModel,
              as: "promotionProducts",
              include: [{ model: PromotionModel, as: "promotion" }],
            },
          ],
        },
        { model: CategoryModel, as: "category", attributes: ["id", "name"] },
        { model: BrandModel, as: "brand", attributes: ["id", "name"] },
      ],
    });

    const currentDate = new Date();
    const productsWithVariantCount = await Promise.all(
      products.map(async (product) => {
        const productJson = product.toJSON();
        productJson.variantCount = product.variants?.length || 0;

        if (productJson.variants && productJson.variants.length > 0) {
          for (let variant of productJson.variants) {
            const promotions = await PromotionProductModel.findAll({
              where: { product_variant_id: variant.id },
              include: [
                {
                  model: PromotionModel,
                  as: "promotion",
                  where: {
                    status: "active",
                    start_date: { [Op.lte]: currentDate },
                    end_date: { [Op.gte]: currentDate },
                  },
                  required: true,
                },
              ],
            });

            let bestPromotion = null;
            let lowestPrice = parseFloat(variant.price) || 0;
            let discountPercent = 0;

            if (promotions.length > 0) {
              bestPromotion = promotions.reduce((best, promoProduct) => {
                const promo = promoProduct.promotion;
                const variantPrice = parseFloat(variant.price) || 0;

                // Kiểm tra điều kiện khuyến mãi
                let meetsConditions = true;
                // Đảm bảo min_price_threshold <= max_price
                const minPrice = parseFloat(promo.min_price_threshold) || 0;
                const maxPrice = parseFloat(promo.max_price) || Infinity;
                if (variantPrice < minPrice || variantPrice > maxPrice) {
                  meetsConditions = true;
                }

                let finalPrice = variantPrice;
                let currentDiscountPercent = 0;

                if (meetsConditions) {
                  if (promo.discount_type === "percentage") {
                    finalPrice -= (finalPrice * parseFloat(promo.discount_value)) / 100;
                    currentDiscountPercent = parseFloat(promo.discount_value);
                  } else if (promo.discount_type === "fixed") {
                    finalPrice -= parseFloat(promo.discount_value);
                    currentDiscountPercent = ((variantPrice - finalPrice) / variantPrice) * 100;
                  }
                  finalPrice = Math.max(0, finalPrice); // Đảm bảo giá không âm
                }

                const newPromo = {
                  id: promo.id,
                  code: promo.code,
                  discount_type: promo.discount_type,
                  discount_value: parseFloat(promo.discount_value),
                  discounted_price: parseFloat(finalPrice.toFixed(2)),
                  discount_percent: parseFloat(currentDiscountPercent.toFixed(2)),
                  meets_conditions: meetsConditions && promo.quantity > 0,
                };

                // Chọn khuyến mãi tốt nhất nếu thỏa mãn điều kiện
                if (!best || (newPromo.meets_conditions && newPromo.discounted_price < best.discounted_price)) {
                  return newPromo;
                }
                return best;
              }, null);

              if (bestPromotion && bestPromotion.meets_conditions) {
                lowestPrice = bestPromotion.discounted_price;
                discountPercent = bestPromotion.discount_percent;
              }
            }

            variant.promotion = bestPromotion || {
              discounted_price: lowestPrice,
              discount_percent: 0,
              meets_conditions: false,
            };
          }
        }

        return productJson;
      })
    );

    const totalVariants = products.reduce((sum, product) => {
      return sum + (product.variants?.length || 0);
    }, 0);

    res.status(200).json({
      status: 200,
      message: "Lấy danh sách sản phẩm thành công",
      data: productsWithVariantCount,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalProducts / limit),
        totalProducts,
      },
      totalVariants,
    });
  } catch (error) {
    console.error("Error in getAll:", error);
    res.status(500).json({ error: error.message });
  }
}

  static async countStockGroupByProductId(req, res) {
    try {
      const result = await ProductVariantModel.findAll({
        attributes: [
          "product_id",
          [ProductVariantModel.sequelize.fn("SUM", ProductVariantModel.sequelize.col("stock")), "total_stock"],
        ],
        group: ["product_id"],
        raw: true,
      });

      return res.status(200).json({
        status: 200,
        message: "Tổng stock theo từng product_id",
        data: result,
      });
    } catch (error) {
      console.error("Error in countStockGroupByProductId:", error);
      return res.status(500).json({ message: "Lỗi máy chủ" });
    }
  }
}

module.exports = ProductClientController;