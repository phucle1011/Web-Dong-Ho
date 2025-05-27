const UserModel = require('../../models/usersModel');
const AddressModel = require('../../models/addressesModel');
const nodemailer = require('nodemailer');
const getEmailTemplate = require('../../utils/emailTemplate');
const { Op } = require('sequelize');

// Hàm tạo transporter với cấu hình SMTP (ví dụ dùng Gmail)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Helper: Gửi email với template chuyên nghiệp
const sendEmail = async (to, subject, htmlContent) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        html: htmlContent
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Đã gửi email đến ${to}`);
    } catch (error) {
        console.error("Lỗi gửi email:", error.message);
    }
};

class UserController {

    // Lấy danh sách người dùng phân trang
    static async get(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;

            const { count, rows: users } = await UserModel.findAndCountAll({
                order: [['created_at', 'DESC']],
                attributes: ['id', 'name', 'email', 'phone', 'avatar', 'role', 'status', 'created_at', 'updated_at'],
                include: [],
                limit: limit,
                offset: offset
            });

            res.status(200).json({
                status: 200,
                message: "Lấy danh sách người dùng thành công",
                data: users,
                totalPages: Math.ceil(count / limit),
                currentPage: page
            });
        } catch (error) {
            console.error("Lỗi khi lấy danh sách người dùng:", error);
            res.status(500).json({ error: error.message });
        }
    }

    // Lấy thông tin chi tiết người dùng theo ID
    static async getById(req, res) {
        try {
            const { id } = req.params;
            const user = await UserModel.findByPk(id, {
                attributes: ['id', 'name', 'email', 'phone', 'avatar', 'role', 'status', 'created_at', 'updated_at'],
                include: [{
                    model: AddressModel,
                    as: 'addresses',
                    attributes: ['id', 'address_line', 'city', 'district', 'province', 'is_default', 'created_at', 'updated_at']
                }]
            });

            if (!user) {
                return res.status(404).json({ message: "Người dùng không tồn tại" });
            }

            res.status(200).json({
                status: 200,
                data: user,
            });
        } catch (error) {
            console.error("Lỗi khi lấy chi tiết người dùng:", error);
            res.status(500).json({ error: error.message });
        }
    }

    // Cập nhật trạng thái người dùng
    static async updateUserStatus(req, res) {
        try {
            const { id } = req.params;
            const { status, reason } = req.body;

            if (!['active', 'inactive', 'pending', 'locked'].includes(status)) {
                return res.status(400).json({ message: "Trạng thái không hợp lệ." });
            }

            if (!reason || typeof reason !== 'string' || reason.trim() === '') {
                return res.status(400).json({ message: "Vui lòng nhập lý do thay đổi trạng thái." });
            }

            const user = await UserModel.findByPk(id);
            if (!user) {
                return res.status(404).json({ message: "Người dùng không tồn tại." });
            }

            // Cập nhật trạng thái
            user.status = status;
            await user.save();

            // Gửi email thông báo lý do
            const htmlContent = getEmailTemplate(user.name, status, reason);

            await sendEmail(user.email, "Thông báo thay đổi trạng thái tài khoản", htmlContent);

            res.status(200).json({
                message: `Cập nhật trạng thái người dùng thành công thành: ${status}`
            });

        } catch (error) {
            console.error("Lỗi khi cập nhật trạng thái người dùng:", error);
            res.status(500).json({ error: error.message });
        }
    }

    // Tìm kiếm người dùng
    static async searchUser(req, res) {
        try {
            const { searchTerm, page = 1, limit = 10 } = req.query;
            const currentPage = parseInt(page);
            const currentLimit = parseInt(limit);
            const offset = (currentPage - 1) * currentLimit;

            if (!searchTerm || searchTerm.trim() === '') {
                return res.status(400).json({ message: 'Vui lòng cung cấp từ khóa tìm kiếm.' });
            }

            const { count, rows: users } = await UserModel.findAndCountAll({
                where: {
                    [Op.or]: [
                        { name: { [Op.like]: `%${searchTerm}%` } },
                        { email: { [Op.like]: `%${searchTerm}%` } },
                        { phone: { [Op.like]: `%${searchTerm}%` } }
                    ]
                },
                attributes: ['id', 'name', 'email', 'phone', 'avatar', 'role', 'status', 'created_at', 'updated_at'],
                limit: currentLimit,
                offset: offset,
                order: [['created_at', 'DESC']]
            });

            if (count === 0) {
                return res.status(404).json({
                    status: 200,
                    message: 'Không tìm thấy người dùng nào phù hợp.',
                    data: [],
                    totalPages: 0,
                    currentPage: currentPage
                });
            }

            return res.status(200).json({
                status: 200,
                message: 'Tìm kiếm người dùng thành công',
                data: users,
                totalPages: Math.ceil(count / currentLimit),
                currentPage: currentPage
            });

        } catch (error) {
            console.error('Lỗi khi tìm kiếm người dùng:', error);
            return res.status(500).json({ message: 'Lỗi server' });
        }
    }
}

module.exports = UserController;