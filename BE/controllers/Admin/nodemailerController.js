const nodemailer = require('nodemailer');
const usersModel = require('../../models/usersModel');
const PromotionUserModel = require('../../models/promotionUsersModel');
const PromotionModel = require('../../models/promotionsModel');

class EmailController {
  static async sendPromotionEmails(req, res) {
    try {
      const { customerIds, subject, content } = req.body;

      if (!customerIds || !Array.isArray(customerIds) || customerIds.length === 0) {
        return res.status(400).json({ message: 'Vui lòng chọn khách hàng.' });
      }
      if (!subject || !content) {
        return res.status(400).json({ message: 'Tiêu đề và nội dung email không được để trống.' });
      }

      const customers = await usersModel.findAll({
        where: {
          id: customerIds,
        },
        attributes: ['id', 'name', 'email'],
      });

      if (customers.length === 0) {
        return res.status(404).json({ message: 'Không tìm thấy khách hàng phù hợp.' });
      }

      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: 'vanquythaicute@gmail.com',
          pass: 'godx gmas dara haly',
        },
      });

      const sendPromises = customers.map(async (cus) => {
        const promotionUsers = await PromotionUserModel.findAll({
          where: {
            user_id: cus.id,
            email_sent: false,
          },
          include: [{ model: PromotionModel, as: 'Promotion' }],
        });

        if (promotionUsers.length === 0) return;

        const promotionsHtml = promotionUsers.map(pu => {
          const promotion = pu.Promotion;
          const name = promotion?.name || 'Chưa có tên';
          const value = promotion?.discount_value || '';
          const type = promotion?.discount_type === 'percentage' ? '%' : 'đ';
          const startDate = promotion?.start_date ? new Date(promotion.start_date).toLocaleDateString('vi-VN') : 'Không rõ';
          const endDate = promotion?.end_date ? new Date(promotion.end_date).toLocaleDateString('vi-VN') : 'Không rõ';

          return `
    <li style="margin-bottom:12px;">
      <strong>${name}</strong> - Giảm 
      <span style="color:#e63946; font-weight:bold;">${value}${type}</span><br/>
      <span style="font-size: 14px; color: #555;">
        Áp dụng từ <strong>${startDate}</strong> đến <strong>${endDate}</strong>
      </span>
    </li>
  `;
        }).join('');

        // Tạo nội dung email hoàn chỉnh
        const emailHtml = `
  <div style="font-family: Arial, sans-serif; max-width: 700px; margin: auto; background-color: #ffffff; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; color: #333;">
  
    <!-- Header -->
    <div style="text-align: center; padding: 20px; background-color: #f1faff; border-bottom: 2px solid #007acc;">
      <img 
        src="https://yourdomain.com/image/logo.jpg" 
        alt="Logo doanh nghiệp" 
        style="width: 140px; height: auto; object-fit: contain; margin-bottom: 10px;" 
      />
      <h1 style="margin: 0; font-size: 26px; color: #007acc;">TIMEMASTERS</h1>
      <p style="margin: 4px 0; font-size: 14px; color: #555;">
        Hotline: <a href="tel:+84123456789" style="color: #007acc; text-decoration: none;">+84 123 456 789</a>
      </p>
    </div>

    <!-- Body -->
    <div style="padding: 30px 25px;">
      <h2 style="color: #1d3557;">Xin chào <span style="color: #457b9d;">${cus.name}</span>,</h2>
      <p style="font-size: 16px;">
        Chúng tôi rất vui được gửi tới bạn những <strong>mã giảm giá đặc biệt</strong> dành riêng cho bạn:
      </p>

      <ul style="list-style-type: disc; padding-left: 20px; margin-bottom: 20px; font-size: 16px; color: #333;">
        ${promotionsHtml}
      </ul>

      <div style="background-color: #f1faee; border-left: 4px solid #1d3557; padding: 15px; margin-bottom: 20px; font-size: 15px;">
        ${content}
      </div>

      <p style="font-size: 15px; color: #555;">
        Nếu bạn có bất kỳ thắc mắc nào, vui lòng liên hệ với bộ phận hỗ trợ của chúng tôi.<br />
        Cảm ơn bạn đã luôn đồng hành cùng <strong>TIMEMASTERS</strong>.
      </p>
    </div>

    <!-- Footer -->
    <div style="text-align: center; font-size: 13px; color: #999; padding: 20px; background-color: #f8f9fa; border-top: 1px solid #ddd;">
      <p style="margin: 5px 0;">© 2025 Tên Doanh Nghiệp. Mọi quyền được bảo lưu.</p>
      <p style="margin: 5px 0;">Địa chỉ: Số 233, Đường Nguyễn Văn Linh, Quận Ninh Kiều, Thành phố Cần Thơ</p>
      <p style="margin: 5px 0; font-style: italic;">Email này được gửi tự động, vui lòng không trả lời lại.@</p>
    </div>
  </div>
`;


        await transporter.sendMail({
          from: '"Your Company" <vanquythaicute@gmail.com>',
          to: cus.email,
          subject: "🎁 Mã giảm giá đặc biệt dành cho bạn!",
          html: emailHtml,
        });

        const idsToUpdate = promotionUsers.map(pu => pu.id);
        const [affectedRows] = await PromotionUserModel.update(
          { email_sent: true },
          { where: { id: idsToUpdate } }
        );

        console.log(`Đã gửi email cho ${cus.email}, cập nhật ${affectedRows} bản ghi email_sent`);
      });

      await Promise.all(sendPromises);

      return res.status(200).json({
        status: 200,
        message: 'Gửi email khuyến mãi thành công.',
      });
    } catch (error) {
      console.error('Lỗi gửi email:', error);
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = EmailController;
