const CommentModel = require('../../models/commentsModel');
const UserModel = require('../../models/usersModel');
const ProductModel = require('../../models/productsModel');

class CommentController {
    static async getAllComments(req, res) {
        try {
            const comments = await CommentModel.findAll({
                attributes: [
                    'id',
                    'user_id',
                    'order_detail_id',
                    'parent_id',
                    'rating',
                    'comment_text',
                    'created_at',
                    'updated_at'
                ],
                include: [
                    { model: UserModel, as: 'user', attributes: ['id', 'name', 'email'] },
                    {
                        model: OrderDetailModel,
                        as: 'orderDetail',
                        attributes: ['id', 'order_id', 'product_variant_id', 'quantity', 'price'],
                        include: [
                            {
                                model: ProductVariantModel,
                                as: 'productVariant',
                                attributes: ['id', 'sku', 'price']
                            }
                        ]
                    },
                    {
                        model: CommentImageModel,
                        as: 'commentImages',
                        attributes: ['id', 'image_url']
                    }
                ],
                order: [['created_at', 'DESC']]
            });
            return res.status(200).json({ success: true, data: comments });
        } catch (error) {
            console.error('Error in getAllComments:', error);
            return res.status(500).json({ success: false, message: 'Lỗi server khi lấy danh sách bình luận' });
        }
    }
    static async getCommentById(req, res) {
        try {
            const { id } = req.params;
            const comment = await CommentModel.findByPk(id, {
                attributes: [
                    'id',
                    'user_id',
                    'order_detail_id',
                    'parent_id',
                    'rating',
                    'comment_text',
                    'created_at',
                    'updated_at'
                ],
                include: [
                    { model: UserModel, as: 'user', attributes: ['id', 'name', 'email'] },
                    {
                        model: OrderDetailModel,
                        as: 'orderDetail',
                        attributes: ['id', 'order_id', 'product_variant_id', 'quantity', 'price'],
                        include: [
                            {
                                model: ProductVariantModel,
                                as: 'productVariant',
                                attributes: ['id', 'sku', 'price'] 
                            }
                        ]
                    },
                    {
                        model: CommentImageModel,
                        as: 'commentImages',
                        attributes: ['id', 'image_url']
                    }
                ]
            });
            if (!comment) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy bình luận' });
            }
            return res.status(200).json({ success: true, data: comment });
        } catch (error) {
            console.error('Error in getCommentById:', error);
            return res.status(500).json({ success: false, message: 'Lỗi server khi lấy bình luận' });
        }
    }
    static async getCommentsByOrderDetail(req, res) {
        try {
            const { order_detail_id } = req.params;
            const comments = await CommentModel.findAll({
                where: { order_detail_id },
                attributes: [
                    'id',
                    'user_id',
                    'order_detail_id',
                    'parent_id',
                    'rating',
                    'comment_text',
                    'created_at',
                    'updated_at'
                ],
                include: [
                    { model: UserModel, as: 'user', attributes: ['id', 'name', 'email'] }
                ],
                order: [['created_at', 'DESC']]
            });
            return res.status(200).json({ success: true, data: comments });
        } catch (error) {
            console.error('Error in getCommentsByOrderDetail:', error);
            return res.status(500).json({ success: false, message: 'Lỗi server khi lấy bình luận theo order detail' });
        }
    }
    static async getChildComments(req, res) {
        try {
            const { parent_id } = req.params;
            const comments = await CommentModel.findAll({
                where: { parent_id },
                attributes: [
                    'id',
                    'user_id',
                    'order_detail_id',
                    'parent_id',
                    'rating',
                    'comment_text',
                    'created_at',
                    'updated_at'
                ],
                include: [
                    { model: UserModel, as: 'user', attributes: ['id', 'name', 'email'] }
                ],
                order: [['created_at', 'ASC']]
            });
            return res.status(200).json({ success: true, data: comments });
        } catch (error) {
            console.error('Error in getChildComments:', error);
            return res.status(500).json({ success: false, message: 'Lỗi server khi lấy bình luận con' });
        }
    }
    static async getCommentsByProductId(req, res) {
        try {
            const { product_id } = req.params;

            const comments = await CommentModel.findAll({
                attributes: [
                    'id',
                    'user_id',
                    'order_detail_id',
                    'parent_id',
                    'rating',
                    'comment_text',
                    'created_at',
                    'updated_at'
                ],
                include: [
                    {
                        model: OrderDetailModel,
                        as: 'orderDetail',
                        attributes: ['id', 'order_id', 'product_variant_id', 'quantity', 'price'],
                        include: [
                            {
                                model: ProductVariantModel,
                                as: 'productVariant',
                                attributes: ['id', 'sku', 'price', 'product_id'],
                                where: { product_id }
                            }
                        ]
                    },
                    {
                        model: UserModel,
                        as: 'user',
                        attributes: ['id', 'name', 'email']
                    },
                    {
                        model: CommentImageModel,
                        as: 'commentImages',
                        attributes: ['id', 'image_url']
                    }
                ],
                order: [['created_at', 'DESC']]
            });

            return res.status(200).json({ success: true, data: comments });
        } catch (error) {
            console.error('Error in getCommentsByProductId:', error);
            return res.status(500).json({ success: false, message: 'Lỗi server khi lấy bình luận theo sản phẩm' });
        }
    }
}

module.exports = CommentController;