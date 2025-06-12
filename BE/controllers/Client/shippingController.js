const axios = require('axios');

const API_TOKEN = '1f73c4c8-3184-11f0-b930-ca8d03ab5418';
const SHOP_ID = '5778611';

class ShippingController {

   static async calculateShippingFee(req, res) {
    try {
      const {
        from_district_id,   
        from_ward_code,
        to_district_id,    
        to_ward_code,        
        service_id,          
        weight,              
        length = 20,         
        width  = 20,        
        height = 15,         
        insurance_value = 0  
      } = req.body;

      if (!to_district_id || !to_ward_code || !service_id || !weight) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu thông tin bắt buộc!'
        });
      }

      const { data } = await axios.post(
        'https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee',
        {
          from_district_id,
          from_ward_code,
          to_district_id,
          to_ward_code,
          service_id,
          weight,
          length,
          width,
          height,
          insurance_value
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Token': API_TOKEN,
            'ShopId': SHOP_ID
          }
        }
      );

      return res.json({
        success: true,
        data: data.data    
      });
    } catch (err) {
      console.error('Lỗi GHN:', err.response?.data || err.message);
      return res.status(500).json({
        success: false,
        message: 'Lỗi hệ thống',
        error: err.response?.data || err.message
      });
    }
  }

}

module.exports = ShippingController;
