const BookingModel = require('../../models/bookingModel');
const TripsModel = require('../../models/tripsModel');
const RoutesModel = require('../../models/routesModel');
const SeatsModel = require('../../models/seatsModel');
const BusesModel = require('../../models/busesModel');
const DriverModel = require('../../models/driverModel');
const UserModel = require('../../models/userModel');
const BookingDetailModel = require('../../models/bookingDetailModel');


class BookingDetailController {

    //------------------[ GET ]------------------
    static async get(req, res) {
        try {
            const userId = req.query.userId;

            // Nếu userId không tồn tại hoặc không hợp lệ, bỏ qua điều kiện userId
            const whereCondition = userId ? { userId } : {};

            const bookingDetail = await BookingDetailModel.findAll({
                
                include: [
                    {
                        model: SeatsModel,
                        as: 'seatDetail',
                    },
                    {
                        model: BookingModel,
                        where: whereCondition,
                        as: 'booking',
                        include: [
                            {
                                model: TripsModel, as: 'trips',
                                include: [{ model: RoutesModel, as: 'routes' }]
                            },
                            { model: BusesModel, as: 'bus' }
                        ]
                    },
                ]
            });

            const formattedBookingDetail = bookingDetail.map(bookingDetail => {
                const data = bookingDetail.toJSON();

                // Gộp thông tin từ bảng User vào key "userId"
                if (data.booking && data.booking.user) {
                    data.userId = { ...data.booking.user };
                    delete data.booking.user;
                }

                // Xử lý quan hệ với RoutesModel
                if (data.booking && data.booking.route) {
                    data.routeId = data.booking.route;
                    delete data.booking.route;
                }

                delete data.booking.busId;
                delete data.booking.tripId;
                delete data.seatsId;
                delete data.bookingId;
                delete data.booking.trips.routeId;

                return data;
            });

            res.status(200).json({
                status: 200,
                message: "Lấy danh sách thành công",
                data: formattedBookingDetail
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // ------------------[ GET BY ID ]------------------
    static async getById(req, res) {
        try {
            const { id } = req.params;
            const booking = await BookingDetailModel.findOne({
                where: { id }, // Sử dụng findOne thay vì findByPk để truy vấn theo ID
                include: [
                    {
                        model: SeatsModel,
                        as: 'seatDetail',
                    },
                    {
                        model: BookingModel,
                        as: 'booking',
                        include: [
                            {
                                model: TripsModel, as: 'trips',
                                include: [{ model: RoutesModel, as: 'routes' }]
                            },
                            { model: BusesModel, as: 'bus' }
                        ]
                    },
                ]
            });

            if (!booking) {
                return res.status(404).json({ message: "Id không tồn tại" });
            }

            const data = booking.toJSON();

            // Gộp thông tin từ bảng User vào key "userId"
            if (data.booking && data.booking.user) {
                data.userId = { ...data.booking.user };
                delete data.booking.user;
            }

            // Xử lý quan hệ với RoutesModel
            if (data.booking && data.booking.route) {
                data.routeId = data.booking.route;
                delete data.booking.route;
            }

            delete data.booking.busId;
            delete data.booking.tripId;
            delete data.seatsId;
            delete data.bookingId;
            delete data.booking.trips.routeId;

            res.status(200).json({
                status: 200,
                message: "Lấy chi tiết thành công",
                data: data
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

}

module.exports = BookingDetailController;
