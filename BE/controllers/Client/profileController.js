const ProfileModel = require('../../models/userModel');
const bcrypt = require('bcryptjs'); 

class ProfileController {
    // ------------------[ GET ALL ]------------------
    static async get(req, res) {
        try {
            const profiles = await ProfileModel.findAll();
            res.status(200).json({
                status: 200,
                message: "Lấy danh sách thành công",
                data: profiles
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // ------------------[ GET BY ID ]------------------
    static async getById(req, res) {
        try {
            const { id } = req.params;
            const profile = await ProfileModel.findByPk(id);

            if (!profile) {
                return res.status(404).json({ message: "Id không tồn tại" });
            }

            res.status(200).json({
                status: 200,
                success: true,
                message: "Lấy người dùng thành công",
                data: profile
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // ------------------[ UPDATE ]------------------
    static async update(req, res) {
        try {
            const { id } = req.params;
            const { fullName, password, email, phone } = req.body;
    
            const profile = await ProfileModel.findByPk(id);
            if (!profile) {
                return res.status(404).json({ message: "Id không tồn tại" });
            }
    
            const imagePath = req.file ? req.file.path.replace(/\\/g, '/') : null;
    
            if (fullName !== undefined && fullName !== "") {
                profile.fullName = fullName;
            }
    
            if (email !== undefined && email !== "") {
                profile.email = email;
            }
    
            if (phone !== undefined && phone !== "") {
                profile.phone = phone;
            }
    
            if (password !== undefined && password !== "") {
                const salt = await bcrypt.genSalt(10); 
                const hashedPassword = await bcrypt.hash(password, salt);
                profile.password = hashedPassword;
            }
    
            if (imagePath) {
                profile.image = imagePath;
            }
    
            await profile.save();
    
            res.status(200).json({
                success: true,
                message: "Cập nhật người dùng thành công",
                data: profile
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Cập nhật người dùng không thành công",
                error: error.message
            });
        }
    }
    
}

module.exports = ProfileController;
