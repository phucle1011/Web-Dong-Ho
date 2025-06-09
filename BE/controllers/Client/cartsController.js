const CartModel = require('../../models/cartDetailsModel');
const ProductVariantsModel = require('../../models/productVariantsModel');
const ProductVariantAttributeValuesModel = require('../../models/productVariantAttributeValuesModel');
const VariantImageModel = require("../../models/variantImagesModel");
const ProductAttribute = require("../../models/productAttributesModel");

const { Op } = require('sequelize');

class CartController {
    static async getCartByUser(req, res) {
        try {
            const userId = req.query.userId;

            const count = await CartModel.sum('quantity', { where: { user_id: userId } });

            const cartItems = await CartModel.findAll({
                where: { user_id: userId },
                include: [
                    {
                        model: ProductVariantsModel,
                        as: 'variant',
                        attributes: ['id', 'price', 'stock', 'sku'],
                        include: [
                            {
                                model: VariantImageModel,
                                as: 'images',
                                attributes: ['image_url'],
                                required: false
                            },
                            {
                                model: ProductVariantAttributeValuesModel,
                                as: "attributeValues",
                                include: [
                                    {
                                        model: ProductAttribute,
                                        as: "attribute",
                                    },
                                ],
                            }
                        ]
                    }
                ],
                order: [['id', 'DESC']]
            });

            res.status(200).json({
                status: 200,
                message: `Lấy giỏ hàng của người dùng ${userId} thành công`,
                data: cartItems,
                count
            });
        } catch (error) {
            console.error("Lỗi khi lấy giỏ hàng:", error);
            res.status(500).json({
                status: 500,
                message: "Lỗi máy chủ",
                error: error.message
            });
        }

    }

    static async addToCart(req, res) {
        try {
            const { userId, productVariantId, quantity } = req.body;

            let cartItem = await CartModel.findOne({
                where: {
                    user_id: userId,
                    product_variant_id: productVariantId
                }
            });

            if (cartItem) {
                cartItem.quantity += quantity;
                await cartItem.save();
            } else {
                cartItem = await CartModel.create({
                    user_id: userId,
                    product_variant_id: productVariantId,
                    quantity
                });
            }

            const fullCartItem = await CartModel.findOne({
                where: { id: cartItem.id },
                include: [
                    {
                        model: ProductVariantsModel,
                        as: 'variant',
                        attributes: ['id', 'price', 'stock', 'sku'],
                        include: [
                            {
                                model: VariantImageModel,
                                as: 'images',
                                attributes: ['image_url'],
                                required: false
                            },
                            {
                                model: ProductVariantAttributeValuesModel,
                                as: "attributeValues",
                                include: [
                                    {
                                        model: ProductAttribute,
                                        as: "attribute",
                                    },
                                ],
                            }
                        ]
                    }
                ]
            });

            return res.status(200).json({
                status: 200,
                message: 'Thêm vào giỏ hàng thành công',
                data: fullCartItem
            });
        } catch (error) {
            console.error("Lỗi khi thêm vào giỏ hàng:", error);
            res.status(500).json({
                status: 500,
                message: "Lỗi máy chủ",
                error: error.message
            });
        }
    }

    static async updateCartItem(req, res) {
        try {
            const { userId, productVariantId } = req.params;
            const { quantity } = req.body;

            const item = await CartModel.findOne({
                where: {
                    user_id: userId,
                    product_variant_id: productVariantId
                }
            });

            if (!item) {
                return res.status(404).json({
                    status: 404,
                    message: "Không tìm thấy sản phẩm trong giỏ hàng"
                });
            }

            item.quantity = quantity;
            await item.save();

            const fullItem = await CartModel.findOne({
                where: { id: item.id },
                include: [
                    {
                        model: ProductVariantsModel,
                        as: 'variant',
                        attributes: ['id', 'price', 'stock', 'sku'],
                        include: [
                            {
                                model: VariantImageModel,
                                as: 'images',
                                attributes: ['image_url'],
                                required: false
                            },
                            {
                                model: ProductVariantAttributeValuesModel,
                                as: "attributeValues",
                                include: [
                                    {
                                        model: ProductAttribute,
                                        as: "attribute",
                                    },
                                ],
                            }
                        ]
                    }
                ]
            });

            res.status(200).json({
                status: 200,
                message: 'Cập nhật số lượng thành công',
                data: fullItem
            });
        } catch (error) {
            console.error("Lỗi khi cập nhật giỏ hàng:", error);
            res.status(500).json({
                status: 500,
                message: "Lỗi máy chủ",
                error: error.message
            });
        }
    }

    static async removeCartItem(req, res) {
        try {
            const { userId, productVariantId } = req.params;

            const deleted = await CartModel.destroy({
                where: {
                    user_id: userId,
                    product_variant_id: productVariantId
                }
            });

            if (!deleted) {
                return res.status(404).json({
                    status: 404,
                    message: "Không tìm thấy sản phẩm trong giỏ hàng để xóa"
                });
            }

            const remainingItems = await CartModel.findAll({
                where: { user_id: userId },
                include: [
                    {
                        model: ProductVariantsModel,
                        as: 'variant',
                        attributes: ['id', 'price', 'stock', 'sku'],
                        include: [
                            {
                                model: VariantImageModel,
                                as: 'images',
                                attributes: ['image_url'],
                                required: false
                            },
                            {
                                model: ProductVariantAttributeValuesModel,
                                as: "attributeValues",
                                include: [
                                    {
                                        model: ProductAttribute,
                                        as: "attribute",
                                    },
                                ],
                            }
                        ]
                    }
                ],
                order: [['id', 'DESC']]
            });

            res.status(200).json({
                status: 200,
                message: 'Xóa sản phẩm khỏi giỏ hàng thành công',
                data: remainingItems
            });
        } catch (error) {
            console.error("Lỗi khi xóa sản phẩm:", error);
            res.status(500).json({
                status: 500,
                message: "Lỗi máy chủ",
                error: error.message
            });
        }
    }

    static async clearCartByUser(req, res) {
        try {
            const { userId } = req.params;

            const deleted = await CartModel.destroy({
                where: {
                    user_id: userId
                }
            });

            res.status(200).json({
                status: 200,
                message: `Đã xóa toàn bộ giỏ hàng của người dùng ${userId}`,
                deletedCount: deleted
            });
        } catch (error) {
            console.error("Lỗi khi xóa toàn bộ giỏ hàng:", error);
            res.status(500).json({
                status: 500,
                message: "Lỗi máy chủ",
                error: error.message
            });
        }
    }

}

module.exports = CartController;
