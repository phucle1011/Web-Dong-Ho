import axios from "axios";
import Constants from "../../../../Constants";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { FaSave, FaTimes } from 'react-icons/fa';

const UserEdit = () => {
    const [queryParams] = useSearchParams();
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState("");

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors }
    } = useForm();

    useEffect(() => {
        if (queryParams.get("id")) {
            getUserInfo();
        }
    }, []);

    const getUserInfo = async () => {
        try {
            const res = await axios.get(`${Constants.DOMAIN_API}/admin/user/getById/${queryParams.get("id")}`);
            const data = res.data.data;

            setValue("fullName", data.fullName);
            setValue("email", data.email);
            setValue("phone", data.phone);
            setValue("role", data.role);
            setValue("status", data.status.toString());

        } catch (error) {
            console.log("Error fetching user info: ", error);
            setErrorMessage("Không thể tải thông tin người dùng. Vui lòng thử lại.");
        }
    };

    const onSubmit = async (data) => {
        try {
            const response = await axios.patch(`${Constants.DOMAIN_API}/admin/user/update/${queryParams.get("id")}`, {
                fullName: data.fullName,
                email: data.email,
                phone: data.phone,
                role: data.role,
                status: data.status
            });

            console.log("Cập nhật thành công:", response.data);
            navigate("/admin/user/getAll");
        } catch (error) {
            console.error("Lỗi khi cập nhật:", error);
            setErrorMessage("Cập nhật thất bại. Vui lòng thử lại.");
        }
    };

    return (
        <div className="container mx-auto p-4">
            <div className="bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto">
                <h3 className="text-2xl font-bold mb-4">Chỉnh sửa người dùng</h3>

                {errorMessage && (
                    <div className="text-red-500 mb-4">
                        <strong>{errorMessage}</strong>
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium">Họ và Tên</label>
                        <input
                            type="text"
                            className={`w-full p-2 border-[1.5px] rounded ${errors.fullName ? 'border-red-700' : 'border-gray-300'}`}
                            placeholder="Nhập họ và tên"
                            {...register("fullName", {
                                required: "Vui lòng nhập họ tên đầy đủ",
                                minLength: {
                                    value: 5,
                                    message: "Họ và tên phải ít nhất có 5 kí tự"
                                }
                            })}
                        />
                        {errors.fullName && <span className="text-red-700 text-sm mt-1">{errors.fullName.message}</span>}
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium">Email</label>
                        <input
                            type="text"
                            className={`w-full p-2 border-[1.5px] rounded ${errors.email ? 'border-red-700' : 'border-gray-300'}`}
                            placeholder="Nhập email"
                            {...register("email", {
                                required: "Vui lòng nhập địa chỉ email",
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: "Email không đúng định dạng"
                                }
                            })}
                        />
                        {errors.email && <span className="text-red-700 text-sm mt-1">{errors.email.message}</span>}
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium">Số điện thoại</label>
                        <input
                            type="text"
                            className={`w-full p-2 border-[1.5px] rounded ${errors.phone ? 'border-red-700' : 'border-gray-300'}`}
                            placeholder="Nhập số điện thoại"
                            {...register("phone", {
                                required: "Vui lòng nhập số điện thoại",
                                pattern: {
                                    value: /^[0-9\-\+]{10}$/,
                                    message: "Số điện thoại không đúng định dạng"
                                }
                            })}
                        />
                        {errors.phone && <span className="text-red-700 text-sm mt-1">{errors.phone.message}</span>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">Vai trò</label>
                            <select
                                className="w-full p-2 border-[1.5px] rounded"
                                {...register("role", { required: "Vui lòng chọn vai trò" })}
                            >
                                <option value="admin">Admin</option>
                                <option value="customer">Khách hàng</option>
                            </select>
                            {errors.role && <span className="text-red-700 text-sm mt-1">{errors.role.message}</span>}
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">Trạng thái</label>
                            <select
                                className="w-full p-2 border-[1.5px] rounded"
                                {...register("status", { required: "Vui lòng chọn trạng thái" })}
                            >
                                <option value="0">Khóa</option>
                                <option value="1">Đang hoạt động</option>
                            </select>
                            {errors.status && <span className="text-red-700 text-sm mt-1">{errors.status.message}</span>}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                        <button
                            type="submit"
                            className="px-4 py-2 bg-[#073272] text-white rounded flex items-center"
                        >
                            <FaSave className="mr-2" /> Cập nhật người dùng
                        </button>
                        <Link
                            to="/admin/user/getAll"
                            className="px-4 py-2 bg-gray-400 text-white rounded flex items-center"
                        >
                            <FaTimes className="mr-2" /> Hủy
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default UserEdit;