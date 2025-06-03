const express = require('express');
const router = express.Router();
const BlogController = require('../controllers/Client/blogsController');
const ContactController = require('../controllers/Client/contactController');

//------------------[ CLIENT ROUTES ]------------------

//------------------[ Blogs ]------------------
router.get('/blogs/search', BlogController.searchBlogs);
router.get('/blogs', BlogController.getAllBlogs);
router.get('/blogs/:id', BlogController.getBlogById);

//------------------[ Contact ]------------------
router.post("/contact", ContactController.sendContactEmail);
module.exports = router;