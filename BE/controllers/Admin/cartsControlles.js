const { CartModel,UserModel, ProductModel } = require('../../models/connectModel');

class CartController {

static async getAllCart(req, res) {
    try {
      const cartItems = await CartModel.findAll({
        include: [
          {
            model: ProductModel,
            as: 'product',
            attributes: ['name']
          },
          {
            model: UserModel,
            as: 'user',
            attributes: ['name', 'email']
          }
        ]
      });

      const formatted = cartItems.map(item => ({
        id: item.id,
        user_name: item.user?.name,
        user_email: item.user?.email,
        product_name: item.product?.name,
        quantity: item.quantity,
        price: item.price,
        total_price: item.total_price,
        created_at: item.created_at
      }));

      res.status(200).json({
        status: 200,
        message: "Lấy tất cả giỏ hàng thành công",
        data: formatted
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }


  static async getCartDetail(req, res) {
    try {
      const { id } = req.params;
  
      const cartItems = await CartModel.findAll({
        where: { id },
        include: [
          {
            model: ProductModel,
            as: 'product',
            attributes: ['name']
          },
          {
            model: UserModel,
            as: 'user',
            attributes: ['name', 'email']
          }
        ],
        attributes: [
          'id', 'user_id', 'product_id', 'quantity', 'price', 'total_price', 'created_at', 'updated_at'
        ]
      });
  
      if (!cartItems || cartItems.length === 0) {
        return res.status(404).json({ message: "Giỏ hàng không tìm thấy" });
      }
  
      const result = cartItems.map(item => ({
        ...item.toJSON(),
        user_email: item.user?.email || '',
        user_name: item.user?.name || '',
      }));
  
      res.status(200).json({
        status: 200,
        message: `Chi tiết giỏ hàng #${id} thành công`,
        data: result,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = CartController;
