import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import Constants from "../../../../Constants.jsx";
import { uploadToCloudinary } from "../../../../Upload/uploadToCloudinary.js";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";

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
        axios.get(`${Constants.DOMAIN_API}/admin/brand/list`),
      ]);

      // Chỉ lấy các category và brand có status = 1
      const activeCategories = (catRes.data.data || []).filter(cat => cat.status === "active");
      const activeBrands = (brandRes.data.data || []).filter(brand => brand.status === "active");

      setCategories(activeCategories);
      setBrands(activeBrands);
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
    <div className="max-w-screen-xl mx-auto bg-white p-5 md:p-10 rounded shadow mt-2 mb-2">

  <h2 className="text-2xl font-semibold mb-6">Thêm sản phẩm mới</h2>

  {message && <p className="mb-4 text-sm text-blue-600">{message}</p>}

  <form onSubmit={handleSubmit(onSubmit)} noValidate>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Tên sản phẩm */}
      <div>
        <label className="block font-medium mb-1 text-sm">Tên sản phẩm *</label>
        <input
          type="text"
          className="w-full border px-3 py-2 rounded text-sm"
          {...register("name", {
            required: "Tên sản phẩm không được để trống",
            minLength: { value: 3, message: "Tối thiểu 3 ký tự" },
          })}
        />
        {errors.name && (
          <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
        )}
      </div>

      {/* Slug */}
      <div>
        <label className="block font-medium mb-1 text-sm">Slug *</label>
        <input
          type="text"
          className="w-full border px-3 py-2 rounded text-sm"
          {...register("slug", { required: "Slug không được để trống" })}
        />
        {errors.slug && (
          <p className="text-red-500 text-xs mt-1">{errors.slug.message}</p>
        )}
      </div>

     

      {/* Thương hiệu */}
      <div>
        <label className="block font-medium mb-1 text-sm">Thương hiệu *</label>
        <select
          className="w-full border px-3 py-2 rounded text-sm"
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
          <p className="text-red-500 text-xs mt-1">{errors.brand_id.message}</p>
        )}
      </div>

      {/* Danh mục */}
      <div>
        <label className="block font-medium mb-1 text-sm">Danh mục *</label>
        <select
          className="w-full border px-3 py-2 rounded text-sm"
          {...register("category_id", {
            required: "Vui lòng chọn danh mục",
          })}
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
          <p className="text-red-500 text-xs mt-1">{errors.category_id.message}</p>
        )}
      </div>

      {/* Ảnh sản phẩm */}
      <div>
        <label className="block font-medium mb-1 text-sm">Ảnh sản phẩm *</label>
        <input
          type="file"
          className="w-full border px-3 py-2 rounded text-sm"
          accept="image/*"
          onChange={(e) => setThumbnailFile(e.target.files[0])}
        />
      </div>

      {/* Trạng thái */}
      <div>
        <label className="block font-medium mb-1 text-sm">Trạng thái *</label>
        <select
          className="w-full border px-3 py-2 rounded text-sm"
          {...register("status", { required: "Trạng thái là bắt buộc" })}
        >
          <option value="1">Hiển thị</option>
          <option value="0">Ẩn</option>
        </select>
        {errors.status && (
          <p className="text-red-500 text-xs mt-1">{errors.status.message}</p>
        )}
      </div>
       {/* Mô tả */}
      <div className="md:col-span-2">
        <label className="block font-medium mb-1 text-sm">Mô tả </label>
        <textarea
          rows={4}
          className="w-full border px-3 py-2 rounded text-sm"
        
        ></textarea>
      </div>
    </div>

    {/* Nút submit */}
    <div className="mt-8 flex items-center gap-1">
  <button
    type="submit"
    disabled={loading}
    className="bg-[#073272] text-white px-6 py-2 rounded hover:bg-[#052354] transition"
  >
    {loading ? "Đang thêm..." : "Thêm sản phẩm"}
  </button>

  <Link
  to="/admin/products/getAll"
  className="bg-gray-200 text-gray-800 px-6 py-2 rounded hover:bg-gray-300 transition"
>
  Quay lại
</Link>
</div>

  </form>
</div>


  );
};

export default AddProduct;
