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
    const { Op, col, fn } = require("sequelize");
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const offset = (page - 1) * limit;

    // Build product filter
    const whereCondition = {};
    whereCondition.status = { [Op.ne]: "hidden" };
    if (req.query.status && req.query.status !== "hidden") {
      whereCondition.status = req.query.status;
    }
    whereCondition.publication_status = req.query.publication_status || "published";

    if (req.query.query) {
      whereCondition[Op.or] = [
        { name: { [Op.like]: `%${req.query.query}%` } },
        { description: { [Op.like]: `%${req.query.query}%` } },
      ];
    }
    if (req.query.category_id) {
      whereCondition.category_id = { [Op.in]: req.query.category_id.split(",").map(Number) };
    }
    if (req.query.brand_id) {
      whereCondition.brand_id = { [Op.in]: req.query.brand_id.split(",").map(Number) };
    }

    // Build variant price filter
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

    // Query products + variants + promos
    const { count: totalProducts, rows: products } = await Product.findAndCountAll({
      where: whereCondition,
      order: [["created_at", "DESC"]],
      limit,
      offset,
      attributes: [
        "id","name","slug","description",
        "brand_id","category_id","thumbnail",
        "status","publication_status",
        "created_at","updated_at"
      ],
      include: [
        {
          model: ProductVariant,
          as: "variants",
          where: variantWhereCondition,
          required: true,
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
                    end_date:   { [Op.gte]: new Date() },
                  },
                  required: false,
                },
              ],
            },
          ],
        },
        { model: CategoryModel, as: "category", attributes: ["id", "name"] },
        { model: BrandModel,    as: "brand",    attributes: ["id", "name"] },
      ],
      distinct: true,
    });

    // No products?
    if (!products.length) {
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

    // Process each product
    const productsWithVariantCount = products.map(product => {
      const p = product.toJSON();
      p.variantCount = p.variants?.length || 0;
      p.total_stock = p.variants.reduce((sum, v) => sum + (parseInt(v.stock) || 0), 0);

      // For each variant, compute best promotion AND add auction flags
      p.variants.forEach(variant => {
        // Auction flags
        variant.isAuctionOnly = variant.is_auction_only === 1;
        variant.isInAuction  = variant.isAuctionOnly;

        // Compute best promotion
        const basePrice = parseFloat(variant.price) || 0;
        let bestPromo = null;
        let lowestPrice = basePrice;

        (variant.promotionProducts || []).forEach(pp => {
          const promo = pp.promotion;
          if (!promo) return;
          let finalPrice = basePrice;
          let pct = 0;

          if (promo.discount_type === "percentage") {
            finalPrice -= (finalPrice * parseFloat(promo.discount_value)) / 100;
            pct = parseFloat(promo.discount_value);
          } else {
            finalPrice -= parseFloat(promo.discount_value);
            pct = basePrice > 0
              ? ((basePrice - finalPrice) / basePrice) * 100
              : 0;
          }
          finalPrice = Math.max(0, finalPrice);

          const promoData = {
            id:               promo.id,
            code:             promo.code,
            discount_type:    promo.discount_type,
            discount_value:   parseFloat(promo.discount_value),
            discounted_price: parseFloat(finalPrice.toFixed(2)),
            discount_percent: parseFloat(pct.toFixed(2)),
            meets_conditions: promo.quantity == null || promo.quantity > 0,
          };

          if (
            !bestPromo ||
            (promoData.meets_conditions &&
             promoData.discounted_price < bestPromo.discounted_price)
          ) {
            bestPromo = promoData;
          }
        });

        if (bestPromo && bestPromo.meets_conditions) {
          lowestPrice = bestPromo.discounted_price;
        }

        variant.promotion = bestPromo || {
          discounted_price: lowestPrice,
          discount_percent: 0,
          meets_conditions: true,
        };
      });

      return p;
    });

    // Total variants
    const totalVariants = productsWithVariantCount.reduce((sum, p) => {
      return sum + (p.variants?.length || 0);
    }, 0);

    const totalPages = Math.ceil(totalProducts / limit);

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
