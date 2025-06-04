const PromotionModel = require('../../models/promotionsModel');
const PromotionUserModel = require('../../models/promotionUsersModel');
const { Op } = require('sequelize');
const sequelize = require('../../config/database');

class PromotionController {
    static async applyDiscount(req, res) {
        try {
            let { code, orderTotal } = req.body;
            const userId = 20; // ⚠️ Cần lấy từ auth thực tế nếu có

            console.log('[applyDiscount] Yêu cầu:', { code, orderTotal, userId });

            if (!code || typeof code !== 'string' || code.trim() === '') {
                return res.status(400).json({ success: false, message: 'Mã giảm giá là bắt buộc' });
            }

            code = code.trim().toUpperCase();
            orderTotal = parseFloat(orderTotal);

            if (isNaN(orderTotal) || orderTotal <= 0) {
                return res.status(400).json({ success: false, message: 'Tổng đơn hàng không hợp lệ' });
            }

            const result = await sequelize.transaction(async (t) => {
                const promotion = await PromotionModel.findOne({
                    where: { code },
                    transaction: t,
                    lock: t.LOCK.UPDATE,
                });

                if (!promotion) {
                    throw { status: 404, message: 'Mã giảm giá không tồn tại' };
                }

                const now = new Date();

                if (promotion.status !== 'active') {
                    throw { status: 400, message: `Khuyến mãi đang ở trạng thái ${promotion.status}` };
                }

                if (now < promotion.start_date || now > promotion.end_date) {
                    throw { status: 400, message: 'Khuyến mãi đã hết hạn hoặc chưa bắt đầu' };
                }

                if (promotion.quantity <= 0) {
                    throw { status: 400, message: 'Khuyến mãi đã hết lượt sử dụng' };
                }

                if (orderTotal < promotion.min_price_threshold) {
                    throw {
                        status: 400,
                        message: `Đơn hàng phải tối thiểu $${promotion.min_price_threshold}`,
                    };
                }

                // Nếu là mã đặc biệt, kiểm tra người dùng đã được cấp chưa
                let promoUser = null;
                if (promotion.special_promotion === true) {
                    if (!userId) {
                        throw { status: 401, message: 'Bạn cần đăng nhập để sử dụng mã này' };
                    }

                    promoUser = await PromotionUserModel.findOne({
                        where: {
                            promotion_id: promotion.id,
                            user_id: userId,
                            email_sent: true,
                        },
                        transaction: t,
                        lock: t.LOCK.UPDATE,
                    });

                    if (!promoUser) {
                        throw {
                            status: 403,
                            message: 'Bạn không được cấp mã này hoặc chưa nhận được qua email',
                        };
                    }

                    if (promoUser.used === true) {
                        throw {
                            status: 400,
                            message: 'Bạn đã sử dụng mã giảm giá này rồi',
                        };
                    }
                }

                // Giảm số lượng
                await promotion.update(
                    { quantity: promotion.quantity - 1 },
                    { transaction: t }
                );

                // Đánh dấu là đã dùng nếu là mã đặc biệt
                if (promotion.special_promotion === true && promoUser) {
                    await promoUser.update(
                        { used: true },
                        { transaction: t }
                    );
                }

                // Tính toán giảm giá
                let discountAmount = 0;
                if (promotion.discount_type === 'percentage') {
                    discountAmount = (orderTotal * promotion.discount_value) / 100;
                } else if (promotion.discount_type === 'fixed') {
                    discountAmount = promotion.discount_value;
                }

                // Không cho vượt quá tổng tiền
                if (discountAmount > orderTotal) {
                    discountAmount = orderTotal;
                }

                return {
                    discountType: promotion.discount_type,
                    discountValue: promotion.discount_value,
                    discountAmount: Number(discountAmount.toFixed(2)),
                    totalAfterDiscount: Number((orderTotal - discountAmount).toFixed(2)),
                    applicableTo: promotion.applicable_to || null,
                    code,
                };
            });

            return res.json({
                success: true,
                message: `Mã giảm giá ${result.code} áp dụng thành công`,
                data: result,
            });

        } catch (error) {
            console.error('[applyDiscount] Lỗi:', error);

            const status = error?.status || 500;
            const message = error?.message || 'Lỗi máy chủ khi áp dụng mã giảm giá';

            return res.status(status).json({
                success: false,
                message,
            });
        }
    }
}

module.exports = PromotionController;
