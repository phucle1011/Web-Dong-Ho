const Product = require("../../models/productsModel");
const ProductVariant = require("../../models/productVariantsModel");
const PromotionModel = require("../../models/promotionsModel");
const PromotionProductModel = require("../../models/promotionProductsModel");
const VariantImagesModel = require("../../models/variantImagesModel");
const Brand = require("../../models/brandsModel");
const Category = require("../../models/categoriesModel");
const ProductVariantAttributeValuesModel = require("../../models/productVariantAttributeValuesModel");
const ProductAttributeModel = require("../../models/productAttributesModel");
const OrderDetail = require("../../models/orderDetailsModel");
const Comment = require("../../models/commentsModel");
const { Op, fn, col, literal,Sequelize } = require("sequelize");

class ProductController {
  static async getVariantsWithPromotion(req, res) {
    try {
      const productId = req.params.id;

      // Tìm thông tin sản phẩm kèm các quan hệ
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
                      applicable_to:"product",
                      start_date: { [Op.lte]: new Date() },
                      end_date: { [Op.gte]: new Date() },
                      status: "active",
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

      const variantImages = [];
      const now = new Date();

      const variants = product.variants.map((variant) => {
        const promo = variant.promotionProducts?.[0]?.promotion || null;

        let finalPrice = parseFloat(variant.price);
        let discount = 0;
        let validPromo = null;

        if (
          promo &&
          promo.status === "active" &&
          new Date(promo.start_date) <= now &&
          new Date(promo.end_date) >= now
        ) {
          validPromo = promo;

          if (promo.discount_type === "percentage") {
            discount = parseFloat(promo.discount_value);
            finalPrice = parseFloat((finalPrice * (1 - discount / 100)).toFixed(2));
          } else if (promo.discount_type === "fixed") {
            discount = parseFloat(promo.discount_value);
            finalPrice = parseFloat((finalPrice - discount).toFixed(2));
          }

          if (finalPrice < 0) finalPrice = 0;
        }

        // Gom ảnh
        if (variant.images?.length) {
          variant.images.forEach((img) => {
            variantImages.push({
              id: img.id,
              image_url: img.image_url,
              variant_id: variant.id,
            });
          });
        }

        return {
          ...variant.toJSON(),
          final_price: validPromo ? finalPrice : null,
          promotion: validPromo,
          images: variant.images,
          attribute_values: variant.attributeValues.map((attr) => ({
            attribute_name: attr.attribute?.name,
            value: attr.value,
          })),
        };
      });

      // ✅ Lấy trung bình đánh giá và số lượng đánh giá từ bảng comments (qua order_details → product_variants)
      const ratingData = await Comment.findAll({
  include: [
    {
      model: OrderDetail,
      as: "orderDetail", // đúng alias
      attributes: [],
      include: [
        {
          model: ProductVariant,
          as: "variant",
          where: { product_id: productId },
          attributes: [],
        },
      ],
    },
  ],
  attributes: [
    [fn("AVG", col("rating")), "avgRating"],
    [fn("COUNT", col("rating")), "ratingCount"],
  ],
  raw: true,
});


      const averageRating = parseFloat(ratingData[0].avgRating || 0).toFixed(1);
      const ratingCount = parseInt(ratingData[0].ratingCount || 0);

      res.json({
        product: {
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          brand: product.brand?.name || null,
          category: product.category?.name || null,
          thumbnail: product.thumbnail,
          variants,
          variantImages,
          averageRating,
          ratingCount,
        },
      });
    } catch (err) {
      console.error("Lỗi khi lấy thông tin sản phẩm và khuyến mãi:", err);
      res.status(500).json({ message: "Đã xảy ra lỗi khi lấy dữ liệu" });
    }
  }

static async getSimilarProducts(req, res) {
  try {
    const productId = req.params.id;

    const product = await Product.findOne({
      where: { id: productId },
      attributes: ["id", "category_id", "brand_id"],
    });

    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    const whereCommon = {
      id: { [Op.ne]: productId },
      status: 1,
    };

    const buildQuery = (extraWhere) => ({
      where: { ...whereCommon, ...extraWhere },
      include: [
        {
          model: ProductVariant,
          as: 'variants',
          required: true,
          attributes: ['id', 'price'],
        },
      ],
      attributes: ['id', 'name', 'thumbnail'],
      limit: 6,
    });

    let similarProducts;

    console.log("📦 Bắt đầu tìm sản phẩm tương tự theo category + brand");
    similarProducts = await Product.findAll(buildQuery({
      category_id: product.category_id,
      brand_id: product.brand_id,
    }));
    console.log("👉 Tìm được (category + brand):", similarProducts.length);

    if (similarProducts.length === 0) {
      console.log("📦 Tiếp tục tìm theo category");
      similarProducts = await Product.findAll(buildQuery({
        category_id: product.category_id,
      }));
      console.log("👉 Tìm được (category):", similarProducts.length);
    }

    if (similarProducts.length === 0) {
      console.log("📦 Tiếp tục tìm theo brand");
      similarProducts = await Product.findAll(buildQuery({
        brand_id: product.brand_id,
      }));
      console.log("👉 Tìm được (brand):", similarProducts.length);
    }

    if (similarProducts.length === 0) {
      console.log("📦 Lấy ngẫu nhiên");
      similarProducts = await Product.findAll({
        where: whereCommon,
        include: [
          {
            model: ProductVariant,
            as: 'variants',
            required: true,
            attributes: ['id', 'price'],
          },
        ],
        attributes: ['id', 'name', 'thumbnail'],
        order: Sequelize.literal('RAND()'),
        limit: 6,
      });
      console.log("👉 Tìm được (random):", similarProducts.length);
    }

    res.json({ similarProducts });
  } catch (err) {
    console.error("Lỗi khi lấy sản phẩm tương tự:", err);
    res.status(500).json({ message: "Đã xảy ra lỗi khi lấy sản phẩm tương tự" });
  }
}




}

module.exports = ProductController;
