const axios = require('axios');

const API_TOKEN = '1f73c4c8-3184-11f0-b930-ca8d03ab5418';
const SHOP_ID = '5778611';

class ShippingController {

static async calculateShippingFee(req, res) {
  console.log('Dữ liệu nhận từ frontend:', req.body);

  try {
    const {
      from_district_id = 1542,
      to_district_id,
      to_ward_code,
      service_id,
      weight,
      length = 20,
      width = 15,
      height = 10,

      // 👇 Bỏ các field liên quan đến thông tin người nhận khi chỉ test phí
      // to_name, to_phone, to_address, required_note, items
    } = req.body;

    // Kiểm tra các trường bắt buộc để tính phí
    if (!to_district_id || !to_ward_code || !service_id || !weight) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bắt buộc để tính phí vận chuyển!'
      });
    }

    // Gọi API GHN để tính phí vận chuyển
    const { data } = await axios.post(
      'https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee', 
      {
        from_district_id,
        to_district_id,
        to_ward_code,
        service_id,
        weight,
        length,
        width,
        height,
        // Các tham số khác nếu cần
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Token': API_TOKEN,
          'ShopId': SHOP_ID
        }
      }
    );

    // Trả về kết quả phí vận chuyển
    return res.json({
      success: true,
      data: {
        total: data.data.total || 0,
        service_fee: data.data.service_fee || 0,
        insurance_fee: data.data.insurance_fee || 0,
        // Có thể trả thêm info khác nếu cần
      }
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
