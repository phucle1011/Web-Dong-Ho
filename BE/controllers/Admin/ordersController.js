const OrderModel = require('../../models/ordersModel');
const OrderItemsModel = require('../../models/orderItemsModel');
const ProductModel = require('../../models/productsModel');
const { Op } = require('sequelize');

class OrderController {

    static async get(req, res) {
        try {
            const orders = await OrderModel.findAll({
                order: [['created_at', 'DESC']], 
                include: [
                    {
                        model: OrderItemsModel,
                        as: 'orderDetails',
                        attributes: ['quantity'],
                        include: [
                            {
                                model: ProductModel,
                                as: 'product',
                                attributes: ['name', 'discount_price']
                            }
                        ]
                    }
                ]
            });
            
            res.status(200).json({
                status: 200,
                message: "Lấy danh sách thành công",
                data: orders,
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    
    static async getById(req, res) {
        try {
            const { id } = req.params;
            const order = await OrderModel.findByPk(id, {
                include: [
                    {
                        model: OrderItemsModel,  
                        as: 'orderDetails',  
                        attributes: ['quantity'],
                        include: [
                            {
                                model: ProductModel, 
                                as: 'product', 
                                attributes: ['title', 'price'], 
                            },
                        ],
                    },
                ],
            });
    
            if (!order) {
                return res.status(404).json({ message: "Id không tồn tại" });
            }
    
            res.status(200).json({
                status: 200,
                data: order,
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    

    static async update(req, res) {
        try {
            const { id } = req.params;
            const {
                name,
                status,
                address,
                phone,
                email,
                total_price,
                payment_method_id
            } = req.body;
    
            const order = await OrderModel.findByPk(id);
            if (!order) {
                return res.status(404).json({ message: "Id không tồn tại" });
            }
    
            // Chỉ cập nhật nếu có dữ liệu truyền vào
            if (name !== undefined) order.name = name;
            if (status !== undefined) order.status = status;
            if (address !== undefined) order.address = address;
            if (phone !== undefined) order.phone = phone;
            if (email !== undefined) order.email = email;
            if (total_price !== undefined) order.total_price = total_price;
            if (payment_method_id !== undefined) order.payment_method_id = payment_method_id;
    
            await order.save();
    
            res.status(200).json({
                message: "Cập nhật thành công",
                order
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    

    static async delete(req, res) {
        try {
            const { id } = req.params;

            const order = await OrderModel.findByPk(id);
            if (!order) {
                return res.status(404).json({ message: "Id không tồn tại" });
            }

            if (order.status !== "Chờ xác nhận") {
                return res.status(400).json({ message: "Chỉ được xóa đơn hàng đang Chờ xác nhận" });
            }

            await order.destroy();

            res.status(200).json({ message: "Xóa thành công" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async searchOrder(req, res) {
        try {
          const { searchTerm } = req.query;
      
          if (!searchTerm || searchTerm.trim() === '') {
            return res.status(400).json({ message: 'Vui lòng cung cấp từ khóa tìm kiếm.' });
          }
      
          console.log("Từ khóa tìm kiếm:", searchTerm);
      
          const orders = await OrderModel.findAll({
            where: {
              [Op.or]: [
                { name: { [Op.like]: `%${searchTerm}%` } }  // Đổi lại đúng tên trường
              ]
            }
          });
      
          if (orders.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng nào.' });
          }
      
          const result = orders.map(order => ({
            ...order.dataValues
          }));
      
          return res.status(200).json({
            message: 'Tìm kiếm đơn hàng thành công',
            data: result
          });
      
        } catch (error) {
          console.error('Lỗi khi tìm kiếm đơn hàng:', error);
          return res.status(500).json({ message: 'Lỗi server' });
        }
      }
}

module.exports = OrderController;
