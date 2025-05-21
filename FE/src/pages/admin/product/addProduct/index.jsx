import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import Constants from "../../../../Constants.jsx";
import { uploadToCloudinary } from "../../../../Upload/uploadToCloudinary.js";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const AddProduct = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();
    const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [thumbnailFile, setThumbnailFile] = useState(null);

  // Gọi API lấy danh sách danh mục và thương hiệu
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          axios.get(`${Constants.DOMAIN_API}/admin/category/list`),
          axios.get(`${Constants.DOMAIN_API}/admin/category/list`),
        ]);

        setCategories(catRes.data.data || []);
        setBrands(brandRes.data.data || []);
      } catch (err) {
        console.error("Lỗi khi load category/brand:", err);
      }
    };

    fetchData();
  }, []);

  const onSubmit = async (formData) => {
    setLoading(true);
    setMessage("");

    try {
      let thumbnailUrl = "";

      if (thumbnailFile) {
        thumbnailUrl = await uploadToCloudinary(thumbnailFile);
      }

      const productData = {
        ...formData,
        thumbnail: thumbnailUrl,
      };

      await axios.post(`${Constants.DOMAIN_API}/admin/products`, productData);

      toast.success("Thêm sản phẩm thành công!");
      navigate("/admin/products/getAll");

      reset();
      setThumbnailFile(null);
    } catch (error) {
      console.error(error);
      toast.error(
        "❌ Lỗi: " + (error.response?.data?.error || "Không xác định")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-screen-xl mx-auto bg-white p-8 rounded shadow mt-8">
      <h2 className="text-2xl font-semibold mb-6">Thêm sản phẩm mới</h2>

      {message && <p className="mb-4 text-sm text-blue-600">{message}</p>}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="mb-6">
          <label className="block font-medium mb-2">Tên sản phẩm *</label>
          <input
            type="text"
            className="w-full border px-4 py-3 rounded"
            {...register("name", {
              required: "Tên sản phẩm không được để trống",
              minLength: { value: 3, message: "Tối thiểu 3 ký tự" },
            })}
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        <div className="mb-6">
          <label className="block font-medium mb-2">Slug *</label>
          <input
            type="text"
            className="w-full border px-4 py-3 rounded"
            {...register("slug", { required: "Slug không được để trống" })}
          />
          {errors.slug && (
            <p className="text-red-500 text-sm mt-1">{errors.slug.message}</p>
          )}
        </div>

        <div className="mb-6">
          <label className="block font-medium mb-2">Mô tả *</label>
          <textarea
            rows={4}
            className="w-full border px-4 py-3 rounded"
            {...register("description", {
              required: "Mô tả không được để trống",
            })}
          ></textarea>
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">
              {errors.description.message}
            </p>
          )}
        </div>

        <div className="mb-6">
          <label className="block font-medium mb-2">Thương hiệu *</label>
          <select
            className="w-full border px-4 py-3 rounded"
            {...register("brand_id", { required: "Vui lòng chọn thương hiệu" })}
          >
            <option value="">-- Chọn thương hiệu --</option>
            {Array.isArray(brands) &&
              brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
          </select>
          {errors.brand_id && (
            <p className="text-red-500 text-sm mt-1">
              {errors.brand_id.message}
            </p>
          )}
        </div>

        <div className="mb-6">
          <label className="block font-medium mb-2">Danh mục *</label>
          <select
            className="w-full border px-4 py-3 rounded"
            {...register("category_id", { required: "Vui lòng chọn danh mục" })}
          >
            <option value="">-- Chọn danh mục --</option>
            {Array.isArray(categories) &&
              categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
          </select>
          {errors.category_id && (
            <p className="text-red-500 text-sm mt-1">
              {errors.category_id.message}
            </p>
          )}
        </div>

        <div className="mb-6">
          <label className="block font-medium mb-2">Ảnh sản phẩm *</label>
          <input
            type="file"
            className="w-full border px-4 py-3 rounded"
            accept="image/*"
            onChange={(e) => setThumbnailFile(e.target.files[0])}
          />
        </div>

        <div className="mb-6">
          <label className="block font-medium mb-2">Trạng thái *</label>
          <select
            className="w-full border px-4 py-3 rounded"
            {...register("status", { required: "Trạng thái là bắt buộc" })}
          >
            <option value="1">Hiển thị</option>
            <option value="0">Ẩn</option>
          </select>
          {errors.status && (
            <p className="text-red-500 text-sm mt-1">{errors.status.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-[#073272] text-white px-6 py-2 rounded hover:bg-[#052354] transition"
        >
          {loading ? "Đang thêm..." : "Thêm sản phẩm"}
        </button>
      </form>
    </div>
  );
};

export default AddProduct;
