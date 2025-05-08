const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/Admin/ordersController');
const OrderHistoryController = require('../controllers/Admin/orderHistoryController');
const CommentController = require('../controllers/Admin/commentsController');

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


//------------------[ COMMENTS ]------------------\
router.get('/comment/list', CommentController.getAllComments);
router.get('/comment/:id', CommentController.getCommentById);





module.exports = router;