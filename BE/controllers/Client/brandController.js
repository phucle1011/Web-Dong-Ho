const BrandModel = require('../../models/brandsModel');
const { Op } = require('sequelize');

class BrandController {
    static async getActiveBrands(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 100; // Tăng limit để lấy nhiều thương hiệu
            const offset = (page - 1) * limit;
            const brands = await BrandModel.findAndCountAll({
                where: { status: 'active' },
                attributes: ['id', 'name', 'slug', 'logo'],
                order: [['name', 'ASC']],
                limit,
                offset
            });
            res.status(200).json({
                status: 200,
                message: "Lấy danh sách thương hiệu đang hoạt động thành công",
                data: brands.rows,
                totalPages: Math.ceil(brands.count / limit),
                currentPage: page,
            });
        } catch (error) {
            console.error("Lỗi khi lấy danh sách thương hiệu:", error);
            res.status(500).json({ error: error.message });
        }
    }

    static async search(req, res) {
        try {
            const { searchTerm, page = 1, limit = 100 } = req.query;
            const currentPage = parseInt(page);
            const currentLimit = parseInt(limit);
            const offset = (currentPage - 1) * currentLimit;

            if (!searchTerm?.trim()) {
                return res.status(400).json({
                    status: 400,
                    message: "Vui lòng nhập từ khóa để tìm kiếm."
                });
            }

            const whereClause = {
                status: 'active',
                [Op.or]: [
                    { name: { [Op.like]: `%${searchTerm}%` } },
                    { country: { [Op.like]: `%${searchTerm}%` } },
                ]
            };

            const brands = await BrandModel.findAndCountAll({
                where: whereClause,
                attributes: ['id', 'name', 'slug', 'logo'],
                order: [['name', 'ASC']],
                limit: currentLimit,
                offset: offset
            });

            const { count, rows } = brands;

            return res.status(200).json({
                status: 200,
                message: count === 0 ? "Không tìm thấy thương hiệu nào phù hợp." : "Tìm kiếm thương hiệu thành công",
                data: rows,
                totalPages: Math.ceil(count / currentLimit),
                currentPage: currentPage,
            });
        } catch (error) {
            console.error("Lỗi khi tìm kiếm thương hiệu:", error);
            return res.status(500).json({
                status: 500,
                error: error.message
            });
        }
    }
}

module.exports = BrandController;