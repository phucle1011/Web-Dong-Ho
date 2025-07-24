const NotificationModel = require("../../models/notificationsModel");

const FlashSaleModel = require("../../models/FlashSaleModel");
const PromotionModel = require("../../models/promotionsModel");
const PromotionProductModel = require("../../models/promotionProductsModel");
const VariantImagesModel = require("../../models/variantImagesModel");
const Product = require("../../models/productsModel");
const ProductVariant = require("../../models/productVariantsModel");
const ProductVariantAttributeValuesModel = require("../../models/productVariantAttributeValuesModel");
const ProductAttributeModel = require("../../models/productAttributesModel");
const { Op, fn, col } = require("sequelize");

class FlashSaleController {
  // ✅ Lấy tất cả flash sale đang hoạt động
static async getAll(req, res) {
  try {
    const now = new Date();

    const flashSales = await FlashSaleModel.findAll({
      include: [
        {
          model: PromotionModel,
          as: "promotion",
          where: {
            status: "active",
            start_date: { [Op.lte]: now },
            end_date: { [Op.gte]: now },
          },
          required: true,
        },
        {
          model: NotificationModel,
          as: "notification",
          // Thêm dòng này để chỉ lấy những trường thực sự tồn tại
          attributes: ['id', 'thumbnail', 'title', 'status', 'created_at'],
        },
      ],
      order: [["id", "DESC"]],
    });

    res.status(200).json({ success: true, data: flashSales });
  } catch (error) {
    console.error("Lỗi khi lấy flash sale:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
}

  static async getDiscountedProducts(req, res) {
    try {
      const now = new Date();
      const promotionId = req.params.promotion_id; 
  
      // Xây dựng điều kiện where cho promotion
      const promotionWhere = {
        status: "active",
        start_date: { [Op.lte]: now },
        end_date: { [Op.gte]: now },
      };
      if (promotionId) {
        promotionWhere.id = promotionId;
      }
  
      const discountedVariants = await ProductVariant.findAll({
        include: [
          {
            model: Product,
            as: "product",
            where: { status: 1 ,
              publication_status: 'published'
            },
            attributes: ["id", "name", "thumbnail", "createdAt"],
          },
          {
            model: VariantImagesModel,
            as: "images",
            attributes: ["id", "image_url"],
          },
          {
            model: PromotionProductModel,
            as: "promotionProducts",
            include: [
              {
                model: PromotionModel,
                as: "promotion",
                where: promotionWhere,
                required: true,
                attributes: [
                  "id",
                  "name",
                  "discount_type",
                  "discount_value",
                  "start_date",
                  "end_date",
                ],
              },
            ],
          },
        ],
        where: {
          "$promotionProducts.promotion.id$": { [Op.ne]: null },
        },
      });
  
      // Gom nhóm theo product như code cũ
      const productMap = new Map();
  
      for (const variant of discountedVariants) {
        const product = variant.product;
        if (!product) continue;
  
        const variantPrice = parseFloat(variant.price);
  
        // Tìm khuyến mãi tốt nhất cho variant này
        const bestPromotion = variant.promotionProducts.reduce((best, pp) => {
          const promo = pp.promotion;
          let finalPrice = variantPrice;
          let percent = 0;
  
          if (promo.discount_type === "percentage") {
            finalPrice -= (variantPrice * parseFloat(promo.discount_value)) / 100;
            percent = parseFloat(promo.discount_value);
          } else if (promo.discount_type === "fixed") {
            finalPrice -= parseFloat(promo.discount_value);
            percent = ((variantPrice - finalPrice) / variantPrice) * 100;
          }
  
          finalPrice = Math.max(0, finalPrice);
  
          const info = {
            id: promo.id,
            name: promo.name,
            discount_type: promo.discount_type,
            discount_value: parseFloat(promo.discount_value),
            discounted_price: parseFloat(finalPrice.toFixed(2)),
            discount_percent: parseFloat(percent.toFixed(2)),
          };
  
          if (!best || info.discounted_price < best.discounted_price) {
            return info;
          }
          return best;
        }, null);
  
        const variantJson = variant.toJSON();
        variantJson.promotion = bestPromotion || {
          discounted_price: variantPrice,
          discount_percent: 0,
        };
  
        // Gom nhóm theo product
        if (!productMap.has(product.id)) {
          productMap.set(product.id, {
            id: product.id,
            name: product.name,
            thumbnail: product.thumbnail,
            created_at: product.createdAt,
            variants: [variantJson],
            total_stock: parseInt(variant.stock) || 0,
            variantCount: 1,
          });
        } else {
          const p = productMap.get(product.id);
          p.variants.push(variantJson);
          p.total_stock += parseInt(variant.stock) || 0;
          p.variantCount += 1;
        }
      }
  
      const result = Array.from(productMap.values());
      return res.status(200).json(result);
    } catch (error) {
      console.error("Lỗi khi lấy sản phẩm giảm giá:", error);
      return res.status(500).json({ message: "Lỗi server khi lấy sản phẩm giảm giá" });
    }
  }
}

module.exports = FlashSaleController;
