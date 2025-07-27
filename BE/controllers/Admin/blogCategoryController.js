
const BlogCategory = require('../../models/blogsCategoryModel');
const slugify = require('slugify');

class BlogCategoryController {
  static async getAll(req, res) {
    try {
      const categories = await BlogCategory.findAll({ order: [['id', 'DESC']] });
      res.json({ success: true, data: categories });
    } catch (error) {
      res.status(500).json({ success: false, message: "Lỗi server", error });
    }
  }
  static async getById(req, res) {
  try {
    const { id } = req.params;
    const category = await BlogCategory.findByPk(id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Không tìm thấy danh mục" });
    }
    res.status(200).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi máy chủ", error });
  }
}
  static async create(req, res) {
    try {
      const { name } = req.body;
      const slug = slugify(name, { lower: true });
      const category = await BlogCategory.create({ name, slug });
      res.json({ success: true, message: "Tạo danh mục thành công", data: category });
    } catch (error) {
      res.status(400).json({ success: false, message: "Tạo thất bại", error });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const { name, status } = req.body;
      const slug = slugify(name, { lower: true });

      const category = await BlogCategory.findByPk(id);
      if (!category) return res.status(404).json({ success: false, message: "Không tìm thấy danh mục" });

      await category.update({ name, slug, status });
      res.json({ success: true, message: "Cập nhật thành công", data: category });
    } catch (error) {
      res.status(400).json({ success: false, message: "Cập nhật thất bại", error });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const category = await BlogCategory.findByPk(id);
      if (!category) return res.status(404).json({ success: false, message: "Không tìm thấy danh mục" });

      await category.destroy();
      res.json({ success: true, message: "Xóa thành công" });
    } catch (error) {
      res.status(500).json({ success: false, message: "Xóa thất bại", error });
    }
  }
}

module.exports = BlogCategoryController;
