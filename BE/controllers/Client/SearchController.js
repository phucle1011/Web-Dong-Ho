const { Op, Sequelize } = require('sequelize');
const ProductModel = require('../../models/productsModel');
const ProductVariantModel = require('../../models/productVariantsModel');
const VariantImageModel = require('../../models/variantImagesModel');
const BrandModel = require('../../models/brandsModel');
const CategoryModel = require('../../models/categoriesModel');
const ProductVariantAttributeValueModel = require('../../models/productVariantAttributeValuesModel');
const ProductAttributeModel = require('../../models/productAttributesModel');
const PromotionProductModel = require('../../models/promotionProductsModel');
const PromotionModel = require('../../models/promotionsModel');

class SearchController {
  static async searchProducts(req, res) {
    try {
      const {
        keyword = '',
        attribute_values = [],
        attribute_ids = [],
        brand_ids = [],
        page = 1,
        limit = 10,
      } = req.query;

      // Chuyển brand_ids thành mảng
      const parsedBrandIds =
        brand_ids === 'all'
          ? []
          : Array.isArray(brand_ids)
            ? brand_ids.map(id => parseInt(id))
            : brand_ids.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));

      // Chuyển attribute_values và attribute_ids thành mảng, chuyển thành chữ thường
      const parsedAttributeValues = Array.isArray(attribute_values)
        ? attribute_values.map(val => val.toLowerCase().trim()).filter(val => val)
        : attribute_values.split(',').map(val => val.toLowerCase().trim()).filter(val => val);
      const parsedAttributeIds = Array.isArray(attribute_ids)
        ? attribute_ids.map(id => parseInt(id))
        : attribute_ids.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));

      console.log('Debug - parsedAttributeValues:', parsedAttributeValues);
      console.log('Debug - parsedAttributeIds:', parsedAttributeIds);

      // Chuẩn hóa tham số phân trang
      const offset = (parseInt(page) - 1) * parseInt(limit);
      const currentDate = new Date();

      // Điều kiện WHERE cho Product
      const whereProduct = { status: 1 };
      if (keyword && parsedAttributeValues.length === 0) {
        whereProduct[Op.or] = [
          { name: { [Op.like]: `%${keyword.toLowerCase()}%` } },
          { description: { [Op.like]: `%${keyword.toLowerCase()}%` } },
        ];
      }
      if (parsedBrandIds.length > 0) {
        whereProduct.brand_id = { [Op.in]: parsedBrandIds };
      }

      // Điều kiện WHERE cho Variant (chỉ áp dụng khi không có attributeValues)
      const whereVariant = keyword && parsedAttributeValues.length === 0 ? { sku: { [Op.like]: `%${keyword.toLowerCase()}%` } } : {};

      // Điều kiện WHERE cho Attribute Values (sử dụng Op.like cho tìm kiếm linh hoạt)
      const whereAttributeValue = {};
      if (parsedAttributeValues.length > 0) {
        whereAttributeValue[Op.or] = parsedAttributeValues.map(val =>
          Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('value')), {
            [Op.like]: `%${val}%`, // Sử dụng Op.like để tìm kiếm linh hoạt
          })
        );
        if (parsedAttributeIds.length > 0) {
          whereAttributeValue.product_attribute_id = { [Op.in]: parsedAttributeIds };
        }
      }

      console.log('Debug - whereAttributeValue:', whereAttributeValue);
      console.log('Debug - whereVariant:', whereVariant);

      // Include các mối quan hệ
      const include = [
        {
          model: BrandModel,
          as: 'brand',
          attributes: ['id', 'name'],
          required: false,
        },
        {
          model: CategoryModel,
          as: 'category',
          attributes: ['id', 'name'],
          required: false,
        },
        {
          model: ProductVariantModel,
          as: 'variants',
          where: whereVariant,
          required: parsedAttributeValues.length > 0 || parsedAttributeIds.length > 0 || (keyword && parsedAttributeValues.length === 0),
          include: [
            {
              model: VariantImageModel,
              as: 'images',
              attributes: ['id', 'image_url'],
            },
            {
              model: ProductVariantAttributeValueModel,
              as: 'attributeValues',
              where: whereAttributeValue,
              required: parsedAttributeValues.length > 0 || parsedAttributeIds.length > 0,
              include: [
                {
                  model: ProductAttributeModel,
                  as: 'attribute',
                  attributes: ['id', 'name'],
                },
              ],
            },
            {
              model: PromotionProductModel,
              as: 'promotionProducts',
              include: [
                {
                  model: PromotionModel,
                  as: 'promotion',
                  where: {
                    start_date: { [Op.lte]: currentDate },
                    end_date: { [Op.gte]: currentDate },
                    status: 'active',
                  },
                  required: false,
                },
              ],
            },
          ],
        },
      ];

      // Thực hiện tìm kiếm với log query SQL
      const products = await ProductModel.findAndCountAll({
        where: whereProduct,
        include,
        limit: parseInt(limit),
        offset,
        distinct: true,
        logging: console.log,
      });

      // Định dạng kết quả
      const formattedProducts = products.rows.map(product => {
        const variants = product.variants.map(variant => {
          const promoProduct = variant.promotionProducts[0];
          let finalPrice = parseFloat(variant.price);
          let promotion = null;

          if (promoProduct?.promotion) {
            const promo = promoProduct.promotion;
            if (promo.discount_type === 'percentage') {
              finalPrice -= (finalPrice * parseFloat(promo.discount_value)) / 100;
            } else if (promo.discount_type === 'fixed') {
              finalPrice -= parseFloat(promo.discount_value);
            }
            finalPrice = Math.max(0, finalPrice);
            promotion = {
              id: promo.id,
              code: promo.code,
              discount_type: promo.discount_type,
              discount_value: parseFloat(promo.discount_value),
              discounted_price: parseFloat(finalPrice.toFixed(2)),
            };
          }

          return {
            ...variant.toJSON(),
            final_price: promotion ? finalPrice : null,
            promotion,
            attribute_values: variant.attributeValues.map(attr => ({
              attribute_id: attr.attribute.id,
              attribute_name: attr.attribute.name,
              value: attr.value,
            })),
          };
        });

        return {
          id: product.id,
          name: product.name,
          description: product.description,
          thumbnail: product.thumbnail,
          brand: product.brand?.name || null,
          category: product.category?.name || null,
          variants,
        };
      });

      res.status(200).json({
        status: 200,
        message: 'Tìm kiếm sản phẩm thành công',
        data: formattedProducts,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(products.count / limit),
          totalItems: products.count,
        },
      });
    } catch (error) {
      console.error('Lỗi khi tìm kiếm sản phẩm:', error);
      res.status(500).json({ message: 'Đã xảy ra lỗi khi tìm kiếm', error: error.message });
    }
  }
}

module.exports = SearchController;