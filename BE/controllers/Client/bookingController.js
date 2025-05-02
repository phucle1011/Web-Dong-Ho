const BookingModel = require('../../models/bookingModel');
const TripsModel = require('../../models/tripsModel');
const RoutesModel = require('../../models/routesModel');
const SeatsModel = require('../../models/seatsModel');
const BusesModel = require('../../models/busesModel');
const DriverModel = require('../../models/driverModel');
const UserModel = require('../../models/userModel');
const BookingDetailModel = require('../../models/bookingDetailModel');


class BookingController {

    //------------------[ GET ]------------------
    static async get(req, res) {
        try {
            const userId = req.query.userId;

            // Nếu userId không tồn tại hoặc không hợp lệ, bỏ qua điều kiện userId
            const whereCondition = userId ? { userId } : {};


            const bookings = await BookingModel.findAll({
                where: whereCondition,
                include: [
                    {
                        model: TripsModel,
                        as: 'trips',
                        include: [
                            { model: RoutesModel, as: 'routes' },
                            { model: BusesModel, as: 'buses' },
                            { model: DriverModel, as: 'drivers' }
                        ]
                    },
                    {
                        model: UserModel,
                        as: 'user'
                    },
                    
                ]
            });

            const formattedBookings = bookings.map(booking => {
                const data = booking.toJSON();

                // Gộp trips vào key "tripId"
                data.tripId = data.trips;
                delete data.trips;


                // Đổi tên các quan hệ trong tripId
                if (data.tripId) {
                    if (data.tripId.routes) {
                        data.tripId.routeId = data.tripId.routes;
                        delete data.tripId.routes;
                    }
                    if (data.tripId.drivers) {
                        data.tripId.driverId = data.tripId.drivers;
                        delete data.tripId.drivers;
                    }
                    if (data.tripId.buses) {
                        data.tripId.busID = data.tripId.buses;
                        delete data.tripId.buses;
                    }
                }

                // Gộp thông tin từ bảng User vào key "userId"
                if (data.user) {
                    data.userId = data.user;
                    delete data.user;
                }

                return data;
            });

            res.status(200).json({
                status: 200,
                message: "Lấy danh sách thành công",
                data: formattedBookings
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }


    // ------------------[ GET BY ID ]------------------
    static async getById(req, res) {
        try {
            const { id } = req.params;
            const booking = await BookingModel.findByPk(id, {
                include: [
                    {
                        model: TripsModel,
                        as: 'trips',
                        include: [
                            { model: RoutesModel, as: 'routes' },
                            { model: BusesModel, as: 'buses' },
                            { model: DriverModel, as: 'drivers' }
                        ]
                    },
                    {
                        model: UserModel,
                        as: 'user'
                    },
                ]
            });

            if (!booking) {
                return res.status(404).json({ message: "Id không tồn tại" });
            }

            const data = booking.toJSON();

            // Gộp trips vào key "tripId"
            data.tripId = data.trips;
            delete data.trips;


            // Đổi tên các quan hệ trong tripId
            if (data.tripId) {
                if (data.tripId.routes) {
                    data.tripId.routeId = data.tripId.routes;
                    delete data.tripId.routes;
                }
                if (data.tripId.drivers) {
                    data.tripId.driverId = data.tripId.drivers;
                    delete data.tripId.drivers;
                }
                if (data.tripId.buses) {
                    data.tripId.busID = data.tripId.buses;
                    delete data.tripId.buses;
                }
            }

            // Gộp thông tin từ bảng User vào key "userId"
            if (data.user) {
                data.userId = data.user;
                delete data.user;
            }

            res.status(200).json({
                status: 200,
                message: "Lấy chi tiết thành công",
                data: data
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }


    // //------------------[ DELETE ]------------------
    static async delete(req, res) {
        try {
            const { id } = req.params;
            const booking = await BookingModel.findByPk(id);

            if (!booking) {
                return res.status(404).json({ message: "Id không tồn tại" });
            }

            if (booking.status !== "pending") {
                return res.status(400).json({
                    success: false,
                    message: "Chỉ được xoá đơn có trạng thái là chờ xác nhận"
                });
            }

            await booking.destroy();

            res.status(200).json({
                success: true,
                message: "Xóa thành công"
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

module.exports = BookingController;
