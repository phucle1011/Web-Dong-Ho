const UserModel = require('../../models/usersModel');

class UserController {
  static async updateUserInfo(req, res) {
    try {
      const { id } = req.params;
      const { name, phone } = req.body;

      const phoneRegex = /^(0[3|5|7|8|9])\d{8}$/;

      if (!name || name.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: "Tên không được để trống.",
        });
      }

      if (!phone || !phoneRegex.test(phone)) {
        return res.status(400).json({
          success: false,
          message: "Số điện thoại không hợp lệ! Phải đủ 10 số và bắt đầu bằng 03, 05, 07, 08, 09.",
        });
      }

      const user = await UserModel.findByPk(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Người dùng không tồn tại.",
        });
      }

      user.name = name;
      user.phone = phone;

      await user.save();

      return res.status(200).json({
        success: true,
        message: "Cập nhật thông tin thành công.",
        data: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          email: user.email,
        },
      });
    } catch (error) {
      console.error("Lỗi khi cập nhật người dùng:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi máy chủ khi cập nhật người dùng.",
      });
    }
  }
}

module.exports = UserController;
