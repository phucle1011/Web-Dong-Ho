const { Op } = require('sequelize');
const AuctionModel = require('../../models/auctionsModel');
const AuctionBidModel = require('../../models/auctionBidsModel');
const CartDetail = require('../../models/cartDetailsModel');

module.exports = (io) => {

  const finalizeAuction = async (auctionId) => {
    const t = await AuctionModel.sequelize.transaction();
    try {
      const auction = await AuctionModel.findOne({
        where: { id: auctionId },
        transaction: t,
        lock: t.LOCK.UPDATE,

      });
      if (!auction) {
        await t.rollback();
        return { ok: false, reason: 'AUCTION_NOT_FOUND' };
      }

      if (auction.status === 'ended') {
        await t.commit();
        return { ok: true, reason: 'ALREADY_ENDED' };
      }

      const topBid = await AuctionBidModel.findOne({
        where: { auction_id: auction.id },
        order: [
          ['bidAmount', 'DESC'],
          ['created_at', 'ASC'],
        ],
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (topBid) {

        const baseTime = topBid.bidTime
          ? new Date(topBid.bidTime)
          : (topBid.created_at ? new Date(topBid.created_at) : new Date());

        const expireAt = new Date(baseTime.getTime() + 5 * 60 * 1000);

        await AuctionBidModel.destroy({
          where: { auction_id: auction.id, id: { [Op.ne]: topBid.id } },
          transaction: t,
        });

        auction.current_price = topBid.bidAmount;
        auction.status = 'ended';
        await auction.save({ transaction: t });

        const variantId = auction.product_variant_id;
        await CartDetail.create({
          user_id: topBid.user_id,
          product_variant_id: variantId,
          quantity: 1,
          expire_at: expireAt
        }, { transaction: t });

      } else {

        await AuctionBidModel.destroy({ where: { auction_id: auction.id }, transaction: t });
        auction.status = 'ended';
        await auction.save({ transaction: t });
      }

      await t.commit();

      const payload = {
        auctionId: auction.id,
        status: 'ended',
        winner: topBid ? {
          user_id: topBid.user_id,
          bidAmount: Number(topBid.bidAmount),
          product_variant_id: auction.product_variant_id,
        } : null,
      };

      io.to(`auction:${auction.id}`).emit('auction:status', payload);

      if (topBid) io.to(`user:${topBid.user_id}`).emit('auction:win', payload);
      io.emit('auction:status', payload);

      return { ok: true, winner: payload.winner };
    } catch (e) {
      await t.rollback();
      console.error('[Finalize Auction Error]', e);
      return { ok: false, reason: e.message };
    }
  };

  setInterval(async () => {
    try {
      const now = new Date();

      const auctionsToActivate = await AuctionModel.findAll({
        where: { status: 'upcoming', start_time: { [Op.lte]: now } },
      });
      for (const auction of auctionsToActivate) {
        auction.status = 'active';
        await auction.save();

        const payload = {
          auctionId: auction.id,
          status: 'active',
          currentPrice: Number(auction.current_price ?? auction.start_price ?? 0),
        };
        io.to(`auction:${auction.id}`).emit('auction:status', payload);
        io.emit('auction:status', payload);
      }

      const auctionsToEnd = await AuctionModel.findAll({
        where: { status: 'active', end_time: { [Op.lte]: now } },
        attributes: ['id'],
      });
      for (const a of auctionsToEnd) {
        await finalizeAuction(a.id);
      }

      const expiredBids = await AuctionBidModel.findAll({
        where: {
          bidTime: {
            [Op.lte]: new Date(now.getTime() - 12 * 60 * 1000),
          },
        },
        include: [
          {
            model: AuctionModel,
            as: 'auction',
            attributes: ['product_variant_id'],
            required: true,
            where: {
              status: 'ended',
            },
          },
        ],
        attributes: ['user_id'],
      });

      if (expiredBids.length > 0) {
        const conditions = expiredBids
          .filter(bid => bid.auction?.product_variant_id)
          .map(bid => ({
            user_id: bid.user_id,
            product_variant_id: bid.auction.product_variant_id,
          }));

        // if (conditions.length > 0) {
        //   await CartDetail.destroy({
        //     where: {
        //       [Op.or]: conditions,
        //     },
        //   });
        // }
      }

    } catch (e) {
      console.error('Lỗi cron job:', e.message);
    }
  }, 1000);

};
