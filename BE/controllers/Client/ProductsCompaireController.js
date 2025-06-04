const { Sequelize, Op } = require("sequelize");

const Product = require("../../models/productsModel");
const Brand = require("../../models/brandsModel");
const ProductVariant = require("../../models/productVariantsModel");
const VariantImage = require("../../models/variantImagesModel");
const ProductVariantAttributeValue = require("../../models/productVariantAttributeValuesModel");
const ProductAttribute = require("../../models/productAttributesModel");
const Comment = require("../../models/commentsModel");

class ProductCompareController {
static async getAllForComparison(req, res) {
    try {
      const { keyword } = req.query;

      const products = await Product.findAll({
        where: {
          status: 1,
          ...(keyword && {
            [Op.or]: [
              { name: { [Op.like]: `%${keyword}%` } },
              Sequelize.literal(`EXISTS (
                SELECT 1 FROM product_variants AS pv
                WHERE pv.product_id = products.id
                AND pv.sku LIKE '%${keyword}%'
              )`),
            ],
          }),
        },
        include: [
          {
            model: Brand,
            as: "brand",
            attributes: ["name"],
          },
          {
            model: ProductVariant,
            as: "variants",
            include: [
              {
                model: VariantImage,
                as: "images",
                attributes: ["image_url"],
              },
              {
                model: ProductVariantAttributeValue,
                as: "attributeValues",
                attributes: ["value"],
                include: [
                  {
                    model: ProductAttribute,
                    as: "attribute",
                    attributes: ["name"],
                  },
                ],
              },
            ],
          },
        ],
        attributes: {
          include: [
            [
              Sequelize.literal(`(
                SELECT ROUND(AVG(c.rating), 1)
                FROM comments AS c
                JOIN order_details AS od ON od.id = c.order_detail_id
                JOIN product_variants AS pv ON pv.id = od.product_variant_id
                WHERE pv.product_id = products.id
              )`),
              "average_rating",
            ],
            [
              Sequelize.literal(`(
                SELECT COUNT(c.id)
                FROM comments AS c
                JOIN order_details AS od ON od.id = c.order_detail_id
                JOIN product_variants AS pv ON pv.id = od.product_variant_id
                WHERE pv.product_id = products.id
              )`),
              "review_count",
            ],
          ],
        },
        order: [["created_at", "DESC"]],
      });

      res.status(200).json({
        success: true,
        data: products,
      });
    } catch (error) {
      console.error("Error fetching products for comparison:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }

}

module.exports = ProductCompareController;
