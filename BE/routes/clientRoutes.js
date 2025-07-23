const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/Client/categoryController');
const ProductCompaireController = require('../controllers/Client/ProductsCompaireController');
const BlogController = require('../controllers/Client/blogsController');
const ContactController = require('../controllers/Client/contactController');
const PromotionController = require('../controllers/Client/promotionController');
const AddressController = require('../controllers/Client/addressController');
const CartController = require('../controllers/Client/cartsController');
const ProductController = require('../controllers/Client/productController');
const AuthController = require('../controllers/Client/authController');
const ProductClientController = require('../controllers/Client/productClientController');
const ProductVariantController = require('../controllers/Client/productVariantController');
const OrderController = require('../controllers/Client/ordersController');
const ClientCommentController = require('../controllers/Client/commentsController');
const  chatWithBot  = require('../controllers/Client/chatboxController');
const ShippingController = require('../controllers/Client/shippingController');
const WishlistController = require('../controllers/Client/wishlistController');
const BrandController = require('../controllers/Client/brandController');
const { checkJWT } = require('../services/authCheck');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });
const { changePassword } = require('../controllers/Client/PasswordOldController');
const authenticate = require('../services/Middleware'); 
const brandClientController = require('../controllers/Client/brandClientController');
const ProfileController = require('../controllers/Client/ProfileController');
const HomeController = require('../controllers/Client/HomeController');
const UserController = require('../controllers/Client/userControllers');
const reviewController = require('../controllers/Client/reviewController');
const notificationClientController = require('../controllers/Client/notificationClientController');
const SearchController = require('../controllers/Client/SearchController')

//------------------[ CLIENT ROUTES ]------------------

//------------------[ HOME]------------------
router.get("/products/getallnew", HomeController.getAllNewProducts);
router.get("/top-sold-products", HomeController.getTopSoldProducts);
router.get("/top-discounted-products", HomeController.getDiscountedProducts);


// ------------------[ Search ]------------------//
router.get('/products/search', SearchController.searchProducts);

//------------------[ CHATBOX ]------------------//
router.post("/chatbox",chatWithBot.chatWithBot);

//------------------[ PRODUCTS ]------------------
router.get('/products/:id/variants', ProductController.getVariantsWithPromotion);
router.get('/products/:id/similar', ProductController.getSimilarProducts);

//------------------[ CATEGORY ]------------------
router.get("/category/list", categoryController.getCategories);

//------------------[ Blogs ]------------------
router.get('/blogs/search', BlogController.searchBlogs);
router.get('/blogs', BlogController.getAllBlogs);
router.get('/blogs/:id', BlogController.getBlogById);

//------------------[ Contact ]------------------
router.post("/contact", ContactController.sendContactEmail);
router.post("/contact/faq", ContactController.sendFaqEmail);

//------------------[ Promotions ]------------------
router.post('/promotions/apply',checkJWT, PromotionController.applyDiscount);
router.get('/promotions/active',checkJWT, PromotionController.getActivePromotions);

//------------------[ Products Compaire ]------------------
router.get("/products/compare", ProductCompaireController.getAllForComparison);

//------------------[ ADDRESS ]------------------\
router.get('/address/user/:id', AddressController.getAddressesByUser);
router.delete('/user/:userId/addresses/:id', AddressController.deleteAddress);
router.put('/user/:userId/addresses/:id', AddressController.updateAddress);
router.post('/user/:userId/addresses', AddressController.addAddress);

//------------------[ CARTS ]------------------
router.get("/carts", checkJWT, CartController.getCartByUser);
router.post("/add-to-carts", checkJWT, CartController.addToCart);
router.put("/update-to-carts/:productVariantId", checkJWT, CartController.updateCartItem);
router.delete("/delete-to-carts/:productVariantId", checkJWT, CartController.removeCartItem);
router.delete("/clear-cart", checkJWT, CartController.clearCartByUser);

//------------------[ ORDERS ]------------------
router.get("/orders", checkJWT, OrderController.get);
router.post("/orders", OrderController.create);
router.post("/orders-momo", OrderController.createMomoUrl);
router.post("/payment-notification", OrderController.momoPaymentNotification);
router.post("/orders-vnpay", OrderController.createVNPayUrl);
router.get("/vnpay-callback", OrderController.handleVNPayCallback);
router.put("/orders/cancel/:id", OrderController.cancelOrder);
router.put("/orders/confirm-delivered/:id", OrderController.confirmDelivered);

//------------------[ SHIPPING ]------------------
router.post('/shipping/shipping-fee', ShippingController.calculateShippingFee);

//------------------[ AUTH ]------------------\
router.post('/auth/register', AuthController.register);
router.get('/auth/verify-email', AuthController.verifyEmail);
router.post('/auth/login', AuthController.login);
router.post('/auth/check-token', AuthController.checkToken);
router.post('/auth/update-verification', AuthController.updateVerification);
router.post('/auth/reset-password', AuthController.resetPassword);
router.post('/auth/update-password/:token', AuthController.updatePassword);
router.get('/users/:id', AuthController.getById);
router.put('/users/:id', AuthController.update);

router.get("/profile/order-stats/:id", ProfileController.getOrderStats);
router.get("/profile/new-orders/:id", ProfileController.getTotalNewOrders);

//------------------[ PRODUCTS ]------------------//
router.get('/products', ProductClientController.getAll);

router.get('/price-range', ProductClientController.getPrice);

// router.get('/stock', ProductClientController.countStockGroupByProductId);
// router.get('/:id', ProductVariantController.getProductVariantDetail);

router.get('/product-variants/:id', ProductVariantController.getProductVariantDetail);
router.get('/products/discounted', ProductVariantController.getDiscountedProducts);

// ------------------[ Comment ]------------------//
router.post('/comments', ClientCommentController.addComment);
router.get('/comment/product/:id', ClientCommentController.getCommentsByProductId);
router.put("/comments/:id", ClientCommentController.updateComment);

// ------------------[ Wishlist ]------------------//
router.get('/wishlist', WishlistController.getAllWishlists);
router.get('/users/:userId/wishlist', WishlistController.getWishlistByUser);
router.post('/wishlist', WishlistController.addToWishlist);
router.delete('/users/:userId/wishlist/:productVariantId', WishlistController.removeFromWishlist);
router.delete('/users/:userId/wishlist', WishlistController.clearWishlist);
router.post('/users/:userId/wishlist/add-to-cart', WishlistController.addWishlistToCart);

// ------------------[ PasswordOld ]------------------//
router.post('/change-password', authenticate, changePassword);

//------------------[ BRANDS ]------------------
router.get('/brands/active', BrandController.getActiveBrands);
router.get('/brands/search', BrandController.search);
router.get('/brand/list', brandClientController.getAll);
router.get('/brands/get-products-by-brands', BrandController.getProductsByBrands);
router.get("/brands/top", BrandController.getTopBrands);


//------------------[ USERS ]------------------
router.put('/users/:id', UserController.updateUserInfo);

//------------------[ Reviews ]------------------
router.get('/:userId/reviews', reviewController.getAllReviews);

//------------------[ Notifications ]------------------
router.get('/notifications', notificationClientController.getNotifications);
router.patch('/notifications/:id/read', notificationClientController.getNotificationById);
router.patch('/notifications/mark-all-read', notificationClientController.createNotification);

module.exports = router;