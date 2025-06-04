const Product = require("../../models/productsModel");
const ProductVariant = require("../../models/productVariantsModel");
const PromotionModel = require("../../models/promotionsModel");
const PromotionProductModel = require("../../models/promotionProductsModel");
const VariantImagesModel = require("../../models/variantImagesModel");
const Brand = require("../../models/brandsModel");
const Category = require("../../models/categoriesModel");
const ProductVariantAttributeValuesModel = require("../../models/productVariantAttributeValuesModel");
const ProductAttributeModel = require("../../models/productAttributesModel");
const { Op } = require("sequelize");

class ProductController {
  static async getVariantsWithPromotion(req, res) {
  try {
    const productId = req.params.id;

    const product = await Product.findOne({
      where: { id: productId },
      include: [
        { model: Brand, as: "brand", attributes: ["id", "name"] },
        { model: Category, as: "category", attributes: ["id", "name"] },
        {
          model: ProductVariant,
          as: "variants",
          include: [
            {
              model: VariantImagesModel,
              as: "images",
              attributes: ["id", "image_url", "variant_id"],
            },
            {
              model: PromotionProductModel,
              as: "promotionProducts",
              include: [
                {
                  model: PromotionModel,
                  as: "promotion",
                  where: {
                    start_date: { [Op.lte]: new Date() },
                    end_date: { [Op.gte]: new Date() },
                  },
                  required: false,
                },
              ],
              required: false,
            },
            {
              model: ProductVariantAttributeValuesModel,
              as: "attributeValues",
              include: [
                {
                  model: ProductAttributeModel,
                  as: "attribute",
                  attributes: ["id", "name"],
                },
              ],
            },
          ],
        },
      ],
    });

    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    // Lấy tất cả ảnh từ các biến thể và gom lại thành 1 mảng
    const variantImages = [];
    
    const variants = product.variants.map((variant) => {
      const promo = variant.promotionProducts?.[0]?.promotion || null;
      let finalPrice = parseFloat(variant.price);
      let discount = 0;

      if (promo) {
        if (promo.discount_type === "percentage") {
          discount = parseFloat(promo.discount_value);
          finalPrice = parseFloat((finalPrice * (1 - discount / 100)).toFixed(2));
        } else if (promo.discount_type === "fixed") {
          discount = parseFloat(promo.discount_value);
          finalPrice = parseFloat((finalPrice - discount).toFixed(2));
        }
        if (finalPrice < 0) finalPrice = 0;
      }

      // Gom ảnh vào mảng chung
      if (variant.images?.length) {
        variant.images.forEach(img => {
          variantImages.push({
            id: img.id,
            image_url: img.image_url,
            variant_id: variant.id
          });
        });
      }

      return {
        ...variant.toJSON(),
        final_price: promo ? finalPrice : null,
        promotion: promo,
        images: variant.images,
        attribute_values: variant.attributeValues.map((attr) => ({
          attribute_name: attr.attribute?.name,
          value: attr.value,
        })),
      };
    });

    res.json({
      product: {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        brand: product.brand?.name || null,
        category: product.category?.name || null,
        variants,
        variantImages, // ✅ Danh sách ảnh của tất cả biến thể
      },
    });
  } catch (err) {
    console.error("Lỗi khi lấy thông tin sản phẩm và khuyến mãi:", err);
    res.status(500).json({ message: "Đã xảy ra lỗi khi lấy dữ liệu" });
  }
}

}

module.exports = ProductController;
