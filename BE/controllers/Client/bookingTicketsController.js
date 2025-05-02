const BookingModel = require('../../models/bookingModel');
const BookingDetailModel = require('../../models/bookingDetailModel');
const SeatsModel = require('../../models/seatsModel');
const TripsModel = require('../../models/tripsModel'); 

class BookingTicketsController {
    static async create(req, res) {
        try {
            const { tripId, seatIds, busId, status, finalPrice, userName, phone, emailUser, userId } = req.body;

            if (!Array.isArray(seatIds) || seatIds.length === 0) {
                return res.status(400).json({ success: false, message: "Danh sách ghế không hợp lệ." });
            }

            const trip = await TripsModel.findByPk(tripId);
            if (!trip) {
                return res.status(404).json({ success: false, message: `Không tìm thấy chuyến xe với ID: ${tripId}` });
            }

            const booking = await BookingModel.create({
                userId,
                tripId,
                busId,
                status,
                finalPrice,
                userName,
                phone,
                emailUser,
            });

            await Promise.all(
                seatIds.map(async (seatId) => {
                    const seat = await SeatsModel.findByPk(seatId);
                    if (!seat) throw new Error(`Không tìm thấy ghế với ID: ${seatId}`);

                    await BookingDetailModel.create({
                        bookingId: booking.id,
                        seatsId: seat.id,
                        seatNumber: seat.seatNumber,
                        price: trip.price,           
                        createdAt: new Date(),  
                    });

                    await SeatsModel.update(
                        { status: "sold" },
                        { where: { id: seatId } }
                    );
                })
            );

            return res.status(201).json({
                success: true,
                message: "Tạo đơn đặt vé thành công!",
                data: {
                    booking,
                },
            });

        } catch (error) {
            console.error("Booking Error:", error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = BookingTicketsController;
