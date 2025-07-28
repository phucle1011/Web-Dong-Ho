const { Op } = require('sequelize');
const AuctionModel = require('../../models/auctionsModel');

setInterval(async () => {
  try {
    const now = new Date();

    const auctionsToActivate = await AuctionModel.findAll({
      where: {
        status: 'upcoming',
        start_time: {
          [Op.lte]: now,
        },
      },
    });

    for (const auction of auctionsToActivate) {
      auction.status = 'active';
      await auction.save();
      console.log(`Phiên đấu giá ${auction.id} bắt đầu`);
    }

    const auctionsToEnd = await AuctionModel.findAll({
      where: {
        status: 'active',
        end_time: {
          [Op.lte]: now,
        },
      },
    });

    for (const auction of auctionsToEnd) {
      auction.status = 'ended';
      await auction.save();
      console.log(`Phiên đấu giá #${auction.id} đã kết thúc`);
    }
  } catch (error) {
    console.error('Lỗi cron job:', error.message);
  }
},60 * 1000); 
//  1000