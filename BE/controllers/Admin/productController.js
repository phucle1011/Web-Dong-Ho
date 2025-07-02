const Product = require("../../models/productsModel");
const ProductVariant = require("../../models/productVariantsModel");
const ProductVariantAttributeValue = require("../../models/productVariantAttributeValuesModel");
const ProductAttribute = require("../../models/productAttributesModel");
const VariantImage = require("../../models/variantImagesModel");
const BrandModel = require("../../models/brandsModel");
const CategoryModel = require("../../models/categoriesModel");
const cloudinary = require("../../config/cloudinaryConfig");

const { Op,Sequelize } = require("sequelize");

class ProductController {
  // Lấy tất cả thuộc tính sản phẩm
static async getAllAttributes(req, res) {
  try {
    const attributes = await ProductAttribute.findAll({
      order: [["id", "ASC"]],
    });

    res.status(200).json({
      status: 200,
      message: "Lấy danh sách thuộc tính thành công",
      data: attributes,
    });
  } catch (error) {
    console.error("Lỗi khi lấy thuộc tính:", error);
    res.status(500).json({ error: error.message });
  }
}

  // Lấy tất cả sản phẩm có biến thể
  static async get(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Đếm tổng số sản phẩm
    const totalProducts = await Product.count();

    // Lấy danh sách sản phẩm phân trang
    const products = await Product.findAll({
      order: [["created_at", "DESC"]],
      limit: limit,
      offset: offset,
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
          attributes: ["id", "name"],
        },
        {
          model: BrandModel,
          as: "brand",
          attributes: ["id", "name"],
        },
      ],
    });

    // Thêm variantCount vào từng sản phẩm
    const productsWithVariantCount = products.map((product) => {
      const productJson = product.toJSON();
      productJson.variantCount = product.variants?.length || 0;
      return productJson;
    });

    // Tổng số biến thể hiển thị
    const totalVariants = products.reduce((sum, product) => {
      return sum + (product.variants?.length || 0);
    }, 0);

    res.status(200).json({
      status: 200,
      message: "Lấy danh sách sản phẩm thành công",
      data: productsWithVariantCount,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalProducts / limit),
        totalProducts,
      },
      totalVariants,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}


  // Lấy chi tiết theo ID
  static async getById(req, res) {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Lấy thông tin cơ bản của sản phẩm
    const product = await Product.findByPk(id, {
      include: [
        {
          model: CategoryModel,
          as: "category",
          attributes: ["id", "name"],
        },
        {
          model: BrandModel,
          as: "brand",
          attributes: ["id", "name"],
        },
      ],
    });

    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }

    // Lấy biến thể có phân trang
    const { count, rows: variants } = await ProductVariant.findAndCountAll({
      where: { product_id: id },
      limit,
      offset,
        distinct: true,  // thêm dòng nà
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
      order: [["created_at", "DESC"]],
    });

    res.status(200).json({
      status: 200,
      data: {
        ...product.toJSON(),
        variants,
        pagination: {
          total: count,
          page,
          limit,
          totalPages: Math.ceil(count / limit),
        },
      },
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

    const product = await Product.create({
      name,
      slug,
      description,
      brand_id,
      category_id,
      thumbnail: thumbnail.url,
      status,
    });

    res.status(201).json({ message: "Tạo sản phẩm thành công", product });

  } catch (error) {
    console.error(error);

    // Nếu là lỗi unique
    if (error instanceof Sequelize.UniqueConstraintError) {
      return res.status(400).json({
        error: "Tên hoặc slug sản phẩm đã tồn tại.",
        fields: error.errors.map(e => e.path)
      });
    }

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
      if (error instanceof Sequelize.UniqueConstraintError) {
  return res.status(400).json({
    message: "SKU đã tồn tại.",
    fields: error.errors.map(e => e.path)
  });
}

res.status(500).json({ error: error.message });

    }
  }
  // Cập nhật biến thể sản phẩm
  static async updateVariant(req, res) {
    const t = await ProductVariant.sequelize.transaction();
    try {
      const { variant_id } = req.params;
      const { sku, price, stock, attributes, images } = req.body;

      const variant = await ProductVariant.findByPk(variant_id);
      if (!variant) {
        await t.rollback();
        return res.status(404).json({ message: "Biến thể không tồn tại" });
      }

      // Cập nhật thông tin cơ bản
      if (sku !== undefined) variant.sku = sku;
      if (price !== undefined) variant.price = price;
      if (stock !== undefined) variant.stock = stock;
      await variant.save({ transaction: t });

      // Xóa các thuộc tính cũ và tạo mới
      await ProductVariantAttributeValue.destroy({
        where: { product_variant_id: variant_id },
        transaction: t,
      });

      if (Array.isArray(attributes)) {
        for (const attr of attributes) {
          await ProductVariantAttributeValue.create(
            {
              product_variant_id: variant_id,
              product_attribute_id: attr.attribute_id,
              value: attr.value,
            },
            { transaction: t }
          );
        }
      }

      // Xóa ảnh cũ và thêm ảnh mới
      await VariantImage.destroy({
        where: { variant_id },
        transaction: t,
      });

      if (Array.isArray(images)) {
        for (const image of images) {
  const url = typeof image === "string" ? image : image?.url || "";
  if (url) {
    await VariantImage.create(
      {
        variant_id,
        image_url: url,
      },
      { transaction: t }
    );
  }
}

      }

      await t.commit();
      res
        .status(200)
        .json({ message: "Cập nhật biến thể thành công", variant });
    } catch (error) {
      await t.rollback();
      console.error("Lỗi khi cập nhật biến thể:", error);
      res.status(500).json({ error: error.message });
    }
  }

  // Thêm ảnh mới cho biến thể
  static async addVariantImages(req, res) {
    try {
      const { variant_id } = req.params;
      const { images } = req.body;

      // Kiểm tra biến thể tồn tại
      const variant = await ProductVariant.findByPk(variant_id);
      if (!variant) {
        return res.status(404).json({ message: "Biến thể không tồn tại" });
      }

      // Tạo ảnh cho biến thể
      const createdImages = [];
      if (Array.isArray(images)) {
        for (const imageUrl of images) {
          const newImage = await VariantImage.create({
            variant_id,
            image_url: imageUrl,
          });
          createdImages.push(newImage);
        }
      }

      res.status(201).json({
        message: "Thêm ảnh biến thể thành công",
        data: createdImages,
      });
    } catch (error) {
      console.error("Lỗi khi thêm ảnh biến thể:", error);
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
static async searchProducts(req, res) {
  try {
    const { searchTerm, categoryId, brandId, page = 1, limit = 10 } = req.query;

    const whereConditions = [];

    if (searchTerm && searchTerm.trim() !== "") {
      whereConditions.push({
        name: {
          [Op.like]: `%${searchTerm}%`,
        },
      });
    }

    if (categoryId) {
      whereConditions.push({
        category_id: categoryId,
      });
    }

    if (brandId) {
      whereConditions.push({
        brand_id: brandId,
      });
    }

    const where = {
      [Op.and]: whereConditions,
    };



    const offset = (parseInt(page) - 1) * parseInt(limit);

    const products = await Product.findAll({
      where,
      offset,
      limit: parseInt(limit),
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
          attributes: ["id", "name"],
        },
        {
          model: BrandModel,
          as: "brand",
          attributes: ["id", "name"],
        },
      ],
    });

    if (products.length === 0) {
      return res.status(404).json({
        status: 200,
        message: "Không tìm thấy sản phẩm nào.",
        data: [],
      });
    }

    res.status(200).json({
      status: 200,
      message: "Tìm kiếm sản phẩm thành công",
      data: products,
    });
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
  // Xóa 1 ảnh cụ thể của biến thể theo image_id
  static async deleteSingleVariantImage(req, res) {
    try {
      const { image_id } = req.params;

      const image = await VariantImage.findByPk(image_id);
      if (!image) {
        return res.status(404).json({ message: "Ảnh không tồn tại" });
      }

      await image.destroy();

      res.status(200).json({ message: "Xóa ảnh thành công" });
    } catch (error) {
      console.error("Lỗi khi xóa ảnh:", error);
      res.status(500).json({ error: error.message });
    }
  }
  // Xóa một biến thể sản phẩm theo variant_id
static async deleteVariant(req, res) {
  const t = await ProductVariant.sequelize.transaction();
  try {
    const { variant_id } = req.params;

    // Tìm biến thể
    const variant = await ProductVariant.findByPk(variant_id);
    if (!variant) {
      return res.status(404).json({ message: "Biến thể không tồn tại" });
    }

    await ProductVariantAttributeValue.destroy({
      where: { product_variant_id: variant_id },
      transaction: t,
    });

    await VariantImage.destroy({
      where: { variant_id },
      transaction: t,
    });

    await ProductVariant.destroy({
      where: { id: variant_id },
      transaction: t,
    });

    await t.commit();
    res.status(200).json({ message: "Xoá biến thể thành công" });
  } catch (error) {
    await t.rollback();
    console.error("Lỗi khi xoá biến thể:", error);
    res.status(500).json({ error: error.message });
  }
}
// Lấy chi tiết biến thể theo variant_id
static async getVariantById(req, res) {
  try {
    const { variant_id } = req.params;

    const variant = await ProductVariant.findByPk(variant_id, {
      attributes: {
        include: ["product_id"], // 👈 Thêm product_id vào kết quả
      },
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
        {
          model: Product,
          as: "product",
          attributes: ["id", "name", "slug", "thumbnail"],
        },
      ],
    });

    if (!variant) {
      return res.status(404).json({ message: "Biến thể không tồn tại" });
    }

    res.status(200).json({
      status: 200,
      message: "Lấy chi tiết biến thể thành công",
      data: variant,
    });
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết biến thể:", error);
    res.status(500).json({ error: error.message });
  }
}


static async deleteAttributeValueById (req, res){
  try {
    const { id } = req.params;

    const deleted = await ProductVariantAttributeValue.destroy({
      where: { id }
    });

    if (deleted === 0) {
      return res.status(404).json({ message: 'Không tìm thấy thuộc tính để xoá' });
    }

    res.status(200).json({ message: 'Xoá thuộc tính thành công' });
  } catch (error) {
    console.error('Lỗi xoá thuộc tính:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};


static async getAllVariants(req, res) {
  try {
    const variants = await ProductVariant.findAll({
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name']
        }
      ],
      order: [['created_at', 'DESC']],
    });

    res.status(200).json({
      status: 200,
      message: "Lấy danh sách biến thể sản phẩm thành công",
      data: variants,
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}


static async deleteImagesClauding(req, res) {
  const { public_id } = req.body;

  try {
    await cloudinary.uploader.destroy(public_id);
    res.json({ message: "Xóa ảnh thành công" });
  } catch (error) {
    console.error("Lỗi xóa ảnh:", error);
    res.status(500).json({ error: "Lỗi xóa ảnh trên Cloudinary" });
  }
}





}

module.exports = ProductController;
