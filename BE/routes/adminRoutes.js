const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/Admin/ordersController');
// const categoryController = require('../controllers/Admin/categoryController');
// const OrderController = require('../controllers/Admin/ordersController');
const categoryController = require('../controllers/Admin/categoryController');
// const UserController = require('../controllers/Admin/userController');
const OrderHistoryController = require('../controllers/Admin/orderHistoryController');
// const CommentController = require('../controllers/Admin/commentsController');
// const CartController = require('../controllers/Admin/cartsControlles');
// const AddressController = require('../controllers/Admin/addressController');
// const UserController = require('../controllers/Admin/userController');
// const DashboardController = require('../controllers/Admin/dashboardController');
const promotionController = require('../controllers/Admin/promotionController');


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
router.put('/orders/:id', OrderController.update); 
router.delete("/orders/:id", OrderController.delete);

//------------------[ USERS ]------------------
// router.get('/user/list', UserController.get);
// router.get('/user/search', UserController.searchUser);
// router.get('/user/:id', UserController.getById); 
// router.put('/user/:id/status', UserController.updateUserStatus);
// router.post('/user/:id/addresses', UserController.addAddressToUser);

//------------------[ COMMENTS ]------------------\
// router.get('/comment/list', CommentController.getAllComments);
// router.get('/comment/:id', CommentController.getCommentById);

//------------------[ CART ]------------------\
// router.get('/cart/list', CartController.getAllCart);
// router.get('/cart/:id', CartController.getCartDetail);

//------------------[ DISHBOARD ]------------------
// router.get('/revenue', DashboardController.getTotalRevenue);

//------------------[ ADDRESS ]------------------\
// router.get('/address/list', AddressController.getAllAddresses);
// router.get('/address/:id', AddressController.getAddressById);
// router.post('/address/add', AddressController.addAddress);
// router.put('/address/edit/:id', AddressController.updateAddress);
// router.delete('/address/delete/:id', AddressController.deleteAddress);

//------------------[ USERS ]------------------\
// router.get('/user/list', UserController.getAllUsers);


//------------------[ PROMOTION PRODUCTS ]-----------------

router.get('/promotion', promotionProductsController.getAll);
router.get('/promotion/:id', promotionProductsController.getById);
router.post('/promotion-products', promotionProductsController.create);
router.put('/promotion/:id', promotionProductsController.update);
router.delete('/promotion/:id', promotionProductsController.remove);

module.exports = router;