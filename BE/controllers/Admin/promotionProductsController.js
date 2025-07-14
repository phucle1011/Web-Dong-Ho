const { Op } = require("sequelize");
const { Sequelize } = require("sequelize");
const ProductVariantsModel = require("../../models/productVariantsModel");
const ProductModel = require("../../models/productsModel");
const PromotionProductModel = require("../../models/promotionProductsModel");
const PromotionModel = require("../../models/promotionsModel");
const PromotionUserModel = require("../../models/promotionUsersModel");

// GET ALL PromotionProducts with pagination and search by product name, promotion name, sku, or status
exports.getAll = async (req, res) => {
  const { searchTerm = "", page = 1, limit = 10, promotion_id } = req.query;
  const pageNumber = parseInt(page);
  const pageSize = parseInt(limit);
  const offset = (pageNumber - 1) * pageSize;

  try {
    const whereCondition = {};
    if (searchTerm) {
      whereCondition[Op.or] = [
        { "$variant.product.name$": { [Op.like]: `%${searchTerm}%` } },
        { "$promotion.name$": { [Op.like]: `%${searchTerm}%` } },
        { "$variant.sku$": { [Op.like]: `%${searchTerm}%` } },
        { "$promotion.status$": { [Op.like]: `%${searchTerm}%` } },
      ];
    }
    if (promotion_id) {
      whereCondition.promotion_id = parseInt(promotion_id);
      // Đảm bảo product_variant_id không null
      whereCondition.product_variant_id = { [Op.ne]: null };
    }

    const { count, rows } = await PromotionProductModel.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: ProductVariantsModel,
          as: "variant",
          attributes: ["sku", "price", "stock"],
          include: [
            {
              model: ProductModel,
              as: "product",
              attributes: ["name"],
            },
          ],
        },
        {
          model: PromotionModel,
          as: "promotion",
          attributes: {
            include: [
              "name",
              "start_date",
              "end_date",
              [
                Sequelize.literal(`(
                  SELECT COUNT(*)
                  FROM promotion_products AS pp
                  WHERE pp.promotion_id = promotion.id
                    AND pp.product_variant_id IS NOT NULL
                )`),
                "variant_count",
              ],
            ],
            exclude: ["quantity"],
          },
        },
      ],
      limit: promotion_id ? undefined : pageSize,
      offset: promotion_id ? 0 : offset,
      distinct: true,
    });

    // Log để debug
    if (promotion_id && rows.length === 0) {
      console.log(`Không tìm thấy bản ghi nào cho promotion_id ${promotion_id} trong promotion_products với product_variant_id hợp lệ`);
    }

    // Đồng bộ variant_count nếu cần
    if (promotion_id) {
      const actualVariantCount = rows.filter(
        (item) => item.product_variant_id && !isNaN(item.product_variant_id)
      ).length;
      const promotion = await PromotionModel.findOne({
        where: { id: parseInt(promotion_id) },
      });
      if (promotion && promotion.variant_count !== actualVariantCount) {
        console.warn(
          `Số lượng variant_count (${promotion.variant_count}) không khớp với số lượng thực tế (${actualVariantCount}) cho promotion_id ${promotion_id}`
        );
        await PromotionModel.update(
          { variant_count: actualVariantCount },
          { where: { id: parseInt(promotion_id) } }
        );
        // Cập nhật variant_count trong dữ liệu trả về
        rows.forEach((item) => {
          if (item.promotion) {
            item.promotion.variant_count = actualVariantCount;
          }
        });
      }
    }

    res.json({
      data: rows,
      pagination: promotion_id
        ? undefined
        : {
            total: count,
            page: pageNumber,
            limit: pageSize,
            totalPages: Math.ceil(count / pageSize),
          },
    });
  } catch (err) {
    console.error("Lỗi khi lấy danh sách promotion_products:", err.message);
    res.status(500).json({ error: err.message });
  }
}; 

// GET BY ID
exports.getById = async (req, res) => {
  try {
    const id = req.params.id;

    const data = await PromotionProductModel.findByPk(id, {
      include: [
        {
          model: ProductVariantsModel,
          as: "variant",
          attributes: ["sku", "price", "stock"],
          include: [
            {
              model: ProductModel,
              as: "product",
              attributes: ["name"],
            },
          ],
        },
        {
          model: PromotionModel,
          as: "promotion",
          attributes: ["name", "start_date", "end_date", "status"],
        },
      ],
    });

    if (!data) {
      return res.status(404).json({ message: "Promotion product not found" });
    }

    res.json(data);
  } catch (err) {
    console.error("Error in getById:", err);
    res.status(500).json({ error: err.message });
  }
};

// CREATE
exports.create = async (req, res) => {
  try {
    const { product_variant_id, promotion_id } = req.body;

    const variantIds = Array.isArray(product_variant_id) ? product_variant_id : [product_variant_id];
    const promotionIds = Array.isArray(promotion_id) ? promotion_id : [promotion_id];

    if (variantIds.length === 0 || promotionIds.length === 0) {
      return res.status(400).json({
        error: "Vui lòng cung cấp ít nhất 1 promotion và 1 product_variant",
      });
    }

    const payloads = [];
    for (const promoId of promotionIds) {
      for (const variantId of variantIds) {
        payloads.push({
          promotion_id: promoId,
          product_variant_id: variantId,
        });
      }
    }

    const existingRecords = await PromotionProductModel.findAll({
      where: {
        promotion_id: promotionIds.length === 1 ? promotionIds[0] : promotionIds,
        product_variant_id: variantIds.length === 1 ? variantIds[0] : variantIds,
      },
    });

    const existingPairs = new Set(
      existingRecords.map((item) => `${item.promotion_id}-${item.product_variant_id}`)
    );

    const filteredPayloads = payloads.filter(
      (p) => !existingPairs.has(`${p.promotion_id}-${p.product_variant_id}`)
    );

    if (filteredPayloads.length === 0) {
      return res.status(409).json({ error: "Tất cả các cặp promotion-product đã tồn tại." });
    }

    const data = await PromotionProductModel.bulkCreate(filteredPayloads);

    return res.status(201).json({
      message: "Thêm promotion-product thành công",
      data,
    });
  } catch (err) {
    console.error("Lỗi khi thêm promotion_product:", err.message);
    return res.status(500).json({ error: err.message });
  }
};

// UPDATE
exports.update = async (req, res) => {
  try {
    const { promotion_id, product_variant_ids, status } = req.body;

    if (!promotion_id || !Array.isArray(product_variant_ids)) {
      return res.status(400).json({ message: "promotion_id và product_variant_ids là bắt buộc, product_variant_ids phải là mảng" });
    }

    const promotion = await PromotionModel.findByPk(promotion_id);
    if (!promotion) {
      return res.status(404).json({ message: "Không tìm thấy khuyến mãi" });
    }

    await PromotionProductModel.destroy({
      where: { promotion_id },
    });

    const newRecords = product_variant_ids
      .filter((variant_id) => variant_id && !isNaN(variant_id)) // Lọc bỏ variant_id không hợp lệ
      .map((variant_id) => ({
        promotion_id,
        product_variant_id: variant_id,
      }));

    await PromotionProductModel.bulkCreate(newRecords);

    await promotion.update({
      status: status || promotion.status,
      variant_count: newRecords.length,
    });

    const updatedRecords = await PromotionProductModel.findAll({
      where: { promotion_id },
      include: [{ model: PromotionModel, as: "promotion" }],
    });

    res.json({
      message: "Cập nhật khuyến mãi thành công",
      data: updatedRecords,
    });
  } catch (err) {
    console.error("Lỗi khi cập nhật khuyến mãi:", err);
    res.status(500).json({ error: err.message || "Lỗi server" });
  }
};

// DELETE
exports.remove = async (req, res) => {
  try {
    const data = await PromotionProductModel.findByPk(req.params.id);
    if (!data) return res.status(404).json({ message: "Not found" });

    await data.destroy();
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET ALL PROMOTIONS with dynamic status updates
exports.getAllPromotion = async (req, res) => {
  try {
    const now = new Date();

    const promotionProducts = await PromotionModel.findAll({
      where: {
        status: {
          [Op.in]: ["active", "upcoming"],
        },
        applicable_to: "product",
      },
    });

    res.status(200).json({
      success: true,
      data: promotionProducts,
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách promotion:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi máy chủ.",
    });
  }
};