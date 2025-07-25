const Blog = require("../../models/blogsModel");
const User = require("../../models/usersModel");
const BlogReview = require("../../models/blogsReviewModels");

class BlogReviewController {
  static async getBlogReviews(req, res) {
    try {
      const blogId = req.params.blogId;
      const reviews = await BlogReview.findAll({
        where: { blog_id: blogId },
        order: [["created_at", "DESC"]],
        include: [{ model: User, as: "user", attributes: ["name"] }]
      });
      res.json({
        reviews: reviews.map(r => ({
          id: r.id,
          rating: r.rating,
          comment: r.comment,
          created_at: r.created_at,
          user_name: r.user ? r.user.name : "Khách"
        }))
      });
    } catch (e) {
      res.status(500).json({ message: "Lỗi lấy bình luận" });
    }
  }

  static async createBlogReview(req, res) {
    try {
      const blogId = req.params.blogId;
      const { rating, comment } = req.body;
      const userId = req.user ? req.user.id : null; 

      if (!rating || !comment) {
        return res.status(400).json({ message: "Thiếu thông tin đánh giá." });
      }

      const newReview = await BlogReview.create({
        blog_id: blogId,
        user_id: userId,
        rating,
        comment,
        created_at: new Date()
      });

      res.json({ success: true, review: newReview });
    } catch (e) {
      res.status(500).json({ message: "Lỗi tạo đánh giá" });
    }
  }
}

module.exports = BlogReviewController;
