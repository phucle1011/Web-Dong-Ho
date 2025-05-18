const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/Admin/ordersController');
const categoryController = require('../controllers/Admin/categoryController');
const UserController = require('../controllers/Admin/userController');
const OrderHistoryController = require('../controllers/Admin/orderHistoryController');
const WishlistController = require('../controllers/Admin/wishlistController')
const promotionController = require('../controllers/Admin/promotionController');
const PromotionProductController = require('../controllers/Admin/promotionProductsController');
const ProductController = require('../controllers/Admin/productController');


//------------------[ ADMIN ROUTES ]------------------

//------------------[ ORDERS ]------------------
router.get('/orders/search', OrderController.searchOrders);
router.get('/orders/track/:orderCode', OrderController.trackOrder);
router.get('/orders/list', OrderController.get);
router.get('/orders/:id', OrderController.getById); 
router.put('/orders/edit/:id', OrderController.update); 
router.delete("/orders/delete/:id", OrderController.delete);

//------------------[ USERS ]------------------
// router.get('/user/list', UserController.get);
// router.get('/user/search', UserController.searchUser);
// router.get('/user/:id', UserController.getById); 
// router.put('/user/:id/status', UserController.updateUserStatus);

//------------------[ ORDERHISTORY ]------------------
router.get('/order-history/search', OrderHistoryController.searchOrderHistory);
router.get('/order-history/list', OrderHistoryController.get);
router.get('/order-history/:id', OrderHistoryController.getById); 

//------------------[ COMMENTS ]------------------\
// router.get('/comment/list', CommentController.getAllComments);
// router.get('/comment/:id', CommentController.getCommentById);

//------------------[ CART ]------------------\
// router.get('/cart/list', CartController.getAllCart);
// router.get('/cart/:id', CartController.getCartDetail);


//------------------[ ADDRESS ]------------------\
// router.get('/address/list', AddressController.getAllAddresses);
// router.get('/address/:id', AddressController.getAddressById);
// router.post('/address/add', AddressController.addAddress);
// router.put('/address/edit/:id', AddressController.updateAddress);
// router.delete('/address/delete/:id', AddressController.deleteAddress);

//------------------[ USERS ]------------------\
// router.get('/user/list', UserController.getAllUsers);


//------------------[ PROMOTION PRODUCTS ]-----------------

// router.get('/promotion', promotionProductsController.getAll);
// router.get('/promotion/:id', promotionProductsController.getById);
// router.post('/promotion-products', promotionProductsController.create);
// router.put('/promotion:id', controller.update);
// router.delete('/promotion:id', controller.remove);

//------------------[ WISHLIST ]------------------
router.get('/users/:userId/wishlist', WishlistController.getWishlistByUser);
router.post('/wishlist', WishlistController.addToWishlist);
router.delete('/users/:userId/wishlist/:productVariantId', WishlistController.removeFromWishlist);
router.get('/users/wishlist/search', WishlistController.searchWishlist);

//------------------[ CATEGORY ]------------------
router.get("/category/list", categoryController.getAll);
router.post('/category/create', categoryController.create);
router.get("/category/:id", categoryController.getById);
router.put('/category/:id', categoryController.update);
router.delete('/category/:id', categoryController.delete);

//------------------[ PROMOTIONS ]------------------
router.get('/promotions/list', promotionController.getAll);
router.post("/promotions/create", promotionController.create);
router.get("/promotions/:id", promotionController.getById);
router.put('/promotions/:id', promotionController.update);
router.delete("/promotion/:id", promotionController.delete);

//------------------[ PROMOTION PRODUCTS ]------------------
router.get('/promotion-products', PromotionProductController.getAll);
router.get('/promotion-products/:id', PromotionProductController.getById);
router.post('/promotion-products', PromotionProductController.create);
router.put('/promotion-products/:id', PromotionProductController.update);
router.delete('/promotion-products/:id', PromotionProductController.remove);

router.get('/products', ProductController.get); 
router.get('/products/:id', ProductController.getById); 
router.post('/products', ProductController.createProduct); 
router.post('/products/:product_id/variants', ProductController.addVariant); 
router.delete('/products/:id', ProductController.delete); 


module.exports = router;