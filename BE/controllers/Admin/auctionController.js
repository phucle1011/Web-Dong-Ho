const cron = require('node-cron');
const { Op } = require('sequelize');
const UsersModel = require('../../models/usersModel');

const AuctionModel = require('../../models/auctionsModel');

class auctionController {

   //--------------------------[ GET ALL ]---------------------------
   static async get(req, res) {
      try {
         const auctions = await AuctionModel.findAll();

         res.status(200).json({
            status: 200,
            message: "Lấy danh sách thành công",
            data: auctions
         });
      } catch (error) {
         console.error("Lỗi server:", error);
         return res.status(500).json({ message: "Lỗi server, vui lòng thử lại sau!" });
      }
   }

   //--------------------------[ GET ID ]---------------------------
   // static async getId(req, res) {
   //    try {   
   //       const { id } = req.params;

   //       const auctions = await AuctionModel.findOne({
   //          where: { id },
   //          include: [
   //             {
   //                model: UsersModel,
   //                as: 'user_id',
   //             }
   //          ]
   //       });

   //       if (!auctions) {
   //          return res.status(404).json({ message: "Phiên đấu giá không tồn tại!" });
   //       }

   //       res.status(200).json({
   //          status: 200,
   //          message: "Lấy danh sách thành công",
   //          data: auctions
   //       });
   //    } catch (error) {
   //       console.error("Lỗi server:", error);
   //       return res.status(500).json({ message: "Lỗi server, vui lòng thử lại sau!" });
   //    }
   // }

   //--------------------------[ CREATE ]---------------------------
   static async create(req, res) {
      try {
         const {
            auctions_product_id,
            start_price,
            start_time,
            end_time,
            priceStep,
         } = req.body;

         const now = new Date();

         const startTime = new Date(start_time);
         const endTime = new Date(end_time);

         if (startTime.getTime() === endTime.getTime()) {
            return res.status(400).json({
               message: "Thời gian bắt đầu và kết thúc không được trùng nhau.",
            });
         }

         if (startTime >= endTime) {
            return res.status(400).json({
               message: "Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc.",
            });
         }

         if (startTime < now) {
            return res.status(400).json({
               message: "Thời gian bắt đầu không được nhỏ hơn thời gian hiện tại.",
            });
         }

         const conflict = await AuctionModel.findOne({
            where: {
               auctions_product_id,
               [Op.or]: [
                  {
                     start_time: {
                        [Op.between]: [start_time, end_time],
                     },
                  },
                  {
                     end_time: {
                        [Op.between]: [start_time, end_time],
                     },
                  },
                  {
                     [Op.and]: [
                        { start_time: { [Op.lte]: start_time } },
                        { end_time: { [Op.gte]: end_time } },
                     ],
                  },
               ],
            },
         });

         if (conflict) {
            return res.status(400).json({
               message: "Đã có phiên đấu giá trùng khoảng thời gian này!",
            });
         }

         const auctions = await AuctionModel.create({
            auctions_product_id,
            start_price,
            priceStep,
            start_time,
            end_time,
            status: "upcoming",
         });

         return res.status(201).json({
            message: "Tạo phiên đấu giá thành công!",
            data: auctions,
         });

      } catch (error) {
         console.error("Lỗi server:", error);
         return res.status(500).json({
            message: "Lỗi server, vui lòng thử lại sau!",
         });
      }
   }

   //--------------------------[ UPDATE ]---------------------------
   static async update(req, res) {
      try {
         const { id } = req.params;
         const {
            auctions_product_id,
            start_price,
            start_time,
            end_time,
            priceStep,
         } = req.body;

         const now = new Date();
         const startTime = new Date(start_time);
         const endTime = new Date(end_time);

         if (startTime.getTime() === endTime.getTime()) {
            return res.status(400).json({
               message: "Thời gian bắt đầu và kết thúc không được trùng nhau.",
            });
         }

         if (startTime >= endTime) {
            return res.status(400).json({
               message: "Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc.",
            });
         }

         if (startTime < now) {
            return res.status(400).json({
               message: "Thời gian bắt đầu không được nhỏ hơn thời gian hiện tại.",
            });
         }

         const auction = await AuctionModel.findByPk(id);
         if (!auction) {
            return res.status(404).json({ message: "Không tìm thấy phiên đấu giá." });
         }

         if (auction.status === 'active' || auction.status === 'ended') {
            return res.status(400).json({
               message: `Không thể cập nhật phiên đã có trạng thái '${auction.status}'.`,
            });
         }

         const conflict = await AuctionModel.findOne({
            where: {
               id: { [Op.ne]: id },
               auctions_product_id,
               [Op.or]: [
                  { start_time: { [Op.between]: [startTime, endTime] } },
                  { end_time: { [Op.between]: [startTime, endTime] } },
                  {
                     [Op.and]: [
                        { start_time: { [Op.lte]: startTime } },
                        { end_time: { [Op.gte]: endTime } },
                     ],
                  },
               ],
            },
         });

         if (conflict) {
            return res.status(400).json({
               message: "Có phiên đấu giá khác trùng thời gian!",
            });
         }

         await AuctionModel.update(
            {
               auctions_product_id,
               start_price,
               priceStep,
               start_time,
               end_time,
            },
            {
               where: { id },
            }
         );

         const updatedAuction = await AuctionModel.findByPk(id);

         return res.status(200).json({
            message: "Cập nhật phiên đấu giá thành công!",
            data: updatedAuction,
         });

      } catch (error) {
         console.error("Lỗi khi cập nhật phiên đấu giá:", error);
         return res.status(500).json({
            message: "Lỗi server, vui lòng thử lại sau!",
         });
      }
   }

   //--------------------------[ DELETE ]---------------------------
   static async delete(req, res) {
      try {
         const { id } = req.params;

         const auction = await AuctionModel.findOne({ where: { id } });
         if (!auction) {
            return res.status(404).json({ message: "Phiên đấu giá không tồn tại!" });
         }

         if (auction.status === 'active' || auction.status === 'ended') {
            return res.status(400).json({
               message: `Không thể xoá phiên đấu giá có trạng thái '${auction.status}'.`,
            });
         }

         await AuctionModel.destroy({ where: { id } });

         return res.status(200).json({ message: "Xoá phiên đấu giá thành công!" });

      } catch (error) {
         console.error("Lỗi server khi xoá phiên đấu giá:", error);
         return res.status(500).json({ message: "Lỗi server, vui lòng thử lại sau!" });
      }
   }

}

module.exports = auctionController;
