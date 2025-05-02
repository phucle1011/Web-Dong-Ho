const BlogModel = require('../../models/blogModel'); 
const UserModel = require('../../models/userModel'); 

class BlogController {
    static async get(req, res) {
        try {
            const blogs = await BlogModel.findAll({
                include: [{ model: UserModel, as: 'User' }]
            });

            res.status(200).json({
                status: 200,
                success: true,
                message: "Lấy danh sách bài viết thành công",
                data: blogs
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    static async getById(req, res) {
        try {
            const { id } = req.params;
            const blog = await BlogModel.findByPk(id, {
                include: [{ model: UserModel, as: 'User' }]
            });

            if (!blog) {
                return res.status(404).json({ message: "Không tìm thấy bài viết" });
            }

            res.status(200).json({
                status: 200,
                success: true,
                message: "Lấy dữ liệu thành công",
                data: blog,
            });
        } catch (err) {
            res.status(500).json({
                status: 500,
                success: false,
                message: "Lấy dữ liệu thất bại",
            });
        }
    }

    static async create(req, res) {
        try {
            const { title, content, userId } = req.body;
            const image = req.file ? req.file.filename : null;

            const newBlog = await BlogModel.create({
                title,
                content,
                image,
                userId,
            });

            res.status(201).json({
                status: 201,
                success: true,
                message: "Thêm bài viết thành công!",
                data: newBlog
            });

        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const { title, content, userId } = req.body;
            const image = req.file ? req.file.filename : undefined;

            const blog = await BlogModel.findByPk(id);
            if (!blog) {
                return res.status(404).json({ message: "Không tìm thấy bài viết." });
            }

            await blog.update({
                title,
                content,
                userId,
                ...(image && { image })
            });

            res.status(200).json({
                success: true,
                message: "Cập nhật bài viết thành công!",
                data: blog
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Cập nhật bài viết thất bại!",
                error: error.message
            });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            const blog = await BlogModel.findByPk(id);
            if (!blog) {
                return res.status(404).json({ message: "Bài viết không tồn tại" });
            }

            await blog.destroy();

            res.status(200).json({
                success: true,
                message: "Xóa bài viết thành công"
            });
        } catch (error) {
            res.status(500).json({
                status: 500,
                success: false,
                message: "Xóa không thành công",
                error: error.message
            });
        }
    }
}

module.exports = BlogController;
