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
WishlistModel.belongsTo(ProductVariantsModel, { foreignKey: 'product_variant_id', as: 'productVariant' });

// Category - Product
CategoriesModel.hasMany(ProductModel, { foreignKey: 'category_id', as: 'products' });
ProductModel.belongsTo(CategoriesModel, { foreignKey: 'category_id', as: 'category' });

CommentModel.hasMany(CommentImageModel, { foreignKey: 'comment_id', as: 'commentImages' });
CommentImageModel.belongsTo(CommentModel, { foreignKey: 'comment_id', as: 'comment' });


// User - Cart
UserModel.hasMany(CartDetailModel, { foreignKey: 'user_id', as: 'carts' });
CartDetailModel.belongsTo(UserModel, { foreignKey: 'user_id', as: 'user' });


// Product - ProductVariant
ProductModel.hasMany(ProductVariantModel, { foreignKey: 'product_id', as: 'variants' });
ProductVariantModel.belongsTo(ProductModel, { foreignKey: 'product_id', as: 'product' });


// ProductVariant - Cart 
ProductVariantModel.hasMany(CartDetailModel, { foreignKey: 'product_variant_id', as: 'carts' });
CartDetailModel.belongsTo(ProductVariantModel, { foreignKey: 'product_variant_id', as: 'productVariant' });

// Brand - Product
BrandModel.hasMany(ProductModel, { foreignKey: 'brand_id', as: 'products' });
ProductModel.belongsTo(BrandModel, { foreignKey: 'brand_id', as: 'brand' });

// Orders - OrderDetails
OrderModel.hasMany(OrderDetailModel, { foreignKey: 'order_id', as: 'orderDetails' });
OrderDetailModel.belongsTo(OrderModel, { foreignKey: 'order_id', as: 'order' });

// OrderDetails - Product
OrderDetailModel.belongsTo(ProductModel, { foreignKey: 'product_id', as: 'orderedProduct' });
ProductModel.hasMany(OrderDetailModel, { foreignKey: 'product_id', as: 'orderItems' });

// ProductVariants - Product
ProductVariantsModel.belongsTo(ProductModel, { foreignKey: 'product_id', as: 'variantProduct' });
ProductModel.hasMany(ProductVariantsModel, { as: 'variants', foreignKey: 'product_id' });

// ProductVariant - ProductVariantAttributeValue
ProductVariantsModel.hasMany(ProductVariantAttributeValueModel, { foreignKey: 'product_variant_id', as: 'attributeValues' });
ProductVariantAttributeValueModel.belongsTo(ProductVariantsModel, { foreignKey: 'product_variant_id', as: 'variant' });

// ProductAttribute - ProductVariantAttributeValue
ProductAttributeModel.hasMany(ProductVariantAttributeValueModel, { foreignKey: 'product_attribute_id', as: 'values' });
ProductVariantAttributeValueModel.belongsTo(ProductAttributeModel, { foreignKey: 'product_attribute_id', as: 'attribute' });

// ProductVariant - VariantImage
ProductVariantsModel.hasMany(VariantImageModel, { foreignKey: 'variant_id', as: 'images' });
VariantImageModel.belongsTo(ProductVariantsModel, { foreignKey: 'variant_id', as: 'variant' });

// OrderDetailModel - ProductVariants
OrderDetailModel.belongsTo(ProductVariantsModel, { foreignKey: 'product_variant_id', as: 'productVariant' });
ProductVariantsModel.hasMany(OrderDetailModel, { foreignKey: 'product_variant_id', as: 'orderDetails' });

// PromotionProduct - ProductVariant
PromotionProductModel.belongsTo(ProductVariantsModel, { foreignKey: 'product_variant_id' });
PromotionModel.hasMany(PromotionProductModel, { foreignKey: 'promotion_id' });  


// ProductVariant - Product
ProductVariantsModel.belongsTo(ProductModel, { foreignKey: 'product_id' });

PromotionProductModel.belongsTo(PromotionModel, { foreignKey: 'promotion_id' });
// Quan hệ một chiều đã có
PromotionProductModel.belongsTo(Promotion, { foreignKey: 'promotion_id' });

//Bổ sung chiều ngược lại
Promotion.hasMany(PromotionProductModel, { foreignKey: 'promotion_id' });


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
  VariantImageModel
};
