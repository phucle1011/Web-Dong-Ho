const BookingModel = require('../../models/bookingModel');
const UserModel = require('../../models/userModel');
const TripModel = require('../../models/tripsModel');
const SeatModel = require('../../models/seatsModel'); 
const BusesModel = require('../../models/busesModel');
const RouteModel = require('../../models/routesModel');


class BookingController {
    static async get(req, res) {
        try {
            const bookings = await BookingModel.findAll({
                include: [
                    { model: UserModel, as: 'User' },
                    { 
                        model: TripModel, 
                        as: 'Trip',
                        include: [{ model: RouteModel, as: 'Route' }] 
                    },
                    { model: SeatModel, as: 'Seat' },
                    { model: BusesModel, as: 'Bus'}

                ]
            });

            res.status(200).json({
                status: 200,
                success: true,
                message: "Lấy danh sách đặt vé thành công",
                data: bookings
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getById(req, res) {
        try {
            const { id } = req.params;
            const booking = await BookingModel.findByPk(id, {
                include: [
                    { model: UserModel, as: 'User' },
                    { 
                        model: TripModel, 
                        as: 'Trip',
                        include: [{ model: RouteModel, as: 'Route' }] 
                    },
                    { model: SeatModel, as: 'Seat' }
                ]
            });

            if (!booking) {
                return res.status(404).json({ message: "Không tìm thấy đặt vé" });
            }

            res.status(200).json({
                status: 200,
                success: true,
                message: "Lấy dữ liệu thành công",
                data: booking,
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
            const { userId, tripId, seatId, status, finalPrice, userName, phone, emailUser, } = req.body;

            const newBooking = await BookingModel.create({
                userId,
                tripId,
                seatId,
                status,
                finalPrice,
                userName,
                phone,
                emailUser,
            });

            res.status(201).json({
                status: 201,
                success: true,
                message: "Tạo đặt vé thành công!",
                data: newBooking
            });

        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const { userId, tripId, seatId, status, finalPrice, userName, phone, emailUser, } = req.body;

            const booking = await BookingModel.findByPk(id);
            if (!booking) {
                return res.status(404).json({ message: "Không tìm thấy đặt vé." });
            }

            await booking.update({
                userId,
                tripId,
                seatId,
                status,
                finalPrice,
                userName,
                phone,
                emailUser,
            });

            res.status(200).json({
                success: true,
                message: "Cập nhật đặt vé thành công!",
                data: booking
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Cập nhật đặt vé thất bại!",
                error: error.message
            });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            const booking = await BookingModel.findByPk(id);
            if (!booking) {
                return res.status(404).json({ message: "Đặt vé không tồn tại" });
            }

            await booking.destroy();

            res.status(200).json({
                success: true,
                message: "Xóa đặt vé thành công"
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

module.exports = BookingController;
