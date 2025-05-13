const CategoryModel = require('../../models/categoryModel');
const { Op } = require('sequelize');

class CategoryController {
  static async getAll(req, res) {
    try {
      const categories = await CategoryModel.findAll({
        order: [["created_at", "DESC"]],
      });
      res.status(200).json({
        status: 200,
        message: "Lấy danh sách danh mục thành công",
        data: categories,
      });
    } catch (error) {
      console.error("Lỗi khi lấy danh sách danh mục:", error);
      res.status(500).json({
        status: 500,
        message: "Lỗi server khi lấy danh sách danh mục.",
      });
    }
  }

  static async create(req, res) {
    const { name, slug, description, status } = req.body;
    if (!name || !description) {
      return res.status(400).json({
        status: 400,
        message: "Tên và mô tả danh mục là bắt buộc.",
      });
    }
    try {
      const newCategory = await CategoryModel.create({
        name,
        slug,
        description,
        status,
      });
      res.status(201).json({
        status: 201,
        message: "Thêm danh mục thành công.",
        data: newCategory,
      });
    } catch (error) {
      console.error("Lỗi khi thêm danh mục:", error);
      res.status(500).json({
        status: 500,
        message: "Lỗi server khi thêm danh mục.",
      });
    }
  }

  static async getById(req, res) {
    const { id } = req.params;
    try {
      const category = await CategoryModel.findByPk(id);
      if (!category) {
        return res.status(404).json({ message: "Danh mục không tồn tại." });
      }
      res.status(200).json({ data: category });
    } catch (error) {
      res.status(500).json({ message: "Lỗi server." });
    }
  }



  static async update(req, res) {
    const { id } = req.params;
    const { name, slug, description, status } = req.body;

    if (!name || !description) {
      return res.status(400).json({
        status: 400,
        message: "Tên và mô tả danh mục là bắt buộc.",
      });
    }

    try {
      const category = await CategoryModel.findByPk(id);
      if (!category) {
        return res.status(404).json({
          status: 404,
          message: "Danh mục không tồn tại.",
        });
      }
      category.name = name;
      category.slug = slug;
      category.description = description;
      category.status = status;
      await category.save();
      res.status(200).json({
        status: 200,
        message: "Cập nhật danh mục thành công.",
        data: category,
      });
    } catch (error) {
      console.error("Lỗi khi cập nhật danh mục:", error);
      res.status(500).json({
        status: 500,
        message: "Lỗi server khi cập nhật danh mục.",
      });
    }
  }

  static async delete(req, res) {
    const { id } = req.params;
    try {
      const category = await CategoryModel.findByPk(id);
      if (!category) {
        return res.status(404).json({
          status: 404,
          message: "Danh mục không tồn tại.",
        });
      }
      const relatedProducts = await category.getProducts(); // Giả sử CategoryModel có quan hệ với Products
      if (relatedProducts.length > 0) {
        return res.status(400).json({
          status: 400,
          message: "Không thể xóa danh mục vì có sản phẩm liên quan.",
        });
      }
      await category.destroy();
      res.status(200).json({
        status: 200,
        message: `Xóa danh mục "${category.name}" thành công.`,
      });
    } catch (error) {
      console.error("Lỗi khi xóa danh mục:", error);
      if (error.name === "SequelizeForeignKeyConstraintError") {
        return res.status(400).json({
          status: 400,
          message: "Không thể xóa vì có dữ liệu liên quan sử dụng danh mục này.",
        });
      }

      res.status(500).json({
        status: 500,
        message: "Lỗi server khi xóa danh mục.",
      });
    }
  }
}

module.exports = CategoryController;
