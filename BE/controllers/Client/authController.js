const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const sendResetPassword = require("../../mail/resetPassword/sendmail");
require("dotenv").config();
const sendVerificationEmail = require("../../helpers/sendMail");
const { successResponse, errorResponse } = require('../../helpers/response');
const UserModel = require('../../models/usersModel');



const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

class AuthController {
    static async register(req, res) {
        try {
            const { name, email, password, phone, avatar } = req.body;

            // Validate name
            if (!name || typeof name !== 'string') {
                return errorResponse(res, "Họ tên không được để trống!", 400);
            }

            const trimmedName = name.trim();

            if (trimmedName.length < 2 || trimmedName.length > 50) {
                return errorResponse(res, "Họ tên phải từ 2 đến 50 ký tự!", 400);
            }

            const nameRegex = /^[a-zA-ZÀ-ỹ\s]+$/;
            if (!nameRegex.test(trimmedName)) {
                return errorResponse(res, "Họ tên chỉ chứa chữ cái và dấu cách!", 400);
            }

            // Validate email
            if (!email || !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
                return errorResponse(res, "Email không hợp lệ!", 400);
            }

            // Validate password
            if (!password || password.length < 6) {
                return errorResponse(res, "Mật khẩu phải ít nhất 6 ký tự!", 400);
            }

            // Kiểm tra email tồn tại chưa
            const existingUser = await UserModel.findOne({ where: { email } });
            if (existingUser) {
                return errorResponse(res, "Email này đã được đăng ký!", 400);
            }

            // Mã hóa mật khẩu
            const hashedPassword = await bcrypt.hash(password, 10);

            // Tạo token xác thực email
            const verifyToken = jwt.sign({ email }, JWT_SECRET, { expiresIn: "1h" });

            // Tạo người dùng mới
            const user = await UserModel.create({
                name,
                email,
                password: hashedPassword,
                phone: phone || null,
                avatar: avatar || "default-avatar.png",
                role: "user",
                email_verified_at: null,
                status: "active"
            });

            // Gửi email xác thực
            await sendVerificationEmail(email, verifyToken);

            // Trả về kết quả thành công
            return successResponse(res, "Đăng ký thành công! Vui lòng kiểm tra email để xác thực.", {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                avatar: user.avatar
            }, 201);

        } catch (error) {
            console.error("Lỗi server:", error);
            return errorResponse(res, "Lỗi server, vui lòng thử lại!", 500);
        }
    }

    // Thêm route xác thực email
    static async verifyEmail(req, res) {
        const { token } = req.query;

        if (!token) {
            return errorResponse(res, "Token không tồn tại!", 400);
        }

        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            const { email } = decoded;

            const user = await UserModel.findOne({ where: { email } });

            if (!user) {
                return errorResponse(res, "Không tìm thấy người dùng!", 404);
            }

            if (user.email_verified_at) {
                return successResponse(res, "Email đã được xác thực trước đó.");
            }

            // Cập nhật thời gian xác thực
            await user.update({ email_verified_at: new Date() });

            return successResponse(res, "Xác thực email thành công!");

        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return errorResponse(res, "Liên kết xác thực đã hết hạn!", 401);
            }
            return errorResponse(res, "Liên kết không hợp lệ!", 400);
        }
    }

    //------------------[ LOGIN ]------------------
    static async login(req, res) {
        try {
            const { email, password, rememberMe } = req.body;

            const user = await UserModel.findOne({ where: { email } });
            if (!user) {
                return errorResponse(res, "Email không tồn tại!", 400);
            }

            if (user.status === 'locked') {
                return errorResponse(res, "Tài khoản bị khóa!", 403);
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return errorResponse(res, "Mật khẩu không chính xác!", 400);
            }

            const expiresIn = rememberMe ? "30d" : "2h";

            const token = jwt.sign(
                { id: user.id, name: user.name, email: user.email, role: user.role },
                JWT_SECRET,
                { expiresIn }
            );

            return successResponse(res, "Đăng nhập thành công!", {
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    status: user.status
                }
            }, 200);

        } catch (error) {
            console.error("Lỗi server:", error);
            return errorResponse(res, "Đăng nhập thất bại!", 500);
        }
    }

    //-------------------[ RESET PASSWORD ]--------------------------
    static async resetPasswod(req, res) {
        const { email } = req.body;
        try {
            const user = await UserModel.findOne({ where: { email } });
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "Email không tồn tại",
                });
            }
            const token = jwt.sign({ email: user.email, id: user.id }, JWT_SECRET, {
                expiresIn: "5m",
            });
            const link = `http://localhost:3001/resetPassword/${token}`;
            await sendResetPassword(email, link);
            return res.status(200).json({
                success: true,
                message: "Kiểm tra email để đặt lại mật khẩu",
            });
        } catch (error) {
            console.error("Lỗi xảy ra khi reset password:", error);
            return res.status(500).json({
                success: false,
                message: "Lỗi khi tạo link reset",
            });
        }
    }

    static async updatePassword(req, res) {
        const token = req.params.token;
        const { password } = req.body;

        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            const userId = decoded.id;

            const user = await UserModel.findOne({ where: { id: userId } });
            if (!user) {
                return res.status(404).json({ message: "Tài khoản không tồn tại." });
            }

            const enPassword = await bcrypt.hash(password, 10);
            await user.update({ password: enPassword });

            return res.status(200).json({
                success: true,
                message: "Cập nhật mật khẩu thành công",
            });
        } catch (error) {
            console.error("Error in updatePassword:", error);
            if (error.name === "TokenExpiredError") {
                return res.status(401).json({
                    message: "Liên kết đặt lại mật khẩu đã hết hạn. Vui lòng yêu cầu lại."
                });
            }
            if (error.name === "JsonWebTokenError") {
                return res.status(401).json({
                    message: "Liên kết không hợp lệ. Vui lòng kiểm tra lại hoặc yêu cầu mới."
                });
            }
            return res.status(500).json({
                message: "Lỗi máy chủ. Vui lòng thử lại sau.",
                error: error.message
            });
        }
    }

}

module.exports = AuthController;
