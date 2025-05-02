const express = require('express');
const multer = require("multer");
const router = express.Router();
const RoutesController = require('../controllers/Admin/routesController');
const { checkJWT, isAdmin } = require('../services/authCheck');
const { route } = require('./clientRoutes');
const ContacController = require('../controllers/Admin/contactController');
const TripsController = require('../controllers/Admin/tripsController');
const BusTypeController = require('../controllers/Admin/busTypeController');
const BusController = require('../controllers/Admin/busController');
/* const DriversController = require('../controllers/Admin/driversController'); */
const SeatsController = require('../controllers/Admin/seatsController');

const DriverController = require('../controllers/Admin/driverController');
const UserController = require('../controllers/Admin/userController');
const BlogController = require('../controllers/Admin/blogController');
const ReviewController = require('../controllers/Admin/reviewController');
const BookingController = require('../controllers/Admin/bookingController');
const upload = require('../config/upload');
//------------------[ ROUTES ]------------
router.get('/routes/list',RoutesController.get);
router.get('/routes/getId',RoutesController.getById);
router.post('/routes/add',RoutesController.create);
router.patch('/routes/update/:id',RoutesController.update);
router.delete('/routes/delete/:id',RoutesController.delete);

// router.post("/login", AuthController.login);

//------------------[ CONTACT ]-------------
router.get('/contact/list', ContacController.get);
router.get('/contact/getById/:id', ContacController.getById);
router.patch('/contact/update/:id', ContacController.update)
router.delete('/contact/:id', ContacController.delete);

//-----------------[ TRIPS ]-----------------
router.get('/trips/list', TripsController.get);
router.get('/trips/getById/:id', TripsController.getById);
router.post('/trips/add', TripsController.create);
router.patch('/trips/update/:id', TripsController.update);
router.delete('/trips/:id', TripsController.delete);

//-----------------[ BUSTYPES ]-----------------
router.get('/busType/list',BusTypeController.get);
router.get('/busType/getId/:id',BusTypeController.getById);
router.post('/busType/add',BusTypeController.create);
router.patch('/busType/update/:id',BusTypeController.update);
router.delete('/busType/delete/:id',BusTypeController.delete);

//-----------------[ BUS ]-----------------
router.get('/bus/list',BusController.get);
router.get('/bus/getId/:id',BusController.getById);
router.post('/bus/add',BusController.create);
router.patch('/bus/update/:id',BusController.update);
router.delete('/bus/delete/:id',BusController.delete);
router.get('/bus/getAllBusByStatusCreate', BusController.getAllBusByStatusCreate);
router.get('/bus/getAllByStatusEdit/:tripId', BusController.getAllByStatusEdit);

//-----------------[ DRIVERs ]-----------------
/* router.get('/drivers/list', DriversController.get); */

//-----------------[ SEATS ]-------------------
router.get('/seats/:busID', SeatsController.get);
router.put('/seats/:id', SeatsController.update);
//------------------[ DRIVER]-------------
router.get('/driver/list', DriverController.get);
router.get('/driver/getById/:id', DriverController.getById);
router.post('/driver/add', upload.single('image'), DriverController.create);
router.patch('/driver/update/:id', upload.single('image'), DriverController.update);
router.delete('/driver/:id', DriverController.delete);
router.get('/driver/getByStatusCreate', DriverController.getAllByStatusCreate);
router.get('/driver/getByStatusEdit/:tripId', DriverController.getAllByStatusEdit);

//------------------[ User]-------------
router.get('/user/list', UserController.get);
router.get('/user/getById/:id', UserController.getById);
router.post('/user/add', upload.single('image'), UserController.create);
router.patch('/user/update/:id', upload.single('image'), UserController.update);
router.delete('/user/:id', UserController.delete);

//------------------[ Blog ]-------------
router.get('/blog/list', BlogController.get);
router.get('/blog/getById/:id', BlogController.getById);
router.post('/blog/add', upload.single('image'), BlogController.create);
router.patch('/blog/update/:id', upload.single('image'), BlogController.update);
router.delete('/blog/:id', BlogController.delete);

//------------------[ Review ]-------------
router.get('/review/list', ReviewController.get);
router.get('/review/getById/:id', ReviewController.getById);
router.patch('/review/update/:id', upload.single('image'), ReviewController.update);
router.delete('/review/:id', ReviewController.delete);

//------------------[ Booking ]-------------
router.get('/booking/list', BookingController.get);
router.get('/booking/getById/:id', BookingController.getById);
router.patch('/booking/update/:id', upload.single('image'), BookingController.update);
router.delete('/booking/:id', BookingController.delete);

module.exports = router;