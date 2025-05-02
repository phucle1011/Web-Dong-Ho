const DriverModel = require('../../models/driverModel');
const calculateAge = require('../../utils/calculateAge');
const { Op } = require('sequelize');
const TripsModel = require('../../models/tripsModel');

class DriverController {
    static async get(req, res) {
        try {
            const routes = await DriverModel.findAll();
            res.status(200).json({
                status: 200,
                success: true,
                message: "Lấy danh sách thành công",
                data: routes
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getById(req, res) {
        try {
            const { id } = req.params;
            const driver = await DriverModel.findByPk(id);

            if (!driver) {
                return res.status(404).json({ message: "Không tìm thấy Id" });
            }

            res.status(200).json({
                status: 200,
                success: true,
                message: "Lấy dữ liệu thành công",
                data: driver,
            });
        } catch (err) {
            res.status(500).json({
                status: 500,
                success: false,
                message: "Lấy dữ liệu thất bại",
            });
        }
    }

    static async create(req, res) {
        try {
            const {
                fullName,
                phone,
                licenseNumber,
                licenseType,
                experienceYears,
                birthDate,
                hireDate,
                status,
            } = req.body;

            const image = req.file ? req.file.filename : null;
            const age = calculateAge(birthDate);
            const newDriver = await DriverModel.create({
                fullName,
                phone,
                licenseNumber,
                licenseType,
                experienceYears,
                birthDate,
                hireDate,
                status,
                image,
                age
            });

            res.status(201).json({
                status: 201,
                success: true,
                message: "Thêm tài xế thành công!",
                data: newDriver
            });

        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }


    static async update(req, res) {
        try {
            const { id } = req.params;
            const {
                fullName,
                phone,
                licenseNumber,
                licenseType,
                experienceYears,
                birthDate,
                hireDate,
                status
            } = req.body;

            const image = req.file ? req.file.filename : undefined;

            const driver = await DriverModel.findByPk(id);
            if (!driver) {
                return res.status(404).json({ message: "Không tìm thấy tài xế." });
            }
            const age = calculateAge(birthDate);
            await driver.update({
                fullName,
                phone,
                licenseNumber,
                licenseType,
                experienceYears,
                birthDate,
                hireDate,
                status,
                ...(image && { image }),
                age
            });

            res.status(200).json({
                success: true,
                message: "Cập nhật tài xế thành công!",
                data: driver
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Cập nhật tài xế thất bại!",
                error: error.message
            });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            const routes = await DriverModel.findByPk(id);
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

    static async getAllByStatusCreate(req, res) {
        try {
            const drivers = await DriverModel.findAll({
                where: {
                    status: "inactive"
                }
            });
            res.status(200).json({
                "status": 200,
                "message": "Lấy danh sách thành công",
                "data": drivers
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getAllByStatusEdit(req, res) {
        try {
            const { tripId } = req.params; 
            const trip = await TripsModel.findOne({ where: { id: tripId } });

            const drivers = await DriverModel.findAll({
                where: {
                    [Op.or]: [
                        { status: 'inactive' },
                        { id: trip.driverId } 
                    ]
                }
            });
    
            res.status(200).json({
                status: 200,
                message: "Lấy danh sách tài xế cho chỉnh sửa thành công!",
                data: drivers
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = DriverController;
