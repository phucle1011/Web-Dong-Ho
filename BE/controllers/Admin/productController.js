const Product = require("../../models/productsModel");
const ProductVariant = require("../../models/productVariantsModel");
const ProductVariantAttributeValue = require("../../models/productVariantAttributeValuesModel");
const ProductAttribute = require("../../models/productAttributesModel");
const VariantImage = require("../../models/variantImagesModel");
const BrandModel = require("../../models/brandsModel");
const CategoryModel = require("../../models/categoriesModel");

const { Op } = require("sequelize");

class ProductController {
  // Lấy tất cả sản phẩm có biến thể
  static async get(req, res) {
  try {
    const products = await Product.findAll({
      order: [["created_at", "DESC"]],
      include: [
        {
          model: ProductVariant,
          as: "variants",
          include: [
            {
              model: ProductVariantAttributeValue,
              as: "attributeValues",
              include: [
                {
                  model: ProductAttribute,
                  as: "attribute",
                },
              ],
            },
            {
              model: VariantImage,
              as: "images",
            },
          ],
        },
        {
          model: CategoryModel,
          as: "category",
          attributes: ["id", "name"], // Lấy tên danh mục
        },
        {
          model: BrandModel,
          as: "brand",
          attributes: ["id", "name"], // Lấy tên thương hiệu
        },
      ],
    });

    res.status(200).json({
      status: 200,
      message: "Lấy danh sách sản phẩm thành công",
      data: products,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}


  // Lấy chi tiết theo ID
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const product = await Product.findByPk(id, {
        include: [
          {
            model: ProductVariant,
            as: "variants",
            include: [
              {
                model: ProductVariantAttributeValue,
                as: "attributeValues",
                include: [
                  {
                    model: ProductAttribute,
                    as: "attribute",
                  },
                ],
              },
              {
                model: VariantImage,
                as: "images",
              },
            ],
          },
        ],
      });

      if (!product) {
        return res.status(404).json({ message: "Sản phẩm không tồn tại" });
      }

      res.status(200).json({
        status: 200,
        data: product,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Tạo mới sản phẩm + biến thể
 static async createProduct(req, res) {
  try {
    const {
      name,
      slug,
      description,
      brand_id,
      category_id,
      thumbnail,
      status,
    } = req.body;

    console.log('Data to insert:', {
      name,
      slug,
      description,
      brand_id,
      category_id,
      thumbnail,
      status,
    });

    const product = await Product.create({
      name,
      slug,
      description,
      brand_id,
      category_id,
      thumbnail,
      status,
    });

    res.status(201).json({ message: "Tạo sản phẩm thành công", product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}


  static async addVariant(req, res) {
  const t = await ProductVariant.sequelize.transaction();
  try {
    const { product_id } = req.params;
    const { sku, price, stock, attributes, images } = req.body;

    // Kiểm tra sản phẩm tồn tại
    const product = await Product.findByPk(product_id);
    if (!product) {
      await t.rollback();
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }

    // Tạo biến thể sản phẩm
    const variant = await ProductVariant.create(
      {
        product_id,
        sku,
        price,
        stock,
      },
      { transaction: t }
    );

    // Tạo các thuộc tính biến thể (nếu có)
    if (Array.isArray(attributes)) {
      for (const attr of attributes) {
        await ProductVariantAttributeValue.create(
          {
            product_variant_id: variant.id,
            product_attribute_id: attr.attribute_id,
            value: attr.value,
          },
          { transaction: t }
        );
      }
    }

    // Tạo ảnh biến thể (nếu có)
    if (Array.isArray(images)) {
      for (const imageUrl of images) {
        await VariantImage.create(
          {
            variant_id: variant.id,
            image_url: imageUrl,
          },
          { transaction: t }
        );
      }
    }

    await t.commit();
    res.status(201).json({ message: "Tạo biến thể thành công", variant });
  } catch (error) {
  await t.rollback();
  console.error("Lỗi khi thêm biến thể:", error);  // <-- thêm log này
  res.status(500).json({ error: error.message });
}

}


  // Cập nhật sản phẩm (chỉ thông tin cơ bản)
  static async update(req, res) {
    try {
      const { id } = req.params;
      const {
        name,
        slug,
        description,
        brand_id,
        category_id,
        thumbnail,
        status,
      } = req.body;

      const product = await Product.findByPk(id);
      if (!product) {
        return res.status(404).json({ message: "Sản phẩm không tồn tại" });
      }

      if (name !== undefined) product.name = name;
      if (slug !== undefined) product.slug = slug;
      if (description !== undefined) product.description = description;
      if (brand_id !== undefined) product.brand_id = brand_id;
      if (category_id !== undefined) product.category_id = category_id;
      if (thumbnail !== undefined) product.thumbnail = thumbnail;
      if (status !== undefined) product.status = status;

      await product.save();

      res
        .status(200)
        .json({ message: "Cập nhật sản phẩm thành công", product });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Xoá sản phẩm và các biến thể
  static async delete(req, res) {
    const t = await Product.sequelize.transaction();
    try {
      const { id } = req.params;

      const product = await Product.findByPk(id);
      if (!product) {
        return res.status(404).json({ message: "Sản phẩm không tồn tại" });
      }

      const variants = await ProductVariant.findAll({
        where: { product_id: id },
      });

      for (const variant of variants) {
        await ProductVariantAttributeValue.destroy({
          where: { product_variant_id: variant.id },
          transaction: t,
        });
        await VariantImage.destroy({
          where: { variant_id: variant.id },
          transaction: t,
        });
      }

      await ProductVariant.destroy({
        where: { product_id: id },
        transaction: t,
      });
      await Product.destroy({ where: { id }, transaction: t });

      await t.commit();
      res.status(200).json({ message: "Xoá sản phẩm thành công" });
    } catch (error) {
      await t.rollback();
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = ProductController;
