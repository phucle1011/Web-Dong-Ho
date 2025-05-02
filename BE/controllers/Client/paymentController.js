const axios = require('axios');
const crypto = require('crypto');
const PaymentModel = require('../../models/paymentModel');
const { BACKEND_URL }  = require ('../../config/url');

const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors({
  origin: `${BACKEND_URL}`,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));


class PaymentController {
    
    static async create(req, res) {
        try {
            const { bookingId, amount, paymentMethod, status } = req.body;

            const payment = await PaymentModel.create({
                bookingId,
                amount,
                paymentMethod,
                status
            });

            res.status(201).json({
                success: true,
                message: "Thanh toán thành công",
                data: payment
            });
        } catch (error) {
            console.error('Error in create:', error);
            res.status(500).json({ error: error.message });
        }
    }

    static async createMomoUrl(req, res) {
        try {
            const { amount, orderId } = req.body;
    
            console.log('Dữ liệu nhận từ frontend:', req.body);
    
            const bookingId = orderId || req.body.bookingId; 
    
            const paymentData = {
                bookingId, 
                amount: amount
            };
    
            if (!bookingId) {
                return res.status(400).json({ error: 'Không tìm thấy bookingId' });
            }
    
            console.log('Booking ID:', bookingId);
            console.log('Payment Data:', paymentData);
    
            const payment = await PaymentModel.create(paymentData);
    
            if (!payment) {
                return res.status(500).json({ error: 'Không thể lưu thông tin thanh toán' });
            }
    
            const endpoint = "https://test-payment.momo.vn/v2/gateway/api/create";
            const partnerCode = 'MOMOBKUN20180529';
            const accessKey = 'klm05TvNBzhg7h7j';
            const secretKey = 'at67qH6mk8w5Y1nAyMoYKMWACiEi2bsa';
            const orderInfo = "Thanh toán bằng momo";
            const redirectUrl = `${BACKEND_URL}/bus`;
            const ipnUrl = "http://127.0.0.1:8080/payment-notification"; 
            const requestId = Date.now().toString();
            const requestType = "payWithATM";
    
            const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
            const signature = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');
    
            const momoData = {
                partnerCode,
                partnerName: "Test",
                storeId: "MomoTestStore",
                requestId,
                amount,
                orderId,
                orderInfo,
                redirectUrl,
                ipnUrl,
                requestType,
                extraData: "",
                lang: 'vi',
                signature
            };
    
            console.log('Dữ liệu gửi lên MoMo:', momoData);
    
            const response = await axios.post(endpoint, momoData, { headers: { 'Content-Type': 'application/json' } });
            const result = response.data;
    
            console.log('Kết quả trả về từ MoMo:', result);
    
            if (result?.payUrl) {
                const paymentData = {
                    bookingId: orderId,
                    amount: amount,
                    paymentMethod: "MOMO",
                    status: "paid"
                };
            
                console.log('Dữ liệu thanh toán cần lưu:', paymentData);
            
                const payment = await PaymentModel.create(paymentData);
            
                if (!payment) {
                    return res.status(500).json({ error: "Không thể lưu dữ liệu thanh toán vào cơ sở dữ liệu" });
                }
            
                return res.json({ payUrl: result.payUrl });
            } else {
                return res.status(400).json({ error: "Không thể tạo URL thanh toán MoMo" });
            }
            
        } catch (error) {
            console.error('Lỗi trong quá trình thanh toán:', error);
            return res.status(500).json({ error: error.message });
        }
    }
    
}

module.exports = PaymentController;
