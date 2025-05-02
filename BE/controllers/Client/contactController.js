const ContactModel = require('../../models/contactModel');

class ContacController {

    static async create(req, res) {
        try {
            const { fullName, email, question } = req.body;
            const contact = await ContactModel.create({ fullName, email, question });

            res.status(201).json({
                success:true,
                message: "Đã gửi yêu cầu thành công",
                contact
            });
        } catch (error) {
            res.status(500).json({ 
                success:false,
                message: "Lỗi khi gửi yêu cầu",
                error: error.message });
        }
    }
}

module.exports = ContacController;
