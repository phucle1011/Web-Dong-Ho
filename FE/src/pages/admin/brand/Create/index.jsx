import { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import Constants from "../../../../Constants.jsx";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const generateSlug = (text) => {
    return text
        .toLowerCase()
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
    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
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

    if (nameValue && !slugValue) {
        setValue("slug", generateSlug(nameValue));
    }

    const handleLogoChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setLogoFile(e.target.files[0]);
        }
    };

    const onSubmit = async (formData) => {
        setLoading(true);

        const formDataToSend = new FormData();
        formDataToSend.append("name", formData.name);
        formDataToSend.append("country", formData.country);
        formDataToSend.append("description", formData.description);
        formDataToSend.append("status", formData.status);
        if (logoFile) {
            formDataToSend.append("logo", logoFile);
        }

        try {
            const response = await axios.post(`${Constants.DOMAIN_API}/admin/brand/create`, formDataToSend, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            toast.success("Thêm thương hiệu thành công!");
            navigate("/admin/brands/getAll");
        } catch (error) {
            // ... (xử lý lỗi)
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="max-w-screen-xl mx-auto bg-white p-8 rounded shadow mt-8">
            <h2 className="text-2xl font-semibold mb-6">Thêm thương hiệu mới</h2> {/* Sửa tiêu đề */}

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className="mb-6">
                    <label className="block font-medium mb-2">Tên thương hiệu *</label> {/* Sửa label */}
                    <input
                        type="text"
                        className="w-full border px-4 py-3 rounded"
                        placeholder="VD: ABC" // Sửa placeholder
                        {...register("name", {
                            required: "Tên thương hiệu không được để trống", // Sửa message
                            minLength: {
                                value: 2, // Thay đổi minLength cho phù hợp
                                message: "Tên thương hiệu phải ít nhất 2 ký tự", // Sửa message
                            },
                        })}
                    />
                    {errors.name && (
                        <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                    )}
                </div>

                <div className="mb-6">
                    <label className="block font-medium mb-2">Quốc gia *</label> {/* Thêm label cho country */}
                    <input
                        type="text"
                        className="w-full border px-4 py-3 rounded"
                        placeholder="VD: Việt Nam"
                        {...register("country", {
                            required: "Quốc gia không được để trống",
                        })}
                    />
                    {errors.country && (
                        <p className="text-red-500 text-sm mt-1">{errors.country.message}</p>
                    )}
                </div>

                <div className="mb-6">
                    <label className="block font-medium mb-2">Logo *</label>
                    <input
                        type="file"
                        className="w-full border px-4 py-3 rounded"
                        accept="image/*" // Chỉ chấp nhận file ảnh
                        onChange={handleLogoChange} // Gọi hàm xử lý khi chọn file
                        {...register("logo", { // Bạn có thể không cần register ở đây, vì đã có handleLogoChange
                            required: "Logo là bắt buộc",
                        })}
                    />
                    {errors.logo && (
                        <p className="text-red-500 text-sm mt-1">{errors.logo.message}</p>
                    )}
                    {logoFile && (
                        <div className="mt-2">
                            <img src={URL.createObjectURL(logoFile)} alt="Preview" className="w-16 h-16 object-cover rounded-full" />
                        </div>
                    )}
                </div>

                <div className="mb-6">
                    <label className="block font-medium mb-2">Mô tả *</label>
                    <textarea
                        rows={4}
                        className="w-full border px-4 py-3 rounded"
                        placeholder="Thông tin chi tiết về thương hiệu" // Sửa placeholder
                        {...register("description", {
                            required: "Mô tả không được để trống", // Sửa message
                        })}
                    ></textarea>
                    {errors.description && (
                        <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                    )}
                </div>

                <div className="mb-6">
                    <label className="block font-medium mb-2">Trạng thái *</label>
                    <select
                        className="w-full border px-4 py-3 rounded"
                        {...register("status", {
                            required: "Trạng thái là bắt buộc", // Sửa message
                        })}
                    >
                        <option value="active">Hoạt động</option> {/* Sửa option value */}
                        <option value="inactive">Không hoạt động</option>    {/* Sửa option value */}
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
                    {loading ? "Đang thêm..." : "Thêm thương hiệu"} {/* Sửa text nút */}
                </button>
            </form>
        </div>
    );
}

export default BrandCreate;
