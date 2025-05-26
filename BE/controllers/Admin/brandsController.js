const BrandModel = require('../../models/brandsModel');
const { Op } = require('sequelize');
const slugify = require('slugify');

class BrandController {
    static async get(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;
            const { status, searchTerm } = req.query;

            const whereClause = {};

            // Nếu có searchTerm, tìm theo name, country
            if (searchTerm) {
                whereClause[Op.or] = [
                    { name: { [Op.like]: `%${searchTerm}%` } },
                    { country: { [Op.like]: `%${searchTerm}%` } }
                ];
            }

            // Nếu có status cụ thể và không có searchTerm thì lọc theo status
            if (status && status !== 'all' && !searchTerm) {
                whereClause.status = status;
            }

            const brands = await BrandModel.findAndCountAll({
                where: whereClause,
                order: [['created_at', 'DESC']],
                limit,
                offset
            });

            const allStatuses = ['active', 'inactive'];
            const [activeCount, inactiveCount] = await Promise.all(
                allStatuses.map(s => BrandModel.count({ where: { status: s } }))
            );

            const counts = {
                all: await BrandModel.count(),
                active: activeCount,
                inactive: inactiveCount
            };

            res.status(200).json({
                status: 200,
                message: "Lấy danh sách thương hiệu thành công",
                data: brands.rows,
                totalPages: Math.ceil(brands.count / limit),
                currentPage: page,
                counts
            });

        } catch (error) {
            console.error("Lỗi khi lấy danh sách thương hiệu:", error);
            res.status(500).json({ error: error.message });
        }
    }


    static async getById(req, res) {
        try {
            const { id } = req.params;
            const brand = await BrandModel.findByPk(id);

            if (!brand) {
                return res.status(404).json({ message: "Không tìm thấy thương hiệu với ID này" });
            }

            res.status(200).json({
                status: 200,
                message: "Lấy thông tin thương hiệu thành công",
                data: brand,
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async create(req, res) {
        console.log("Dữ liệu nhận được từ req.body:", req.body);

        try {
            const { name, country, description, status } = req.body;
            let errors = {};

            // Kiểm tra dữ liệu đầu vào
            if (!name || typeof name !== 'string' || name.trim() === '') {
                errors.name = "Tên thương hiệu không được để trống và phải là chuỗi.";
            } else if (name.trim().length < 2) {
                errors.name = "Tên thương hiệu phải ít nhất 2 ký tự.";
            }

            if (!country || typeof country !== 'string' || country.trim() === '') {
                errors.country = "Quốc gia không được để trống và phải là chuỗi.";
            }

            if (description !== undefined && typeof description !== 'string') {
                errors.description = "Mô tả phải là chuỗi.";
            }

            if (!status || (status !== 'active' && status !== 'inactive')) {
                errors.status = "Trạng thái không hợp lệ.";
            }

            if (Object.keys(errors).length > 0) {
                console.log("Lỗi kiểm tra dữ liệu đầu vào:", errors);
                return res.status(400).json({
                    status: 400,
                    message: "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại các trường.",
                    errors: errors
                });
            }

            const cleanName = name.trim();
            const cleanCountry = country.trim();
            const cleanDescription = description ? description.trim() : null;
            const slug = slugify(cleanName, { lower: true, locale: 'vi' });

            const existingBrand = await BrandModel.findOne({ where: { slug } });
            if (existingBrand) {
                return res.status(400).json({
                    status: 400,
                    message: "Tên thương hiệu đã tồn tại.",
                    errors: { name: "Tên thương hiệu này đã tồn tại. Vui lòng chọn tên khác." }
                });
            }

            const newBrand = await BrandModel.create({
                name: cleanName,
                slug,
                country: cleanCountry,
                logo: null, // Không xử lý ảnh
                description: cleanDescription,
                status,
            });

            console.log("Thương hiệu mới đã tạo:", newBrand);

            res.status(201).json({
                status: 201,
                message: "Tạo thương hiệu thành công",
                data: newBrand,
            });

        } catch (error) {
            console.error("Lỗi trong hàm tạo thương hiệu:", error);
            res.status(500).json({
                message: "Lỗi nội bộ máy chủ khi tạo thương hiệu.",
                error: error.message
            });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            // Bỏ 'logo' ra khỏi destructuring, sẽ truy cập trực tiếp req.body.logo
            const { name, country, description, status } = req.body;
            const brand = await BrandModel.findByPk(id);

            if (!brand) {
                return res.status(404).json({ message: "Không tìm thấy thương hiệu với ID này" });
            }

            const updatedData = {};
            if (name !== undefined) {
                updatedData.name = name;
                updatedData.slug = slugify(name, { lower: true });
            }
            if (country !== undefined) updatedData.country = country;

            // Xử lý logo:
            // 1. Nếu có file mới được tải lên (multer hoạt động)
            if (req.file) {
                updatedData.logo = `/uploads/${req.file.filename}`;
            }
            // 2. Nếu không có file mới, nhưng 'logo' được gửi trong req.body (có thể là đường dẫn cũ hoặc null)
            else if (req.body.logo !== undefined) {
                // Kiểm tra xem frontend có gửi logo là null/empty string để xóa không
                // hoặc là đường dẫn logo hiện tại để giữ nguyên (nếu frontend gửi lại)
                updatedData.logo = req.body.logo;
            }

            if (description !== undefined) updatedData.description = description;
            if (status !== undefined) updatedData.status = status;

            await BrandModel.update(updatedData, {
                where: { id: id },
            });

            const updatedBrand = await BrandModel.findByPk(id);

            // Tái tính toán counts sau khi cập nhật
            const allStatuses = ['active', 'inactive'];
            const countPromises = allStatuses.map(s =>
                BrandModel.count({ where: { status: s } })
            );
            const countsByStatus = await Promise.all(countPromises);
            const counts = {
                all: await BrandModel.count(),
                active: countsByStatus[0],
                inactive: countsByStatus[1],
            };

            res.status(200).json({
                status: 200,
                message: "Cập nhật thương hiệu thành công",
                data: updatedBrand,
                counts: counts
            });
        } catch (error) {
            console.error("Lỗi khi cập nhật thương hiệu:", error);
            res.status(500).json({ error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            const brand = await BrandModel.findByPk(id);

            if (!brand) {
                return res.status(404).json({ message: "Không tìm thấy thương hiệu với ID này" });
            }

            await BrandModel.destroy({
                where: { id: id },
            });

            // Tái tính toán counts sau khi xóa
            const allStatuses = ['active', 'inactive'];
            const countPromises = allStatuses.map(s =>
                BrandModel.count({ where: { status: s } })
            );
            const countsByStatus = await Promise.all(countPromises);
            const counts = {
                all: await BrandModel.count(),
                active: countsByStatus[0],
                inactive: countsByStatus[1],
            };

            res.status(200).json({
                status: 200,
                message: "Xóa thương hiệu thành công",
                counts: counts // Trả về counts đã cập nhật
            });
        } catch (error) {
            console.error("Lỗi khi xóa thương hiệu:", error);
            res.status(500).json({ error: error.message });
        }
    }


    static async search(req, res) {
        try {
            const { searchTerm, page = 1, limit = 10 } = req.query;
            const currentPage = parseInt(page);
            const currentLimit = parseInt(limit);
            const offset = (currentPage - 1) * currentLimit;

            if (!searchTerm?.trim()) {
                return res.status(400).json({
                    status: 400,
                    message: "Vui lòng nhập từ khóa để tìm kiếm."
                });
            }

            const brands = await BrandModel.findAndCountAll({
                where: {
                    [Op.or]: [
                        { name: { [Op.like]: `%${searchTerm}%` } },
                        { country: { [Op.like]: `%${searchTerm}%` } },
                    ]
                },
                order: [['created_at', 'DESC']],
                limit: currentLimit,
                offset: offset
            });

            const { count, rows } = brands;

            if (count === 0) {
                return res.status(200).json({
                    status: 200,
                    message: "Không tìm thấy thương hiệu nào phù hợp.",
                    data: [],
                    totalPages: 1,
                    currentPage: currentPage
                });
            }

            return res.status(200).json({
                status: 200,
                message: "Tìm kiếm thương hiệu thành công",
                data: rows,
                totalPages: Math.ceil(count / currentLimit),
                currentPage: currentPage,
                counts: {
                    all: await BrandModel.count(),
                    active: await BrandModel.count({ where: { status: 'active' } }),
                    inactive: await BrandModel.count({ where: { status: 'inactive' } })
                }
            });

        } catch (error) {
            console.error("Lỗi khi tìm kiếm thương hiệu:", error);
            return res.status(500).json({
                status: 500,
                error: error.message
            });
        }
    }

    // Gợi ý thêm các phương thức khác
    static async getActiveBrands(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;

            const brands = await BrandModel.findAndCountAll({
                where: { status: 'active' },
                order: [['name', 'ASC']],
                limit: limit,
                offset: offset
            });

            res.status(200).json({
                status: 200,
                message: "Lấy danh sách thương hiệu đang hoạt động thành công",
                data: brands.rows,
                totalPages: Math.ceil(brands.count / limit),
                currentPage: page,
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getInactiveBrands(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;

            const brands = await BrandModel.findAndCountAll({
                where: { status: 'inactive' },
                order: [['name', 'ASC']],
                limit: limit,
                offset: offset
            });

            res.status(200).json({
                status: 200,
                message: "Lấy danh sách thương hiệu không hoạt động thành công",
                data: brands.rows,
                totalPages: Math.ceil(brands.count / limit),
                currentPage: page,
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = BrandController;