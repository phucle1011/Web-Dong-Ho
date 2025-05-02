const SeatsModel = require('../../models/seatsModel');
class SeatsController {
    static async get(req, res) {
        try {
            const seats = await SeatsModel.findAll({
                where: { busID: req.params.busID}
            });
            res.status(200).json({
                "status": 200,
                "message": "Lấy danh sách thành công",
                "data": seats
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }


    static async update(req, res) {
        const seatId = req.params.id;
        const { status } = req.body;
      
        try {
          const seat = await SeatsModel.findByPk(seatId);
      
          if (!seat) {
            return res.status(404).json({ message: 'Không tìm thấy ghế!' });
          }
      
          seat.status = status;
          await seat.save();
      
          return res.status(200).json({
            message: 'Cập nhật trạng thái ghế thành công!',
            data: seat,
          });
        } catch (error) {
          return res.status(500).json({
            message: 'Lỗi server khi cập nhật ghế!',
            error: error.message,
          });
        }
    }


}
module.exports = SeatsController;