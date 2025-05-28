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
              "name", "quantity", "start_date", "end_date",
              // Đếm số user sử dụng mỗi promotion_id
              [
                Sequelize.literal(`(
                  SELECT COUNT(*)
                  FROM promotion_users AS pu
                  WHERE pu.promotion_id = promotion.id
                )`),
                "user_count"
              ]
            ]
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

    // Đảm bảo cả hai đều là mảng
    const variantIds = Array.isArray(product_variant_id)
      ? product_variant_id
      : [product_variant_id];

    const promotionIds = Array.isArray(promotion_id)
      ? promotion_id
      : [promotion_id];

    if (variantIds.length === 0 || promotionIds.length === 0) {
      return res.status(400).json({
        error: "Vui lòng cung cấp ít nhất 1 promotion và 1 product_variant",
      });
    }

    // Kết hợp nhiều khuyến mãi và biến thể => tạo dữ liệu
    const payloads = [];
    for (const promoId of promotionIds) {
      for (const variantId of variantIds) {
        payloads.push({
          promotion_id: promoId,
          product_variant_id: variantId,
        });
      }
    }

    // Lưu vào DB
    const data = await PromotionProductModel.bulkCreate(payloads, {
      ignoreDuplicates: true, // tránh trùng nếu cần
    });

    return res.status(201).json({
      message: "Thêm nhiều promotion_product thành công",
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
    const { product_variant_id, promotion_id } = req.body;
    const data = await PromotionProductModel.findByPk(req.params.id);

    if (!data) return res.status(404).json({ message: "Not found" });

    const payload = {
      product_variant_id,
      promotion_id,
    };

    await data.update(payload);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
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
        status: "active",
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
