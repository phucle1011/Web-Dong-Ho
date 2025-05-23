const BrandModel = require('../../models/brandsModel');
const { Op } = require('sequelize');
const slugify = require('slugify');

class BrandController {
    static async get(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;
            const { status, searchTerm } = req.query; // Lấy status và searchTerm từ query params

            const whereClause = {}; // Đối tượng chứa điều kiện WHERE cho truy vấn

            // Xử lý điều kiện tìm kiếm theo searchTerm
            if (searchTerm) {
                whereClause[Op.or] = [
                    { name: { [Op.like]: `%${searchTerm}%` } }, // Tìm kiếm theo tên thương hiệu
                    { country: { [Op.like]: `%${searchTerm}%` } } // Tìm kiếm theo quốc gia
                ];
            }

            // Xử lý điều kiện lọc theo status (nếu có và không phải đang tìm kiếm chung)
            // Nếu có searchTerm, chúng ta muốn tìm kiếm trên tất cả các trạng thái
            // Nếu không có searchTerm, chúng ta áp dụng filterStatus
            if (status && status !== 'all' && !searchTerm) {
                whereClause.status = status;
            }

            // Lấy danh sách thương hiệu theo các điều kiện đã thiết lập
            const brands = await BrandModel.findAndCountAll({
                where: whereClause, // Áp dụng điều kiện WHERE
                order: [['created_at', 'DESC']],
                limit: limit,
                offset: offset,
            });

            // Lấy tổng số lượng thương hiệu cho từng trạng thái
            const allStatuses = ['active', 'inactive'];
            const countPromises = allStatuses.map(s =>
                BrandModel.count({ where: { status: s } })
            );

            const countsByStatus = await Promise.all(countPromises);

            const counts = {
                all: await BrandModel.count(), // Tổng số tất cả thương hiệu
                active: countsByStatus[0],
                inactive: countsByStatus[1],
            };

            res.status(200).json({
                status: 200,
                message: "Lấy danh sách thương hiệu thành công",
                data: brands.rows,
                totalPages: Math.ceil(brands.count / limit),
                currentPage: page,
                counts // Trả về số lượng theo trạng thái
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
        try {
            const { name, country, description, status } = req.body;
            const slug = slugify(name, { lower: true });

            // Kiểm tra xem có file logo được tải lên không
            let logo = null;
            if (req.file) {
                // Xử lý file logo ở đây (ví dụ: lưu vào thư mục trên server)
                // Ví dụ:
                const logoPath = `/uploads/${req.file.filename}`; // Đường dẫn tương đối đến file đã lưu
                logo = logoPath; // Lưu đường dẫn vào biến logo
                console.log("logoPath:", logoPath); // Log đường dẫn logo
            } else {
                const errorMessage = "Vui lòng tải lên logo cho thương hiệu.";
                console.log(errorMessage);
                return res.status(400).json({ message: errorMessage });
            }

            // Validate dữ liệu (ví dụ: sử dụng thư viện như express-validator)
            if (!name || !country || !description || !status) {
                const errorMessage = "Vui lòng nhập đầy đủ thông tin cho thương hiệu.";
                console.log(errorMessage);
                return res.status(400).json({ message: errorMessage });
            }

            const newBrand = await BrandModel.create({
                name,
                slug,
                country,
                logo, // Sử dụng đường dẫn đã xử lý ở trên
                description,
                status,
            });
            console.log("newBrand:", newBrand); // Log newBrand

            res.status(201).json({
                status: 201,
                message: "Tạo thương hiệu thành công",
                data: newBrand,
            });
        } catch (error) {
            console.error("Lỗi trong hàm create:", error); // Log lỗi
            res.status(500).json({ error: error.message });
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
            const { searchTerm } = req.query;

            if (!searchTerm || searchTerm.trim() === '') {
                return res.status(400).json({ message: "Vui lòng nhập từ khóa để tìm kiếm thương hiệu." });
            }

            const brands = await BrandModel.findAll({
                where: {
                    [Op.or]: [
                        { name: { [Op.like]: `%${searchTerm}%` } },
                        { country: { [Op.like]: `%${searchTerm}%` } },
                        { description: { [Op.like]: `%${searchTerm}%` } },
                    ],
                },
                order: [['created_at', 'DESC']],
            });

            res.status(200).json({
                status: 200,
                message: "Tìm kiếm thương hiệu thành công",
                data: brands,
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
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