const DriverModel = require('../../models/driverModel');
class DriversController {
    static async get(req, res) {
        try {
            const drivers = await DriverModel.findAll();
            res.status(200).json({
                "status": 200,
                "message": "Lấy danh sách thành công",
                "data": drivers
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
module.exports = DriversController;