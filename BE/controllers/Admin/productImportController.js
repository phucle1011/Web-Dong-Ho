// controllers/Admin/productImportController.js
const XLSX = require("xlsx");
const Product = require("../../models/productsModel");
const ProductVariant = require("../../models/productVariantModel");

class ProductImportController {
  // Hàm 1: Import sản phẩm
  static async importProducts(req, res) {
    try {
      const fileBuffer = req.file.buffer;
      const workbook = XLSX.read(fileBuffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

      const errors = [];
      let successCount = 0;

      for (let index = 0; index < data.length; index++) {
        const row = data[index];

        if (!row.name || !row.thumbnail || !row.category_id || !row.brand_id || !row.slug) {
          errors.push(`Dòng ${index + 2}: Thiếu thông tin sản phẩm bắt buộc`);
          continue;
        }

        try {
          await Product.create({
            name: row.name,
            description: row.description || "",
            status: row.status ?? 1,
            thumbnail: row.thumbnail,
            category_id: row.category_id,
            brand_id: row.brand_id,
            slug: row.slug,
          });
          successCount++;
        } catch (err) {
          errors.push(`Dòng ${index + 2}: ${err.message}`);
        }
      }

      res.json({
        message: `Đã import thành công ${successCount} sản phẩm`,
        errors,
      });
    } catch (error) {
      console.error("Import error:", error);
      res.status(500).json({ error: "Lỗi khi xử lý file Excel" });
    }
  }

  // Hàm 2: Import biến thể sản phẩm
  static async importVariants(req, res) {
    try {
      const fileBuffer = req.file.buffer;
      const workbook = XLSX.read(fileBuffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

      const errors = [];
      let successCount = 0;

      for (let index = 0; index < data.length; index++) {
        const row = data[index];

        // Ưu tiên dùng slug nếu không có product_id
        let productId = row.product_id;

        if (!productId && row.slug) {
          const product = await Product.findOne({ where: { slug: row.slug } });
          if (product) {
            productId = product.id;
          } else {
            errors.push(`Dòng ${index + 2}: Không tìm thấy sản phẩm với slug "${row.slug}"`);
            continue;
          }
        }

        if (!productId || !row.sku || row.price == null || row.stock == null) {
          errors.push(`Dòng ${index + 2}: Thiếu thông tin biến thể bắt buộc`);
          continue;
        }

        try {
          await ProductVariant.create({
            sku: row.sku,
            price: row.price,
            stock: row.stock,
            product_id: productId,
          });
          successCount++;
        } catch (err) {
          errors.push(`Dòng ${index + 2}: ${err.message}`);
        }
      }

      res.json({
        message: `Đã import thành công ${successCount} biến thể`,
        errors,
      });
    } catch (error) {
      console.error("Import Variant error:", error);
      res.status(500).json({ error: "Lỗi khi xử lý file Excel" });
    }
  }
}

module.exports = ProductImportController;
