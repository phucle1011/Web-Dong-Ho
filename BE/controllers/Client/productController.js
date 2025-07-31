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


static async getNonAuctionVariantsWithPromotion(req, res) {
  try {
    const productId = req.params.id;
    const now = new Date();

    const product = await Product.findOne({
      where: {
        id: productId,
        publication_status: "published",
        status: 1,
      },
      include: [
        { model: Brand, as: "brand", attributes: ["id", "name"] },
        { model: Category, as: "category", attributes: ["id", "name"] },
        {
          model: ProductVariant,
          as: "variants",
          // 🔵 CHỈ lấy biến thể KHÔNG đấu giá
          where: { is_auction_only: 0 },
          required: false, // có thể cho phép rỗng, tuỳ UX (đổi true nếu muốn 404 khi rỗng)
          include: [
            {
              model: VariantImagesModel,
              as: "images",
              attributes: ["id", "image_url", "variant_id"],
            },
            {
              model: PromotionProductModel,
              as: "promotionProducts",
              required: false,
              include: [
                {
                  model: PromotionModel,
                  as: "promotion",
                  where: {
                    applicable_to: "product",
                    start_date: { [Op.lte]: now },
                    end_date: { [Op.gte]: now },
                    status: "active",
                  },
                  required: false,
                },
              ],
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
      order: [["created_at", "DESC"]],
    });

    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    const variantImages = [];
    const nonAuctionVariantIds = (product.variants || []).map(v => v.id);

    // ✅ Tính đánh giá CHỈ cho các variant không đấu giá
    let averageRating = "0.0";
    let ratingCount = 0;
    const ratingMap = {};

    if (nonAuctionVariantIds.length > 0) {
      const ratingData = await Comment.findAll({
        include: [
          {
            model: OrderDetail,
            as: "orderDetail",
            attributes: ["product_variant_id"],
            where: { product_variant_id: { [Op.in]: nonAuctionVariantIds } },
            required: true,
          },
        ],
        attributes: [
          [col("orderDetail.product_variant_id"), "variantId"],
          [fn("AVG", col("rating")), "avgRating"],
          [fn("COUNT", col("rating")), "ratingCount"],
        ],
        group: ["orderDetail.product_variant_id"],
        raw: true,
      });

      ratingData.forEach((item) => {
        const variantId = item.variantId;
        ratingMap[variantId] = {
          avgRating: parseFloat(item.avgRating || 0).toFixed(1),
          ratingCount: parseInt(item.ratingCount || 0, 10),
        };
      });

      const total = ratingData.reduce(
        (acc, cur) => {
          const count = parseInt(cur.ratingCount || 0, 10);
          const avg = parseFloat(cur.avgRating || 0);
          acc.sum += avg * count;
          acc.count += count;
          return acc;
        },
        { sum: 0, count: 0 }
      );

      averageRating = total.count > 0 ? (total.sum / total.count).toFixed(1) : "0.0";
      ratingCount = total.count;
    }

    const variants = (product.variants || []).map((variant) => {
      if (variant.images?.length) {
        variant.images.forEach((img) => {
          variantImages.push({
            id: img.id,
            image_url: img.image_url,
            variant_id: variant.id,
          });
        });
      }

      const variantPrice = parseFloat(variant.price) || 0;
      let bestPromotion = null;
      let finalPrice = variantPrice;

      const promotions = variant.promotionProducts || [];
      if (promotions.length > 0) {
        bestPromotion = promotions.reduce((best, promoProduct) => {
          const promo = promoProduct.promotion;
          if (!promo) return best;

          let tmpPrice = variantPrice;
          let tmpPercent = 0;

          if (promo.discount_type === "percentage") {
            tmpPrice -= (tmpPrice * parseFloat(promo.discount_value)) / 100;
            tmpPercent = parseFloat(promo.discount_value);
          } else {
            tmpPrice -= parseFloat(promo.discount_value);
            tmpPercent = variantPrice > 0 ? ((variantPrice - tmpPrice) / variantPrice) * 100 : 0;
          }

          tmpPrice = Math.max(0, tmpPrice);

          const promoData = {
            id: promo.id,
            code: promo.code,
            discount_type: promo.discount_type,
            discount_value: parseFloat(promo.discount_value),
            discounted_price: parseFloat(tmpPrice.toFixed(2)),
            discount_percent: parseFloat(tmpPercent.toFixed(2)),
            meets_conditions: promo.quantity == null || promo.quantity > 0,
          };

          if (
            !best ||
            (promoData.meets_conditions &&
              promoData.discounted_price < best.discounted_price)
          ) {
            return promoData;
          }
          return best;
        }, null);

        if (bestPromotion && bestPromotion.meets_conditions) {
          finalPrice = bestPromotion.discounted_price;
        }
      }

      const ratingInfo = ratingMap[variant.id] || { avgRating: "0.0", ratingCount: 0 };

      return {
        id: variant.id,
        // name: variant.name, // nếu không có field name thì bỏ
        price: variantPrice,
        stock: variant.stock,
        sku: variant.sku,
        is_auction_only: variant.is_auction_only, // luôn = 0 ở đây
        images: variant.images,
        attributeValues: variant.attributeValues,
        final_price: bestPromotion ? finalPrice : null,
        promotion:
          bestPromotion || {
            discounted_price: variantPrice,
            discount_percent: 0,
            meets_conditions: true,
          },
        averageRating: ratingInfo.avgRating,
        ratingCount: ratingInfo.ratingCount,
      };
    });

    return res.json({
      product: {
        id: product.id,
        name: product.name,
        description: product.description,
        short_description: product.short_description,
        price: product.price,
        brand: product.brand?.name || null,
        category: product.category?.name || null,
        thumbnail: product.thumbnail,
        variants,       // ✅ chỉ chứa biến thể is_auction_only = 0
        variantImages,  // flattened nếu FE cần
        averageRating,
        ratingCount,
      },
    });
  } catch (err) {
    console.error("Lỗi khi lấy biến thể thường:", err);
    res.status(500).json({ message: "Đã xảy ra lỗi khi lấy dữ liệu" });
  }
}

static async getAuctionVariants(req, res) {
  try {
    const productId = req.params.id;
    const now = new Date();

    // Lấy product đã xuất bản, còn hiển thị
    const product = await Product.findOne({
      where: {
        id: productId,
        publication_status: 'published',
        status: 1,
      },
      include: [
        { model: Brand, as: "brand", attributes: ["id", "name"] },
        { model: Category, as: "category", attributes: ["id", "name"] },
        {
          // 🔴 CHỈ lấy biến thể đang đấu giá
          model: ProductVariant,
          as: "variants",
          where: { is_auction_only: 1 },
          required: true, // Không có biến thể đấu giá → không trả về product
          include: [
            {
              model: VariantImagesModel,
              as: "images",
              attributes: ["id", "image_url", "variant_id"],
            },
            {
              // Khuyến mãi áp cho từng biến thể
              model: PromotionProductModel,
              as: "promotionProducts",
              include: [
                {
                  model: PromotionModel,
                  as: "promotion",
                  where: {
                    applicable_to: "product",
                    start_date: { [Op.lte]: now },
                    end_date: { [Op.gte]: now },
                    status: "active",
                  },
                  required: false,
                },
              ],
              required: false,
            },
            {
              // Thuộc tính biến thể
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
      order: [["created_at", "DESC"]],
    });

    if (!product) {
      return res.status(404).json({
        message: "Không tìm thấy sản phẩm hoặc không có biến thể đấu giá.",
      });
    }

    // Danh sách variantId để tính rating hiệu quả hơn
    const auctionVariantIds = (product.variants || []).map(v => v.id);
    if (auctionVariantIds.length === 0) {
      return res.status(200).json({
        product: {
          id: product.id,
          name: product.name,
          description: product.description,
          short_description: product.short_description,
          price: product.price,
          brand: { id: product.brand?.id || null, name: product.brand?.name || null },
          category: { id: product.category?.id || null, name: product.category?.name || null },
          thumbnail: product.thumbnail,
          variants: [],
          variantImages: [],
          averageRating: "0.0",
          ratingCount: 0,
        },
      });
    }

    // ✅ Tính rating chỉ cho các biến thể đấu giá
    const ratingData = await Comment.findAll({
      include: [
        {
          model: OrderDetail,
          as: "orderDetail",
          attributes: ["product_variant_id"],
          where: { product_variant_id: { [Op.in]: auctionVariantIds } },
          required: true,
        },
      ],
      attributes: [
        [col("orderDetail.product_variant_id"), "variantId"],
        [fn("AVG", col("rating")), "avgRating"],
        [fn("COUNT", col("rating")), "ratingCount"],
      ],
      group: ["orderDetail.product_variant_id"],
      raw: true,
    });

    const ratingMap = {};
    ratingData.forEach((item) => {
      const variantId = item.variantId;
      ratingMap[variantId] = {
        avgRating: parseFloat(item.avgRating || 0).toFixed(1),
        ratingCount: parseInt(item.ratingCount || 0, 10),
      };
    });

    // Tính rating tổng cho trang chi tiết
    const totalRatingAgg = ratingData.reduce(
      (acc, cur) => {
        const count = parseInt(cur.ratingCount || 0, 10);
        const avg = parseFloat(cur.avgRating || 0);
        acc.sum += avg * count;
        acc.count += count;
        return acc;
      },
      { sum: 0, count: 0 }
    );

    const averageRating =
      totalRatingAgg.count > 0
        ? (totalRatingAgg.sum / totalRatingAgg.count).toFixed(1)
        : "0.0";
    const ratingCount = totalRatingAgg.count;

    // Gom ảnh biến thể (dùng nếu front-end cần danh sách phẳng)
    const variantImages = [];
    const variants = product.variants.map((variant) => {
      if (variant.images?.length) {
        variant.images.forEach((img) => {
          variantImages.push({
            id: img.id,
            image_url: img.image_url,
            variant_id: variant.id,
          });
        });
      }

      // ✅ Tính khuyến mãi tốt nhất cho biến thể
      const variantPrice = parseFloat(variant.price) || 0;
      let bestPromotion = null;
      let finalPrice = variantPrice;

      const promotions = variant.promotionProducts || [];
      if (promotions.length > 0) {
        bestPromotion = promotions.reduce((best, promoProduct) => {
          const promo = promoProduct.promotion;
          if (!promo) return best;

          let tmpPrice = variantPrice;
          let tmpPercent = 0;

          if (promo.discount_type === "percentage") {
            tmpPrice -= (tmpPrice * parseFloat(promo.discount_value)) / 100;
            tmpPercent = parseFloat(promo.discount_value);
          } else {
            tmpPrice -= parseFloat(promo.discount_value);
            tmpPercent =
              variantPrice > 0
                ? ((variantPrice - tmpPrice) / variantPrice) * 100
                : 0;
          }

          tmpPrice = Math.max(0, tmpPrice);

          const promoData = {
            id: promo.id,
            code: promo.code,
            discount_type: promo.discount_type,
            discount_value: parseFloat(promo.discount_value),
            discounted_price: parseFloat(tmpPrice.toFixed(2)),
            discount_percent: parseFloat(tmpPercent.toFixed(2)),
            meets_conditions: promo.quantity == null || promo.quantity > 0,
          };

          if (
            !best ||
            (promoData.meets_conditions &&
              promoData.discounted_price < best.discounted_price)
          ) {
            return promoData;
          }
          return best;
        }, null);

        if (bestPromotion && bestPromotion.meets_conditions) {
          finalPrice = bestPromotion.discounted_price;
        }
      }

      const ratingInfo = ratingMap[variant.id] || {
        avgRating: "0.0",
        ratingCount: 0,
      };

      return {
        id: variant.id,
        // name: variant.name, // nếu variant không có field name thì bỏ
        price: variantPrice,
        stock: variant.stock,
        sku: variant.sku,
        is_auction_only: variant.is_auction_only, // luôn = 1 ở đây
        images: variant.images,
        attributeValues: variant.attributeValues,
        final_price: bestPromotion ? finalPrice : null,
        promotion:
          bestPromotion || {
            discounted_price: variantPrice,
            discount_percent: 0,
            meets_conditions: true,
          },
        averageRating: ratingInfo.avgRating,
        ratingCount: ratingInfo.ratingCount,
      };
    });

    return res.json({
      product: {
        id: product.id,
        name: product.name,
        description: product.description,
        short_description: product.short_description,
        price: product.price,
        brand: { id: product.brand?.id || null, name: product.brand?.name || null },
        category: { id: product.category?.id || null, name: product.category?.name || null },
        thumbnail: product.thumbnail,
        variants,       // ✅ chỉ có các biến thể is_auction_only = 1
        variantImages,  // phẳng (nếu front cần)
        averageRating,
        ratingCount,
      },
    });
  } catch (err) {
    console.error("Lỗi khi lấy biến thể đấu giá:", err);
    res.status(500).json({ message: "Đã xảy ra lỗi khi lấy dữ liệu" });
  }
}


static async getSimilarProducts(req, res) {
  try {
    const productId = req.params.id;

    // Lấy sản phẩm gốc, bắt buộc phải published
    const product = await Product.findOne({
      where: {
        id: productId,
        status: 1,
        publication_status: 'published',
      },
      attributes: ["id", "category_id", "brand_id"],
    });

    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    // Chỉ lấy sản phẩm active + published và khác productId hiện tại
    const whereCommon = {
      id: { [Op.ne]: productId },
      status: 1,
      publication_status: 'published',     // ✅ chỉ lấy sp đã xuất bản
    };

    // Hàm build truy vấn, chỉ lấy biến thể thường (không đấu giá)
    const buildQuery = (extraWhere) => ({
      where: { ...whereCommon, ...extraWhere },
      include: [
        {
          model: ProductVariant,
          as: 'variants',
          required: true,                   // ✅ đảm bảo phải có ít nhất một biến thể đủ điều kiện
          attributes: ['id', 'price', 'stock', 'is_auction_only'],
          where: { is_auction_only: 0 },    // ✅ chỉ biến thể không đấu giá
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
      attributes: ['id', 'name', 'thumbnail'],
      limit: 6,
    });

    let similarProducts;

    // 1) Cùng danh mục + cùng thương hiệu
    similarProducts = await Product.findAll(buildQuery({
      category_id: product.category_id,
      brand_id: product.brand_id,
    }));

    // 2) Chỉ theo danh mục
    if (similarProducts.length === 0) {
      similarProducts = await Product.findAll(buildQuery({
        category_id: product.category_id,
      }));
    }

    // 3) Chỉ theo thương hiệu
    if (similarProducts.length === 0) {
      similarProducts = await Product.findAll(buildQuery({
        brand_id: product.brand_id,
      }));
    }

    // 4) Fallback: ngẫu nhiên (vẫn phải published + có variant is_auction_only=0)
    if (similarProducts.length === 0) {
      similarProducts = await Product.findAll({
        where: whereCommon,
        include: buildQuery({}).include, // ✅ giữ nguyên include (lọc is_auction_only=0)
        attributes: ['id', 'name', 'thumbnail'],
        order: Sequelize.literal('RAND()'),
        limit: 6,
      });
    }

    // Tính thêm thông tin khuyến mãi + tồn kho
    const currentDate = new Date();
    const productsWithDetails = await Promise.all(
      similarProducts.map(async (product) => {
        const productJson = product.toJSON();

        // Số biến thể & tổng tồn kho (đã là biến thể thường vì đã lọc ở query)
        productJson.variantCount = product.variants?.length || 0;
        productJson.total_stock = (product.variants || []).reduce(
          (sum, v) => sum + (parseInt(v.stock) || 0),
          0
        );

        if (productJson.variants && productJson.variants.length > 0) {
          for (let variant of productJson.variants) {
            // (Tuỳ chọn) Tính khuyến mãi tốt nhất đang hiệu lực
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
                  finalPrice -= (finalPrice * parseFloat(promo.discount_value)) / 100;
                  currentDiscountPercent = parseFloat(promo.discount_value);
                } else if (promo.discount_type === "fixed") {
                  finalPrice -= parseFloat(promo.discount_value);
                  currentDiscountPercent =
                    ((parseFloat(variant.price) - finalPrice) / parseFloat(variant.price)) * 100;
                }

                finalPrice = Math.max(0, finalPrice);

                const promoInfo = {
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
                  (promoInfo.meets_conditions && promoInfo.discounted_price < best.discounted_price)
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
      message: "Lấy sản phẩm tương tự thành công",
      data: productsWithDetails,
      pagination: {
        currentPage: 1,
        limit: 6,
        totalPages: 1,
        totalProducts: productsWithDetails.length,
      },
      totalVariants,
    });

  } catch (err) {
    console.error("Lỗi khi lấy sản phẩm tương tự:", err);
    res.status(500).json({ message: "Đã xảy ra lỗi khi lấy sản phẩm tương tự" });
  }
}






}

module.exports = ProductController;
