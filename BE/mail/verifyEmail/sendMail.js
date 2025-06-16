const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendVerificationEmail = async (email, verificationToken) => {
    const verificationLink = `http://localhost:3000/auth/verify-email?token=${verificationToken}`;

    const mailOptions = {
        from: `"Hệ thống xác thực" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Xác thực địa chỉ email của bạn",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
                <h2 style="color: #4a4a4a;">Xin chào!</h2>
                <p>Cảm ơn bạn đã đăng ký tài khoản. Vui lòng nhấn vào nút bên dưới để xác thực email của bạn:</p>
                
                <div style="text-align: center; margin: 25px 0;">
                    <a href="${verificationLink}" 
                       style="background-color: #6c5ce7; color: white; padding: 12px 24px; 
                              text-decoration: none; border-radius: 4px; font-weight: bold;">
                        Xác thực Email
                    </a>
                </div>
                
                <p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.</p>
                <p style="color: #888; font-size: 12px; margin-top: 30px;">
                    Liên kết này sẽ hết hạn sau 1 giờ. Nếu liên kết đã hết hạn, bạn có thể đăng nhập và yêu cầu gửi lại email xác thực.
                </p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email xác thực đã được gửi đến ${email}`);
        return true;
    } catch (error) {
        console.error("Lỗi gửi email xác thực:", error);
        throw new Error("Không thể gửi email xác thực");
    }
};

module.exports = sendVerificationEmail;