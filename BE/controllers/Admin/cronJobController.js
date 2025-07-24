const cron = require('node-cron');
const { Op } = require('sequelize');
const PromotionModel = require('../../models/promotionsModel');
const UserModel = require('../../models/usersModel');
const nodemailer = require('nodemailer');
// const getEmailTemplate = require('../../utils/emailTemplate');
const WishlistModel = require('../../models/wishlistsModel');
const ProductModel = require('../../models/productsModel');
const ProductVariantsModel = require('../../models/productVariantsModel');
const transporter = require('../../config/mailer');
const { getEmailTemplate, getWishlistPromoTemplate } = require('../../utils/emailTemplate');
const PromotionProductModel = require('../../models/promotionProductsModel');



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

async function deactivateStaleUsers() {
    try {
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        const usersToDeactivate = await UserModel.findAll({
            where: {
                status: 'active',
                last_active_at: { [Op.lte]: threeMonthsAgo }
            }
        });

        if (usersToDeactivate.length === 0) return;

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        for (const user of usersToDeactivate) {
            user.status = 'inactive';
            user.lockout_reason = 'Không hoạt động trong thời gian dài';
            await user.save();

            const html = getEmailTemplate(user.name, 'inactive', user.lockout_reason);
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: user.email,
                subject: 'Tài khoản của bạn đã bị vô hiệu hóa',
                html
            });
        }

        console.log(`Deactivated ${usersToDeactivate.length} stale users.`);
    } catch (err) {
        console.error('Lỗi khi deactive stale users:', err);
    }
}

async function notifyWishlistPromotions() {
    try {
        // 1. Lấy promotions active dành cho sản phẩm
        const promos = await PromotionModel.findAll({
            where: { status: 'active', applicable_to: 'product' }
        });

        for (const promo of promos) {
            // 2. Lấy biến thể thuộc promotion
            const items = await PromotionProductModel.findAll({
                where: { promotion_id: promo.id, product_variant_id: { [Op.ne]: null } },
                include: [{
                    model: ProductVariantsModel,
                    as: 'variant',
                    include: [{ model: ProductModel, as: 'product' }]
                }]
            });

            for (const entry of items) {
                const variant = entry.variant;
                const product = variant.product;
                if (!variant || !product) continue;

                // 3. Tìm user đã wishlist biến thể này
                const wishers = await WishlistModel.findAll({
                    where: { product_variant_id: variant.id },
                    include: [{ model: UserModel, as: 'user', attributes: ['name', 'email'] }]
                });

                // 4. Gửi mail mỗi user
                const startDate = new Date(promo.start_date).toLocaleDateString('vi-VN');
                const endDate = new Date(promo.end_date).toLocaleDateString('vi-VN');
                const type = promo.discount_type === 'percentage' ? '%' : '₫';

                for (const w of wishers) {
                    const user = w.user;
                    const html = getWishlistPromoTemplate(
                        user.name,
                        product.name,
                        promo.discount_value,
                        type,
                        promo.name,
                        promo.code || '',
                        startDate,
                        endDate
                    );

                    await transporter.sendMail({
                        from: `"TIMEMASTERS" <${process.env.EMAIL_USER}>`,
                        to: user.email,
                        subject: `🎉 ${product.name} bạn yêu thích đang giảm giá!`,
                        html
                    });
                }
            }
        }

        console.log('✔ Đã gửi thông báo khuyến mãi cho wishlist');
    } catch (err) {
        console.error('Lỗi khi gửi thông báo wishlist-promotions:', err);
    }
}

cron.schedule('0 0 * * *', () => {
    updatePromotionStatuses();
});

cron.schedule('59 23 * * *', () => {
    updatePromotionStatuses();
});

cron.schedule('0 0 * * *', deactivateStaleUsers);

cron.schedule('0 9 * * *', () => {
    console.log('🔔 Chạy job notifyWishlistPromotions');
    notifyWishlistPromotions();
});


module.exports = { updatePromotionStatuses, notifyWishlistPromotions, deactivateStaleUsers };
