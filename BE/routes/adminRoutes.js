const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/Admin/ordersController');
const categoryController = require('../controllers/Admin/categoryController');

const UserController = require('../controllers/Admin/userController');


const OrderHistoryController = require('../controllers/Admin/orderHistoryController');
const CommentController = require('../controllers/Admin/commentsController');
const CartController = require('../controllers/Admin/cartsControlles');
const AddressController = require('../controllers/Admin/addressController');
const UserController = require('../controllers/Admin/userController');
const DashboardController = require('../controllers/Admin/dashboardController');

//------------------[ ADMIN ROUTES ]------------------

//------------------[ ORDERS ]------------------
router.get('/orders/list', OrderController.get);
router.get('/orders/:id', OrderController.getById); 
router.put('/orders/edit/:id', OrderController.update); 
router.delete("/orders/delete/:id", OrderController.delete);

//------------------[ ORDERHISTORY ]------------------
router.get('/order-history/list', OrderHistoryController.get);
router.get('/order-history/:id', OrderHistoryController.getById); 
router.put('/orders/:id', OrderController.update); 
router.delete("/orders/:id", OrderController.delete);

//------------------[ CATEGORY ]------------------
router.get("/category/list", categoryController.getAll);
router.post('/category/create', categoryController.create);
router.get("/category/:id", categoryController.getById);
router.put('/category/:id', categoryController.update);
router.delete('/category/:id', categoryController.delete);


//------------------[ USERS ]------------------
router.get('/user/list', UserController.get);
router.get('/user/search', UserController.searchUser);
router.get('/user/:id', UserController.getById); 
router.put('/user/:id/status', UserController.updateUserStatus);
router.post('/user/:id/addresses', UserController.addAddressToUser);

//------------------[ COMMENTS ]------------------\
router.get('/comment/list', CommentController.getAllComments);
router.get('/comment/:id', CommentController.getCommentById);

//------------------[ CART ]------------------\
router.get('/cart/list', CartController.getAllCart);
router.get('/cart/:id', CartController.getCartDetail);

//------------------[ DISHBOARD ]------------------
router.get('/revenue', DashboardController.getTotalRevenue);

//------------------[ ADDRESS ]------------------\
router.get('/address/list', AddressController.getAllAddresses);
router.get('/address/:id', AddressController.getAddressById);
router.post('/address/add', AddressController.addAddress);
router.put('/address/edit/:id', AddressController.updateAddress);
router.delete('/address/delete/:id', AddressController.deleteAddress);


router.get('/user/list', UserController.getAllUsers);
module.exports = router;