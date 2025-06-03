const { Op } = require("sequelize"); 
const Blog = require("../../models/blogsModel");

class BlogController {
  static async getAllBlogs(req, res) {
    try {
      const blogs = await Blog.findAll({
        order: [["created_at", "DESC"]],
      });
      res.status(200).json({ blogs });
    } catch (error) {
      console.error("Error fetching blogs:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  static async getBlogById(req, res) {
    const { id } = req.params;
    try {
      const blog = await Blog.findByPk(id);

      if (!blog) {
        return res.status(404).json({ message: "Blog not found" });
      }

      res.status(200).json(blog);
    } catch (error) {
      console.error("Error fetching blog by id:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  // Thêm method tìm kiếm blog theo title
  static async searchBlogs(req, res) {
    const q = req.query.q || "";

    if (!q.trim()) {
      return res.status(200).json({ blogs: [] }); // nếu từ khóa rỗng trả về mảng rỗng
    }

    try {
      const blogs = await Blog.findAll({
        where: {
          title: {
            [Op.like]: `%${q}%`, // tìm các title chứa q (case-insensitive tùy DB)
          },
        },
        order: [["created_at", "DESC"]],
      });

      res.status(200).json({ blogs });
    } catch (error) {
      console.error("Error searching blogs:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
}

module.exports = BlogController;
