const BrandModel = require('../../models/brandsModel');
const { Op } = require('sequelize');
const slugify = require('slugify');

class BrandController {
    static async get(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;

            const brands = await BrandModel.findAndCountAll({
                order: [['created_at', 'DESC']],
                limit: limit,
                offset: offset,
            });

            res.status(200).json({
                status: 200,
                message: "Lấy danh sách thương hiệu thành công",
                data: brands.rows,
                totalPages: Math.ceil(brands.count / limit),
                currentPage: page,
            });
        } catch (error) {
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
        console.log("Bắt đầu hàm create"); // Log bắt đầu hàm
        console.log("req.body:", req.body); // Log nội dung req.body
        console.log("req.file:", req.file); // Log nội dung req.file

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
            const { name, country, logo, description, status } = req.body;
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
            if (logo !== undefined) updatedData.logo = logo;
            if (description !== undefined) updatedData.description = description;
            if (status !== undefined) updatedData.status = status;

            await BrandModel.update(updatedData, {
                where: { id: id },
            });

            const updatedBrand = await BrandModel.findByPk(id);

            res.status(200).json({
                status: 200,
                message: "Cập nhật thương hiệu thành công",
                data: updatedBrand,
            });
        } catch (error) {
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

            res.status(200).json({
                status: 200,
                message: "Xóa thương hiệu thành công",
            });
        } catch (error) {
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