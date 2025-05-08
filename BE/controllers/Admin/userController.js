const UserModel = require('../../models/usersModel');
const AddressModel = require('../../models/addressModel')
const { Op } = require('sequelize');

class UserController {

    static async get(req, res) {
        try {
            const users = await UserModel.findAll({
                order: [['created_at', 'DESC']],
                attributes: ['id', 'name', 'email', 'phone', 'avatar', 'role', 'status', 'created_at', 'updated_at']
            });

            res.status(200).json({
                status: 200,
                message: "Lấy danh sách người dùng thành công",
                data: users,
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getById(req, res) {
        try {
            const { id } = req.params;
            const user = await UserModel.findByPk(id, {
                attributes: ['id', 'name', 'email', 'phone', 'avatar', 'role', 'status', 'created_at', 'updated_at'],
                include: [
                    {
                        model: AddressModel,
                        as: 'addresses',
                        attributes: ['id', 'address_line1', 'address_line2', 'city', 'district', 'province', 'postal_code', 'is_default', 'created_at', 'updated_at'] // Chọn các trường địa chỉ bạn muốn hiển thị
                    }
                ]
            });

            if (!user) {
                return res.status(404).json({ message: "Người dùng không tồn tại" });
            }

            res.status(200).json({
                status: 200,
                data: user,
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async updateUserStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            if (!['active', 'inactive', 'pending', 'locked'].includes(status)) {
                return res.status(400).json({ message: "Trạng thái không hợp lệ." });
            }

            const user = await UserModel.findByPk(id);
            if (!user) {
                return res.status(404).json({ message: "Người dùng không tồn tại." });
            }

            user.status = status;
            await user.save();

            res.status(200).json({ message: `Cập nhật trạng thái người dùng thành công thành: ${status}` });

        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async addAddressToUser(req, res) {
        try {
            const { id } = req.params;
            const { address_line1, address_line2, city, district, province, postal_code, is_default } = req.body;

            const user = await UserModel.findByPk(id);
            if (!user) {
                return res.status(404).json({ message: "Người dùng không tồn tại." });
            }

            const newAddress = await AddressModel.create({
                user_id: id,
                address_line1,
                address_line2,
                city,
                district,
                province,
                postal_code,
                is_default: is_default || 0,
            });

            res.status(201).json({ message: "Thêm địa chỉ thành công.", data: newAddress });

        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async searchUser(req, res) {
        try {
            const { searchTerm } = req.query;

            if (!searchTerm || searchTerm.trim() === '') {
                return res.status(400).json({ message: 'Vui lòng cung cấp từ khóa tìm kiếm.' });
            }

            const users = await UserModel.findAll({
                where: {
                    [Op.or]: [
                        { name: { [Op.like]: `%${searchTerm}%` } },
                        { email: { [Op.like]: `%${searchTerm}%` } },
                        { phone: { [Op.like]: `%${searchTerm}%` } }
                    ]
                },
                attributes: ['id', 'name', 'email', 'phone', 'avatar', 'role', 'status', 'created_at', 'updated_at']
            });

            if (users.length === 0) {
                return res.status(404).json({ message: 'Không tìm thấy người dùng nào.' });
            }

            return res.status(200).json({
                message: 'Tìm kiếm người dùng thành công',
                data: users
            });

        } catch (error) {
            console.error('Lỗi khi tìm kiếm người dùng:', error);
            return res.status(500).json({ message: 'Lỗi server' });
        }
    }
}

module.exports = UserController;