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

    const notifications = await NotificationModel.findAll({
      where: {
        status: 1,
        // Nếu muốn lọc theo ngày hiện tại đang hiệu lực:
        // start_date: { [Op.lte]: now },
        // end_date: { [Op.gte]: now },
      },
      attributes: [
        'id',
        'title',
        'thumbnail', // ✅ đảm bảo dòng này có
        'status',
        'start_date',
        'end_date',
        'created_at',
      ],
      include: [
        {
          model: FlashSaleModel,
          as: "flashSale",
          required: false,
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
          ],
        },
      ],
      order: [["id", "DESC"]],
    });

    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách flash sale theo notification:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
}

  static async getDiscountedProductsByNotificationId(req, res) {
  try {
    const now = new Date();
    const notificationId = req.params.notification_id;

    if (!notificationId) {
      return res.status(400).json({ message: "Thiếu notification_id" });
    }

    // ✅ 1. Tìm tất cả flash_sale liên quan đến notification
    const flashSales = await FlashSaleModel.findAll({
      where: { notification_id: notificationId },
    });

    if (!flashSales || flashSales.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy Flash Sale nào" });
    }

    const promotionIds = flashSales.map(fs => fs.promotion_id);
    console.log("===> [PROMOTION_IDS]", promotionIds);

    // ✅ 2. Điều kiện lọc promotion
    const promotionWhere = {
      status: "active",
      start_date: { [Op.lte]: now },
      end_date: { [Op.gte]: now },
      id: { [Op.in]: promotionIds },
    };

    console.log("===> [WHERE promotion]", promotionWhere);

    // ✅ 3. Tìm các product_variant có liên kết promotion
    const discountedVariants = await ProductVariant.findAll({
      include: [
        {
          model: Product,
          as: "product",
          where: {
            status: 1,
            publication_status: "published",
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

    console.log("===> [discountedVariants.length]", discountedVariants.length);

    // ✅ 4. Gom theo product
    const productMap = new Map();

    for (const variant of discountedVariants) {
      const product = variant.product;
      if (!product) continue;

      const variantPrice = parseFloat(variant.price);

      // ✅ Tìm khuyến mãi tốt nhất
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
    console.error("Lỗi khi lấy sản phẩm giảm giá theo notification:", error);
    return res.status(500).json({ message: "Lỗi server khi xử lý yêu cầu" });
  }
}



}

module.exports = FlashSaleController;
