const axios = require('axios');
const API_TOKEN = "e0c711d8-e3a7-11ef-9022-7e9c01851c55";

exports.getProvinces = async (req, res) => {
  try {
    const response = await axios.get("https://online-gateway.ghn.vn/shiip/public-api/master-data/province", {
      headers: { "Token": API_TOKEN }
    });

    const data = response.data; 

    if (data.code === 200) {
      console.log("Tỉnh thành phố được lấy:", data.data);
      res.json(data.data);  
    } else {
      res.status(data.code).json({
        message: 'Lỗi khi lấy danh sách tỉnh',
        details: data.message
      });
    }
  } catch (error) {
    res.status(500).json({
      message: 'Có lỗi xảy ra khi kết nối đến API.',
      details: error.message
    });
  }
};

exports.getDistricts = async (req, res) => {
  const provinceID = req.query.provinceId;
  if (!provinceID) {
    return res.status(400).json({
      message: 'ProvinceID là bắt buộc!',
      details: 'Thiếu provinceID trong yêu cầu.'
    });
  }

  try {
    const response = await axios.get(`https://online-gateway.ghn.vn/shiip/public-api/master-data/district?province_id=${provinceID}`, {
      headers: { "Token": API_TOKEN }
    });

    const data = response.data;

    if (data.code === 200) {
      console.log("Quận huyện được lấy cho tỉnh", provinceID, ":", data.data);
      res.json(data.data);  
    } else {
      res.status(data.code).json({
        message: 'Lỗi khi lấy danh sách quận huyện',
        details: data.message
      });
    }
  } catch (error) {
    res.status(500).json({
      message: 'Có lỗi xảy ra khi kết nối đến API.',
      details: error.message
    });
  }
};


exports.getWards = async (req, res) => {
  try {
    const districtID = req.query.districtId;  
    if (!districtID) {
      return res.status(400).json({ message: 'Thiếu district_id' });
    }

    const response = await axios.get(`https://online-gateway.ghn.vn/shiip/public-api/master-data/ward?district_id=${districtID}`, {
      headers: { "Token": API_TOKEN }
    });

    const data = response.data;

    if (data.code === 200) {
      console.log("Phường xã được lấy cho quận huyện", districtID, ":", data.data);
      res.json(data.data);  
    } else {
      res.status(data.code).json({
        message: 'Lỗi khi lấy danh sách phường xã',
        details: data.message
      });
    }
  } catch (error) {
    console.error("Lỗi khi lấy phường xã:", error.message);
    res.status(500).json({
      message: 'Có lỗi xảy ra khi kết nối đến API.',
      details: error.message
    });
  }
};



