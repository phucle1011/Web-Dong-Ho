const CommentModel = require('../../models/commentsModel');
const CommentImageModel = require('../../models/commentImagesModel');
const OrderDetailModel = require('../../models/orderDetailsModel');
const ProductVariantModel = require('../../models/productVariantsModel');
const ProductModel = require('../../models/productsModel');
const UserModel = require('../../models/usersModel');

class ClientCommentController {
  // ===== 1. Gửi bình luận =====
static async addComment(req, res) {
  const t = await CommentModel.sequelize.transaction();
  try {
    const {
      user_id,
      order_detail_id,
      rating,
      comment_text,
      parent_id = null,
      images = []
    } = req.body;

    // 1. Tạo bình luận
    const newComment = await CommentModel.create({
      user_id,
      order_detail_id,
      parent_id,
      rating,
      comment_text
    }, { transaction: t });

    // 2. Nếu có ảnh thì lưu vào bảng comment_images
    if (images.length > 0) {
      const commentImages = images.map(url => ({
        comment_id: newComment.id,
        image_url: url
      }));

      await CommentImageModel.bulkCreate(commentImages, { transaction: t });
    }

    await t.commit();

    return res.status(201).json({
      success: true,
      message: 'Gửi bình luận thành công',
      data: newComment
    });

  } catch (error) {
    await t.rollback();
    console.error('Error in addComment:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi gửi bình luận'
    });
  }
}


  // ===== 2. Lấy bình luận theo product_id =====
static async getCommentsByProductId(req, res) {
  try {
    const { id } = req.params; 
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
          required: true,
          include: [
            {
              model: ProductVariantModel,
              as: 'variant',
              attributes: ['id', 'sku', 'price', 'product_id'],
              where: { product_id: id }, // chỉ lấy variant có product_id đúng
              required: true
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

module.exports = ClientCommentController;
