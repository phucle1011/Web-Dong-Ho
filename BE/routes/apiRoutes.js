const express = require('express');
const router = express.Router();
const getProvinces = require('../services/ApiRoutes').getProvinces;
const getDistricts = require('../services/ApiRoutes').getDistricts;
const getWards = require('../services/ApiRoutes').getWards;


//------------------[ API ROUTES ]------------------
router.get('/apiRoutes/provinces', getProvinces);
router.get('/apiRoutes/districts', getDistricts);
router.get('/apiRoutes/wards', getWards);

module.exports = router;