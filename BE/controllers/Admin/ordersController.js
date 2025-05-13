// const OrderModel = require('../../models/ordersModel');
// const OrderItemsModel = require('../../models/orderItemsModel');
// const ProductModel = require('../../models/productsModel');
// const UserModel = require('../../models/usersModel'); 
// const { Op } = require('sequelize');

// class OrderController {

//     static async get(req, res) {
//         try {
//             const orders = await OrderModel.findAll({
//                 order: [['created_at', 'DESC']],
//                 include: [
//                     {
//                         model: OrderItemsModel,
//                         as: 'orderDetails',
//                         attributes: ['quantity', 'price'],
//                         include: [
//                             {
//                                 model: ProductModel,
//                                 as: 'product',
//                                 attributes: ['name', 'discount_price']
//                             }
//                         ]
//                     },
//                     {
//                         model: UserModel,
//                         as: 'user',
//                         attributes: ['id', 'name', 'email', 'phone']
//                     }
//                 ]
//             });
    
//             const result = orders.map(order => {
//                 const orderData = order.toJSON();
//                 delete orderData.user_id;
//                 return orderData;
//             });
    
//             res.status(200).json({
//                 status: 200,
//                 message: "Lấy danh sách thành công",
//                 data: result,
//             });
//         } catch (error) {
//             res.status(500).json({ error: error.message });
//         }
//     }
    
//     static async getById(req, res) {
//         try {
//             const { id } = req.params;
//             const order = await OrderModel.findByPk(id, {
//                 include: [
//                     {
//                         model: OrderItemsModel,
//                         as: 'orderDetails',
//                         attributes: ['quantity', 'price'],
//                         include: [
//                             {
//                                 model: ProductModel,
//                                 as: 'product',
//                                 attributes: ['name', 'discount_price']
//                             }
//                         ]
//                     },
//                     {
//                         model: UserModel,
//                         as: 'user',
//                         attributes: ['id', 'name', 'email', 'phone']
//                     }
//                 ],
//             });
    
//             if (!order) {
//                 return res.status(404).json({ message: "Id không tồn tại" });
//             }
    
//             const orderData = order.toJSON();
//             delete orderData.user_id;
    
//             res.status(200).json({
//                 status: 200,
//                 data: orderData,
//             });
//         } catch (error) {
//             res.status(500).json({ error: error.message });
//         }
//     }     

//     static async update(req, res) {
//         try {
//             const { id } = req.params;
//             const {
//                 name,
//                 status,
//                 address,
//                 phone,
//                 email,
//                 total_price,
//                 payment_method_id
//             } = req.body;
    
//             const order = await OrderModel.findByPk(id);
//             if (!order) {
//                 return res.status(404).json({ message: "Id không tồn tại" });
//             }
    
//             // Chỉ cập nhật nếu có dữ liệu truyền vào
//             if (name !== undefined) order.name = name;
//             if (status !== undefined) order.status = status;
//             if (address !== undefined) order.address = address;
//             if (phone !== undefined) order.phone = phone;
//             if (email !== undefined) order.email = email;
//             if (total_price !== undefined) order.total_price = total_price;
//             if (payment_method_id !== undefined) order.payment_method_id = payment_method_id;
    
//             await order.save();
    
//             res.status(200).json({
//                 message: "Cập nhật thành công",
//                 order
//             });
//         } catch (error) {
//             res.status(500).json({ error: error.message });
//         }
//     }
    

//     static async delete(req, res) {
//         try {
//             const { id } = req.params;

//             const order = await OrderModel.findByPk(id);
//             if (!order) {
//                 return res.status(404).json({ message: "Id không tồn tại" });
//             }

//             if (order.status !== "Chờ xác nhận") {
//                 return res.status(400).json({ message: "Chỉ được xóa đơn hàng có trạng thái là 'Chờ xác nhận'" });
//             }

//             await order.destroy();

//             res.status(200).json({ message: "Xóa thành công" });
//         } catch (error) {
//             res.status(500).json({ error: error.message });
//         }
//     }
// }

// module.exports = OrderController;