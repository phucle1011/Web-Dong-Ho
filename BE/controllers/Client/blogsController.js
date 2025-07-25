const { Op } = require("sequelize"); 
const Blog = require("../../models/blogsModel");
const User = require("../../models/usersModel");
class BlogController {
 static async getAllBlogs(req, res) {
  try {
    const blogs = await Blog.findAll({
      order: [["created_at", "DESC"]],
      include: [
        {
          model: User,
          as: "user", 
          attributes: ["id", "name"], 
        },
      ],
    });

   
    const result = blogs.map((blog) => ({
      id: blog.id,
      user_id: blog.user_id,
      user_name: blog.user ? blog.user.name : "",
      title: blog.title,
      image_url: blog.image_url,
      content: blog.content,
      created_at: blog.created_at,
      updated_at: blog.updated_at,
      meta_description: blog.meta_description,
      focus_keyword: blog.focus_keyword,
    }));

    res.status(200).json({ blogs: result });
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
