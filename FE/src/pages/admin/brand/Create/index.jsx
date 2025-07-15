import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import Constants from "../../../../Constants.jsx";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import { uploadToCloudinary } from "../../../../Upload/uploadToCloudinary.js";

const generateSlug = (text) => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
};

function BrandCreate({ onSuccess, isModal = false }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [countries, setCountries] = useState([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    setError,
    clearErrors,
    reset,
  } = useForm({
    defaultValues: {
      name: "",
      slug: "",
      country: "",
      description: "",
      status: "active",
    },
  });

  const nameValue = watch("name");
  const slugValue = watch("slug");

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    try {
      const res = await axios.get(
        "https://restcountries.com/v3.1/all?fields=name "
      );
      const countryNames = res.data.map((c) => c.name.common).sort();
      setCountries(countryNames);
    } catch (error) {
      console.error("Lỗi khi lấy quốc gia:", error);
    }
  };

  useEffect(() => {
    if (nameValue && !slugValue) {
      setValue("slug", generateSlug(nameValue));
    }
  }, [nameValue, slugValue, setValue]);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      clearErrors("logo");
    } else {
      setLogoFile(null);
    }
  };

  const onSubmit = async (formData) => {
    Swal.fire({
      title: "Xác nhận thêm thương hiệu",
      text: `Bạn có chắc muốn thêm thương hiệu "${formData.name}"?`,
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Thêm",
      cancelButtonText: "Hủy",
    }).then(async (result) => {
      if (result.isConfirmed) {
        setLoading(true);

        let logoUrl = null;
        if (logoFile) {
          try {
            logoUrl = await uploadToCloudinary(logoFile);
            if (!logoUrl) {
              toast.error("Lỗi: Không nhận được URL từ Cloudinary");
              setLoading(false);
              return;
            }
          } catch (err) {
            toast.error("Lỗi khi upload ảnh lên Cloudinary: " + err.message);
            setLoading(false);
            return;
          }
        }

        if (!formData.name || formData.name.trim() === "") {
          setError("name", {
            type: "required",
            message: "Tên không được để trống",
          });
          setLoading(false);
          return;
        }
        if (!formData.country || formData.country === "") {
          setError("country", {
            type: "required",
            message: "Quốc gia là bắt buộc",
          });
          setLoading(false);
          return;
        }
        if (
          !formData.status ||
          !["active", "inactive"].includes(formData.status)
        ) {
          setError("status", {
            type: "required",
            message: "Trạng thái không hợp lệ",
          });
          setLoading(false);
          return;
        }

        const brandData = {
          ...formData,
          slug: generateSlug(formData.name),
          logo: logoUrl?.url || null,
        };

        try {
          const res = await axios.post(
            `${Constants.DOMAIN_API}/admin/brand/create`,
            brandData,
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (res.status === 201) {
            toast.success("Thêm thương hiệu thành công!");
            reset();
            setLogoFile(null);
            if (isModal) {
              onSuccess?.();
            } else {
              navigate("/admin/brand/getAll");
            }
          }
        } catch (error) {
          console.error("Lỗi từ server:", error.response?.data);
          const errRes = error.response?.data;
          if (errRes?.errors) {
            Object.entries(errRes.errors).forEach(([key, msg]) => {
              setError(key, { type: "server", message: msg });
            });
            toast.error("Có lỗi xảy ra, vui lòng kiểm tra lại.");
          } else {
            toast.error(errRes?.message || "Lỗi không xác định.");
          }
        } finally {
          setLoading(false);
        }
      }
    });
  };

  return (
    <div className="max-w-screen-xl mx-auto bg-white p-8 rounded shadow mt-8">
      <h3 className="text-2xl font-bold text-gray-700 text-center mb-5 border-b pb-3">
        Thêm thương hiệu
      </h3>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
        {/* Tên thương hiệu */}
        <div className="mb-6">
          <label
            htmlFor="name"
            className="block font-medium mb-2 text-gray-700"
          >
            Tên thương hiệu *
          </label>
          <input
            id="name"
            type="text"
            className={`w-full border ${
              errors.name ? "border-red-500" : "border-gray-300"
            } px-4 py-3 rounded-md focus:outline-none`}
            placeholder="Ví dụ: Apple, Samsung"
            {...register("name", {
              required: "Tên không được để trống",
              minLength: { value: 2, message: "Tối thiểu 2 ký tự" },
            })}
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Slug (readonly) */}
        <div className="mb-6">
          <label
            htmlFor="slug"
            className="block font-medium mb-2 text-gray-700"
          >
            Slug
          </label>
          <input
            id="slug"
            type="text"
            readOnly
            className="w-full border border-gray-300 px-4 py-3 rounded-md bg-gray-100"
            {...register("slug")}
          />
        </div>

        {/* Quốc gia */}
        <div className="mb-6">
          <label
            htmlFor="country"
            className="block font-medium mb-2 text-gray-700"
          >
            Quốc gia *
          </label>
          <select
            id="country"
            className={`w-full border ${
              errors.country ? "border-red-500" : "border-gray-300"
            } px-4 py-3 rounded-md`}
            {...register("country", { required: "Quốc gia là bắt buộc" })}
          >
            <option value="">-- Chọn quốc gia --</option>
            {countries.map((country, idx) => (
              <option key={idx} value={country}>
                {country}
              </option>
            ))}
          </select>
          {errors.country && (
            <p className="text-red-500 text-sm mt-1">
              {errors.country.message}
            </p>
          )}
        </div>

        <div className="mb-6">
          <label
            htmlFor="logo"
            className="block font-medium mb-2 text-gray-700"
          >
            Logo:
          </label>
          <input
            id="logo"
            type="file"
            accept="image/*"
            className={`w-full border ${
              errors.logo ? "border-red-500" : "border-gray-300"
            } px-4 py-3 rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100`}
            onChange={handleLogoChange}
          />
          {errors.logo && (
            <p className="text-red-500 text-sm mt-1">{errors.logo.message}</p>
          )}
          {logoFile && (
            <div className="mt-2 flex items-center space-x-2">
              <img
                src={URL.createObjectURL(logoFile)}
                alt="Preview"
                className="w-24 h-24 object-contain border rounded"
              />
              <span className="text-sm text-gray-600">{logoFile.name}</span>
            </div>
          )}
        </div>

        <div className="mb-6">
          <label
            htmlFor="description"
            className="block font-medium mb-2 text-gray-700"
          >
            Mô tả
          </label>
          <textarea
            id="description"
            rows={4}
            className="w-full border border-gray-300 px-4 py-3 rounded-md resize-y"
            placeholder="Nhập mô tả chi tiết (tùy chọn)"
            {...register("description")}
          ></textarea>
        </div>

        <div className="mb-6">
          <label
            htmlFor="status"
            className="block font-medium mb-2 text-gray-700"
          >
            Trạng thái *
          </label>
          <select
            id="status"
            className={`w-full border ${
              errors.status ? "border-red-500" : "border-gray-300"
            } px-4 py-3 rounded-md`}
            {...register("status", { required: "Trạng thái là bắt buộc" })}
          >
            <option value="active">Hoạt động</option>
            <option value="inactive">Ngừng hoạt động</option>
          </select>
          {errors.status && (
            <p className="text-red-500 text-sm mt-1">{errors.status.message}</p>
          )}
        </div>
      </form>

      <div className="mt-6 flex space-x-4">
        <button
          type="submit"
          onClick={handleSubmit(onSubmit)}
          disabled={loading}
          className="bg-[#073272] text-white px-6 py-3 rounded-md shadow-md hover:bg-[#052354] transition w-full md:w-auto"
        >
          {loading ? "Đang thêm thương hiệu..." : "Thêm Thương Hiệu"}
        </button>

        <button
          onClick={() => navigate("/admin/brand/getAll")}
          className="bg-gray-600 text-white px-6 py-2 rounded-md shadow-md hover:bg-gray-700 transition duration-200 ease-in-out w-full md:w-auto"
        >
          Quay lại
        </button>
      </div>
    </div>
  );
}

export default BrandCreate;
