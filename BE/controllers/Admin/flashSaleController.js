const NotificationModel = require("../../models/notificationsModel");

const FlashSaleModel = require("../../models/FlashSaleModel");
const PromotionModel = require("../../models/promotionsModel");
const PromotionProductModel = require("../../models/promotionProductsModel");

const { Op, fn, col,literal  } = require("sequelize");

class FlashSaleController {
  // ✅ Lấy tất cả flash sale đang hoạt động
static async getAll(req, res) {
  try {
    const now = new Date();

    const notifications = await NotificationModel.findAll({
      include: [
        {
          model: FlashSaleModel,
          as: "flashSale", // ✅ alias mới: flash_sales
          include: [
            {
              model: PromotionModel,
              as: "promotion",
            //  "" where: {
            //     start_date: { [Op.lte]: now },
            //     end_date: { [Op.gte]: now }
            //   },"",
              required: true
            }
          ]
        }
      ],
      order: [["id", "DESC"]]
    });

    res.status(200).json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách notification:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi máy chủ"
    });
  }
}




  // ✅ Tạo flash sale mới (xóa bản cũ nếu có)
 static async create(req, res) {
  try {
    // Nhận promotion_id có thể là số hoặc mảng số
    let { promotion_id, thumbnail, title, start_date, end_date, status } = req.body;

    if (!promotion_id || !thumbnail || !title || !start_date || !end_date) {
      return res
        .status(400)
        .json({ success: false, message: "Thiếu thông tin cần thiết." });
    }

    // Chuẩn hoá promotionIds thành mảng
    const promotionIds = Array.isArray(promotion_id)
      ? promotion_id
      : [promotion_id];

    // Kiểm tra format và loại bỏ các phần tử không phải số
    const validIds = promotionIds
      .map(id => parseInt(id, 10))
      .filter(id => !isNaN(id));

    if (!validIds.length) {
      return res
        .status(400)
        .json({ success: false, message: "promotion_id không hợp lệ." });
    }

    // Tạo notification mới
    const notification = await NotificationModel.create({
  thumbnail,
  title,
  status, // nếu không có thì mặc định là 1
  start_date,
  end_date
});


    // Duyệt từng promotion_id
    const createdFlashSales = [];
    for (const pid of validIds) {
      // Kiểm tra đã tồn tại flash_sale cho promotion này chưa
      const exists = await FlashSaleModel.findOne({
        where: { promotion_id: pid }
      });
      if (exists) {
        // Bỏ qua nếu đã có
        continue;
      }
      // Tạo mới
      const fs = await FlashSaleModel.create({
        promotion_id: pid,
        notification_id: notification.id
      });
      createdFlashSales.push(fs);
    }

    if (!createdFlashSales.length) {
      return res.status(409).json({
        success: false,
        message: "Không có flash sale nào được tạo vì tất cả đã tồn tại."
      });
    }

    // Trả về mảng kết quả
    res.status(201).json({ success: true, data: createdFlashSales });
  } catch (error) {
    console.error("Lỗi khi tạo flash sale:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
}



  // ✅ Xoá flash sale theo ID
  static async delete(req, res) {
    const { id } = req.params;
    try {
      const flashSale = await FlashSaleModel.findByPk(id);
      if (!flashSale) {
        return res
          .status(404)
          .json({ success: false, message: "Không tìm thấy flash sale." });
      }

      // Xoá luôn thông báo liên quan nếu có
      if (flashSale.notification_id) {
        await NotificationModel.destroy({
          where: { id: flashSale.notification_id },
        });
      }

      await flashSale.destroy();

      res
        .status(200)
        .json({ success: true, message: "Xóa flash sale thành công." });
    } catch (error) {
      console.error("Lỗi khi xóa flash sale:", error);
      res
        .status(500)
        .json({ success: false, message: "Lỗi máy chủ khi xóa flash sale." });
    }
  }

 static async getActiveProductPromotions(req, res) {
  try {
    const promotions = await PromotionModel.findAll({
      where: {
        applicable_to: "product",
        status: ["active", "upcoming"],
        "$flashSale.id$": null, // lọc ra các promotion KHÔNG nằm trong flashSale
      },
      attributes: {
        include: [
          [fn("COUNT", col("promotionProducts.product_variant_id")), "variant_count"]
        ],
      },
      include: [
        {
          model: PromotionProductModel,
          as: "promotionProducts",
          attributes: [],
        },
        {
          model: FlashSaleModel,
          as: "flashSale",
          required: false, // LEFT JOIN để có thể lọc NULL
          attributes: [],
        },
      ],
      group: ["Promotion.id"],
      order: [["created_at", "DESC"]],
    });

    res.status(200).json({
      success: true,
      data: promotions,
    });
  } catch (error) {
    console.error("Lỗi khi lấy khuyến mãi sản phẩm:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi máy chủ.",
    });
  }
}
}

module.exports = FlashSaleController;
