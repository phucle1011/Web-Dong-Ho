const { Op } = require("sequelize");
const Product = require("../../models/productsModel");
const ProductVariantModel = require("../../models/productVariantsModel");

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
    const { Op } = require('sequelize');
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const offset = (page - 1) * limit;

    const whereCondition = {};
    // Ưu tiên lọc sản phẩm không ẩn
    whereCondition.status = { [Op.ne]: 'hidden' };
    if (req.query.status && req.query.status !== 'hidden') {
      whereCondition.status = req.query.status;
    }

    // Lọc theo publication_status
    whereCondition.publication_status = req.query.publication_status || 'published';

    // Tìm kiếm theo tên hoặc mô tả
    if (req.query.query) {
      whereCondition[Op.or] = [
        { name: { [Op.like]: `%${req.query.query}%` } },
        { description: { [Op.like]: `%${req.query.query}%` } },
      ];
    }

    // Lọc theo danh mục
    if (req.query.category_id) {
      whereCondition.category_id = {
        [Op.in]: req.query.category_id.split(",").map(Number),
      };
    }

    // Lọc theo thương hiệu
    if (req.query.brand_id) {
      whereCondition.brand_id = {
        [Op.in]: req.query.brand_id.split(",").map(Number),
      };
    }

    // Điều kiện lọc biến thể (variants) theo giá và tồn kho
    const variantWhereCondition = {};
    if (req.query.min_price || req.query.max_price) {
      variantWhereCondition.price = {};
      if (req.query.min_price && !isNaN(parseFloat(req.query.min_price))) {
        variantWhereCondition.price[Op.gte] = parseFloat(req.query.min_price);
      }
      if (req.query.max_price && !isNaN(parseFloat(req.query.max_price))) {
        variantWhereCondition.price[Op.lte] = parseFloat(req.query.max_price);
      }
    }
    // Chỉ lấy biến thể có tồn kho
    variantWhereCondition.stock = { [Op.gt]: 0 };

    // Truy vấn sản phẩm với điều kiện chỉ lấy sản phẩm có biến thể
    const { count: totalProducts, rows: products } = await Product.findAndCountAll({
      where: whereCondition,
      order: [["created_at", "DESC"]],
      limit,
      offset,
      attributes: [
        'id',
        'name',
        'slug',
        'description',
        'brand_id',
        'category_id',
        'thumbnail',
        'status',
        'publication_status',
        'created_at',
        'updated_at'
      ],
      include: [
        {
          model: ProductVariant,
          as: "variants",
          where: variantWhereCondition,
          include: [
            { model: VariantImage, as: "images" },
            {
              model: PromotionProductModel,
              as: "promotionProducts",
              include: [
                {
                  model: PromotionModel,
                  as: "promotion",
                  where: {
                    status: "active",
                    start_date: { [Op.lte]: new Date() },
                    end_date: { [Op.gte]: new Date() },
                  },
                  required: false,
                },
              ],
            },
          ],
          required: true, // Chỉ lấy sản phẩm có ít nhất 1 biến thể hợp lệ
        },
        {
          model: CategoryModel,
          as: "category",
          attributes: ["id", "name"],
        },
        {
          model: BrandModel,
          as: "brand",
          attributes: ["id", "name"],
        },
      ],
      distinct: true, // Đảm bảo đếm chính xác số sản phẩm, không tính trùng lặp
    });

    // Kiểm tra nếu không có sản phẩm nào
    if (!products || products.length === 0) {
      return res.status(200).json({
        status: 200,
        message: "Không tìm thấy sản phẩm phù hợp",
        data: [],
        pagination: {
          currentPage: page,
          limit,
          totalPages: 0,
          totalProducts: 0,
        },
        totalVariants: 0,
      });
    }

    // Xử lý dữ liệu sản phẩm
    const productsWithVariantCount = products
      .map((product) => {
        const productJson = product.toJSON();
        productJson.variantCount = product.variants?.length || 0;
        productJson.total_stock = product.variants.reduce((sum, variant) => {
          return sum + (parseInt(variant.stock) || 0);
        }, 0);

        if (productJson.variants && productJson.variants.length > 0) {
          for (let variant of productJson.variants) {
            const promotions = variant.promotionProducts || [];
            let bestPromotion = null;
            let lowestPrice = parseFloat(variant.price) || 0;
            let discountPercent = 0;

            if (promotions.length > 0) {
              bestPromotion = promotions.reduce((best, promoProduct) => {
                const promo = promoProduct.promotion;
                if (!promo) return best;
                const variantPrice = parseFloat(variant.price) || 0;

                let finalPrice = variantPrice;
                let currentDiscountPercent = 0;

                if (promo.discount_type === "percentage") {
                  finalPrice -= (finalPrice * parseFloat(promo.discount_value)) / 100;
                  currentDiscountPercent = parseFloat(promo.discount_value);
                } else if (promo.discount_type === "fixed") {
                  finalPrice -= parseFloat(promo.discount_value);
                  currentDiscountPercent = ((variantPrice - finalPrice) / variantPrice) * 100;
                }
                finalPrice = Math.max(0, finalPrice);

                const newPromo = {
                  id: promo.id,
                  code: promo.code,
                  discount_type: promo.discount_type,
                  discount_value: parseFloat(promo.discount_value),
                  discounted_price: parseFloat(finalPrice.toFixed(2)),
                  discount_percent: parseFloat(currentDiscountPercent.toFixed(2)),
                  meets_conditions: promo.quantity == null || promo.quantity > 0,
                };

                if (
                  !best ||
                  (newPromo.meets_conditions && newPromo.discounted_price < best.discounted_price)
                ) {
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
              meets_conditions: true,
            };
          }
        }

        return productJson;
      })
      .filter((product) => product !== null && product.variants?.length > 0); // Chỉ giữ sản phẩm có biến thể

    // Tính tổng số biến thể
    const totalVariants = productsWithVariantCount.reduce((sum, product) => {
      return sum + (product.variants?.length || 0);
    }, 0);

    // Tính tổng số trang dựa trên số sản phẩm thực sự
    const totalPages = Math.ceil(totalProducts / limit);

    // Kiểm tra nếu trang hiện tại không có sản phẩm hợp lệ
    if (productsWithVariantCount.length === 0 && page > 1) {
      return res.status(200).json({
        status: 200,
        message: `Không tìm thấy sản phẩm ở trang ${page}`,
        data: [],
        pagination: {
          currentPage: page,
          limit,
          totalPages,
          totalProducts,
        },
        totalVariants: 0,
      });
    }

    return res.status(200).json({
      status: 200,
      message: "Lấy danh sách sản phẩm thành công",
      data: productsWithVariantCount,
      pagination: {
        currentPage: page,
        limit,
        totalPages,
        totalProducts,
        hasNextPage: productsWithVariantCount.length === limit && totalProducts > page * limit,
      },
      totalVariants,
    });
  } catch (error) {
    console.error("Error in getAll:", error);
    res.status(500).json({ error: error.message });
  }
}
  static async getPrice(req, res) {
    try {
      const priceRange = await ProductVariant.findOne({
        attributes: [
          [Sequelize.fn("MIN", Sequelize.col("price")), "minPrice"],
          [Sequelize.fn("MAX", Sequelize.col("price")), "maxPrice"],
        ],
      });

      return res.status(200).json({
        status: 200,
        message: "Lấy khoảng giá thành công",
        data: {
          minPrice: parseFloat(priceRange.get("minPrice")) || 0,
          maxPrice: parseFloat(priceRange.get("maxPrice")) || 1000,
        },
      });
    } catch (error) {
      console.error("Error in getPriceRange:", error);
      res.status(500).json({ error: error.message });
    }
  }

  static async countStockGroupByProductId(req, res) {
    try {
      const result = await ProductVariantModel.findAll({
        attributes: [
          "product_id",
          [
            ProductVariantModel.sequelize.fn(
              "SUM",
              ProductVariantModel.sequelize.col("stock")
            ),
            "total_stock",
          ],
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
