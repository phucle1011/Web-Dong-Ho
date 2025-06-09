const WishlistModel = require('../../models/wishlistsModel');
const ProductVariantsModel = require('../../models/productVariantsModel');
const ProductModel = require('../../models/productsModel');
const UserModel = require('../../models/usersModel');
const ProductVariantAttributeValueModel = require("../../models/productVariantAttributeValuesModel");
const ProductAttributeModel = require("../../models/productAttributesModel");
const VariantImageModel = require("../../models/variantImagesModel");


const { Op } = require('sequelize');

class WishlistController {

    // Lấy toàn bộ wishlist (có thể dùng ở admin để xem tổng quan wishlist hệ thống)
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

    // Lấy danh sách sản phẩm yêu thích của một người dùng
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
                        attributes: ['id', 'price', 'sku', 'stock'], // Thêm sku, stock nếu có
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
                                }]
                            },
                            {
                                model: VariantImageModel,
                                as: 'images',
                                attributes: ['image_url'],
                                required: false,
                            }
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
            res.status(500).json({ error: error.message });
        }
    }

    // Thêm sản phẩm vào danh sách yêu thích của người dùng
    static async addToWishlist(req, res) {
        try {
            const { userId, productVariantId } = req.body;

            // Kiểm tra xem sản phẩm đã có trong danh sách yêu thích của người dùng chưa
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
            res.status(500).json({ error: error.message });
        }
    }

    // Xóa sản phẩm khỏi danh sách yêu thích của người dùng
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
            res.status(500).json({ error: error.message });
        }
    }

    // Tìm kiếm (có thể tìm kiếm danh sách yêu thích của người dùng theo tên sản phẩm)
    static async searchWishlist(req, res) {
        try {
            const { searchTerm } = req.query;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;

            if (!searchTerm || searchTerm.trim() === '') {
                return res.status(400).json({ message: 'Vui lòng nhập từ khóa tìm kiếm.' });
            }

            const wishlists = await WishlistModel.findAndCountAll({
                where: {
                    user_id: userId
                },
                limit,
                offset,
                order: [['id', 'DESC']],
                include: [
                    {
                        model: ProductVariantsModel,
                        as: 'variant',
                        attributes: ['id', 'price', 'stock', 'sku'], // thêm stock, sku nếu cần
                        include: [
                            {
                                model: ProductModel,
                                as: 'product',
                                attributes: ['id', 'name', 'slug', 'thumbnail'],
                                where: {
                                    name: { [Op.like]: `%${searchTerm}%` }
                                },
                                required: true
                            },
                            {
                                model: ProductVariantAttributeValueModel,
                                as: 'attributeValues',
                                attributes: ['value'],
                                include: [
                                    {
                                        model: ProductAttributeModel,
                                        as: 'attribute',
                                        attributes: ['name']
                                    }
                                ]
                            },
                            {
                                model: VariantImageModel,
                                as: 'images',
                                attributes: ['image_url']
                            }
                        ]
                    },
                    {
                        model: UserModel,
                        as: 'user',
                        attributes: ['id', 'name', 'email']
                    }
                ],
                where: {
                    user_id: userId
                }
            });

            res.status(200).json({
                status: 200,
                message: "Lấy danh sách yêu thích của người dùng thành công",
                data: wishlists.rows,
                totalPages: Math.ceil(wishlists.count / limit),
                currentPage: page,
            });
        } catch (error) {
            console.error("Lỗi khi lấy danh sách yêu thích của người dùng:", error);
            res.status(500).json({ error: error.message });
        }
    }

    // Tìm kiếm sản phẩm yêu thích của người dùng cụ thể
    static async searchWishlistByUserProduct(req, res) {
        try {
            const { userId } = req.params;
            const { searchTerm } = req.query;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;

            if (!searchTerm || searchTerm.trim() === '') {
                return res.status(400).json({ message: 'Vui lòng nhập từ khóa tìm kiếm.' });
            }

            const wishlists = await WishlistModel.findAndCountAll({
                where: { user_id: userId },
                limit,
                offset,
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
                                where: {
                                    name: {
                                        [Op.like]: `%${searchTerm}%`,
                                    },
                                },
                                required: false
                            },
                        ],
                    },
                    {
                        model: UserModel,
                        as: 'user',
                        attributes: ['id', 'name', 'email'],
                    },
                ],
                where: {
                    [Op.and]: [
                        { user_id: userId },
                        { '$variant.product.name$': { [Op.like]: `%${searchTerm}%` } }
                    ]
                }
            });

            res.status(200).json({
                status: 200,
                message: `Tìm kiếm sản phẩm yêu thích của người dùng ${userId} thành công`,
                data: wishlists.rows,
                totalPages: Math.ceil(wishlists.count / limit),
                currentPage: page,
            });
        } catch (error) {
            console.error("Lỗi khi tìm kiếm sản phẩm yêu thích:", error);
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = WishlistController;