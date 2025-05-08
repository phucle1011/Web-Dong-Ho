const { CommentModel, UserModel, ProductModel } = require('../../models/connectModel');

class CommentController {
    // Lấy tất cả bình luận
    static async getAllComments(req, res) {
        try {
            const comments = await CommentModel.findAll({
                include: [
                    {
                        model: UserModel,
                        as: 'user',
                        attributes: ['name']
                    },
                    {
                        model: ProductModel,
                        as: 'product',
                        attributes: ['name']
                    }
                ]
            });

            if (comments.length === 0) {
                return res.status(404).json({
                    message: "No comments found"
                });
            }
            return res.status(200).json({
                status: 200,
                message: "Lấy danh sách bình luận thành công",
                data: comments.map(comment => ({
                    id: comment.id,
                    user_name: comment.user?.name || "N/A",
                    product_name: comment.product?.name || "N/A",
                    comment_text: comment.comment_text,
                    rating: comment.rating,
                    created_at: comment.created_at,
                    updated_at: comment.updated_at
                }))
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Lấy bình luận theo ID
    static async getCommentById(req, res) {
        try {
            const { id } = req.params;
            const comment = await CommentModel.findByPk(id, {
                include: [
                    {
                        model: UserModel,
                        as: 'user',
                        attributes: ['name']
                    },
                    {
                        model: ProductModel,
                        as: 'product',
                        attributes: ['name']
                    }
                ]
            });

            if (!comment) {
                return res.status(404).json({ message: "Bình luận không tồn tại" });
            }

            return res.status(200).json({
                status: 200,
                data: {
                    id: comment.id,
                    user_name: comment.user?.name || "N/A",
                    product_name: comment.product?.name || "N/A",
                    comment_text: comment.comment_text,
                    rating: comment.rating,
                    created_at: comment.created_at,
                    updated_at: comment.updated_at

                }
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = CommentController;
