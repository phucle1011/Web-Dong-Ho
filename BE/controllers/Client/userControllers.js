const UserModel = require('../../models/usersModel');

class UserController {
    static async updateUserInfo(req, res) {
        try {
            const { id } = req.params;
            const { name, email, phone } = req.body;

            const user = await UserModel.findByPk(id);
            if (!user) {
                return res.status(404).json({ message: "Người dùng không tồn tại." });
            }

            if (name) user.name = name;
            if (email) user.email = email;
            if (phone) user.phone = phone;

            await user.save();

            res.status(200).json({
                success: true,
                message: "Cập nhật thông tin thành công",
                data: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone
                }
            });

        } catch (error) {
            console.error("Lỗi khi cập nhật thông tin người dùng:", error);
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = UserController;