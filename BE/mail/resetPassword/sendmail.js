const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const mailConfig = require("../../config/mail");

const transporter = nodemailer.createTransport(mailConfig);

async function sendResetPassword(email, link) {
  const subject = 'Yêu cầu lấy lại mật khẩu';

  const templatePath = path.join(__dirname, '../resetPassword/index.html');
  let html = fs.readFileSync(templatePath, 'utf8');
  html = html
  .replace('{{email}}', email)
  .replace('{{link}}', link);

    const mailOptions = {
        from: '"Website Hỗ trợ" <Duyenktbpc08750@gmail.com>',
        to: email,
        subject,
        html,
      };
    
      try {
        await transporter.sendMail(mailOptions);
      } catch (error) {
        console.error("Lỗi khi gửi email reset:", error);
      }
    }
    

module.exports = sendResetPassword;
