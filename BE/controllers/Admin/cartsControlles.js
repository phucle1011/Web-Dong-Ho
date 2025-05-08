const { CartModel, ProductModel } = require('../../models/connectModel');

class CartController {
  // Lấy giỏ hàng theo user
  static async getCartByUser(req, res) {
    try {
      const { userId } = req.params;

      const cartItems = await CartModel.findAll({
        where: { user_id: userId },
        include: [
          {
            model: ProductModel,
            as: 'product',
            attributes: ['name', 'price']
          }
        ]
      });

      res.status(200).json({
        status: 200,
        message: "Lấy giỏ hàng thành công",
        data: cartItems
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // Thêm vào giỏ hàng
  static async addToCart(req, res) {
    try {
      const { user_id, product_id, quantity, price } = req.body;

      const existingItem = await CartModel.findOne({
        where: { user_id, product_id }
      });

      if (existingItem) {
        existingItem.quantity += quantity;
        existingItem.price = price;
        await existingItem.save();
        return res.status(200).json({ message: "Cập nhật giỏ hàng thành công", data: existingItem });
      }

      const cartItem = await CartModel.create({ user_id, product_id, quantity, price });
      res.status(201).json({ message: "Thêm vào giỏ hàng thành công", data: cartItem });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // Cập nhật số lượng
  static async updateQuantity(req, res) {
    try {
      const { id } = req.params;
      const { quantity } = req.body;

      const cartItem = await CartModel.findByPk(id);
      if (!cartItem) return res.status(404).json({ message: "Không tìm thấy mục trong giỏ hàng" });

      cartItem.quantity = quantity;
      await cartItem.save();
      res.status(200).json({ message: "Cập nhật số lượng thành công", data: cartItem });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // Xoá khỏi giỏ hàng
  static async deleteCartItem(req, res) {
    try {
      const { id } = req.params;
      const deleted = await CartModel.destroy({ where: { id } });
      if (!deleted) return res.status(404).json({ message: "Không tìm thấy mục để xoá" });
      res.status(200).json({ message: "Xoá khỏi giỏ hàng thành công" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = CartController;
