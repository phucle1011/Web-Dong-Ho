const { Op } = require("sequelize");
const ProductVariantsModel = require("../../models/productVariantsModel");
const ProductModel = require("../../models/productsModel");
const PromotionProductModel = require("../../models/promotionProductsModel");
const PromotionModel = require("../../models/promotionsModel");

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
          attributes: ["name"],
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
exports.create = async (req, res) => {
  try {
    const { product_variant_id, promotion_id } = req.body;

    const payload = {
      product_variant_id,
      promotion_id,
    };

    const data = await PromotionProductModel.create(payload);
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
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

    // Cập nhật trạng thái các khuyến mãi
    const promotions = await PromotionModel.findAll();
    for (const promo of promotions) {
      let newStatus = promo.status;

      if (promo.status === 'inactive') {
        newStatus = 'inactive';
      } else if (promo.quantity === 0) {
        newStatus = 'exhausted';
      } else if (now < promo.start_date) {
        newStatus = 'upcoming';
      } else if (now >= promo.start_date && now <= promo.end_date) {
        newStatus = 'active';
      } else {
        newStatus = 'expired';
      }

      if (promo.status !== newStatus) {
        await promo.update({ status: newStatus });
      }
    }

    // Lấy các promotion đang active từ bảng PromotionProduct
    const promotionProducts = await PromotionProductModel.findAll({
      include: [
        {
          model: PromotionModel,
          as: "promotion",
          attributes: ["id", "name"],
          where: {
            status: 'active',
            start_date: { [Op.lte]: now },
            end_date: { [Op.gte]: now },
          },
          required: true,
        },
      ],
    });

    if (!promotionProducts || promotionProducts.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy khuyến mãi nào đang hoạt động.",
      });
    }

    // Trả về danh sách promotion id + name (unique)
    const promotionsData = promotionProducts.map(item => ({
      id: item.promotion.id,
      name: item.promotion.name
    }));

    const uniquePromotions = Array.from(
      new Map(promotionsData.map(p => [p.id, p])).values()
    );

    res.status(200).json({
      success: true,
      data: uniquePromotions,
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách promotion:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi máy chủ.",
    });
  }
};




