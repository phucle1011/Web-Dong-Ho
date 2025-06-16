const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false, // Dùng trong dev, bỏ trong production
  },
});

const sendResetPassword = async (email, resetLink) => {
  const mailOptions = {
    from: `"Hệ thống đặt lại mật khẩu" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Đặt lại mật khẩu",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
        <h2 style="color: #4a4a4a;">Xin chào!</h2>
        <p>Bạn đã yêu cầu đặt lại mật khẩu. Vui lòng nhấp vào nút bên dưới để tiếp tục:</p>
        
        <div style="text-align: center; margin: 25px 0;">
          <a href="${resetLink}" 
             style="background-color: #6c5ce7; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 4px; font-weight: bold;">
            Đặt lại mật khẩu
          </a>
        </div>
        
        <p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.</p>
        <p style="color: #888; font-size: 12px; margin-top: 30px;">
          Liên kết này sẽ hết hạn sau 1 giờ. Nếu liên kết đã hết hạn, bạn có thể yêu cầu lại.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email đặt lại mật khẩu đã được gửi đến ${email}`);
    return true;
  } catch (error) {
    console.error("Lỗi gửi email đặt lại mật khẩu:", error);
    throw new Error("Không thể gửi email đặt lại mật khẩu");
  }
};

module.exports = sendResetPassword;