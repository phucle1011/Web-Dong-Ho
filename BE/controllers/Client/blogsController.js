const { Op } = require("sequelize"); 
const Blog = require("../../models/blogsModel");
const User = require("../../models/usersModel");
const BlogCategory = require("../../models/blogsCategoryModel");
class BlogController {
 static async getAllBlogs(req, res) {
  try {
    const { category } = req.query;

    const whereBlog = {};
    const whereCategory = {
      status: 1, // ❗ CHỈ LẤY danh mục hiển thị
    };

    if (category) {
      whereCategory.slug = category; // nếu có truyền slug thì lọc theo slug + status
    }

    const blogs = await Blog.findAll({
      where: whereBlog,
      order: [["created_at", "DESC"]],
      include: [
        {
          model: BlogCategory,
          as: "category",
          attributes: ["id", "name", "slug"],
          where: whereCategory,
          required: true, // ❗ Bắt buộc để điều kiện `where` có tác dụng
        },
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
      user_name: blog.user?.name || "",
      title: blog.title,
      image_url: blog.image_url,
      content: blog.content,
      created_at: blog.created_at,
      updated_at: blog.updated_at,
      meta_description: blog.meta_description,
      focus_keyword: blog.focus_keyword,
      blog_category: blog.category?.name || null,
      blog_category_slug: blog.category?.slug || null,
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
    const blog = await Blog.findByPk(id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name"],
        },
        {
          model: BlogCategory,
          as: "category",
          attributes: ["id", "name", "slug"],
        },
      ],
    });

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    const result = {
      id: blog.id,
      user_id: blog.user_id,
      user_name: blog.user?.name || "",
      title: blog.title,
      image_url: blog.image_url,
      content: blog.content,
      created_at: blog.created_at,
      updated_at: blog.updated_at,
      meta_description: blog.meta_description,
      focus_keyword: blog.focus_keyword,
      blog_category: blog.category?.name || null,
      blog_category_slug: blog.category?.slug || null,
    };

    res.status(200).json(result);
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
