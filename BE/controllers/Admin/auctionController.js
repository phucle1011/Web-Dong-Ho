const cron = require('node-cron');
const { Op } = require('sequelize');
const UsersModel = require('../../models/usersModel');
const AuctionProductModel = require('../../models/auctionsProductModel')
const AuctionModel = require('../../models/auctionsModel');

class auctionController {

   //--------------------------[ GET ALL ]---------------------------
   static async get(req, res) {
      try {
         const page = parseInt(req.query.page) || 1;
         const limit = parseInt(req.query.limit) || 10;
         const offset = (page - 1) * limit;

         const { searchTerm, startDate, endDate, status } = req.query;
         const whereClause = {};

         if (searchTerm) {
            whereClause.auctions_product_id = {
               [Op.like]: `%${searchTerm}%`,
            };
         }

         if (startDate || endDate) {
            whereClause.start_time = {};
            if (startDate) {
               whereClause.start_time[Op.gte] = new Date(`${startDate}T00:00:00`);
            }
            if (endDate) {
               whereClause.start_time[Op.lte] = new Date(`${endDate}T23:59:59`);
            }
         }

         const allAuctions = await AuctionModel.findAll({
            where: whereClause,
            include: [
               {
                  model: AuctionProductModel,
                  as: "auctionProduct",
               },
            ],
         });

         const statusCounts = {
            all: allAuctions.length,
            upcoming: allAuctions.filter(a => a.status === "upcoming").length,
            active: allAuctions.filter(a => a.status === "active").length,
            ended: allAuctions.filter(a => a.status === "ended").length,
         };

         let filteredAuctions = allAuctions;
         if (status === "upcoming" || status === "active" || status === "ended") {
            filteredAuctions = allAuctions.filter(a => a.status === status);
         }

const statusPriority = { active: 1, upcoming: 2, ended: 3 };

filteredAuctions.sort((a, b) => {
   const priorityA = statusPriority[a.status] || 99;
   const priorityB = statusPriority[b.status] || 99;

   if (priorityA === priorityB) {
      return new Date(a.start_time) - new Date(b.start_time);
   }

   return priorityA - priorityB;
});

         const paginatedAuctions = filteredAuctions.slice(offset, offset + limit);

         return res.status(200).json({
            status: 200,
            message: "Lấy danh sách phiên đấu giá thành công",
            data: paginatedAuctions,
            pagination: {
               currentPage: page,
               totalPages: Math.ceil(filteredAuctions.length / limit),
               totalItems: filteredAuctions.length,
            },
            statusCounts,
         });
      } catch (error) {
         console.error("Lỗi khi lấy danh sách đấu giá:", error);
         return res.status(500).json({ message: "Lỗi server, vui lòng thử lại sau!" });
      }
   }

   static async getAuctionProduct(req, res) {
      try {
         const auctionProducts = await AuctionProductModel.findAll();

         return res.status(200).json({ data: auctionProducts });
      } catch (error) {
         console.error("Lỗi server:", error);
         return res.status(500).json({ message: "Lỗi server, vui lòng thử lại sau!" });
      }
   }

   //--------------------------[ GET ID ]---------------------------
   static async getId(req, res) {
      try {
         const { id } = req.params;
         const moment = require("moment-timezone");

         const auction = await AuctionModel.findOne({
            where: { id },
            include: [{ model: AuctionProductModel, as: "auctionProduct" }],
         });

         if (!auction) {
            return res.status(404).json({ message: "Phiên đấu giá không tồn tại!" });
         }

         const startTimeStr = moment(auction.start_time).tz("Asia/Ho_Chi_Minh").format("YYYY-MM-DD HH:mm:ss");
         const endTimeStr = moment(auction.end_time).tz("Asia/Ho_Chi_Minh").format("YYYY-MM-DD HH:mm:ss");

         const now = moment().tz("Asia/Ho_Chi_Minh");
         if (moment(startTimeStr).isBefore(now) && moment(endTimeStr).isAfter(now)) {
            auction.dataValues.status = "active";
         } else if (moment(startTimeStr).isAfter(now)) {
            auction.dataValues.status = "upcoming";
         } else {
            auction.dataValues.status = "ended";
         }

         return res.status(200).json({
            status: 200,
            message: "Lấy thông tin phiên đấu giá thành công",
            data: auction,
         });
      } catch (error) {
         console.error("Lỗi server:", error);
         return res.status(500).json({ message: "Lỗi server, vui lòng thử lại sau!" });
      }
   }

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

         const now = new Date(new Date().toISOString());

         const moment = require('moment-timezone');

         const startTime = moment.tz(start_time, "YYYY-MM-DD HH:mm:ss", "Asia/Ho_Chi_Minh").toDate();
         const endTime = moment.tz(end_time, "YYYY-MM-DD HH:mm:ss", "Asia/Ho_Chi_Minh").toDate();

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
            start_time: startTime,
            end_time: endTime,
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

         const now = new Date(new Date().toISOString());
         const moment = require('moment-timezone');

         const startTime = moment.tz(start_time, "YYYY-MM-DD HH:mm:ss", "Asia/Ho_Chi_Minh").toDate();
         const endTime = moment.tz(end_time, "YYYY-MM-DD HH:mm:ss", "Asia/Ho_Chi_Minh").toDate();

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
               start_time: startTime,
               end_time: endTime,
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
