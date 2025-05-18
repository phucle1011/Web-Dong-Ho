const UserModel = require('./usersModel');
const AddressesModel = require('./addressesModel');
const NotificationModel = require('./notificationsModel');
const ProductModel = require('./productsModel');
const CommentModel = require('./commentsModel');
const OrderModel = require('./ordersModel');
const WishlistModel = require('./wishlistsModel');
const CategoriesModel = require('./categoriesModel');
const CartDetailModel = require('./cartDetailsModel');
const PromotionModel = require('./promotionsModel');
const OrderDetailModel = require('./orderDetailsModel');
const BrandModel = require('./brandsModel');
const ProductVariantsModel = require('./productVariantsModel');
const PromotionProductModel = require('./promotionProductsModel');

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

// Orders - OrderDetails
OrderModel.hasMany(OrderDetailModel, { foreignKey: 'order_id', as: 'orderDetails' });
OrderDetailModel.belongsTo(OrderModel, { foreignKey: 'order_id', as: 'order' });

// OrderDetails - Product
OrderDetailModel.belongsTo(ProductModel, { foreignKey: 'product_id', as: 'product' });

// OrderItems - Product
OrderDetailModel.belongsTo(ProductModel, { foreignKey: 'product_id', as: 'orderedProduct' }); 
ProductModel.hasMany(OrderDetailModel, { foreignKey: 'product_id', as: 'orderItems' });

// OrderDetailModel - ProductVariants
OrderDetailModel.belongsTo(ProductVariantsModel, { foreignKey: 'product_variant_id', as: 'productVariant' }); 
ProductVariantsModel.hasMany(OrderDetailModel, { foreignKey: 'product_variant_id', as: 'orderDetails' });

// ProductVariantsModel - ProductModel
ProductVariantsModel.belongsTo(ProductModel, { foreignKey: 'product_id', as: 'variantProduct' }); 
ProductModel.hasMany(ProductVariantsModel, { foreignKey: 'product_id', as: 'variants' });

// PromotionProduct - ProductVariant
PromotionProductModel.belongsTo(ProductVariantsModel, { foreignKey: 'product_variant_id' });

// ProductVariant - Product
ProductVariantsModel.belongsTo(ProductModel, { foreignKey: 'product_id' });

PromotionProductModel.belongsTo(PromotionModel, { foreignKey: 'promotion_id' });
PromotionProductModel.belongsTo(ProductVariantsModel, { foreignKey: 'product_variant_id' });

// Export all models
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
  OrderDetailModel,
  ProductVariantsModel,
  PromotionProductModel
};
