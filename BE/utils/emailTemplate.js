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
            max-width: 600px;
            margin: 30px auto;
            background-color: #ffffff;
            border-radius: 10px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background-color: #4F46E5;
            color: white;
            padding: 20px;
            text-align: center;
        }
        .content {
            padding: 20px;
            line-height: 1.6;
            color: #333333;
        }
        .status {
            color: #4F46E5;
            font-weight: bold;
        }
        .reason {
            margin-top: 10px;
            color: #000;
        }
        .footer {
            background-color: #f1f5f9;
            text-align: center;
            font-size: 12px;
            padding: 15px;
            color: #666;
            border-top: 1px solid #e0e0e0;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h2>Thông báo trạng thái tài khoản</h2>
        </div>
        <div class="content">
            <p>Xin chào <strong>${userName}</strong>,</p>
            <p>Trạng thái tài khoản của bạn đã được cập nhật.</p>
            <p><strong>Trạng thái mới:</strong> <span class="status">${newStatus}</span></p>
            <p><strong>Lý do:</strong> ${reason}</p>
            <p>Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ hỗ trợ để được giải đáp.</p>
            <p>Trân trọng,<br><strong>Đội ngũ hỗ trợ</strong></p>
        </div>
        <div class="footer">
            &copy; ${new Date().getFullYear()} Hệ thống quản trị người dùng
        </div>
    </div>
</body>
</html>
`;

module.exports = getEmailTemplate;