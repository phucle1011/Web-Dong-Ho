const { Op } = require('sequelize');
const Sequelize = require('sequelize');
const Product = require('../../models/productsModel');
const Variant = require('../../models/productVariantsModel');
const Img = require('../../models/variantImagesModel');
const Brand = require('../../models/brandsModel');
const Category = require('../../models/categoriesModel');
const AttrValue = require('../../models/productVariantAttributeValuesModel');
const Attribute = require('../../models/productAttributesModel');
const PromoProd = require('../../models/promotionProductsModel');
const Promotion = require('../../models/promotionsModel');

class SearchController {
  static async searchProducts(req, res) {
    try {
      let {
        keyword = '',
        attribute_values = [],
        attribute_ids = [],
        brand_ids = [],
        page = 1,
        limit = 10,
      } = req.query;

      // normalize
      page = Math.max(1, parseInt(page));
      limit = Math.max(1, parseInt(limit));
      const offset = (page - 1) * limit;
      const now = new Date();

      // helpers
      const toIntList = v => (Array.isArray(v) ? v : `${v}`.split(',')).map(x => parseInt(x)).filter(n => !isNaN(n));
      const toStrList = v => (Array.isArray(v) ? v : `${v}`.split(',')).map(x => x.trim().toLowerCase()).filter(x => x);

      const brandFilter = brand_ids === 'all' ? [] : toIntList(brand_ids);
      const attrIds = toIntList(attribute_ids);
      const attrVals = toStrList(attribute_values);

      const tokens = `${keyword}`.toLowerCase().split(/\s+/).filter(t => t);

      // 1) Tìm các product khớp keyword và brand
      const prodWhere = { status: 1 };
      if (brandFilter.length) prodWhere.brand_id = { [Op.in]: brandFilter };
      if (tokens.length) {
        prodWhere[Op.or] = [
          ...tokens.map(t => ({ name: { [Op.like]: `%${t}%` } })),
          ...tokens.map(t => ({ description: { [Op.like]: `%${t}%` } }))
        ];
      }
      const baseProds = await Product.findAll({
        where: prodWhere,
        attributes: ['id', 'name'],
        order: [['name', 'ASC']]
      });
      const baseIds = baseProds.map(p => p.id);
      if (!baseIds.length) {
        return res.json({
          status: 200,
          message: 'Không tìm thấy',
          data: [],
          pagination: { page, limit, totalItems: 0, totalPages: 0 }
        });
      }

      // 2) Lọc thêm theo thuộc tính (size, màu, chất liệu, ...)
      let finalIds = baseIds;
      if (attrIds.length || attrVals.length) {
        const avWhere = {};
        if (attrIds.length) avWhere.product_attribute_id = { [Op.in]: attrIds };
        if (attrVals.length) avWhere[Op.or] = attrVals.map(v => ({ value: { [Op.like]: `%${v}%` } }));

        const matching = await AttrValue.findAll({
          where: {
            ...avWhere,
            '$variant.product_id$': { [Op.in]: baseIds }
          },
          include: [{
            model: Variant,
            as: 'variant',
            attributes: ['product_id'],
            required: true
          }],
          attributes: [],
          raw: true
        });

        finalIds = [...new Set(matching.map(m => m['variant.product_id']))];

        if (!finalIds.length) {
          return res.json({
            status: 200,
            message: 'Không tìm thấy thuộc tính phù hợp',
            data: [],
            pagination: { page, limit, totalItems: 0, totalPages: 0 }
          });
        }
      }

      // 3) Phân trang & lấy chi tiết
      const totalItems = finalIds.length;
      const totalPages = Math.ceil(totalItems / limit);
      const pageIds = finalIds.slice(offset, offset + limit);

      const products = await Product.findAll({
        where: { id: pageIds },
        include: [
          { model: Brand, as: 'brand', attributes: ['id', 'name'] },
          { model: Category, as: 'category', attributes: ['id', 'name'] },
          {
            model: Variant, as: 'variants',
            where: tokens.length
              ? { sku: { [Op.or]: tokens.map(t => ({ [Op.like]: `%${t}%` })) } }
              : undefined,
            required: false,
            include: [
              { model: Img, as: 'images', attributes: ['id', 'image_url'] },
              {
                model: AttrValue, as: 'attributeValues',
                include: [{ model: Attribute, as: 'attribute', attributes: ['id', 'name'] }]
              },
              {
                model: PromoProd, as: 'promotionProducts',
                required: false,
                include: [{
                  model: Promotion, as: 'promotion',
                  where: {
                    start_date: { [Op.lte]: now },
                    end_date: { [Op.gte]: now },
                    status: 'active'
                  },
                  required: false
                }]
              }
            ]
          }
        ],
        order: [['name', 'ASC']]
      });

      // format
      const data = products.map(p => ({
        id: p.id, name: p.name, description: p.description, thumbnail: p.thumbnail,
        brand: p.brand?.name, category: p.category?.name,
        variants: p.variants.map(v => {
          const promo = v.promotionProducts[0]?.promotion;
          let fp = parseFloat(v.price);
          if (promo) {
            fp = promo.discount_type === 'percentage'
              ? fp * (1 - parseFloat(promo.discount_value) / 100)
              : fp - parseFloat(promo.discount_value);
          }
          return {
            id: v.id, sku: v.sku,
            price: parseFloat(v.price),
            final_price: Math.max(fp, 0),
            images: v.images.map(i => i.image_url),
            attributes: v.attributeValues.map(av => ({
              id: av.attribute.id,
              name: av.attribute.name,
              value: av.value
            })),
            promotion: promo ? {
              id: promo.id,
              code: promo.code,
              type: promo.discount_type,
              value: parseFloat(promo.discount_value)
            } : null
          };
        })
      }));

      return res.json({
        status: 200,
        message: 'Tìm kiếm thành công',
        data,
        pagination: { page, limit, totalItems, totalPages }
      });
    }
    catch (err) {
      console.error('Search error:', err);
      return res.status(500).json({ status: 500, message: 'Lỗi tìm kiếm', error: err.message });
    }
  }
}

module.exports = SearchController;
