const CartDetailModel = require('../../models/cartDetailsModel');
const UserModel = require('../../models/usersModel');
const ProductVariantModel = require('../../models/productVariantsModel');
const product = require('../../models/productsModel');
const { Op } = require('sequelize');

class CartController {
    static async getAllCart(req, res) {
        try {
            const { search } = req.query;
            let whereUser = {};
            let whereProduct = {};

            if (search) {
                whereUser = {
                    name: {
                        [Op.like]: `%${search}%`
                    }
                };

                whereProduct = {
                    name: {
                        [Op.like]: `%${search}%`
                    }
                };
            }

            const carts = await CartDetailModel.findAll({
                include: [
                    { 
                      model: UserModel, 
                      as: 'user', 
                      attributes: ['id', 'name', 'email'],
                      where: search ? whereUser : undefined
                    },
                    {
                        model: ProductVariantModel, 
                        as: 'productVariant', 
                        attributes: ['id', 'sku', 'price'],
                        include: {
                            model: product,
                            as: 'product',
                            attributes: ['name'],
                            where: search ? whereProduct : undefined
                        }
                    }
                ]
            });

            return res.status(200).json({ success: true, data: carts });
        } catch (error) {
            console.error('Error in CartController.getAllCart:', error);
            return res.status(500).json({ success: false, message: 'Lỗi server khi lấy giỏ hàng' });
        }
    }
}

 module.exports = CartController;