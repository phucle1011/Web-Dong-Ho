const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/Admin/ordersController');

//------------------[ ADMIN ROUTES ]------------------

//------------------[ ORDERS ]------------------
router.get('/orders/list', OrderController.get);
router.get('/orders/:id', OrderController.getById); 
router.put('/orders/edit/:id', OrderController.update); 
router.delete("/orders/delete/:id", OrderController.delete);

module.exports = router;