const BusTypesModel = require('../../models/busTypesModel');

class BusTypeController {

    //------------------[ GET ]------------------
    static async get(req, res) {
        try {
            const busType = await BusTypesModel.findAll();
            res.status(200).json({
                "status": 200,
                "message": "Lấy danh sách thành công",
                "data": busType
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // ------------------[ GET BY ID ]------------------
    static async getById(req, res) {
        try {
            const { id } = req.params;
            const busType = await BusTypesModel.findByPk(id);

            if (!busType) {
                return res.status(404).json({ message: "Id không tồn tại" });
            }

            res.status(200).json({
                "status": 200,
                "success": true,
                "message": "Lấy loại xe thành công",
                "data": busType
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // //------------------[ CREATE ]------------------
    static async create(req, res) {
        try {
            const {
                typeName,
                totalSeats
            } = req.body;

            const busType = await BusTypesModel.create({
                typeName,
                totalSeats
            });

            res.status(201).json({
                success: true,
                message: "Thêm mới loại xe thành công",
                busType
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }


    // //------------------[ UPDATE ]------------------
    static async update(req, res) {
        try {
            const { id } = req.params;

            const {
                typeName,
                totalSeats
            } = req.body;

            const busType = await BusTypesModel.findByPk(id);
            if (!busType) {
                return res.status(404).json({ message: "Id không tồn tại" });
            }

            busType.typeName = typeName;
            busType.totalSeats = totalSeats;

            await busType.save();

            res.status(200).json({
                success: true,
                message: "Cập nhật loại xe thành công",
                busType
            });
        } catch (error) {
            res.status(500).json({
                success:false,
                message: "Cập nhật loại xe không thành công",
                error: error.message });
        }
    }

    // //------------------[ DELETE ]------------------
    static async delete(req, res) {
        try {
            const { id } = req.params;
            const busType = await BusTypesModel.findByPk(id);
            if (!busType) {
                return res.status(404).json({ message: "Id không tồn tại" });
            }

            await busType.destroy();

            res.status(200).json({
                success: true,
                message: "Xóa loại thành công"
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Xóa không thành công",
                error: error.message
            });
        }
    }
}

module.exports = BusTypeController;
