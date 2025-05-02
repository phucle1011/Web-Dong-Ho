const RoutesModel = require('../../models/routesModel');

class RoutesController {

    //------------------[ GET ]------------------
    static async get(req, res) {
        try {
            const routes = await RoutesModel.findAll({
                order: [['id', 'DESC']]
            });
            res.status(200).json({
                "status": 200,
                "message": "Lấy danh sách thành công",
                "data": routes
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    //------------------[ GET BY ID ]------------------
    static async getById(req, res) {
        try {
            const { id } = req.query;
            const routes = await RoutesModel.findByPk(id);

            if (!routes) {
                return res.status(404).json({ message: "Id không tồn tại" });
            }

            res.status(200).json({
                "status": 200,
                "success": true,
                "message": "Lấy tuyen duong thành công",
                "data": routes
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    //------------------[ CREATE ]------------------
    static async create(req, res) {
        try {
            const {
                startPoint,
                endPoint,
                distance,
                time,
                startProvinceID,
                startDistrictID,
                startWardID,
                endProvinceID,
                endDistrictID,
                endWardID
            } = req.body;

            const routes = await RoutesModel.create({
                startPoint,
                endPoint,
                distance,
                time,
                startProvinceID,
                startDistrictID,
                startWardID,
                endProvinceID,
                endDistrictID,
                endWardID
            });

            res.status(201).json({
                success: true,
                message: "Thêm mới thành công",
                routes
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }


    //------------------[ UPDATE ]------------------
    static async update(req, res) {
        try {
            const { id } = req.params;

            const {
                startPoint,
                endPoint,
                distance,
                time,
                startProvinceID,
                startDistrictID,
                startWardID,
                endProvinceID,
                endDistrictID,
                endWardID
            } = req.body;

            const routes = await RoutesModel.findByPk(id);
            if (!routes) {
                return res.status(404).json({ message: "Id không tồn tại" });
            }

            routes.startPoint = startPoint;
            routes.endPoint = endPoint;
            routes.distance = distance;
            routes.startProvinceID = startProvinceID;
            routes.startDistrictID = startDistrictID;
            routes.startWardID = startWardID;
            routes.endProvinceID = endProvinceID;
            routes.endDistrictID = endDistrictID;
            routes.endWardID = endWardID;
            routes.time = time;

            await routes.save();

            res.status(200).json({
                success: true,
                message: "Cập nhật tuyen duong thành công",
                routes
            });
        } catch (error) {
            res.status(500).json({
                success:false,
                message: "Cập nhật không thành công",
                error: error.message });
        }
    }
    //------------------[ DELETE ]------------------
    static async delete(req, res) {
        try {
            const { id } = req.params;
            const routes = await RoutesModel.findByPk(id);
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
                status: 500,
                success: false,
                message: "Xóa không thành công",
                error: error.message
            });
        }
    }
}

module.exports = RoutesController;
