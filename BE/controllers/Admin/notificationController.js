const { Op } = require('sequelize');
const Notification = require('../../models/notificationsModel');

class NotificationController {
  // Lấy danh sách notifications với bộ lọc
// In NotificationController.js
static async getNotifications(req, res) {
  try {
    const {
      user_id,
      type,
      read,
      keyword,
      created_from,
      created_to,
      page = 1,
      limit = 10
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    if (user_id) where.user_id = user_id;
    if (type) where.type = type;
    if (read === 'true') where.read_at = { [Op.not]: null };
    if (read === 'false') where.read_at = null;
    if (created_from || created_to) {
      where.created_at = {};
      if (created_from) where.created_at[Op.gte] = new Date(created_from);
      if (created_to) where.created_at[Op.lte] = new Date(created_to);
    }
    if (keyword) {
      where[Op.or] = [
        { type: { [Op.like]: `%${keyword}%` } },
        // For JSON fields, use JSON path queries if supported (e.g., PostgreSQL)
        // For MySQL, consider extracting fields to columns or using a full-text index
        { '$data.title$': { [Op.like]: `%${keyword}%` } },
        { '$data.message$': { [Op.like]: `%${keyword}%` } }
      ];
    }

    const { count, rows } = await Notification.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    return res.json({ total: count, notifications: rows });
  } catch (err) {
    return res.status(500).json({ message: 'Lỗi lấy danh sách thông báo', error: err.message });
  }
}

  // Lấy chi tiết một notification
  static async getNotificationById(req, res) {
    try {
      const { id } = req.params;
      const notification = await Notification.findByPk(id);

      if (!notification) {
        return res.status(404).json({ message: 'Không tìm thấy thông báo' });
      }

      return res.json(notification);
    } catch (err) {
      return res.status(500).json({ message: 'Lỗi lấy chi tiết thông báo', error: err.message });
    }
  }

  // Tạo mới notification
// In NotificationController.js
static async createNotification(req, res) {
  try {
    const { user_ids, discount_id, type, data } = req.body;

    if (!data?.title || !data?.message) {
      return res.status(400).json({ message: 'Dữ liệu thông báo phải có title và message' });
    }

    let notifications;
    if (Array.isArray(user_ids)) {
      // Create notifications for multiple users
      notifications = await Promise.all(
        user_ids.map(user_id =>
          Notification.create({ user_id, discount_id, type, data })
        )
      );
    } else {
      // Single user
      notifications = [
        await Notification.create({ user_id: user_ids, discount_id, type, data })
      ];
    }

    return res.status(201).json(notifications);
  } catch (err) {
    return res.status(500).json({ message: 'Lỗi tạo thông báo', error: err.message });
  }
}

  // Xóa notification
  static async deleteNotification(req, res) {
    try {
      const { id } = req.params;

      const deleted = await Notification.destroy({ where: { id } });

      if (!deleted) {
        return res.status(404).json({ message: 'Không tìm thấy thông báo để xóa' });
      }

      return res.json({ message: 'Xóa thông báo thành công' });
    } catch (err) {
      return res.status(500).json({ message: 'Lỗi xóa thông báo', error: err.message });
    }
  }

  // In NotificationController.js
// In NotificationController.js
static async markAsRead(req, res) {
  try {
    const { id } = req.params;
    const notification = await Notification.findByPk(id);

    if (!notification) {
      return res.status(404).json({ message: 'Không tìm thấy thông báo' });
    }

    await notification.update({ read_at: new Date() });
    return res.json({ message: 'Đánh dấu thông báo đã đọc thành công' });
  } catch (err) {
    return res.status(500).json({ message: 'Lỗi đánh dấu thông báo', error: err.message });
  }
}

// In NotificationController.js
// In NotificationController.js
static async markAllAsRead(req, res) {
  try {
    const { user_id } = req.body;
    if (!user_id) {
      return res.status(400).json({ message: 'Thiếu user_id' });
    }

    await Notification.update(
      { read_at: new Date() },
      { where: { user_id, read_at: null } }
    );

    return res.json({ message: 'Đánh dấu tất cả thông báo đã đọc thành công' });
  } catch (err) {
    return res.status(500).json({ message: 'Lỗi đánh dấu tất cả thông báo', error: err.message });
  }
}

}

module.exports = NotificationController;