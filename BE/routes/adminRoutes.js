const express = require('express');
const router = express.Router();
const { checkJWT, isAdmin } = require('../services/authCheck');

const OrderController = require('../controllers/Admin/ordersController');
const categoryController = require('../controllers/Admin/categoryController');
const UserController = require('../controllers/Admin/userController');
const WishlistController = require('../controllers/Admin/wishlistController')
const promotionController = require('../controllers/Admin/promotionController');
const promotionProductsController = require('../controllers/Admin/promotionProductsController');
const ProductController = require('../controllers/Admin/productController');
const AddressController = require('../controllers/Admin/addressController');
const CartController = require('../controllers/Admin/cartsControlles');
const CommentController = require('../controllers/Admin/commentsController');
const BrandController = require('../controllers/Admin/brandsController');
const PromotionUserController = require('../controllers/Admin/promotionUserController');
const EmailController = require('../controllers/Admin/nodemailerController')
const DashboardController = require('../controllers/Admin/dashboardController');
const BlogController = require('../controllers/Admin/blogsController');
const NotificationController = require('../controllers/Admin/notificationController');
//------------------[ ADMIN ROUTES ]------------------

//------------------[ ORDERS ]------------------\
router.get('/orders/search', OrderController.searchOrders);
router.get('/orders/track/:orderCode', OrderController.trackOrder);
router.get('/orders/export-excel', OrderController.exportExcel);
router.get('/orders/filter-by-date', OrderController.filterByDate);
router.get('/orders/list', OrderController.get);
router.get('/orders/:id', OrderController.getById);
router.put('/orders/edit/:id', OrderController.update);
router.delete("/orders/delete/:id", OrderController.delete);


router.use(checkJWT, isAdmin); // tất cả route phía dưới phải login và có role admin

//------------------[ USERS ]------------------\
router.get('/user/list', UserController.get);
router.get('/user/search', UserController.searchUser);
router.get('/user/:id', UserController.getById);
router.put('/user/:id/status', UserController.updateUserStatus);

//------------------[ WISHLIST ]------------------\
router.get('/wishlist', WishlistController.getAllWishlists);
router.get('/users/:userId/wishlist', WishlistController.getWishlistByUser);
router.post('/wishlist', WishlistController.addToWishlist);
router.delete('/users/:userId/wishlist/:productVariantId', WishlistController.removeFromWishlist);
router.get('/users/wishlist/search', WishlistController.searchWishlist);
router.get('/users/:userId/wishlist/search', WishlistController.searchWishlistByUserProduct);

//------------------[ CATEGORY ]------------------\
router.get("/category/list", categoryController.getAll);
router.post('/category/create', categoryController.create);
router.get("/category/:id", categoryController.getById);
router.put('/category/:id', categoryController.update);
router.delete('/category/:id', categoryController.delete);

//------------------[ PROMOTIONS ]------------------\
router.get('/promotions/list', promotionController.getAll);
router.post("/promotions/create", promotionController.create);
router.get("/promotions/:id", promotionController.getById);
router.put('/promotions/:id', promotionController.update);
router.delete("/promotion/:id", promotionController.delete);
router.get('/promotions/generate-code', promotionController.generateUniquePromoCode);

//------------------[ PROMOTION PRODUCTS ]------------------\
router.get('/promotion', promotionProductsController.getAll);
router.get('/promotions/ss/all', promotionProductsController.getAllPromotion);
router.get('/promotion/:id', promotionProductsController.getById);
router.post('/promotion-products', promotionProductsController.create);
router.put('/promotion/:id', promotionProductsController.update);
router.delete('/promotions/:id', promotionProductsController.remove);

//------------------[ PRODUCT ]------------------\
router.get('/products', ProductController.get);
router.get('/products/:id', ProductController.getById);
router.post('/products', ProductController.createProduct);
router.post('/products/:product_id/variants', ProductController.addVariant);
router.delete('/products/:id', ProductController.delete);
router.get('/products/productList/search', ProductController.searchProducts);
router.post('/variants/:variant_id/images', ProductController.addVariantImages);
router.put("/variants/:variant_id", ProductController.updateVariant);
router.put("/products/:id", ProductController.update);
router.delete('/variant-images/:image_id', ProductController.deleteSingleVariantImage);
router.get("/product-attributes", ProductController.getAllAttributes);
router.delete("/variants/:variant_id", ProductController.deleteVariant);
router.get("/variants/:variant_id", ProductController.getVariantById);
router.get('/product-variants', ProductController.getAllVariants);
router.delete('/product-variants/deleteAttributeValueById/:id', ProductController.deleteAttributeValueById);
router.post('/products/imagesClauding', ProductController.deleteImagesClauding);





//------------------[ ADDRESS ]------------------\
router.get('/address/list', AddressController.getAllAddress);
router.get('/address/user/:id', AddressController.getAddressesByUser);
router.delete('/user/:userId/addresses/:id', AddressController.deleteAddress);
router.put('/user/:userId/addresses/:id', AddressController.updateAddress);
router.post('/user/:userId/addresses', AddressController.addAddress);

//------------------[ CART ]------------------\
router.get('/cart/list', CartController.getAllCart);
router.get('/cart/user/:userId', CartController.getCartByUserId);

//------------------[ Blog ]------------------\
router.get('/blog/list', BlogController.getAll);
router.get('/blog/:id', BlogController.getById);
router.post('/blog/add', BlogController.create);
router.put('/blog/:id', BlogController.update);
router.delete('/blog/:id', BlogController.delete);


//------------------[ COMMENT ]------------------\
router.get('/comment/list', CommentController.getAllComments);
router.get('/comment/product/:id', CommentController.getCommentsByProductId);

//------------------[ BRAND ]------------------\
router.get('/brand/list', BrandController.get);
router.get('/brand/search', BrandController.search);
router.get('/brand/active', BrandController.getActiveBrands);
router.get('/brand/inactive', BrandController.getInactiveBrands);
router.get('/brand/:id', BrandController.getById);
router.post('/brand/create', BrandController.create);
router.put('/brand/update/:id', BrandController.update);
router.delete('/brand/delete/:id', BrandController.delete);

//------------------[ PROMOTION-USER ]------------------\
router.get('/promotionusers/list', PromotionUserController.get);
router.post('/promotionusers/check-emails', PromotionUserController.checkPromotionExpiry);
router.post('/send-promotion-emails', EmailController.sendPromotionEmails);

//------------------[ DASHBOARD ]------------------\
router.get('/dashboard/counts', DashboardController.getCounts);
router.get('/dashboard/revenue/days', DashboardController.getRevenueByDaysInMonth);
router.get('/dashboard/revenue/months', DashboardController.getRevenueByMonthsInYear);
router.get('/dashboard/revenue', DashboardController.getRevenueByCustomRange);


router.get('/notification', NotificationController.getNotifications);
router.get('/notification/:id', NotificationController.getNotificationById);
router.post('/notification', NotificationController.createNotification);
router.delete('/notification/:id', NotificationController.deleteNotification);
router.patch('/notification/:id/read', NotificationController.markAsRead);
router.patch('/notification/mark-all-read', NotificationController.markAllAsRead);

module.exports = router;