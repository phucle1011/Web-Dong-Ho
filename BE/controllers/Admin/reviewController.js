const ReviewModel = require('../../models/reviewModel');
const UserModel = require('../../models/userModel');

class ReviewController {
    static async get(req, res) {
        try {
            const reviews = await ReviewModel.findAll({
                include: [{ model: UserModel, as: 'User' }]
            });

            res.status(200).json({
                success: true,
                message: "Lấy danh sách đánh giá thành công",
                data: reviews
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    static async getById(req, res) {
        try {
            const { id } = req.params;
            const review = await ReviewModel.findByPk(id, {
                include: [{ model: UserModel, as: 'User' }]
            });

            if (!review) {
                return res.status(404).json({ message: "Không tìm thấy đánh giá" });
            }

            res.status(200).json({
                success: true,
                message: "Lấy dữ liệu thành công",
                data: review,
            });
        } catch (err) {
            res.status(500).json({ success: false, message: "Lỗi server" });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const { userId, tripId, rating, comment, status } = req.body;

            const review = await ReviewModel.findByPk(id);
            if (!review) {
                return res.status(404).json({ message: "Không tìm thấy đánh giá." });
            }
            await review.update({
                userId,
                tripId,
                rating,
                comment,
                status,
            });
            res.status(200).json({
                success: true,
                message: "Cập nhật đánh giá thành công",
                data: review
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            const review = await ReviewModel.findByPk(id);
            if (!review) {
                return res.status(404).json({ message: "Không tìm thấy đánh giá" });
            }

            await review.destroy();

            res.status(200).json({
                success: true,
                message: "Xóa đánh giá thành công"
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = ReviewController;
