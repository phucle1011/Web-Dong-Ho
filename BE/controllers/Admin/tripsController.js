const { RoutesModel, BusesModel, DriverModel, TripsModel, SeatsModel } = require('../../models/connectModel');

class TripsController {
    static async get(req, res) {
        try {
            const trips = await TripsModel.findAll({
                include: [
                    {
                        model: RoutesModel,
                        as: 'routes',
                    },
                    {
                        model: BusesModel,
                        as: 'buses',
                    },
                    {
                        model: DriverModel,
                        as: 'drivers',
                    }
                ]
            })
            res.status(200).json({
                "status": 200,
                "message": "Lấy danh sách thành công!",
                "data": trips
            })
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getById(req, res) {
        try {
            const { id } = req.params;
            const trips = await TripsModel.findOne({
                where: { id },
                include: [
                    {
                        model: RoutesModel,
                        as: 'routes',
                    },
                    {
                        model: BusesModel,
                        as: 'buses',
                        include: {
                            model: SeatsModel,
                            as: 'seats',
                        }
                    },
                    {
                        model: DriverModel,
                        as: 'drivers',
                    }
                ]
            })
            if (!trips) {
                res.status(404).json({ message: 'Không tìm thấy chuyến xe!' });
            }
            res.status(200).json({
                "status": 200,
                "message": "Lấy chuyến xe thành công!",
                "data": trips
            })

        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async create(req, res) {
        try {
            const {
                busID,
                routeId,
                driverId,
                departureTime,
                arrivalTime,
                price,
                status,
            } = req.body;

            const trips = await TripsModel.create({
                busID,
                routeId,
                driverId,
                departureTime,
                arrivalTime,
                price,
                status,
            });

            await BusesModel.update(
                { status: 'active' },
                { where: { id: busID } }
            );
    
            await DriverModel.update(
                { status: 'active' },
                { where: { id: driverId } }
            );

            res.status(200).json({
                "status": 200,
                "message": "Thêm chuyến xe thành công!",
                "data": trips
            })

        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    }


        static async update(req, res) {
            try {
                const { id } = req.params;
                const {
                    busID,
                    routeId,
                    driverId,
                    departureTime,
                    arrivalTime,
                    price,
                    status,
                } = req.body;
        
                const trip = await TripsModel.findOne({ where: { id } });
                if (!trip) {
                    return res.status(404).json({ message: "Không tìm thấy chuyến xe!" });
                }
        
                const oldBusID = trip.busID;
                const oldDriverId = trip.driverId;

                trip.busID = busID;
                trip.routeId = routeId;
                trip.driverId = driverId;
                trip.departureTime = departureTime;
                trip.arrivalTime = arrivalTime;
                trip.price = price;
                trip.status = status;
        
                await trip.save();
        
                // Nếu bus bị thay đổi
                if (oldBusID !== busID) {
                    const oldBusInTrips = await TripsModel.findOne({ where: { busID: oldBusID } });
                    if (!oldBusInTrips) {
                        await BusesModel.update({ status: 'inactive' }, { where: { id: oldBusID } });
                    }
        
                    await BusesModel.update({ status: 'active' }, { where: { id: busID } });
                }
        
                if (oldDriverId !== driverId) {
                    const oldDriverInTrips = await TripsModel.findOne({ where: { driverId: oldDriverId } });
                    if (!oldDriverInTrips) {
                        await DriverModel.update({ status: 'inactive' }, { where: { id: oldDriverId } });
                    }
        
                    await DriverModel.update({ status: 'active' }, { where: { id: driverId } });
                }
        
                res.status(200).json({
                    status: 200,
                    message: "Cập nhật thành công!",
                    data: trip
                });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        }


        static async delete(req, res) {
            try {
                const { id } = req.params;

                const trip = await TripsModel.findOne({ where: { id } });
                if (!trip) {
                    return res.status(404).json({ message: "Không tìm thấy chuyến xe!" });
                }
        
                const busID = trip.busID;
                const driverId = trip.driverId;

                await trip.destroy();
        
                const busInTrips = await TripsModel.findOne({ where: { busID } });
                if (!busInTrips) {
                    await BusesModel.update(
                        { status: 'inactive' },
                        { where: { id: busID } }
                    );
                }
        
                const driverInTrips = await TripsModel.findOne({ where: { driverId } });
                if (!driverInTrips) {
                    await DriverModel.update(
                        { status: 'inactive' },
                        { where: { id: driverId } }
                    );
                }
        
                res.status(200).json({
                    status: 200,
                    message: "Xóa thành công!",
                    data: trip
                });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        }
        
}
module.exports = TripsController;