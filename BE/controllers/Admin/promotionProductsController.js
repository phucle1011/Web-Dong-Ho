const { Op } = require("sequelize");
const { Sequelize } = require('sequelize');
const ProductVariantsModel = require("../../models/productVariantsModel");
const ProductModel = require("../../models/productsModel");
const PromotionProductModel = require("../../models/promotionProductsModel");
const PromotionModel = require("../../models/promotionsModel");
const PromotionUserModel = require("../../models/promotionUsersModel");
// GET ALL PromotionProducts with pagination and search by product name
exports.getAll = async (req, res) => {
  const { searchTerm = "", page = 1, limit = 10 } = req.query;
  const pageNumber = parseInt(page);
  const pageSize = parseInt(limit);
  const offset = (pageNumber - 1) * pageSize;

  try {
    const { count, rows } = await PromotionProductModel.findAndCountAll({
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
              where: searchTerm
                ? {
                    name: {
                      [Op.like]: `%${searchTerm}%`,
                    },
                  }
                : undefined,
            },
          ],
        },
        {
          model: PromotionModel,
          as: "promotion",
          attributes: {
            include: [
              "name", "start_date", "end_date",
              // Đếm số user sử dụng mỗi promotion_id
              [
                Sequelize.literal(`(
                  SELECT COUNT(*)
                  FROM promotion_users AS pu
                  WHERE pu.promotion_id = promotion.id
                )`),
                "user_count"
              ],
              // Đếm số lượng biến thể (variant) gán vào promotion
              [
                Sequelize.literal(`(
                  SELECT COUNT(*)
                  FROM promotion_products AS pp
                  WHERE pp.promotion_id = promotion.id
                )`),
                "variant_count"
              ]
            ],
            exclude: ["quantity"], // Bỏ trường quantity
          },
        },
      ],
      limit: pageSize,
      offset,
      distinct: true,
    });

    res.json({
      data: rows,
      pagination: {
        total: count,
        page: pageNumber,
        limit: pageSize,
        totalPages: Math.ceil(count / pageSize),
      },
    });
  } catch (err) {
    console.error(err);
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
          attributes: ["name"],
        },
      ],
    });

    if (!data) {
      return res.status(404).json({ message: "Promotion product not found" });
    }

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// CREATE
// controller: promotion-product.controller.js
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

    // Tạo tất cả cặp promotion-variant
    const payloads = [];
    for (const promoId of promotionIds) {
      for (const variantId of variantIds) {
        payloads.push({
          promotion_id: promoId,
          product_variant_id: variantId,
        });
      }
    }

    // Lấy các bản ghi đã tồn tại
    const existingRecords = await PromotionProductModel.findAll({
      where: {
        promotion_id: promotionIds.length === 1 ? promotionIds[0] : promotionIds,
        product_variant_id: variantIds.length === 1 ? variantIds[0] : variantIds,
      },
    });

    const existingPairs = new Set(
      existingRecords.map((item) => `${item.promotion_id}-${item.product_variant_id}`)
    );

    // Lọc payloads chưa tồn tại
    const filteredPayloads = payloads.filter(
      (p) => !existingPairs.has(`${p.promotion_id}-${p.product_variant_id}`)
    );

    if (filteredPayloads.length === 0) {
      return res.status(409).json({ error: "Tất cả các cặp promotion-product đã tồn tại." });
    }

    // Thêm mới những cặp chưa tồn tại
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

    // Kiểm tra dữ liệu đầu vào
    if (!promotion_id || !Array.isArray(product_variant_ids)) {
      return res.status(400).json({ message: "promotion_id và product_variant_ids là bắt buộc, product_variant_ids phải là mảng" });
    }

    // Kiểm tra khuyến mãi tồn tại
    const promotion = await PromotionModel.findByPk(promotion_id);
    if (!promotion) {
      return res.status(404).json({ message: "Không tìm thấy khuyến mãi" });
    }

    // Xóa tất cả bản ghi hiện tại trong promotion_products cho promotion_id
    await PromotionProductModel.destroy({
      where: { promotion_id }
    });

    // Tạo bản ghi mới trong promotion_products
    const newRecords = product_variant_ids.map(variant_id => ({
      promotion_id,
      product_variant_id: variant_id
    }));
    await PromotionProductModel.bulkCreate(newRecords);

    // Cập nhật status và variant_count trong bảng promotions
    await promotion.update({
      status: status || promotion.status,
      variant_count: product_variant_ids.length
    });

    // Lấy dữ liệu cập nhật để trả về
    const updatedRecords = await PromotionProductModel.findAll({
      where: { promotion_id },
      include: [{ model: PromotionModel, as: 'promotion' }]
    });

    res.json({
      message: "Cập nhật khuyến mãi thành công",
      data: updatedRecords
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

    // Lấy các promotion đang active từ bảng PromotionProduct
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
