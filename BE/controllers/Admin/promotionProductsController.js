const { Op, Sequelize } = require("sequelize");
const ProductVariantsModel = require("../../models/productVariantsModel");
const ProductModel = require("../../models/productsModel");
const PromotionProductModel = require("../../models/promotionProductsModel");
const PromotionModel = require("../../models/promotionsModel");
const sequelize = require('../../config/database');

class PromotionProductController {
  static async getAll(req, res) {
  const { searchTerm = "", page = 1, limit = 10, promotion_id } = req.query;
  const pageNumber = parseInt(page, 10);
  const pageSize = parseInt(limit, 10);

  try {
    const whereCondition = {};
    if (searchTerm) {
      whereCondition[Op.or] = [
        { '$variant.product.name$': { [Op.like]: `%${searchTerm}%` } },
        { '$promotion.name$': { [Op.like]: `%${searchTerm}%` } },
        { '$variant.sku$': { [Op.like]: `%${searchTerm}%` } },
        { '$promotion.status$': { [Op.like]: `%${searchTerm}%` } },
      ];
    }
    if (promotion_id) {
      whereCondition.promotion_id = parseInt(promotion_id, 10);
    }

    const allRows = await PromotionProductModel.findAll({
      where: whereCondition,
      include: [
        {
          model: ProductVariantsModel,
          as: 'variant',
          attributes: ['id', 'sku', 'price', 'stock'],
          include: [{ model: ProductModel, as: 'product', attributes: ['name'] }],
          required: false,
        },
        {
          model: PromotionModel,
          as: 'promotion',
          attributes: {
            include: [
              'id',
              'name',
              'start_date',
              'end_date',
              'discount_value',
              'discount_type',
         
              [
                Sequelize.literal(
                  '(SELECT COUNT(DISTINCT pp.product_variant_id) FROM promotion_products AS pp WHERE pp.promotion_id = promotion.id AND pp.product_variant_id IS NOT NULL)'
                ),
                'variant_count'
              ]
            ]
          }
        }
      ],
      order: [['promotion', 'id', 'ASC']],
      subQuery: false
    });

    // Nhóm theo promotion_id
    const grouped = {};
    let totalVariantQuantity = 0;

    allRows.forEach(item => {
      const promoId = item.promotion?.id;
      if (!promoId) return;

      if (!grouped[promoId]) {
        grouped[promoId] = {
          items: [],
          totalVariantQuantity: 0
        };
      }

      grouped[promoId].items.push(item);
      grouped[promoId].totalVariantQuantity += item.variant_quantity || 0;

      // Tính tổng variant quantity cho tất cả promotions
      totalVariantQuantity += item.variant_quantity || 0;
    });

    const promoIds = Object.keys(grouped).map(id => parseInt(id, 10));
    const totalPromotions = promoIds.length;
    const totalPages = Math.ceil(totalPromotions / pageSize);

    const startIndex = (pageNumber - 1) * pageSize;
    const pagePromoIds = promoIds.slice(startIndex, startIndex + pageSize);

    // Tạo mảng rows hiển thị trong trang hiện tại
    const rows = pagePromoIds.flatMap(promoId => grouped[promoId].items);

    // Nếu muốn, bạn có thể gửi kèm map tổng số lượt mỗi promotion:
    const variantQuantityByPromotion = {};
    pagePromoIds.forEach(promoId => {
      variantQuantityByPromotion[promoId] = grouped[promoId].totalVariantQuantity;
    });

    return res.json({
      data: rows,
      totalVariantQuantity,
      variantQuantityByPromotion, // optional: để frontend hiển thị từng promotion
      pagination: {
        total: totalPromotions,
        page: pageNumber,
        limit: pageSize,
        totalPages
      }
    });

  } catch (err) {
    console.error('Error fetching promotion_products:', err);
    return res.status(500).json({ error: err.message });
  }
}


  static async getById(req, res) {
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
}

static async create(req, res) {
  try {
    const { product_variant_id, promotion_id, variant_quantity } = req.body;

    const variantIds = Array.isArray(product_variant_id) ? product_variant_id : [product_variant_id];
    const promotionIds = Array.isArray(promotion_id) ? promotion_id : [promotion_id];
    const variantQuantities = Array.isArray(variant_quantity) ? variant_quantity : [variant_quantity];

    if (variantIds.length === 0 || promotionIds.length === 0) {
      return res.status(400).json({ error: "Vui lòng cung cấp ít nhất 1 promotion và 1 product_variant" });
    }

    if (variantIds.some(id => isNaN(id) || id <= 0) || promotionIds.some(id => isNaN(id) || id <= 0)) {
      return res.status(400).json({ error: "ID khuyến mãi hoặc biến thể không hợp lệ" });
    }

    if (variantQuantities.length !== variantIds.length) {
      return res.status(400).json({ error: "variant_quantity phải tương ứng từng biến thể" });
    }

    if (variantQuantities.some(q => isNaN(q) || q <= 0)) {
      return res.status(400).json({ error: "Tất cả variant_quantity phải là số > 0" });
    }

  const variants = await ProductVariantsModel.findAll({
  where: { id: variantIds },
  include: [
    {
      model: ProductModel,
      as: 'product',
      attributes: ['id', 'publication_status'],
      where: { publication_status: 'published' }
    }
  ]
});

if (variants.length !== variantIds.length) {
  const foundVariantIds = variants.map((v) => v.id);
  const missingIds = variantIds.filter(
    (id) => !foundVariantIds.includes(id)
  );
  return res.status(400).json({
    error: `Các biến thể không hợp lệ hoặc thuộc sản phẩm chưa xuất bản: ${missingIds.join(", ")}`,
  });
}

    const promotions = await PromotionModel.findAll({ where: { id: promotionIds } });
    if (promotions.length !== promotionIds.length) {
      const missingIds = promotionIds.filter(id => !promotions.some(p => p.id === id));
      return res.status(400).json({ error: `Các khuyến mãi không tồn tại: ${missingIds.join(', ')}` });
    }

    // ✅ Kiểm tra tồn kho biến thể
    for (let i = 0; i < variantIds.length; i++) {
      const variantId = parseInt(variantIds[i]);
      const quantity = parseInt(variantQuantities[i]);
      const variant = variants.find(v => v.id === variantId);

      if (!variant) {
        return res.status(400).json({ error: `Không tìm thấy biến thể với ID ${variantId}` });
      }

      const totalForVariant = quantity * promotionIds.length;

      if (totalForVariant > variant.stock) {
        return res.status(400).json({
          error: `Tổng số lượng áp dụng (${totalForVariant}) vượt quá tồn kho (${variant.stock}) của biến thể SKU ${variant.sku}`
        });
      }
    }

    // ✅ Tạo payload
    const payloads = [];
    for (const promoId of promotionIds) {
      for (let i = 0; i < variantIds.length; i++) {
        payloads.push({
          promotion_id: parseInt(promoId),
          product_variant_id: parseInt(variantIds[i]),
          variant_quantity: parseInt(variantQuantities[i])
        });
      }
    }

    // ✅ Kiểm tra trùng lặp
    const existingRecords = await PromotionProductModel.findAll({
      where: {
        promotion_id: promotionIds,
        product_variant_id: variantIds,
      },
    });

    const existingPairs = new Set(
      existingRecords.map(item => `${item.promotion_id}-${item.product_variant_id}`)
    );

    const filteredPayloads = payloads.filter(
      p => !existingPairs.has(`${p.promotion_id}-${p.product_variant_id}`)
    );

    if (filteredPayloads.length === 0) {
      return res.status(409).json({ error: "Tất cả các cặp promotion-product đã tồn tại" });
    }

    // ✅ Kiểm tra tổng variant_quantity không vượt quá promotion.quantity
    await sequelize.transaction(async t => {
      const groupedByPromo = {};

      for (const item of filteredPayloads) {
        if (!groupedByPromo[item.promotion_id]) groupedByPromo[item.promotion_id] = [];
        groupedByPromo[item.promotion_id].push(item.variant_quantity);
      }

      for (const [promoId, quantities] of Object.entries(groupedByPromo)) {
        const promo = promotions.find(p => p.id === parseInt(promoId));
        const total = quantities.reduce((sum, q) => sum + q, 0);

        if (total > promo.quantity) {
          throw new Error(`Tổng variant_quantity (${total}) vượt quá số lượng còn lại (${promo.quantity}) của promotion ${promoId}`);
        }
      }

      // ✅ Lưu dữ liệu (KHÔNG TRỪ promotion.quantity)
      await PromotionProductModel.bulkCreate(filteredPayloads, { transaction: t });
    });

    const data = await PromotionProductModel.findAll({
      where: { promotion_id: promotionIds },
      include: [
        { model: PromotionModel, as: 'promotion' },
        { model: ProductVariantsModel, as: 'variant' },
      ],
    });

    return res.status(201).json({ message: "Thêm promotion-product thành công", data });

  } catch (err) {
    console.error("Error in create:", {
      message: err.message,
      stack: err.stack,
      payload: req.body,
    });
    return res.status(500).json({ error: err.message || "Lỗi khi thêm sản phẩm khuyến mãi" });
  }
}


static async update(req, res) {
  try {
    const { promotion_id, products } = req.body;

    if (!promotion_id || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: "Thiếu thông tin cập nhật." });
    }

    // 1. Lấy promotion để biết kiểu và giá trị giảm giá
    const promo = await PromotionModel.findByPk(promotion_id);
    if (!promo) {
      return res.status(404).json({ message: "Promotion không tồn tại." });
    }

    // 2. Lấy id các biến thể từ payload
    const variantIds = products.map(p => p.product_variant_id);

    // 3. Lấy thông tin stock và giá gốc (price) của các variant
    const variants = await ProductVariantsModel.findAll({
      where: { id: variantIds },
      attributes: ['id', 'stock', 'price', 'sku']
    });

    // Map id => stock, price
    const variantMap = {};
    variants.forEach(v => {
      variantMap[v.id] = {
        stock: v.stock,
        price: parseFloat(v.price),
        sku: v.sku
      };
    });

    // 4. Kiểm tra từng item
    for (const item of products) {
      const { product_variant_id, variant_quantity } = item;
      const qty = parseInt(variant_quantity, 10);

      // Kiểm quantity hợp lệ
      if (isNaN(qty) || qty <= 0) {
        return res.status(400).json({
          message: `Số lượng không hợp lệ cho biến thể ID ${product_variant_id}.`
        });
      }

      const v = variantMap[product_variant_id];
      if (!v) {
        return res.status(400).json({
          message: `Không tìm thấy biến thể ID ${product_variant_id}.`
        });
      }

      // 4a. Check stock
      if (qty > v.stock) {
        return res.status(400).json({
          message: `Số lượt áp dụng (${qty}) vượt quá tồn kho (${v.stock}) cho SKU ${v.sku}.`
        });
      }

      // 4b. Nếu là discount % thì kiểm finalPrice > 0
      if (promo.discount_type === 'percentage') {
        const finalPrice = v.price * (1 - promo.discount_value / 100);
        if (finalPrice <= 0) {
          return res.status(400).json({
            message: `Sau khi giảm ${promo.discount_value}% biến thể SKU ${v.sku} có giá <= 0.`
          });
        }
      }
      // 4c. Nếu là discount fixed thì cũng check finalPrice > 0
      else if (promo.discount_type === 'fixed') {
        const finalPrice = v.price - promo.discount_value;
        if (finalPrice <= 0) {
          return res.status(400).json({
            message: `Giảm cố định ${promo.discount_value}₫ biến thể SKU ${v.sku} có giá <= 0.`
          });
        }
      }
    }

    // 5. Xoá hết biến thể cũ của promotion này
    await PromotionProductModel.destroy({
      where: { promotion_id },
    });

    // 6. Tạo mới tất cả
    const created = await Promise.all(
      products.map(item => PromotionProductModel.create({
        promotion_id,
        product_variant_id: item.product_variant_id,
        variant_quantity: item.variant_quantity,
      }))
    );

    const totalApplied = created.reduce(
      (sum, x) => sum + parseInt(x.variant_quantity, 10),
      0
    );

    return res.status(200).json({
      message: "Cập nhật khuyến mãi thành công!",
      totalApplied,
    });

  } catch (err) {
    console.error("Lỗi khi cập nhật khuyến mãi:", err);
    return res.status(500).json({ message: err.message });
  }
}



  static async remove(req, res) {
    const { id } = req.params;

    try {
      const transaction = await sequelize.transaction();

      try {
        const promotionProduct = await PromotionProductModel.findByPk(id, {
          transaction,
        });

        if (!promotionProduct) {
          await transaction.rollback();
          return res.status(404).json({ message: 'Không tìm thấy bản ghi khuyến mãi.' });
        }

        const promotionId = promotionProduct.promotion_id;

        await promotionProduct.destroy({ transaction });

        await PromotionModel.increment('quantity', {
          by: 1,
          where: { id: promotionId },
          transaction,
        });

        await transaction.commit();

        return res.status(200).json({ message: 'Xóa thành công! Đã hoàn lại 1 lượt sử dụng.' });
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      console.error('Lỗi khi xóa bản ghi khuyến mãi:', error);
      return res.status(500).json({ message: 'Xóa thất bại: ' + error.message });
    }
  }

  static async getAllPromotion(req, res) {
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
  }
}

module.exports = PromotionProductController;