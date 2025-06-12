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
const ShippingController = require('../controllers/Client/shippingController');
const { checkJWT } = require('../services/authCheck');

//------------------[ CLIENT ROUTES ]------------------

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

//------------------[ Promotions ]------------------
router.post('/promotions/apply', checkJWT, PromotionController.applyDiscount);
router.get('/promotions/active', checkJWT, PromotionController.getActivePromotions);


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
router.get("/orders", OrderController.get);
router.post("/orders", OrderController.create);
router.post("/orders-momo", OrderController.createMomoUrl);

//------------------[ SHIPPING ]------------------
router.post('/shipping/shipping-fee', ShippingController.calculateShippingFee);

//------------------[ AUTH ]------------------\
router.post('/auth/register', AuthController.register);
router.get('/auth/verify-email', AuthController.verifyEmail);
router.post('/auth/login', AuthController.login);

//------------------[ PRODUCTS ]------------------//
router.get('/products', ProductClientController.getAll);

router.get('/:id', ProductVariantController.getProductVariantDetail);
module.exports = router;