const WishlistModel = require('../../models/wishlistsModel');
const ProductVariantsModel = require('../../models/productVariantsModel');
const ProductModel = require('../../models/productsModel');
const UserModel = require('../../models/usersModel');
const ProductVariantAttributeValueModel = require("../../models/productVariantAttributeValuesModel");
const ProductAttributeModel = require("../../models/productAttributesModel");
const VariantImageModel = require("../../models/variantImagesModel");

const { Op } = require('sequelize');

class WishlistController {

    // Lấy toàn bộ wishlist (dành cho admin)
    static async getAllWishlists(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;

            const wishlists = await WishlistModel.findAndCountAll({
                limit: limit,
                offset: offset,
                order: [['id', 'DESC']],
                include: [
                    {
                        model: ProductVariantsModel,
                        as: 'variant',
                        attributes: ['id', 'price'],
                        include: [
                            {
                                model: ProductModel,
                                as: 'product',
                                attributes: ['id', 'name', 'slug', 'thumbnail'],
                            },
                        ],
                    },
                    {
                        model: UserModel,
                        as: 'user',
                        attributes: ['id', 'name', 'email'],
                    },
                ],
            });

            res.status(200).json({
                status: 200,
                message: "Lấy danh sách wishlist thành công",
                data: wishlists.rows,
                totalPages: Math.ceil(wishlists.count / limit),
                currentPage: page,
            });
        } catch (error) {
            console.error("Lỗi khi lấy toàn bộ wishlist:", error);
            res.status(500).json({ error: error.message });
        }
    }

    // Lấy danh sách yêu thích của một người dùng
    static async getWishlistByUser(req, res) {
        try {
            const { userId } = req.params;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;

            const wishlists = await WishlistModel.findAndCountAll({
                where: { user_id: userId },
                limit: limit,
                offset: offset,
                order: [['id', 'DESC']],
                include: [
                    {
                        model: ProductVariantsModel,
                        as: 'variant',
                        attributes: ['id', 'price', 'sku', 'stock'],
                        include: [
                            {
                                model: ProductModel,
                                as: 'product',
                                attributes: ['id', 'name', 'slug', 'thumbnail'],
                            },
                            {
                                model: ProductVariantAttributeValueModel,
                                as: 'attributeValues',
                                attributes: ['value'],
                                include: [{
                                    model: ProductAttributeModel,
                                    as: 'attribute',
                                    attributes: ['name'],
                                }],
                            },
                            {
                                model: VariantImageModel,
                                as: 'images',
                                attributes: ['image_url'],
                                required: false,
                            },
                        ],
                    },
                    {
                        model: UserModel,
                        as: 'user',
                        attributes: ['id', 'name', 'email', 'phone', 'avatar', 'status'],
                    },
                ],
            });

            res.status(200).json({
                status: 200,
                message: `Lấy danh sách yêu thích của người dùng ${userId} thành công`,
                data: wishlists.rows,
                totalPages: Math.ceil(wishlists.count / limit),
                currentPage: page,
            });
        } catch (error) {
            console.error("Lỗi khi lấy wishlist của người dùng:", error);
            res.status(500).json({ error: error.message });
        }
    }

    // Thêm sản phẩm vào danh sách yêu thích
    static async addToWishlist(req, res) {
        try {
            const { userId, productVariantId } = req.body;

            const existingWishlistItem = await WishlistModel.findOne({
                where: {
                    user_id: userId,
                    product_variant_id: productVariantId,
                },
            });

            if (existingWishlistItem) {
                return res.status(409).json({
                    status: 409,
                    message: 'Sản phẩm đã có trong danh sách yêu thích.',
                });
            }

            const newWishlistItem = await WishlistModel.create({
                user_id: userId,
                product_variant_id: productVariantId,
            });

            res.status(201).json({
                status: 201,
                message: 'Đã thêm sản phẩm vào danh sách yêu thích.',
                data: newWishlistItem,
            });
        } catch (error) {
            console.error("Lỗi khi thêm vào wishlist:", error);
            res.status(500).json({ error: error.message });
        }
    }

    // Xóa sản phẩm khỏi danh sách yêu thích
    static async removeFromWishlist(req, res) {
        try {
            const { userId, productVariantId } = req.params;

            const deletedRowCount = await WishlistModel.destroy({
                where: {
                    user_id: userId,
                    product_variant_id: productVariantId,
                },
            });

            if (deletedRowCount === 0) {
                return res.status(404).json({
                    status: 404,
                    message: 'Không tìm thấy sản phẩm trong danh sách yêu thích của người dùng.',
                });
            }

            res.status(200).json({
                status: 200,
                message: 'Đã xóa sản phẩm khỏi danh sách yêu thích.',
            });
        } catch (error) {
            console.error("Lỗi khi xóa khỏi wishlist:", error);
            res.status(500).json({ error: error.message });
        }
    }

    // Xóa toàn bộ danh sách yêu thích của người dùng
    static async clearWishlist(req, res) {
        try {
            const { userId } = req.params;

            const deletedRowCount = await WishlistModel.destroy({
                where: { user_id: userId },
            });

            if (deletedRowCount === 0) {
                return res.status(404).json({
                    status: 404,
                    message: 'Danh sách yêu thích của người dùng đã trống hoặc không tồn tại.',
                });
            }

            res.status(200).json({
                status: 200,
                message: 'Đã xóa toàn bộ danh sách yêu thích.',
            });
        } catch (error) {
            console.error("Lỗi khi xóa toàn bộ wishlist:", error);
            res.status(500).json({ error: error.message });
        }
    }

    // Thêm tất cả sản phẩm trong wishlist vào giỏ hàng
    static async addWishlistToCart(req, res) {
        try {
            const { userId } = req.params;

            // Lấy tất cả sản phẩm trong wishlist
            const wishlistItems = await WishlistModel.findAll({
                where: { user_id: userId },
                include: [
                    {
                        model: ProductVariantsModel,
                        as: 'variant',
                        attributes: ['id', 'stock'],
                    },
                ],
            });

            if (!wishlistItems.length) {
                return res.status(404).json({
                    status: 404,
                    message: 'Danh sách yêu thích trống.',
                });
            }

            const transaction = await WishlistModel.sequelize.transaction();
            try {
                const addedItems = [];
                const errors = [];

                for (const item of wishlistItems) {
                    const { product_variant_id: productVariantId, variant } = item;
                    const quantity = 1; // Mặc định thêm 1 sản phẩm

                    // Kiểm tra tồn kho
                    if (variant.stock < quantity) {
                        errors.push(`Sản phẩm ID ${productVariantId} không đủ tồn kho.`);
                        continue;
                    }

                    // Kiểm tra sản phẩm trong giỏ hàng
                    let cartItem = await CartModel.findOne({
                        where: {
                            user_id: userId,
                            product_variant_id: productVariantId,
                        },
                        transaction,
                    });

                    if (cartItem) {
                        cartItem.quantity += quantity;
                        await cartItem.save({ transaction });
                    } else {
                        cartItem = await CartModel.create({
                            user_id: userId,
                            product_variant_id: productVariantId,
                            quantity,
                        }, { transaction });
                    }

                    addedItems.push(cartItem);
                }

                if (errors.length > 0) {
                    await transaction.rollback();
                    return res.status(400).json({
                        status: 400,
                        message: 'Một số sản phẩm không thể thêm vào giỏ hàng.',
                        errors,
                        addedItems,
                    });
                }

                await transaction.commit();
                res.status(200).json({
                    status: 200,
                    message: 'Đã thêm tất cả sản phẩm từ wishlist vào giỏ hàng.',
                    data: addedItems,
                });
            } catch (error) {
                await transaction.rollback();
                throw error;
            }
        } catch (error) {
            console.error("Lỗi khi thêm wishlist vào giỏ hàng:", error);
            res.status(500).json({ error: error.message });
        }
    }

}

module.exports = WishlistController;