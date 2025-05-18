// controllers/Admin/promotionProductsController.js

const PromotionProductModel = require('../../models/promotionProductsModel'); 
const ProductVariant = require('../../models/productVariantsModel');
const ProductModel = require('../../models/productsModel');
const Promotion = require('../../models/promotionsModel');
const { Op } = require('sequelize');
const { Sequelize } = require('sequelize');

// GET all promotion products
exports.getAll = async (req, res) => {
  try {
    const data = await PromotionProductModel.findAll({
      include: [
        {
          model: ProductVariant,
          attributes: ['sku', 'price', 'stock'],
          include: [
            {
              model: ProductModel,
              attributes: ['name']
            }
          ]
        },
        {
          model: Promotion,
          attributes: ['name']
        }
      ]
    });
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// GET by ID
// exports.getById = async (req, res) => {
//   try {
//     const data = await PromotionProductModel.findByPk(req.params.id, {
//       include: [
//         {
//           model: ProductVariant,
//           attributes: ['sku', 'price', 'stock'],
//           include: [{ model: ProductModel, attributes: ['name'] }]
//         },
//         {
//           model: Promotion,
//           attributes: ['name']
//         }
//       ]
//     });
//     if (!data) return res.status(404).json({ message: 'Not found' });
//     res.json(data);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };
exports.getById = async (req, res) => {
  try {
    const id = req.params.id;
    console.log('Received ID:', id);

    const data = await PromotionProductModel.findByPk(id, {
      include: [
        {
          model: ProductVariant,
          attributes: ['sku', 'price', 'stock'],
          include: [
            { model: ProductModel, attributes: ['name'] }
          ]
        },
        {
          model: Promotion,
          attributes: ['name']
        }
      ]
    });

    console.log('Data found:', data);

    if (!data) {
      return res.status(404).json({ message: 'Promotion product not found' });
    }
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// CREATE (discount_value không bắt buộc)
exports.create = async (req, res) => {
  try {
    const { promotion_id, product_variant_id, discount_value } = req.body;

    const payload = {
      promotion_id,
      product_variant_id
    };

    // Nếu discount_value được gửi, thì thêm vào payload
    if (discount_value !== undefined) {
      payload.discount_value = discount_value;
    }

    const data = await PromotionProductModel.create(payload);
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE (discount_value không bắt buộc)
exports.update = async (req, res) => {
  try {
    const { promotion_id, product_variant_id, discount_value } = req.body;
    const data = await PromotionProductModel.findByPk(req.params.id);
    if (!data) return res.status(404).json({ message: 'Not found' });

    const payload = {
      promotion_id,
      product_variant_id
    };

    if (discount_value !== undefined) {
      payload.discount_value = discount_value;
    }

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
    if (!data) return res.status(404).json({ message: 'Not found' });
    await data.destroy();
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
