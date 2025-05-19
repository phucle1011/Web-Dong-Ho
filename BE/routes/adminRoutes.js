const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/Admin/ordersController');
const categoryController = require('../controllers/Admin/categoryController');
const UserController = require('../controllers/Admin/userController');
const OrderHistoryController = require('../controllers/Admin/orderHistoryController');
const WishlistController = require('../controllers/Admin/wishlistController')
const promotionController = require('../controllers/Admin/promotionController');
const promotionProductsController = require('../controllers/Admin/promotionProductsController');
const ProductController = require('../controllers/Admin/productController');
const AddressController = require('../controllers/Admin/addressController');
const CartController = require('../controllers/Admin/cartsControlles');
const CommentController = require('../controllers/Admin/commentsController');
//------------------[ ADMIN ROUTES ]------------------

//------------------[ ORDERS ]------------------
router.get('/orders/search', OrderController.searchOrders);
router.get('/orders/track/:orderCode', OrderController.trackOrder);
router.get('/orders/list', OrderController.get);
router.get('/orders/:id', OrderController.getById); 
router.put('/orders/edit/:id', OrderController.update); 
router.delete("/orders/delete/:id", OrderController.delete);

//------------------[ ORDERHISTORY ]------------------
router.get('/order-history/search', OrderHistoryController.searchOrderHistory);
router.get('/order-history/list', OrderHistoryController.get);
router.get('/order-history/:id', OrderHistoryController.getById); 

//------------------[ USERS ]------------------\
router.get('/user/list', UserController.get);
router.get('/user/search', UserController.searchUser);
router.get('/user/:id', UserController.getById); 
router.put('/user/:id/status', UserController.updateUserStatus);

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
router.get('/promotion', promotionProductsController.getAll);
router.get('/promotion/:id', promotionProductsController.getById);
router.post('/promotion-products', promotionProductsController.create);
router.put('/promotion/:id', promotionProductsController.update);
router.delete('/promotion/:id', promotionProductsController.remove);

//------------------[ PRODUCT ]------------------\
router.get('/products', ProductController.get); // GET /products
router.get('/products/:id', ProductController.getById); // GET /products/:id
router.post('/products', ProductController.createProduct); // POST /products
router.post('/products/:product_id/variants', ProductController.addVariant); // POST /products/:product_id/variants
router.delete('/products/:id', ProductController.delete); // DELETE /products/:id

//------------------[ ADDRESS ]------------------\
router.get('/address/list', AddressController.getAllAddress);
router.get('/address/user/:id', AddressController.getAddressesByUser);

//------------------[ CART ]------------------\
router.get('/cart/list', CartController.getAllCart);
router.get('/cart/:id', CartController.getCartById);

//------------------[ COMMENT ]------------------\
router.get('/comment/list', CommentController.getAllComments);
router.get('/comment/product/:id', CommentController.getCommentsByProductId);
module.exports = router;