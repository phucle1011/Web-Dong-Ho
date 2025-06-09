const express = require('express');
const router = express.Router();
const {
  getProvinces,
  getDistricts,
  getWards,
} = require('../services/ApiRoutes');

//------------------[ API ROUTES ]------------------
router.get('/api/provinces', getProvinces);
router.get('/api/districts', getDistricts); 
router.get('/api/wards', getWards); 
module.exports = router;