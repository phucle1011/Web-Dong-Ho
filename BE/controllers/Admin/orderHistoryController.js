const OrderModel = require('../../models/ordersModel');
const OrderItemsModel = require('../../models/orderItemsModel');
const ProductModel = require('../../models/productsModel');
const UserModel = require('../../models/usersModel'); 
const { Op } = require('sequelize');

class OrderHistory {

    static async get(req, res) {
        try {
            const orders = await OrderModel.findAll({
                where: {
                    status: 'Đã giao hàng thành công'
                },
                order: [['created_at', 'DESC']],
                include: [
                    {
                        model: OrderItemsModel,
                        as: 'orderDetails',
                        attributes: ['quantity', 'price'],
                        include: [
                            {
                                model: ProductModel,
                                as: 'product',
                                attributes: ['name', 'discount_price']
                            }
                        ]
                    },
                    {
                        model: UserModel,
                        as: 'user',
                        attributes: ['id', 'name', 'email', 'phone']
                    }
                ]
            });
    
            const result = orders.map(order => {
                const orderData = order.toJSON();
                delete orderData.user_id;
                return orderData;
            });
    
            res.status(200).json({
                status: 200,
                message: "Lấy danh sách thành công",
                data: result,
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }     
    
    static async getById(req, res) {
        try {
            const { id } = req.params;
    
            const order = await OrderModel.findOne({
                where: {
                    id: id,
                    status: 'Đã giao hàng thành công'
                },
                include: [
                    {
                        model: OrderItemsModel,
                        as: 'orderDetails',
                        attributes: ['quantity', 'price'],
                        include: [
                            {
                                model: ProductModel,
                                as: 'product',
                                attributes: ['name', 'discount_price']
                            }
                        ]
                    },
                    {
                        model: UserModel,
                        as: 'user',
                        attributes: ['id', 'name', 'email', 'phone']
                    }
                ]
            });
    
            if (!order) {
                return res.status(404).json({ message: "Đơn hàng không tồn tại hoặc không ở trạng thái 'Đã giao hàng thành công'" });
            }
    
            const orderData = order.toJSON();
            delete orderData.user_id;
    
            res.status(200).json({
                status: 200,
                data: orderData,
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }    
}

module.exports = OrderHistory;