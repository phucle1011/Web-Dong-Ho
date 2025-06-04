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

//------------------[ Promotions ]------------------
router.post('/promotions/apply', PromotionController.applyDiscount);


//------------------[ Products Compaire ]------------------
router.get("/products/compare", ProductCompaireController.getAllForComparison);

//------------------[ ADDRESS ]------------------\
router.get('/address/list', AddressController.getAllAddress);
router.get('/address/user/:id', AddressController.getAddressesByUser);
router.delete('/user/:userId/addresses/:id', AddressController.deleteAddress);
router.put('/user/:userId/addresses/:id', AddressController.updateAddress);
router.post('/user/:userId/addresses', AddressController.addAddress);



//------------------[ Cart ]------------------
router.get("/carts", CartController.getCartByUser);
router.post("/add-to-carts", CartController.addToCart);
router.put("/update-to-carts/:userId/:productVariantId", CartController.updateCartItem);
router.delete("/delete-to-carts/:userId/:productVariantId", CartController.removeCartItem);
router.delete("/clear-cart/:userId", CartController.clearCartByUser);

module.exports = router;