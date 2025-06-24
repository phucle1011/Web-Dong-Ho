const CommentModel = require('../../models/commentsModel');
const UserModel = require('../../models/usersModel');
const ProductModel = require('../../models/productsModel');
const OrderDetailModel = require('../../models/orderDetailsModel');
const ProductVariantModel = require('../../models/productVariantsModel');
const CommentImageModel = require('../../models/commentImagesModel');

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
                                as: 'variant',
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
                                as: 'variant',
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
        const { id } = req.params; // id ở đây là product_id

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
                            as: 'variant',
                            attributes: ['id', 'sku', 'price', 'product_id'],
                            where: { product_id: id } 
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
static async replyComment(req, res) {
  try {
    const { parent_id, comment_text } = req.body;

    if (!parent_id || !comment_text) {
      return res.status(400).json({
        success: false,
        message: "Thiếu parent_id hoặc nội dung trả lời.",
      });
    }

    // Lấy comment gốc kèm theo các quan hệ liên quan
    const parentComment = await CommentModel.findByPk(parent_id, {
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
          required: true,
          include: [
            {
              model: ProductVariantModel,
              as: 'variant',
              attributes: ['id', 'sku', 'price', 'product_id'],
              required: true,
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
      ]
    });

    if (!parentComment) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bình luận gốc.",
      });
    }

    // Dùng user_id đại diện cho admin, hoặc bạn có thể để null nếu cần
    const adminUserId = 1;

    // Tạo bình luận trả lời
    const reply = await CommentModel.create({
      user_id: adminUserId,
      order_detail_id: parentComment.order_detail_id,
      parent_id,
      rating: 0,
      comment_text,
    });

    return res.status(201).json({
      success: true,
      message: "Trả lời bình luận thành công.",
      data: reply,
    });

  } catch (error) {
    console.error("Lỗi trả lời bình luận:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi trả lời bình luận.",
    });
  }
}


  }



module.exports = CommentController;