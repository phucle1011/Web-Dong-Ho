const CommentModel = require('../../models/commentsModel');
const CommentImageModel = require('../../models/commentImagesModel');
const OrderDetailModel = require('../../models/orderDetailsModel');
const ProductVariantModel = require('../../models/productVariantsModel');
const ProductModel = require('../../models/productsModel');
const UserModel = require('../../models/usersModel');
const axios = require("axios");
const checkImageModeration = async (imageUrl) => {
  try {
    const response = await axios.get("https://api.sightengine.com/1.0/check.json", {
      params: {
        url: imageUrl,
        models: "nudity,wad,offensive",
        api_user: process.env.SIGHTENGINE_USER,     // 👈 bạn cần set trong .env
        api_secret: process.env.SIGHTENGINE_SECRET, // 👈 bạn cần set trong .env
      },
    });

    const result = response.data;

    const isNude = result.nudity?.safe < 0.85;
    const isWeapon = result.weapon > 0.5;
    const isOffensive = result.offensive?.prob > 0.5;

    if (isNude || isWeapon || isOffensive) {
      return { valid: false, reason: result };
    }

    return { valid: true, reason: result };
  } catch (err) {
    console.error("Lỗi kiểm duyệt ảnh:", err.message);
    return { valid: false, reason: "Lỗi kiểm duyệt ảnh" };
  }
};
class ClientCommentController {
  // ===== 1. Gửi bình luận =====
static async addComment(req, res) {
  const t = await CommentModel.sequelize.transaction();
  try {
    const {
      user_id, // 👈 Lấy trực tiếp từ FE
      order_detail_id,
      rating,
      comment_text,
      parent_id = null,
      images = []
    } = req.body;

    if (!user_id) {
      await t.rollback();
      return res.status(401).json({ success: false, message: "Thiếu user_id" });
    }

    const [results] = await CommentModel.sequelize.query(
      'SELECT id FROM comments WHERE user_id = ? AND order_detail_id = ? LIMIT 1',
      {
        replacements: [user_id, order_detail_id],
        type: CommentModel.sequelize.QueryTypes.SELECT,
        transaction: t
      }
    );

    if (results && results.id) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "Bạn đã đánh giá sản phẩm này rồi."
      });
    }

    // ✅ Kiểm duyệt ảnh bằng Sightengine
    if (images.length > 0) {
      for (const imageUrl of images) {
        const result = await checkImageModeration(imageUrl);
        if (!result.valid) {
          await t.rollback();
          return res.status(400).json({
            success: false,
            message: "Ảnh không phù hợp. Vui lòng chọn ảnh khác.",
            reason: result.reason,
          });
        }
      }
    }

    const newComment = await CommentModel.create({
      user_id,
      order_detail_id,
      parent_id,
      rating,
      comment_text
    }, { transaction: t });

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
