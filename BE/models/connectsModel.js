const UserModel = require('./usersModel');
const AddressesModel = require('./addressesModel');
const NotificationModel = require('./notificationsModel');
const ProductModel = require('./productsModel');
const CommentModel = require('./commentsModel');
const OrderModel = require('./ordersModel');
const WishlistModel = require('./wishlistsModel');
const CategoriesModel = require('../models/categoriesModel');
const CartDetailModel = require('../models/cartDetailsModel');
const PromotionModel = require('./promotionsModel');
const OrderDetailModel = require('../models/orderDetailsModel');
const BrandModel = require('../models/brandsModel');

//--------------------- [ Thiết lập quan hệ ]------------------------

// User - Address
UserModel.hasMany(AddressesModel, { foreignKey: 'user_id', as: 'addresses' });
AddressesModel.belongsTo(UserModel, { foreignKey: 'user_id', as: 'user' });

// User - Notification
UserModel.hasMany(NotificationModel, { foreignKey: 'user_id', as: 'notifications' });
NotificationModel.belongsTo(UserModel, { foreignKey: 'user_id', as: 'user' });

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
CategoriesModel.hasMany(ProductModel, { foreignKey: 'category_id', as: 'products' });
ProductModel.belongsTo(CategoriesModel, { foreignKey: 'category_id', as: 'category' });

// User - Cart
UserModel.hasMany(CartDetailModel, { foreignKey: 'user_id', as: 'carts' });
CartDetailModel.belongsTo(UserModel, { foreignKey: 'user_id', as: 'user' });

// Product - Cart
ProductModel.hasMany(CartDetailModel, { foreignKey: 'product_id', as: 'carts' });
CartDetailModel.belongsTo(ProductModel, { foreignKey: 'product_id', as: 'product' });

// Brand - Product
BrandModel.hasMany(ProductModel, { foreignKey: 'brand_id', as: 'products' });
ProductModel.belongsTo(BrandModel, { foreignKey: 'brand_id', as: 'brand' });

// Product - Promotion
ProductModel.hasMany(PromotionModel, { foreignKey: 'product_id', as: 'promotions' });
PromotionModel.belongsTo(ProductModel, { foreignKey: 'product_id', as: 'product' });

// Orders - OrderItems
OrderModel.hasMany(OrderDetailModel, { foreignKey: 'order_id', as: 'orderDetails', onDelete: 'CASCADE' });
OrderDetailModel.belongsTo(OrderModel, { foreignKey: 'order_id', as: 'order'});

// OrderItems - Product
OrderDetailModel.belongsTo(ProductModel, { foreignKey: 'product_id', as: 'product'});
ProductModel.hasMany(OrderDetailModel, { foreignKey: 'product_id', as: 'orderItems'});


module.exports = {
    UserModel,
    AddressesModel,
    NotificationModel,
    ProductModel,
    CommentModel,
    OrderModel,
    WishlistModel,
    CategoriesModel,
    CartDetailModel,
    BrandModel,
    PromotionModel,
    OrderDetailModel
};
