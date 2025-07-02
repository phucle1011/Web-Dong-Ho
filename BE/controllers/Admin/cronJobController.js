const cron = require('node-cron');
const { Op } = require('sequelize');
const PromotionModel = require('../../models/promotionsModel');

async function updatePromotionStatuses() {
    try {
        const now = new Date();

        const allPromotions = await PromotionModel.findAll();

        for (const promo of allPromotions) {
            let newStatus = promo.status;

            const startDate = new Date(promo.start_date).toISOString().split('T')[0];
            const endDate = new Date(promo.end_date).toISOString().split('T')[0];
            const nowDate = now.toISOString().split('T')[0];

            // const startDate = new Date(promo.start_date).toISOString(); // ví dụ: "2025-05-29T15:00:00.000Z"
            // const endDate = new Date(promo.end_date).toISOString();
            // const nowDate = new Date().toISOString();

            if (promo.status === 'inactive') {
                newStatus = 'inactive';
            } else if (promo.quantity === 0) {
                newStatus = 'exhausted';
            } else if (nowDate < startDate) {
                newStatus = 'upcoming';
            } else if (nowDate >= startDate && nowDate <= endDate) {
                newStatus = 'active';
            } else if (nowDate > endDate) {
                newStatus = 'expired';
            }

            const updateData = {};

            if (promo.status !== newStatus) {
                updateData.status = newStatus;
            }

            if (newStatus === 'exhausted' && promo.quantity !== 0) {
                updateData.quantity = 0;
            }

            if (Object.keys(updateData).length > 0) {
                await promo.update(updateData);
            }
        }
    } catch (error) {
        console.error('Lỗi khi cập nhật trạng thái khuyến mãi:', error);
    }
}

cron.schedule('0 0 * * *', () => {
    updatePromotionStatuses();
});

cron.schedule('59 23 * * *', () => {
    updatePromotionStatuses();
});

module.exports = updatePromotionStatuses;
