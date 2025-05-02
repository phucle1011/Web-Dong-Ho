const flash = require('express-flash');
const ContactModel = require('../../models/contactModel');
const sendContactReply = require('../../mail/contact/sendmail.js')
class ContacController {
    static async get(req, res) {
        try {
            const routes = await ContactModel.findAll();
            res.status(200).json({
                "status": 200,
                 success:true,
                "message": "Lấy danh sách thành công",
                "data": routes
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

//-------------------[ GET BY ID ]-----------------------
static async getById(req, res){
    try{
        const { id} = req.params;
        const contact = await ContactModel.findByPk(id);

        if(!contact){
            return res.status(404).json({
                message:"khong tim thay Id"
            })
        }
        res.status(200).json({
            status:200,
            success:true,
            message:"Lay dữ liệu thành công",
            data:contact,
        })
    }catch(err){
        res.status(500).json({
            status:500,
            success:flash,
            message:"Lay dữ liệu thất bại",
        })

    }
}

    //------------------[ UPDATE ]------------------
    static async update(req, res) {
        try {
            const { id } = req.params;
            const { reply } = req.body;
    
            const contact = await ContactModel.findByPk(id);
            if (!contact) {
                return res.status(404).json({ message: "Id không tồn tại" });
            }
    
            contact.reply = reply;
            contact.reply_at = new Date();
            contact.status = 1;
    
            await contact.save();
    
            await sendContactReply(contact.email, contact.fullName, contact.question, contact.reply);
    
            res.status(200).json({
                success: true,
                message: "Đã phản hồi người dùng",
                contact
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Cập nhật không thành công",
                error: error.message
            });
        }
    }
    
      
//-------------------[ DELETE ]-----------------------
static async delete(req, res) {
    try {
        const { id } = req.params;
        const routes = await ContactModel.findByPk(id);
        if (!routes) {
            return res.status(404).json({ message: "Id không tồn tại" });
        }

        await routes.destroy();

        res.status(200).json({
            success: true,
            message: "Xóa thành công"
        });
    } catch (error) {
        res.status(500).json({
            status: status,
            success: false,
            message: "Xóa không thành công",
            error: error.message
        });
    }
}

}

module.exports = ContacController;
