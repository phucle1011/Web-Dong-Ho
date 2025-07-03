const Blog = require('../../models/blogsModel');
const { Op } = require('sequelize');

class BlogController {
  // Lấy danh sách blog có hỗ trợ tìm kiếm theo tiêu đề + phân trang
  static async getAll(req, res) {
    try {
      const { page = 1, limit = 5, search = "" } = req.query;
      const offset = (page - 1) * limit;

      // Điều kiện tìm kiếm, nếu có
      let whereCondition = {};
      if (search) {
        whereCondition = {
          title: {
            [Op.like]: `%${search}%`,
          },
        };
      }

      const { rows: blogs, count: totalItems } = await Blog.findAndCountAll({
        where: whereCondition,
        limit: Number(limit),
        offset: Number(offset),
        order: [['created_at', 'DESC']],  // dùng created_at thay vì createdAt
      });

      const totalPages = Math.ceil(totalItems / limit);

      res.json({
        data: blogs,
        pagination: {
          totalItems,
          totalPages,
          currentPage: Number(page),
        },
      });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi lấy bài viết', error: error.message });
    }
  }

  static async getById(req, res) {
    try {
      const id = req.params.id;
      const blog = await Blog.findByPk(id);
      if (!blog) return res.status(404).json({ message: 'Không tìm thấy bài viết' });
      res.json(blog);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi lấy bài viết', error: error.message });
    }
  }

  static async create(req, res) {
    try {
      const data = req.body; 
      const { user_id, title, image_url, content, meta_description, focus_keyword } = req.body;

      const newBlog = await Blog.create({
        user_id: data.user_id,
        title: data.title,
        image_url: data.image_url,
        content: data.content,
        meta_description: data.meta_description,
        focus_keyword: data.focus_keyword,
      });

      res.status(201).json(newBlog);
    } catch (error) {
      console.error("Lỗi khi tạo blog:", error);
      res.status(500).json({ message: 'Lỗi khi tạo bài viết', error: error.message });
    }
  }

  static async update(req, res) {
  try {
    const id = req.params.id;
    const {
      user_id,
      title,
      image_url,
      content,
      meta_description,
      focus_keyword
    } = req.body;

    const blog = await Blog.findByPk(id);
    if (!blog) return res.status(404).json({ message: 'Không tìm thấy bài viết' });

    await blog.update({
      user_id,
      title,
      image_url,
      content,
      meta_description,
      focus_keyword
    });

    res.json({ message: 'Cập nhật thành công', blog });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi cập nhật bài viết', error: error.message });
  }
}


  static async delete(req, res) {
    try {
      const id = req.params.id;

      const blog = await Blog.findByPk(id);
      if (!blog) return res.status(404).json({ message: 'Không tìm thấy bài viết' });

      await blog.destroy();
      res.json({ message: 'Xóa bài viết thành công' });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi xóa bài viết', error: error.message });
    }
  }
}

module.exports = BlogController;
