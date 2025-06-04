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
            <h3>Xin chào!</h3>
            <p>Vui lòng nhấn vào liên kết bên dưới để xác thực email của bạn:</p>
            <a href="${verificationLink}" target="_blank">Xác thực Email</a>
            <p>Liên kết này sẽ hết hạn sau 1 giờ.</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("Gửi email xác thực thành công!");
    } catch (error) {
        console.error("Lỗi gửi email xác thực:", error);
    }
};

module.exports = sendVerificationEmail;