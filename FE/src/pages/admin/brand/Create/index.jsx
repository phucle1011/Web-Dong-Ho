import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import Constants from "../../../../Constants.jsx";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

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

function BrandCreate() {
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
        reset
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
            const res = await axios.get("https://restcountries.com/v3.1/all?fields=name");
            const countryNames = res.data.map(c => c.name.common).sort();
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
            clearErrors("logo");
        }
    };

    const onSubmit = async (formData) => {
        Swal.fire({
            title: 'Xác nhận thêm thương hiệu',
            text: `Bạn có chắc muốn thêm thương hiệu "${formData.name}"?`,
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: 'Thêm',
            cancelButtonText: 'Hủy',
        }).then(async (result) => {
            if (result.isConfirmed) {
                setLoading(true);
                const formDataToSend = new FormData();
                formDataToSend.append("name", formData.name);
                formDataToSend.append("slug", generateSlug(formData.name));
                formDataToSend.append("country", formData.country);
                formDataToSend.append("description", formData.description);
                formDataToSend.append("status", formData.status);

                if (logoFile) {
                    formDataToSend.append("logo", logoFile);
                }

                try {
                    const res = await axios.post(`${Constants.DOMAIN_API}/admin/brand/create`, formDataToSend, {
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
                    });

                    if (res.status === 201) {
                        toast.success("Thêm thương hiệu thành công!");
                        reset();
                        setLogoFile(null);
                        navigate("/admin/brand/getAll");
                    } else {
                        toast.error(res.data.message || "Lỗi khi thêm thương hiệu.");
                    }
                } catch (error) {
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
            <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">Thêm Thương Hiệu Mới</h2>
            <form onSubmit={handleSubmit(onSubmit)} noValidate>

                {/* Tên thương hiệu */}
                <div className="mb-6">
                    <label htmlFor="name" className="block font-medium mb-2 text-gray-700">Tên thương hiệu *</label>
                    <input
                        id="name"
                        type="text"
                        className={`w-full border ${errors.name ? 'border-red-500' : 'border-gray-300'} px-4 py-3 rounded-md focus:outline-none`}
                        placeholder="Ví dụ: Apple, Samsung"
                        {...register("name", {
                            required: "Tên không được để trống",
                            minLength: { value: 2, message: "Tối thiểu 2 ký tự" }
                        })}
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                </div>

                {/* Slug (readonly) */}
                <div className="mb-6">
                    <label htmlFor="slug" className="block font-medium mb-2 text-gray-700">Slug</label>
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
                    <label htmlFor="country" className="block font-medium mb-2 text-gray-700">Quốc gia *</label>
                    <select
                        id="country"
                        className={`w-full border ${errors.country ? 'border-red-500' : 'border-gray-300'} px-4 py-3 rounded-md`}
                        {...register("country", { required: "Quốc gia là bắt buộc" })}
                    >
                        <option value="">-- Chọn quốc gia --</option>
                        {countries.map((country, idx) => (
                            <option key={idx} value={country}>{country}</option>
                        ))}
                    </select>
                    {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country.message}</p>}
                </div>

                <div className="mb-6">
                    <label htmlFor="logo" className="block font-medium mb-2 text-gray-700">Logo (tùy chọn)</label>
                    <input
                        id="logo"
                        type="file"
                        accept="image/*"
                        className={`w-full border ${errors.logo ? 'border-red-500' : 'border-gray-300'} px-4 py-3 rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100`}
                        onChange={handleLogoChange}
                    />
                    {errors.logo && <p className="text-red-500 text-sm mt-1">{errors.logo.message}</p>}
                    {logoFile && (
                        <div className="mt-2 flex items-center space-x-2">
                            <img src={URL.createObjectURL(logoFile)} alt="Preview" className="w-24 h-24 object-contain border rounded" />
                            <span className="text-sm text-gray-600">{logoFile.name}</span>
                        </div>
                    )}
                </div>

                <div className="mb-6">
                    <label htmlFor="description" className="block font-medium mb-2 text-gray-700">Mô tả</label>
                    <textarea
                        id="description"
                        rows={4}
                        className="w-full border border-gray-300 px-4 py-3 rounded-md resize-y"
                        placeholder="Nhập mô tả chi tiết (tùy chọn)"
                        {...register("description")}
                    ></textarea>
                </div>

                <div className="mb-6">
                    <label htmlFor="status" className="block font-medium mb-2 text-gray-700">Trạng thái *</label>
                    <select
                        id="status"
                        className={`w-full border ${errors.status ? 'border-red-500' : 'border-gray-300'} px-4 py-3 rounded-md`}
                        {...register("status", { required: "Trạng thái là bắt buộc" })}
                    >
                        <option value="active">Hoạt động</option>
                        <option value="inactive">Ngừng hoạt động</option>
                    </select>
                    {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status.message}</p>}
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="bg-[#073272] text-white px-6 py-3 rounded-md shadow-md hover:bg-[#052354] transition w-full md:w-auto"
                >
                    {loading ? "Đang thêm thương hiệu..." : "Thêm Thương Hiệu"}
                </button>
            </form>
        </div>
    );
}

export default BrandCreate;
