const WishlistModel = require('../../models/wishlistsModel');
const ProductVariantsModel = require('../../models/productVariantsModel');
const ProductModel = require('../../models/productsModel');
const UserModel = require('../../models/usersModel');
const ProductVariantAttributeValueModel = require("../../models/productVariantAttributeValuesModel");
const ProductAttributeModel = require("../../models/productAttributesModel");
const VariantImageModel = require("../../models/variantImagesModel");
const { Op, fn, col } = require('sequelize');


class WishlistController {

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

    static async searchWishlist(req, res) {
        try {
            const { searchTerm = '' } = req.query;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;

            if (!searchTerm.trim()) {
                return this.getAllWishlists(req, res);
            }

            const whereClause = {
                [Op.or]: [
                    { '$user.name$': { [Op.like]: `%${searchTerm}%` } },
                    { '$variant.product.name$': { [Op.like]: `%${searchTerm}%` } }
                ]
            };

            const wishlists = await WishlistModel.findAndCountAll({
                where: whereClause,
                limit,
                offset,
                order: [['id', 'DESC']],
                include: [
                    {
                        model: ProductVariantsModel,
                        as: 'variant',
                        attributes: ['id', 'price'],
                        include: [{
                            model: ProductModel,
                            as: 'product',
                            attributes: ['id', 'name', 'slug', 'thumbnail']
                        }]
                    },
                    {
                        model: UserModel,
                        as: 'user',
                        attributes: ['id', 'name', 'email']
                    }
                ],
                subQuery: false
            });

            res.status(200).json({
                status: 200,
                message: "Tìm kiếm wishlist thành công",
                data: wishlists.rows,
                totalPages: Math.ceil(wishlists.count / limit),
                currentPage: page
            });
        } catch (error) {
            console.error("Lỗi khi tìm kiếm wishlist:", error);
            res.status(500).json({ error: error.message });
        }
    }

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

    static async getMostFavoritedVariants(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 5;
            const variants = await WishlistModel.findAll({
                attributes: [
                    'product_variant_id',
                    [fn('COUNT', col('product_variant_id')), 'favoriteCount'],
                ],
                include: [
                    {
                        model: ProductVariantsModel,
                        as: 'variant',
                        attributes: ['id', 'sku', 'price'],
                        include: [
                            {
                                model: ProductModel,
                                as: 'product',
                                attributes: ['id', 'name', 'thumbnail'],
                            },
                        ],
                    },
                ],
                group: ['product_variant_id', 'variant.id', 'variant->product.id'],
                order: [[fn('COUNT', col('product_variant_id')), 'DESC']],
                limit: limit,
                raw: true,
                nest: true,
            });

            res.status(200).json({
                status: 200,
                message: 'Lấy danh sách sản phẩm biến thể yêu thích nhiều nhất thành công',
                data: variants,
            });
        } catch (error) {
            console.error("Lỗi khi lấy thống kê sản phẩm yêu thích:", error);
            res.status(500).json({ error: error.message });
        }
    }

    static async getRecentlyFavoritedVariants(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 5;
            const variants = await WishlistModel.findAll({
                limit: limit,
                order: [['created_at', 'DESC']],
                include: [
                    {
                        model: ProductVariantsModel,
                        as: 'variant',
                        attributes: ['id', 'sku', 'price'],
                        include: [
                            {
                                model: ProductModel,
                                as: 'product',
                                attributes: ['id', 'name', 'thumbnail'],
                            },
                        ],
                    },
                    {
                        model: UserModel,
                        as: 'user',
                        attributes: ['id', 'name'],
                    },
                ],
                raw: true,
                nest: true,
            });

            res.status(200).json({
                status: 200,
                message: 'Lấy danh sách sản phẩm biến thể được yêu thích gần đây thành công',
                data: variants,
            });
        } catch (error) {
            console.error("Lỗi khi lấy sản phẩm yêu thích gần đây:", error);
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = WishlistController;