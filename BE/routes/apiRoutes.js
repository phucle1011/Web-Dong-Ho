const express = require('express');
const router = express.Router();
const getProvinces = require('../services/ApiRoutes').getProvinces;
const getDistricts = require('../services/ApiRoutes').getDistricts;
const getWards = require('../services/ApiRoutes').getWards;


//------------------[ API ROUTES ]------------------
router.get('/api/provinces', getProvinces);
router.get('/api/districts', getDistricts);
router.get('/api/wards', getWards);

module.exports = router;