const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/Client/categoryController');
const BlogController = require('../controllers/Client/blogsController');
const ContactController = require('../controllers/Client/contactController');
const CartController = require('../controllers/Client/cartsController');
const ProductController = require('../controllers/Client/productController');

//------------------[ CLIENT ROUTES ]------------------

//------------------[ PRODUCTS ]------------------
router.get('/products/:id/variants', ProductController.getVariantsWithPromotion);

//------------------[ CATEGORY ]------------------
router.get("/category/list", categoryController.getCategories);

//------------------[ Blogs ]------------------
router.get('/blogs/search', BlogController.searchBlogs);
router.get('/blogs', BlogController.getAllBlogs);
router.get('/blogs/:id', BlogController.getBlogById);

//------------------[ Contact ]------------------
router.post("/contact", ContactController.sendContactEmail);

//------------------[ Cart ]------------------
router.get("/carts", CartController.getCartByUser);


module.exports = router;