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
const { Op, fn, col, literal, Sequelize } = require("sequelize");

class HomeController {
  static async getAllNewProducts(req, res) {
    try {
      const newProducts = await Product.findAll({
        where: { status: 1,
          publication_status: 'published'
         },
        include: [
          {
            model: ProductVariant,
            as: "variants",
            required: true,
            attributes: ["id", "price", "stock"],
            include: [
              {
                model: ProductVariantAttributeValuesModel,
                as: "attributeValues",
                include: [{ model: ProductAttributeModel, as: "attribute" }],
              },
              { model: VariantImagesModel, as: "images" },
              {
                model: PromotionProductModel,
                as: "promotionProducts",
                include: [{ model: PromotionModel, as: "promotion" }],
              },
            ],
          },
        ],
        attributes: ["id", "name", "thumbnail", "created_at"],
        order: [["created_at", "DESC"]],

        limit: 8,
      });

      const currentDate = new Date();

      const productsWithDetails = await Promise.all(
        newProducts.map(async (product) => {
          const productJson = product.toJSON();
          productJson.variantCount = product.variants?.length || 0;
          productJson.total_stock = product.variants.reduce(
            (sum, v) => sum + (parseInt(v.stock) || 0),
            0
          );

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
                let finalPrice = parseFloat(variant.price);
                let currentDiscountPercent = 0;

                if (promo.discount_type === "percentage") {
                  finalPrice -=
                    (finalPrice * parseFloat(promo.discount_value)) / 100;
                  currentDiscountPercent = parseFloat(promo.discount_value);
                } else if (promo.discount_type === "fixed") {
                  finalPrice -= parseFloat(promo.discount_value);
                  currentDiscountPercent =
                    ((parseFloat(variant.price) - finalPrice) /
                      parseFloat(variant.price)) *
                    100;
                }

                finalPrice = Math.max(0, finalPrice);

                const promoInfo = {
                  id: promo.id,
                  code: promo.code,
                  discount_type: promo.discount_type,
                  discount_value: parseFloat(promo.discount_value),
                  discounted_price: parseFloat(finalPrice.toFixed(2)),
                  discount_percent: parseFloat(
                    currentDiscountPercent.toFixed(2)
                  ),
                  meets_conditions:
                    promo.quantity == null || promo.quantity > 0,
                };

                if (
                  !best ||
                  (promoInfo.meets_conditions &&
                    promoInfo.discounted_price < best.discounted_price)
                ) {
                  return promoInfo;
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
              discount_percent: discountPercent,
              meets_conditions: true,
            };
          }

          return productJson;
        })
      );

      const totalVariants = productsWithDetails.reduce(
        (sum, p) => sum + (p.variants?.length || 0),
        0
      );

      return res.status(200).json({
        status: 200,
        message: "Lấy danh sách sản phẩm mới thành công!",
        data: productsWithDetails,

        pagination: {
          currentPage: 1,
          limit: 8,
          totalPages: 1,
          totalProducts: productsWithDetails.length,
        },
        totalVariants,
      });
    } catch (error) {
      console.error("Lỗi khi lấy sản phẩm mới:", error);
      return res.status(500).json({
        status: 500,
        message: "Lỗi máy chủ khi lấy sản phẩm mới!",
      });
    }
  }

  static async getTopSoldProducts(req, res) {
    try {
      // Bước 1: Đếm tổng số lượng bán theo product_variant_id
      const variantSales = await OrderDetail.findAll({
        attributes: [
          "product_variant_id",
          [fn("SUM", col("quantity")), "totalSold"],
        ],
        group: ["product_variant_id"],
        order: [[literal("totalSold"), "DESC"]],
        limit: 20,
        raw: true,
      });

      const variantIds = variantSales.map((item) => item.product_variant_id);

      const variants = await ProductVariant.findAll({
        where: { id: { [Op.in]: variantIds } },
        include: [{ model: Product, as: "product" }],
      });

      const productMap = new Map();
      for (const variant of variants) {
        const product = variant.product;
        if (!product) continue;

        const totalSold =
          variantSales.find((s) => s.product_variant_id === variant.id)
            ?.totalSold || 0;

        if (productMap.has(product.id)) {
          productMap.get(product.id).totalSold += parseInt(totalSold);
        } else {
          productMap.set(product.id, {
            ...product.toJSON(),
            totalSold: parseInt(totalSold),
          });
        }
      }

      const topProducts = Array.from(productMap.values())
        .sort((a, b) => b.totalSold - a.totalSold)
        .slice(0, 10);

      const enrichedTopProducts = await Promise.all(
        topProducts.map(async (product) => {
          const fullProduct = await Product.findOne({
            where: { id: product.id, status: 1,publication_status: 'published' },
            attributes: ["id", "name", "thumbnail", "created_at"],
            include: [
              {
                model: ProductVariant,
                as: "variants",
                attributes: ["id", "price", "stock"],
                include: [
                  {
                    model: ProductVariantAttributeValuesModel,
                    as: "attributeValues",
                    include: [
                      { model: ProductAttributeModel, as: "attribute" },
                    ],
                  },
                  { model: VariantImagesModel, as: "images" },
                  {
                    model: PromotionProductModel,
                    as: "promotionProducts",
                    include: [{ model: PromotionModel, as: "promotion" }],
                  },
                ],
              },
            ],
          });

          if (!fullProduct) return null;

          const productJson = fullProduct.toJSON();
          productJson.totalSold = product.totalSold;
          productJson.variantCount = productJson.variants?.length || 0;
          productJson.total_stock = productJson.variants.reduce(
            (sum, v) => sum + (parseInt(v.stock) || 0),
            0
          );

          const currentDate = new Date();
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
                let finalPrice = parseFloat(variant.price);
                let currentDiscountPercent = 0;

                if (promo.discount_type === "percentage") {
                  finalPrice -=
                    (finalPrice * parseFloat(promo.discount_value)) / 100;
                  currentDiscountPercent = parseFloat(promo.discount_value);
                } else if (promo.discount_type === "fixed") {
                  finalPrice -= parseFloat(promo.discount_value);
                  currentDiscountPercent =
                    ((parseFloat(variant.price) - finalPrice) /
                      parseFloat(variant.price)) *
                    100;
                }

                finalPrice = Math.max(0, finalPrice);

                const promoInfo = {
                  id: promo.id,
                  code: promo.code,
                  discount_type: promo.discount_type,
                  discount_value: parseFloat(promo.discount_value),
                  discounted_price: parseFloat(finalPrice.toFixed(2)),
                  discount_percent: parseFloat(
                    currentDiscountPercent.toFixed(2)
                  ),
                  meets_conditions:
                    promo.quantity == null || promo.quantity > 0,
                };

                if (
                  !best ||
                  (promoInfo.meets_conditions &&
                    promoInfo.discounted_price < best.discounted_price)
                ) {
                  return promoInfo;
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
              discount_percent: discountPercent,
              meets_conditions: true,
            };
          }

          return productJson;
        })
      );

      const filtered = enrichedTopProducts.filter(Boolean); // bỏ null
      return res.status(200).json(filtered);
    } catch (error) {
      console.error("Lỗi getTopSoldProducts:", error);
      return res
        .status(500)
        .json({ message: "Lỗi máy chủ", error: error.message });
    }
  }
  static async getDiscountedProducts(req, res) {
  try {
    const now = new Date();

    const discountedVariants = await ProductVariant.findAll({
      include: [
        {
          model: Product,
          as: "product",
          where: { status: 1,publication_status: 'published' },
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
              where: {
                start_date: { [Op.lte]: now },
                end_date: { [Op.gte]: now },
              },
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

    const productMap = new Map();

    for (const variant of discountedVariants) {
      const product = variant.product;
      if (!product) continue;

      const variantPrice = parseFloat(variant.price);
      let lowestPrice = variantPrice;
      let discountPercent = 0;

      // Tìm khuyến mãi tốt nhất
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

      if (bestPromotion) {
        lowestPrice = bestPromotion.discounted_price;
        discountPercent = bestPromotion.discount_percent;
      }

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
module.exports = HomeController;

