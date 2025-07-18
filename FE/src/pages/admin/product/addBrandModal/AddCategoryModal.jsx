import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Constants from "../../../../Constants.jsx";

export default function AddCategoryModal({ onClose, onSuccess }) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("active");

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const generateSlug = (text) => {
      return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9 -]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
    };
    setSlug(generateSlug(name));
  }, [name]);

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = "Vui lòng nhập tên danh mục";
    if (!slug.trim()) newErrors.slug = "Slug không được để trống";
    if (!description.trim()) newErrors.description = "Vui lòng nhập mô tả";
    return newErrors;
  };

  const handleSubmit = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});

    try {
      // Gửi dữ liệu dạng JSON
      await axios.post(`${Constants.DOMAIN_API}/admin/category/create`, {
        name,
        slug,
        description: description || "", // gửi "" nếu không nhập
        status,
      });

      toast.success("✅ Thêm danh mục thành công!");
      onSuccess?.();
      onClose?.();
    } catch (error) {
      console.error(
        "Lỗi thêm danh mục:",
        error.response?.data || error.message
      );
      toast.error(" Thêm danh mục thất bại");
    }
  };

  return (
<div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.2)] backdrop-blur-sm">
      <div className="bg-white max-w-md w-full rounded-lg shadow-lg relative p-6">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-red-500 text-xl font-bold"
        >
          &times;
        </button>

        <h2 className="text-xl font-semibold mb-4">Thêm danh mục</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Tên danh mục
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Slug</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
            {errors.slug && (
              <p className="text-sm text-red-500 mt-1">{errors.slug}</p>
            )}
          </div>
          <div className="mb-3">
            <label htmlFor="status" className="form-label">
              Trạng thái
            </label>
            <select
              id="status"
              className="form-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="active">Hoạt động</option>
              <option value="inactive">Không hoạt động</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Mô tả</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-red-500 mt-1">{errors.description}</p>
            )}
          </div>

          <div className="text-right">
            <button
              onClick={handleSubmit}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Thêm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
