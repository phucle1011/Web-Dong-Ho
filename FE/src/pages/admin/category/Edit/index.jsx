import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import Constants from "../../../../Constants.jsx";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";

function CategoryEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm();

    useEffect(() => {
        const fetchCategory = async () => {
            try {
                const response = await axios.get(`${Constants.DOMAIN_API}/admin/category/${id}`);
                const category = response.data.data;

                setValue("name", category.name);
                setValue("slug", category.slug || "");
                setValue("description", category.description);
                setValue("status", category.status);
            } catch (error) {
                toast.error("Không tìm thấy danh mục.");
                navigate("/admin/categories/getAll");
            }
        };

        fetchCategory();
    }, [id, navigate, setValue]);

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            await axios.put(`${Constants.DOMAIN_API}/admin/category/${id}`, data);
            toast.success("Cập nhật danh mục thành công!");
            navigate("/admin/categories/getAll");
        } catch (error) {
            toast.error("Cập nhật danh mục thất bại.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-screen-xl mx-auto bg-white p-8 rounded shadow mt-8">
            <h2 className="text-2xl font-semibold mb-6">Cập nhật danh mục</h2>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className="mb-6">
                    <label className="block font-medium mb-2">Tên danh mục *</label>
                    <input
                        type="text"
                        className="w-full border px-4 py-3 rounded"
                        placeholder="VD: Đồng hồ thời trang"
                        {...register("name", {
                            required: "Tên danh mục không được để trống",
                            minLength: {
                                value: 4,
                                message: "Tên danh mục phải ít nhất 4 ký tự",
                            },
                        })}
                    />
                    {errors.name && (
                        <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                    )}
                </div>

                <div className="mb-6">
                    <label className="block font-medium mb-2">Mô tả *</label>
                    <textarea
                        rows={4}
                        className="w-full border px-4 py-3 rounded"
                        placeholder="Thông tin chi tiết về danh mục"
                        {...register("description", {
                            required: "Mô tả không được để trống",
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
                            required: "Trạng thái là bắt buộc",
                        })}
                    >
                        <option value="active">Hiển thị</option>
                        <option value="inactive">Ẩn</option>
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
                    {loading ? "Đang cập nhật..." : "Cập nhật danh mục"}
                </button>
            </form>
        </div>
    );
}

export default CategoryEdit;
