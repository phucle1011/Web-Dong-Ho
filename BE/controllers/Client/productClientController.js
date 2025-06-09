const Product = require("../../models/productsModel");
const ProductVariant = require("../../models/productVariantsModel");
const ProductVariantAttributeValue = require("../../models/productVariantAttributeValuesModel");
const ProductAttribute = require("../../models/productAttributesModel");
const VariantImage = require("../../models/variantImagesModel");
const BrandModel = require("../../models/brandsModel");
const CategoryModel = require("../../models/categoriesModel");
const cloudinary = require("../../config/cloudinaryConfig"); 
 class ProductClientController {
  static async getAll(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      // Thêm điều kiện lọc
      const whereCondition = {};
      if (req.query.status) {
        whereCondition.status = req.query.status;
      }
      if (req.query.category_id) {
        whereCondition.category_id = req.query.category_id;
      }
      if (req.query.brand_id) {
        whereCondition.brand_id = req.query.brand_id;
      }

      const totalProducts = await Product.count({ where: whereCondition });

      const products = await Product.findAll({
        where: whereCondition,
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

      const productsWithVariantCount = products.map((product) => {
        const productJson = product.toJSON();
        productJson.variantCount = product.variants?.length || 0;
        return productJson;
      });

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
}

module.exports = ProductClientController;