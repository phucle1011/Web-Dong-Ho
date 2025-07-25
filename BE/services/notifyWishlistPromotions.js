// services/notifyWishlistPromotions.js

const PromotionModel = require('../models/promotionsModel');
const PromotionProductModel = require('../models/promotionProductsModel');
const WishlistModel = require('../models/wishlistsModel');
const ProductVariantModel = require('../models/productVariantsModel');
const ProductModel = require('../models/productsModel');
const UserModel = require('../models/usersModel');
const transporter = require('../config/mailer');
const { Op } = require('sequelize');

async function notifyWishlistPromotions() {
  try {
    const activePromotions = await PromotionModel.findAll({
      where: {
        applicable_to: 'product',
        status: 'active',
      },
      include: [{
        model: PromotionProductModel,
        as: 'promotion_products',
        include: [{
          model: ProductVariantModel,
          as: 'variant',
          include: [{ model: ProductModel, as: 'product' }],
        }]
      }]
    });

    for (const promo of activePromotions) {
      for (const pp of promo.promotion_products) {
        const variantId = pp.product_variant_id;
        const variant = pp.variant;
        const product = variant?.product;

        // Tìm người dùng yêu thích biến thể này
        const wishlists = await WishlistModel.findAll({
          where: { product_variant_id: variantId },
          include: [{
            model: UserModel,
            as: 'user',
            attributes: ['id', 'email', 'name'],
          }]
        });

        for (const wish of wishlists) {
          const user = wish.user;
          if (!user?.email) continue;

          await transporter.sendMail({
            from: `"TIMEMASTERS" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: `Sản phẩm bạn yêu thích đang giảm giá!`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 16px; background-color: #f9f9f9;">
                  <h2 style="color: #1868D5;">🎁 Khuyến mãi dành riêng cho bạn!</h2>
                  <p>Xin chào <strong>${user.name || 'bạn'}</strong>,</p>

                  <p>Sản phẩm bạn yêu thích hiện đang được <span style="color: #D7263D; font-weight: bold;">
                    ${promo.discount_type === 'fixed' ? `${promo.discount_value}₫` : `${promo.discount_value}%`}
                  </span> giảm giá!</p>

                  <div style="display: flex; align-items: center; gap: 16px; background: #fff; border-radius: 8px; padding: 12px; box-shadow: 0 0 6px rgba(0,0,0,0.1);">
                    <img src="${product?.thumbnail || '#'}" alt="${product?.name}" style="width: 100px; height: auto; border-radius: 8px;">
                    <div>
                      <h3 style="margin: 0;">${product?.name || '[Không xác định]'}</h3>
                      <p style="margin: 4px 0;">Thời gian áp dụng: <strong>${new Date(promo.start_date).toLocaleDateString()}</strong> - <strong>${new Date(promo.end_date).toLocaleDateString()}</strong></p>
                      <a href="${process.env.CLIENT_DOMAIN || '#'}" style="display: inline-block; margin-top: 8px; padding: 8px 12px; background-color: #1868D5; color: white; text-decoration: none; border-radius: 6px;">
                        Xem sản phẩm ngay
                      </a>
                    </div>
                  </div>

                  <p style="margin-top: 16px;">Cảm ơn bạn đã tin tưởng và sử dụng website của chúng tôi.</p>
                </div>
              `
          });
        }
      }
    }
  } catch (err) {
    console.error('Lỗi khi gửi email wishlist:', err);
  }
}

module.exports = notifyWishlistPromotions;
