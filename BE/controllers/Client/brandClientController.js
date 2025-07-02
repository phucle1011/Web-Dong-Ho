const BrandModel = require('../../models/brandsModel');
const { Op } = require('sequelize');

class brandClientController {
  static async getAll(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { status, searchTerm } = req.query;
    const whereClause = {};

    if (searchTerm) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${searchTerm}%` } },
        { country: { [Op.like]: `%${searchTerm}%` } },
      ];
    }

    if (status && status !== 'all') {
      whereClause.status = status;
    }

    const { count, rows } = await BrandModel.findAndCountAll({
      where: whereClause,
      order: [['created_at', 'DESC']],
      limit,
      offset,
    });

    const [allCount, activeCount, inactiveCount] = await Promise.all([
      BrandModel.count(),
      BrandModel.count({ where: { status: 'active' } }),
      BrandModel.count({ where: { status: 'inactive' } }),
    ]);

    return res.status(200).json({
      status: 200,
      message: 'Lấy danh sách thương hiệu thành công',
      data: rows,
      pagination: {
        total: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        limit,
      },
      counts: {
        all: allCount,
        active: activeCount,
        inactive: inactiveCount,
      },
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách thương hiệu:', error);
    res.status(500).json( { status: 500, error: error.message });
  }
}
}

module.exports = brandClientController;
