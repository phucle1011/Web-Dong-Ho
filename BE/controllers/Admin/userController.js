const UserModel = require('../../models/userModel');
const bcrypt = require('bcryptjs');

class UserController {
    static async get(req, res) {
        try {
            const users = await UserModel.findAll();
            res.status(200).json({
                status: 200,
                success: true,
                message: "Lấy danh sách thành công",
                data: users
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getById(req, res) {
        try {
            const { id } = req.params;
            const user = await UserModel.findByPk(id);

            if (!user) {
                return res.status(404).json({ message: "Không tìm thấy Id" });
            }

            res.status(200).json({
                status: 200,
                success: true,
                message: "Lấy dữ liệu thành công",
                data: user,
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
            const {
                fullName,
                phone,
                email,
                password,
                role,
                status
            } = req.body;

            const image = req.file ? req.file.filename : null; 
            const existingUser = await UserModel.findOne({ where: { email } });

            if (existingUser) {
                return res.status(400).json({ success: false, message: "Email đã tồn tại!" });
            }

            const hashedPassword = await bcrypt.hash(password, 12);

            const newUser = await UserModel.create({
                fullName,
                phone,
                email,
                password: hashedPassword,
                role,
                status,
                image
            });

            res.status(201).json({
                status: 201,
                success: true,
                message: "Thêm người dùng thành công!",
                data: newUser
            });

        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const {
                fullName,
                phone,
                email,
                role,
                status
            } = req.body;

            const image = req.file ? req.file.filename : null;

            const user = await UserModel.findByPk(id);
            if (!user) {
                return res.status(404).json({ message: "Không tìm thấy người dùng." });
            }

            await user.update({
                fullName,
                phone,
                email,
                role,
                status,
                ...(image && { image })
            });

            res.status(200).json({
                success: true,
                message: "Cập nhật người dùng thành công!",
                data: user
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Cập nhật người dùng thất bại!",
                error: error.message
            });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            const user = await UserModel.findByPk(id);
            if (!user) {
                return res.status(404).json({ message: "Id không tồn tại" });
            }

            await user.destroy();

            res.status(200).json({
                success: true,
                message: "Xóa thành công"
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

module.exports = UserController;
