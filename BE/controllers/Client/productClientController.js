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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const whereCondition = {};
    if (req.query.status) whereCondition.status = req.query.status;
    if (req.query.category_id) whereCondition.category_id = req.query.category_id;
    if (req.query.brand_id) whereCondition.brand_id = req.query.brand_id;

    // Thêm điều kiện lọc giá cho biến thể
    const variantWhereCondition = {};
    if (req.query.minPrice || req.query.maxPrice) {
      variantWhereCondition.price = {};
      if (req.query.minPrice) variantWhereCondition.price[Op.gte] = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) variantWhereCondition.price[Op.lte] = parseFloat(req.query.maxPrice);
    }

    // ✅ Phân trang sản phẩm với findAndCountAll
    const { count: totalProducts, rows: products } = await Product.findAndCountAll({
      where: whereCondition,
      order: [["created_at", "DESC"]],
      limit,
      offset,
      include: [
        {
          model: ProductVariant,
          as: "variants",
          where: variantWhereCondition, // Áp dụng điều kiện lọc giá
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
          required: true, // Chỉ lấy sản phẩm có biến thể thỏa mãn điều kiện
        },
        { model: CategoryModel, as: "category", attributes: ["id", "name"] },
        { model: BrandModel, as: "brand", attributes: ["id", "name"] },
      ],
    });

    // ✅ Lọc sản phẩm có biến thể
    const filteredProducts = products.filter(product => product.variants && product.variants.length > 0);
    const filteredTotalProducts = filteredProducts.length;

    const currentDate = new Date();

    // ✅ Xử lý từng sản phẩm để thêm variantCount, total_stock và promotion
    const productsWithVariantCount = await Promise.all(
      filteredProducts.map(async (product) => {
        const productJson = product.toJSON();
        productJson.variantCount = product.variants?.length || 0;

        productJson.total_stock = product.variants.reduce((sum, variant) => {
          return sum + (parseInt(variant.stock) || 0);
        }, 0);

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

                let meetsConditions = true;

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
                  finalPrice = Math.max(0, finalPrice);
                }

                const newPromo = {
                  id: promo.id,
                  code: promo.code,
                  discount_type: promo.discount_type,
                  discount_value: parseFloat(promo.discount_value),
                  discounted_price: parseFloat(finalPrice.toFixed(2)),
                  discount_percent: parseFloat(currentDiscountPercent.toFixed(2)),
                  meets_conditions: meetsConditions && (promo.quantity == null || promo.quantity > 0),
                };

                if (!meetsConditions) {
                  console.log(`Promotion not applied for variant ${variant.id}:`, newPromo);
                }

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
                console.log(`Best promotion for variant ${variant.id}:`, bestPromotion);
              }
            } else {
              console.log(`No promotions found for variant ${variant.id}`);
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
    );

    const totalVariants = productsWithVariantCount.reduce((sum, product) => {
      return sum + (product.variants?.length || 0);
    }, 0);

    return res.status(200).json({
      status: 200,
      message: "Lấy danh sách sản phẩm thành công",
      data: productsWithVariantCount,
      pagination: {
        currentPage: page,
        limit,
        totalPages: Math.ceil(filteredTotalProducts / limit),
        totalProducts: filteredTotalProducts,
      },
      totalVariants,
    });
  } catch (error) {
    console.error("Error in getAll:", error);
    res.status(500).json({ error: error.message });
  }
}

//   static async getAll(req, res) {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const offset = (page - 1) * limit;

//     const whereCondition = {};
//     if (req.query.status) whereCondition.status = req.query.status;
//     if (req.query.category_id)
//       whereCondition.category_id = req.query.category_id;
//     if (req.query.brand_id) whereCondition.brand_id = req.query.brand_id;

//     // ✅ Phân trang sản phẩm với findAndCountAll
//     const { count: totalProducts, rows: products } = await Product.findAndCountAll({
//       where: whereCondition,
//       order: [["created_at", "DESC"]],
//       limit,
//       offset,
//       include: [
//         {
//           model: ProductVariant,
//           as: "variants",
//           include: [
//             {
//               model: ProductVariantAttributeValue,
//               as: "attributeValues",
//               include: [{ model: ProductAttribute, as: "attribute" }],
//             },
//             { model: VariantImage, as: "images" },
//             {
//               model: PromotionProductModel,
//               as: "promotionProducts",
//               include: [{ model: PromotionModel, as: "promotion" }],
//             },
//           ],
//         },
//         { model: CategoryModel, as: "category", attributes: ["id", "name"] },
//         { model: BrandModel, as: "brand", attributes: ["id", "name"] },
//       ],
//     });

//     // ✅ Lọc sản phẩm có biến thể
//     const filteredProducts = products.filter(product => product.variants && product.variants.length > 0);
//     const filteredTotalProducts = filteredProducts.length;

//     const currentDate = new Date();

//     // ✅ Xử lý từng sản phẩm để thêm variantCount, total_stock và promotion
//     const productsWithVariantCount = await Promise.all(
//       filteredProducts.map(async (product) => {
//         const productJson = product.toJSON();
//         productJson.variantCount = product.variants?.length || 0;

//         productJson.total_stock = product.variants.reduce((sum, variant) => {
//           return sum + (parseInt(variant.stock) || 0);
//         }, 0);

//         if (productJson.variants && productJson.variants.length > 0) {
//   for (let variant of productJson.variants) {
//     const promotions = await PromotionProductModel.findAll({
//       where: { product_variant_id: variant.id },
//       include: [
//         {
//           model: PromotionModel,
//           as: "promotion",
//           where: {
//             status: "active",
//             start_date: { [Op.lte]: currentDate },
//             end_date: { [Op.gte]: currentDate },
//           },
//           required: true,
//         },
//       ],
//     });

//     let bestPromotion = null;
//     let lowestPrice = parseFloat(variant.price) || 0;
//     let discountPercent = 0;

//     if (promotions.length > 0) {
//       bestPromotion = promotions.reduce((best, promoProduct) => {
//         const promo = promoProduct.promotion;
//         const variantPrice = parseFloat(variant.price) || 0;

//         let meetsConditions = true;
//         // Bỏ kiểm tra minPrice/maxPrice để áp dụng khuyến mãi bất kể giá
//         // const minPrice = parseFloat(promo.min_price_threshold) || 0;
//         // const maxPrice = parseFloat(promo.max_price) || Infinity;
//         // if (variantPrice < minPrice || variantPrice > maxPrice) {
//         //   console.warn(`❌ Variant ${variant.id} price ${variantPrice} không nằm trong khoảng [${minPrice}, ${maxPrice}]`);
//         //   meetsConditions = false;
//         // }

//         if (isNaN(promo.discount_value) || parseFloat(promo.discount_value) <= 0) {
//           console.warn(`Invalid discount_value ${promo.discount_value} for promotion ${promo.id}`);
//           meetsConditions = false;
//         }

//         let finalPrice = variantPrice;
//         let currentDiscountPercent = 0;

//         if (meetsConditions) {
//           if (promo.discount_type === "percentage") {
//             finalPrice -= (finalPrice * parseFloat(promo.discount_value)) / 100;
//             currentDiscountPercent = parseFloat(promo.discount_value);
//           } else if (promo.discount_type === "fixed") {
//             finalPrice -= parseFloat(promo.discount_value);
//             currentDiscountPercent = ((variantPrice - finalPrice) / variantPrice) * 100;
//           }
//           finalPrice = Math.max(0, finalPrice);
//         }

//         const newPromo = {
//           id: promo.id,
//           code: promo.code,
//           discount_type: promo.discount_type,
//           discount_value: parseFloat(promo.discount_value),
//           discounted_price: parseFloat(finalPrice.toFixed(2)),
//           discount_percent: parseFloat(currentDiscountPercent.toFixed(2)),
//           meets_conditions: meetsConditions && (promo.quantity == null || promo.quantity > 0),
//         };

//         if (!meetsConditions) {
//           console.log(`Promotion not applied for variant ${variant.id}:`, newPromo);
//         }

//         if (
//           !best ||
//           (newPromo.meets_conditions && newPromo.discounted_price < best.discounted_price)
//         ) {
//           return newPromo;
//         }
//         return best;
//       }, null);

//       if (bestPromotion && bestPromotion.meets_conditions) {
//         lowestPrice = bestPromotion.discounted_price;
//         discountPercent = bestPromotion.discount_percent;
//         console.log(`Best promotion for variant ${variant.id}:`, bestPromotion);
//       }
//     } else {
//       console.log(`No promotions found for variant ${variant.id}`);
//     }

//     variant.promotion = bestPromotion || {
//       discounted_price: lowestPrice,
//       discount_percent: 0,
//       meets_conditions: true,
//     };
//   }
// }

//         return productJson;
//       })
//     );

//     const totalVariants = productsWithVariantCount.reduce((sum, product) => {
//       return sum + (product.variants?.length || 0);
//     }, 0);

//     return res.status(200).json({
//       status: 200,
//       message: "Lấy danh sách sản phẩm thành công",
//       data: productsWithVariantCount,
//       pagination: {
//         currentPage: page,
//         limit,
//         totalPages: Math.ceil(filteredTotalProducts / limit),
//         totalProducts: filteredTotalProducts,
//       },
//       totalVariants,
//     });
//   } catch (error) {
//     console.error("Error in getAll:", error);
//     res.status(500).json({ error: error.message });
//   }
// }


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
