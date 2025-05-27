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
const OrderDetailModel = require('../models/orderDetailsModel');
const BrandModel = require('../models/brandsModel');
const ProductAttributeModel = require('../models/productAttributesModel');
const ProductVariantAttributeValueModel = require('../models/productVariantAttributeValuesModel');
const VariantImageModel = require('../models/variantImagesModel');
const ProductVariantsModel = require('../models/productVariantsModel');
const PromotionProductModel = require('../models/promotionProductsModel');
const Promotion = require('../models/promotionsModel');
const CommentImageModel = require('../models/commentImagesModel');
const PromotionUserModel = require('./promotionUsersModel');

//--------------------- [ Thiết lập quan hệ ]------------------------

// User - Address
UserModel.hasMany(AddressesModel, { foreignKey: 'user_id', as: 'addresses' });
AddressesModel.belongsTo(UserModel, { foreignKey: 'user_id', as: 'user' });

// User - Notification
UserModel.hasMany(NotificationModel, { foreignKey: 'user_id', as: 'notifications' });
NotificationModel.belongsTo(UserModel, { foreignKey: 'user_id', as: 'user' });

// Product - Comment
ProductModel.hasMany(CommentModel, { foreignKey: 'product_id', as: 'comments' });
CommentModel.belongsTo(ProductModel, { foreignKey: 'product_id', as: 'commentedProduct' });

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

// Wishlist - ProductVariant
ProductVariantsModel.hasMany(WishlistModel, { foreignKey: 'product_variant_id', as: 'wishlists' });
WishlistModel.belongsTo(ProductVariantsModel, { foreignKey: 'product_variant_id', as: 'variant' }); // ✅ alias: variant

// Category - Product
CategoriesModel.hasMany(ProductModel, { foreignKey: 'category_id', as: 'products' });
ProductModel.belongsTo(CategoriesModel, { foreignKey: 'category_id', as: 'category' });

// comment - OrderDetail
CommentModel.belongsTo(OrderDetailModel, { foreignKey: 'order_detail_id', as: 'orderDetail' });
OrderDetailModel.hasMany(CommentModel, { foreignKey: 'order_detail_id', as: 'comments' });

// Comment images 
CommentModel.hasMany(CommentImageModel, { foreignKey: 'comment_id', as: 'commentImages' });
CommentImageModel.belongsTo(CommentModel, { foreignKey: 'comment_id', as: 'comment' });

// User - Cart
UserModel.hasMany(CartDetailModel, { foreignKey: 'user_id', as: 'carts' });
CartDetailModel.belongsTo(UserModel, { foreignKey: 'user_id', as: 'user' });

// Product - ProductVariant
ProductModel.hasMany(ProductVariantsModel, { foreignKey: 'product_id', as: 'variants' });
ProductVariantsModel.belongsTo(ProductModel, { foreignKey: 'product_id', as: 'product' }); // ✅ alias: product

// ProductVariant - Cart
ProductVariantsModel.hasMany(CartDetailModel, { foreignKey: 'product_variant_id', as: 'carts' });
CartDetailModel.belongsTo(ProductVariantsModel, { foreignKey: 'product_variant_id', as: 'variant' }); // ✅ alias: variant

// Brand - Product
BrandModel.hasMany(ProductModel, { foreignKey: 'brand_id', as: 'products' });
ProductModel.belongsTo(BrandModel, { foreignKey: 'brand_id', as: 'brand' });

// Orders - OrderDetails
OrderModel.hasMany(OrderDetailModel, { foreignKey: 'order_id', as: 'orderDetails' });
OrderDetailModel.belongsTo(OrderModel, { foreignKey: 'order_id', as: 'order' });

// OrderDetails - Product
OrderDetailModel.belongsTo(ProductModel, { foreignKey: 'product_id', as: 'orderedProduct' });
ProductModel.hasMany(OrderDetailModel, { foreignKey: 'product_id', as: 'orderItems' });

// ProductVariant - ProductVariantAttributeValue
ProductVariantsModel.hasMany(ProductVariantAttributeValueModel, { foreignKey: 'product_variant_id', as: 'attributeValues' });
ProductVariantAttributeValueModel.belongsTo(ProductVariantsModel, { foreignKey: 'product_variant_id', as: 'variant' }); // ✅ alias: variant

// ProductAttribute - ProductVariantAttributeValue
ProductAttributeModel.hasMany(ProductVariantAttributeValueModel, { foreignKey: 'product_attribute_id', as: 'values' });
ProductVariantAttributeValueModel.belongsTo(ProductAttributeModel, { foreignKey: 'product_attribute_id', as: 'attribute' });

// ProductVariant - VariantImage
ProductVariantsModel.hasMany(VariantImageModel, { foreignKey: 'variant_id', as: 'images' });
VariantImageModel.belongsTo(ProductVariantsModel, { foreignKey: 'variant_id', as: 'variant' }); // ✅ alias: variant

// OrderDetail - ProductVariant
OrderDetailModel.belongsTo(ProductVariantsModel, { foreignKey: 'product_variant_id', as: 'variant' });
ProductVariantsModel.hasMany(OrderDetailModel, { foreignKey: 'product_variant_id', as: 'orderDetails' });

// PromotionProduct - ProductVariant
PromotionProductModel.belongsTo(ProductVariantsModel, { foreignKey: 'product_variant_id' });
PromotionModel.hasMany(PromotionProductModel, { foreignKey: 'promotion_id' });  

UserModel.belongsToMany(PromotionModel, { through: PromotionUserModel, foreignKey: 'user_id', otherKey: 'promotion_id' });
PromotionModel.belongsToMany(UserModel, { through: PromotionUserModel, foreignKey: 'promotion_id', otherKey: 'user_id' });

// Promotion - User (Many-to-Many thông qua promotion_users)
UserModel.hasMany(PromotionUserModel, { foreignKey: 'user_id', as: 'promotionUsers' });
PromotionUserModel.belongsTo(UserModel, { foreignKey: 'user_id' });

// PromotionUser belongsTo Promotion
PromotionUserModel.belongsTo(PromotionModel, { foreignKey: 'promotion_id', as: 'Promotion' });
PromotionModel.hasMany(PromotionUserModel, { foreignKey: 'promotion_id', as: 'promotionUsers' });

// ProductVariant - Product
ProductVariantsModel.belongsTo(ProductModel, { foreignKey: 'product_id' });

PromotionProductModel.belongsTo(PromotionModel, { foreignKey: 'promotion_id' });
// Quan hệ một chiều đã có
PromotionProductModel.belongsTo(Promotion, { foreignKey: 'promotion_id' });

//Bổ sung chiều ngược lại
Promotion.hasMany(PromotionProductModel, { foreignKey: 'promotion_id' });

// ✅ FIXED: PromotionProduct - ProductVariant
PromotionProductModel.belongsTo(ProductVariantsModel, { foreignKey: 'product_variant_id', as: 'variant' }); // CHUẨN
ProductVariantsModel.hasMany(PromotionProductModel, { foreignKey: 'product_variant_id', as: 'promotionProducts' });

// ✅ FIXED: PromotionProduct - Promotion
PromotionProductModel.belongsTo(PromotionModel, { foreignKey: 'promotion_id', as: 'promotion' }); // CHUẨN
PromotionModel.hasMany(PromotionProductModel, { foreignKey: 'promotion_id', as: 'promotionProducts' });
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
  PromotionProductModel,
  ProductAttributeModel,
  ProductVariantAttributeValueModel,
  VariantImageModel,
  CommentImageModel
};
