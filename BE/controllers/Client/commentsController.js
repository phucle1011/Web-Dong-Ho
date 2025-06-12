// const CommentModel = require('../../models/commentsModel');
// const CommentImageModel = require('../../models/commentImagesModel');
// const OrderDetailModel = require('../../models/orderDetailsModel');
// const ProductVariantModel = require('../../models/productVariantsModel');
// const UserModel = require('../../models/usersModel');
// const cloudinary = require('../../utils/cloudinary'); // Đã cấu hình sẵn Cloudinary
// const Filter = require('bad-words');
// const nsfw = require('nsfwjs');
// const tf = require('@tensorflow/tfjs-node');
// const streamifier = require('streamifier');
// const fetch = require('node-fetch'); // nếu đang dùng Node <18

// let nsfwModel;
// (async () => {
//   nsfwModel = await nsfw.load();
// })();

// // Hàm upload Buffer lên Cloudinary
// function uploadToCloudinary(buffer) {
//   return new Promise((resolve, reject) => {
//     const stream = cloudinary.uploader.upload_stream(
//       { folder: 'comments' },
//       (error, result) => {
//         if (result) resolve(result);
//         else reject(error);
//       }
//     );
//     streamifier.createReadStream(buffer).pipe(stream);
//   });
// }

// class ClientCommentController {
//   static async addComment(req, res) {
//     try {
//       const {
//         user_id,
//         order_detail_id,
//         rating,
//         comment_text,
//         parent_id = null
//       } = req.body;

//       const images = req.files; // Dữ liệu từ multer.memoryStorage()

//       // Lọc từ ngữ không phù hợp
//       const filter = new Filter();
//       const cleanedComment = filter.clean(comment_text);
//       if (cleanedComment !== comment_text) {
//         return res.status(400).json({ success: false, message: 'Bình luận chứa từ ngữ không phù hợp.' });
//       }

//       // Tạo bình luận mới
//       const newComment = await CommentModel.create({
//         user_id,
//         order_detail_id,
//         parent_id,
//         rating,
//         comment_text: cleanedComment
//       });

//       // Xử lý ảnh nếu có
//       if (images && images.length > 0) {
//         for (const img of images) {
//           const result = await uploadToCloudinary(img.buffer);

//           // Phân tích NSFW
//           const imageBuffer = await fetch(result.secure_url).then(r => r.arrayBuffer());
//           const imageTensor = tf.node.decodeImage(new Uint8Array(imageBuffer), 3);
//           const predictions = await nsfwModel.classify(imageTensor);
//           imageTensor.dispose();

//           const isUnsafe = predictions.some(p => ['Porn', 'Hentai', 'Sexy'].includes(p.className) && p.probability > 0.6);

//           if (isUnsafe) {
//             // Xóa ảnh khỏi Cloudinary nếu vi phạm
//             await cloudinary.uploader.destroy(result.public_id);
//             continue;
//           }

//           // Lưu ảnh hợp lệ
//           await CommentImageModel.create({
//             comment_id: newComment.id,
//             image_url: result.secure_url
//           });
//         }
//       }

//       // Trả về toàn bộ bình luận liên quan
//       const productComments = await CommentModel.findAll({
//         attributes: ['id', 'user_id', 'order_detail_id', 'parent_id', 'rating', 'comment_text', 'created_at'],
//         include: [
//           {
//             model: OrderDetailModel,
//             as: 'orderDetail',
//             attributes: ['product_variant_id'],
//             include: [{
//               model: ProductVariantModel,
//               as: 'variant',
//               attributes: ['product_id']
//             }]
//           },
//           {
//             model: UserModel,
//             as: 'user',
//             attributes: ['id', 'name']
//           },
//           {
//             model: CommentImageModel,
//             as: 'commentImages',
//             attributes: ['id', 'image_url']
//           }
//         ],
//         order: [['created_at', 'DESC']]
//       });

//       return res.status(201).json({ success: true, message: 'Bình luận đã được gửi', data: productComments });
//     } catch (error) {
//       console.error('Error in addComment:', error);
//       return res.status(500).json({ success: false, message: 'Lỗi server khi gửi bình luận' });
//     }
//   }
// }

// module.exports = ClientCommentController;
