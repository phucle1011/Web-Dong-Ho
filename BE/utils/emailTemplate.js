const getEmailTemplate = (userName, newStatus, reason) => `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <title>Thông báo trạng thái tài khoản</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f9f9f9;
            margin: 0;
            padding: 0;
        }
        .email-container {
            max-width: 700px;
            margin: 30px auto;
            background-color: #ffffff;
            border: 1px solid #ddd;
            border-radius: 8px;
            overflow: hidden;
            color: #333;
        }
        .header {
            text-align: center;
            padding: 20px;
            background-color: #f1faff;
            border-bottom: 2px solid #007acc;
        }
        .header img {
            width: 140px;
        }
        .header h1 {
            margin: 0;
            font-size: 26px;
            color: #007acc;
        }
        .header p {
            margin: 4px 0;
            font-size: 14px;
            color: #555;
        }
        .header a {
            color: #007acc;
            text-decoration: none;
        }
        .content {
            padding: 30px 25px;
            line-height: 1.6;
            color: #333333;
        }
        .status {
            color: #e63946;
            font-weight: bold;
        }
        .reason {
            margin-top: 10px;
            color: #000;
        }
        .footer {
            text-align: center;
            font-size: 13px;
            color: #999;
            padding: 20px;
            background-color: #f8f9fa;
            border-top: 1px solid #ddd;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <img src="https://yourdomain.com/image/logo.jpg" alt="Logo TIMEMASTERS" />
            <h1>TIMEMASTERS</h1>
            <p>
                Hotline: <a href="tel:+84123456789">+84 123 456 789</a>
            </p>
        </div>
        <div class="content">
            <h2 style="color: #1d3557;">Xin chào <span style="color: #457b9d;">${userName}</span>,</h2>
            <p style="font-size: 16px;">
                Trạng thái tài khoản của bạn đã được cập nhật.
            </p>
            <ul style="list-style-type: disc; padding-left: 20px; margin-bottom: 20px;">
                <li>
                    <strong>Trạng thái mới:</strong> <span class="status">${newStatus}</span><br/>
                    <span class="reason"><strong>Lý do:</strong> ${reason}</span>
                </li>
            </ul>
            <p style="font-size: 15px; color: #555;">
                Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với đội ngũ hỗ trợ của chúng tôi.
            </p>
            <p>Trân trọng,<br><strong>Đội ngũ TIMEMASTERS</strong></p>
        </div>
        <div class="footer">
            <p style="margin: 5px 0;">© ${new Date().getFullYear()} TIMEMASTERS. Địa chỉ: Số 233, Nguyễn Văn Linh, Cần Thơ</p>
            <p style="margin: 5px 0; font-style: italic;">Email này được gửi tự động, vui lòng không trả lời lại.</p>
        </div>
    </div>
</body>
</html>
`;

const getWishlistPromoTemplate = (
    userName,
    productName,
    discountValue,
    discountType,
    promoName,
    code,
    startDate,
    endDate
) => `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;border:1px solid #ddd;border-radius:8px;">
  <h2>Xin chào ${userName},</h2>
  <p>
    Sản phẩm bạn yêu thích <strong>${productName}</strong> đang có chương trình khuyến mãi:
  </p>
  <ul>
    <li><strong>${promoName}</strong> - Giảm ${discountValue}${discountType}</li>
    <li>Mã giảm giá: <strong>${code}</strong></li>
    <li>Thời gian áp dụng: ${startDate} → ${endDate}</li>
  </ul>
  <p>Nhanh tay vào mua nhé!</p>
  <hr/>
  <p style="font-size:12px;color:#555;">Đây là email tự động, vui lòng không trả lời.</p>
</div>
`;

module.exports = { getEmailTemplate, getWishlistPromoTemplate };
