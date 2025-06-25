const ProductAttributeModel = require('../../models/productAttributesModel');
const { Op } = require('sequelize');

class ProductAttributeController {
  // Lấy danh sách thuộc tính với tìm kiếm và phân trang
  static async getAll(req, res) {
    const { searchTerm = '', page = 1, limit = 10 } = req.query;
    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const offset = (pageNumber - 1) * pageSize;

    try {
      const whereClause = searchTerm
        ? {
            name: {
              [Op.like]: `%${searchTerm}%`,
            },
          }
        : {};

      const { rows: attributes, count: totalItems } = await ProductAttributeModel.findAndCountAll({
        where: whereClause,
        limit: pageSize,
        offset,
        order: [['created_at', 'DESC']],
      });

      const totalPages = Math.ceil(totalItems / pageSize);

      res.status(200).json({
        status: 200,
        message: 'Lấy danh sách thuộc tính thành công',
        data: attributes,
        pagination: {
          totalItems,
          totalPages,
          currentPage: pageNumber,
          perPage: pageSize,
        },
      });
    } catch (error) {
      console.error('Lỗi khi lấy danh sách thuộc tính:', error);
      res.status(500).json({
        status: 500,
        message: 'Lỗi server khi lấy danh sách thuộc tính.',
      });
    }
  }

  // Tạo mới thuộc tính
  static async create(req, res) {
    let { name } = req.body;

    if (!name) {
      return res.status(400).json({
        status: 400,
        message: 'Tên thuộc tính là bắt buộc.',
      });
    }

    const normalizedName = name.trim().replace(/\s+/g, ' ').toLowerCase();

    try {
      const existingAttribute = await ProductAttributeModel.findOne({
        where: { name: normalizedName },
      });

      if (existingAttribute) {
        return res.status(409).json({
          status: 409,
          message: 'Tên thuộc tính đã tồn tại.',
        });
      }

      const newAttribute = await ProductAttributeModel.create({
        name: normalizedName,
      });

      res.status(201).json({
        status: 201,
        message: 'Thêm thuộc tính thành công.',
        data: newAttribute,
      });
    } catch (error) {
      console.error('Lỗi khi thêm thuộc tính:', error);
      res.status(500).json({
        status: 500,
        message: 'Lỗi server khi thêm thuộc tính.',
      });
    }
  }

  // Lấy thuộc tính theo ID
  static async getById(req, res) {
    const { id } = req.params;
    try {
      const attribute = await ProductAttributeModel.findByPk(id);
      if (!attribute) {
        return res.status(404).json({
          status: 404,
          message: 'Thuộc tính không tồn tại.',
        });
      }
      res.status(200).json({
        status: 200,
        data: attribute,
      });
    } catch (error) {
      console.error('Lỗi khi lấy thuộc tính:', error);
      res.status(500).json({
        status: 500,
        message: 'Lỗi server.',
      });
    }
  }

  // Cập nhật thuộc tính
  static async update(req, res) {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        status: 400,
        message: 'Tên thuộc tính là bắt buộc.',
      });
    }

    try {
      const attribute = await ProductAttributeModel.findByPk(id);
      if (!attribute) {
        return res.status(404).json({
          status: 404,
          message: 'Thuộc tính không tồn tại.',
        });
      }

      attribute.name = name;
      await attribute.save();

      res.status(200).json({
        status: 200,
        message: 'Cập nhật thuộc tính thành công.',
        data: attribute,
      });
    } catch (error) {
      console.error('Lỗi khi cập nhật thuộc tính:', error);
      res.status(500).json({
        status: 500,
        message: 'Lỗi server khi cập nhật thuộc tính.',
      });
    }
  }

  // Xoá thuộc tính
  static async delete(req, res) {
    const { id } = req.params;

    try {
      const attribute = await ProductAttributeModel.findByPk(id);
      if (!attribute) {
        return res.status(404).json({
          status: 404,
          message: 'Thuộc tính không tồn tại.',
        });
      }

      await attribute.destroy();

      res.status(200).json({
        status: 200,
        message: `Xoá thuộc tính "${attribute.name}" thành công.`,
      });
    } catch (error) {
      console.error('Lỗi khi xoá thuộc tính:', error);

      res.status(500).json({
        status: 500,
        message: 'Lỗi server khi xoá thuộc tính.',
      });
    }
  }
}

module.exports = ProductAttributeController;
