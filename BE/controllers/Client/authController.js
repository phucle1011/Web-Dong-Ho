const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const sendResetPassword = require("../../mail/resetPassword/sendmail");
require("dotenv").config();
const sendVerificationEmail = require("../../mail/verifyEmail/sendMail");
const { successResponse, errorResponse } = require('../../helpers/response');
const UserModel = require('../../models/usersModel');



const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

class AuthController {
    static async register(req, res) {
        try {
            const { name, email, password, phone, avatar } = req.body;

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

            if (!email || !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
                return errorResponse(res, "Email không hợp lệ!", 400);
            }

            if (!password || password.length < 6) {
                return errorResponse(res, "Mật khẩu phải ít nhất 6 ký tự!", 400);
            }

            const existingUser = await UserModel.findOne({ where: { email } });
            if (existingUser) {
                return errorResponse(res, "Email này đã được đăng ký!", 400);
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const verifyToken = jwt.sign({ email }, JWT_SECRET, { expiresIn: "1h" });

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

            await sendVerificationEmail(email, verifyToken);

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
                return successResponse(res, null, { email }); // Không gửi thông báo, chỉ dữ liệu
            }

            await user.update({ email_verified_at: new Date() });
            return successResponse(res, null, { email });
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

            if (!email || !password) {
                return errorResponse(res, "Email và mật khẩu là bắt buộc!", 400);
            }

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
                {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    phone: user.phone,
                    email_verified_at: user.email_verified_at
                },
                JWT_SECRET,
                { expiresIn }
            );

            return successResponse(res, "Đăng nhập thành công!", {
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    email_verified_at: user.email_verified_at,
                    role: user.role,
                    status: user.status
                }
            }, 200);

        } catch (error) {
            console.error("Lỗi server:", error);
            return errorResponse(res, "Đăng nhập thất bại!", 500);
        }
    }

    static async updateVerification(req, res) {
        try {
            const { email } = req.body;

            if (!email) {
                return errorResponse(res, "Email là bắt buộc", 400);
            }

            const user = await UserModel.findOne({ where: { email } });
            if (!user) {
                return errorResponse(res, "Không tìm thấy người dùng", 404);
            }

            // Cập nhật thời gian xác thực
            await user.update({ email_verified_at: new Date() });

            return successResponse(res, "Cập nhật trạng thái xác thực thành công");
        } catch (error) {
            console.error("Lỗi khi cập nhật xác thực:", error);
            return errorResponse(res, "Lỗi server", 500);
        }
    }

    //-------------------[ RESET PASSWORD ]--------------------------
    static async resetPassword(req, res) {
        const { email } = req.body;
        try {
            const user = await UserModel.findOne({ where: { email } });
            if (!user) {
                return errorResponse(res, "Email không tồn tại!", 404);
            }

            const token = jwt.sign({ email: user.email, id: user.id }, JWT_SECRET, {
                expiresIn: "1h",
            });
            const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

            await sendResetPassword(email, resetLink);
            return successResponse(res, "Kiểm tra email để đặt lại mật khẩu!", null, 200);
        } catch (error) {
            console.error("Lỗi xảy ra khi reset password:", error);
            return errorResponse(res, "Lỗi server, vui lòng thử lại!", 500);
        }
    }

    // Cập nhật mật khẩu với token
    static async updatePassword(req, res) {
        const { token } = req.params;
        const { password } = req.body;

        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            const userId = decoded.id;

            const user = await UserModel.findOne({ where: { id: userId } });
            if (!user) {
                return errorResponse(res, "Tài khoản không tồn tại!", 404);
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            await user.update({ password: hashedPassword });

            return successResponse(res, "Cập nhật mật khẩu thành công!", null, 200);
        } catch (error) {
            console.error("Lỗi khi cập nhật mật khẩu:", error);
            if (error.name === "TokenExpiredError") {
                return errorResponse(res, "Liên kết đặt lại mật khẩu đã hết hạn!", 401);
            }
            if (error.name === "JsonWebTokenError") {
                return errorResponse(res, "Liên kết không hợp lệ!", 400);
            }
            return errorResponse(res, "Lỗi server, vui lòng thử lại!", 500);
        }
    }

}

module.exports = AuthController;
