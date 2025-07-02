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
        subject: "🎉 Xác thực địa chỉ email của bạn!",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 700px; margin: auto; background-color: #ffffff; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; color: #333;">
                <div style="text-align: center; padding: 20px; background-color: #f1faff; border-bottom: 2px solid #007acc;">
                    <img src="https://yourdomain.com/image/logo.jpg" alt="Logo TIMEMASTERS" style="width: 140px;" />
                    <h1 style="margin: 0; font-size: 26px; color: #007acc;">TIMEMASTERS</h1>
                    <p style="margin: 4px 0; font-size: 14px; color: #555;">
                        Hotline: <a href="tel:+84123456789" style="color: #007acc;">+84 123 456 789</a>
                    </p>
                </div>

                <div style="padding: 30px 25px;">
                    <h2 style="color: #1d3557;">Xin chào!</h2>
                    <p style="font-size: 16px;">
                        Cảm ơn bạn đã đăng ký tài khoản. Vui lòng nhấn vào nút bên dưới để xác thực email của bạn:
                    </p>
                    <ul style="list-style-type: disc; padding-left: 20px; margin-bottom: 20px;">
                        <li>
                            <div style="text-align: center; margin: 25px 0;">
                                <a href="${verificationLink}" 
                                   style="background-color: #6c5ce7; color: white; padding: 12px 24px; 
                                          text-decoration: none; border-radius: 4px; font-weight: bold;">
                                    Xác thực Email
                                </a>
                            </div>
                            <span style="font-size: 14px; color: #555;">
                                Liên kết này sẽ hết hạn sau <strong>1 giờ</strong>. Nếu liên kết đã hết hạn, bạn có thể đăng nhập và yêu cầu gửi lại email xác thực.
                            </span>
                        </li>
                    </ul>

                    <p style="font-size: 15px; color: #555;">
                        Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.
                    </p>
                </div>

                <div style="text-align: center; font-size: 13px; color: #999; padding: 20px; background-color: #f8f9fa; border-top: 1px solid #ddd;">
                    <p style="margin: 5px 0;">© ${new Date().getFullYear()} TIMEMASTERS. Địa chỉ: Số 233, Nguyễn Văn Linh, Cần Thơ</p>
                    <p style="margin: 5px 0; font-style: italic;">Email này được gửi tự động, vui lòng không trả lời lại.</p>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error("Lỗi gửi email xác thực:", error);
        throw new Error("Không thể gửi email xác thực");
    }
};

module.exports = sendVerificationEmail;