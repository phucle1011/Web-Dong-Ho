const UserModel = require('../models/usersModel');
const AddressModel = require('../models/addressModel');
const NotificationModel = require('../models/notificationsModel');
const DiscountModel = require('../models/discountsModel');
const ProductModel = require('../models/productsModel');
const CommentModel = require('../models/commentsModel');
const OrderModel = require('../models/ordersModel');
const WishlistModel = require('../models/wishlistsModel');
const CategoryModel = require('../models/categoryModel');
const CartModel = require('../models/cartsModel');
const BrandModel = require('../models/brandsModel');
const PromotionModel = require('../models/promotionsModel');
const PromotionComboModel = require('../models/promotionCombosModel');
const OrderPromotionModel = require('../models/orderPromotionsModel');
const OrderCouponModel = require('../models/orderCouponsModel');
const CouponModel = require('../models/couponsModel');
const OrderItemsModel = require('../models/orderItemsModel');

//--------------------- [ Thiết lập quan hệ ]------------------------

// User - Address
UserModel.hasMany(AddressModel, { foreignKey: 'user_id', as: 'addresses' });
AddressModel.belongsTo(UserModel, { foreignKey: 'user_id', as: 'user' });

// User - Notification
UserModel.hasMany(NotificationModel, { foreignKey: 'user_id', as: 'notifications' });
NotificationModel.belongsTo(UserModel, { foreignKey: 'user_id', as: 'user' });

// Discount - Notification
DiscountModel.hasMany(NotificationModel, { foreignKey: 'discount_id', as: 'notifications' });
NotificationModel.belongsTo(DiscountModel, { foreignKey: 'discount_id', as: 'discount' });

// Product - Discount
ProductModel.hasMany(DiscountModel, { foreignKey: 'product_id', as: 'discounts' });
DiscountModel.belongsTo(ProductModel, { foreignKey: 'product_id', as: 'product' });

// Product - Comment
ProductModel.hasMany(CommentModel, { foreignKey: 'product_id', as: 'comments' });
CommentModel.belongsTo(ProductModel, { foreignKey: 'product_id', as: 'product' });

// User - Comment
CommentModel.belongsTo(UserModel, { foreignKey: 'user_id', as: 'user' });

// Order - Comment
CommentModel.belongsTo(OrderModel, { foreignKey: 'order_id', as: 'order' });

// User - Order
UserModel.hasMany(OrderModel, { foreignKey: 'user_id', as: 'orders' });
OrderModel.belongsTo(UserModel, { foreignKey: 'user_id', as: 'user' });

// User - Wishlist
UserModel.hasMany(WishlistModel, { foreignKey: 'user_id', as: 'wishlists' });
WishlistModel.belongsTo(UserModel, { foreignKey: 'user_id', as: 'user' });

// Product - Wishlist
ProductModel.hasMany(WishlistModel, { foreignKey: 'product_id', as: 'wishlists' });
WishlistModel.belongsTo(ProductModel, { foreignKey: 'product_id', as: 'product' });

// Category - Product
CategoryModel.hasMany(ProductModel, { foreignKey: 'category_id', as: 'products' });
ProductModel.belongsTo(CategoryModel, { foreignKey: 'category_id', as: 'category' });

// User - Cart
UserModel.hasMany(CartModel, { foreignKey: 'user_id', as: 'carts' });
CartModel.belongsTo(UserModel, { foreignKey: 'user_id', as: 'user' });

// Product - Cart
ProductModel.hasMany(CartModel, { foreignKey: 'product_id', as: 'carts' });
CartModel.belongsTo(ProductModel, { foreignKey: 'product_id', as: 'product' });

// Brand - Product
BrandModel.hasMany(ProductModel, { foreignKey: 'brand_id', as: 'products' });
ProductModel.belongsTo(BrandModel, { foreignKey: 'brand_id', as: 'brand' });

// Product - Promotion
ProductModel.hasMany(PromotionModel, { foreignKey: 'product_id', as: 'promotions' });
PromotionModel.belongsTo(ProductModel, { foreignKey: 'product_id', as: 'product' });

// PromotionCombo - Promotion
PromotionComboModel.hasMany(PromotionModel, { foreignKey: 'promotion_combo_id', as: 'promotions' });
PromotionModel.belongsTo(PromotionComboModel, { foreignKey: 'promotion_combo_id', as: 'combo' });

// Orders - OrderItems
OrderModel.hasMany(OrderItemsModel, { foreignKey: 'order_id', as: 'orderDetails' });
OrderItemsModel.belongsTo(OrderModel, { foreignKey: 'order_id', as: 'order'});

// OrderItems - Product
OrderItemsModel.belongsTo(ProductModel, { foreignKey: 'product_id', as: 'product'});
ProductModel.hasMany(OrderItemsModel, { foreignKey: 'product_id', as: 'orderItems'});
  
// Order - Promotion (Many-to-Many qua OrderPromotions)
OrderModel.belongsToMany(PromotionModel, {
    through: OrderPromotionModel,
    foreignKey: 'order_id',
    otherKey: 'promotion_id',
    as: 'promotions_in_order' 
});

PromotionModel.belongsToMany(OrderModel, {
    through: OrderPromotionModel,
    foreignKey: 'promotion_id',
    otherKey: 'order_id',
    as: 'orders_with_promotion'
});

// Order - Coupon (Many-to-Many qua OrderCoupons)
OrderModel.belongsToMany(CouponModel, {
    through: OrderCouponModel,
    foreignKey: 'order_id',
    otherKey: 'coupon_id',
    as: 'coupons'
});

CouponModel.belongsToMany(OrderModel, {
    through: OrderCouponModel,
    foreignKey: 'coupon_id',
    otherKey: 'order_id',
    as: 'orders_with_coupon'
});

module.exports = {
    UserModel,
    AddressModel,
    NotificationModel,
    DiscountModel,
    ProductModel,
    CommentModel,
    OrderModel,
    WishlistModel,
    CategoryModel,
    CartModel,
    BrandModel,
    PromotionModel,
    PromotionComboModel,
    OrderPromotionModel,
    CouponModel,
    OrderCouponModel,
    OrderItemsModel
};
