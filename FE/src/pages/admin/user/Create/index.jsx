import axios from "axios";
import Constants from "../../../../Constants";
import { Link } from "react-router-dom";
import { FaSave, FaTimes } from 'react-icons/fa';
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const UserCreate = () => {
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm();

    const [errorMessage, setErrorMessage] = useState("");

    const handleUser = async (data) => {
        try {
            const res = await axios.post(`${Constants.DOMAIN_API}/admin/user/add`, {
                fullName: data.fullName,
                email: data.email,
                phone: data.phone,
                password: data.password,
                role: data.role,
                status: data.status
            });

            console.log("Thêm người dùng thành công === ", res);
            navigate("/admin/user/getAll");
        } catch (error) {
            console.error("Lỗi khi thêm người dùng === ", error);
            setErrorMessage("Thêm người dùng thất bại. Vui lòng thử lại.");
        }
    };

    const validatePassword = (value) => {
        if (!value) return "Mật khẩu là bắt buộc";
        if (value.length < 6) return "Mật khẩu phải có ít nhất 6 ký tự";
        if (!/[a-z]/.test(value)) return "Mật khẩu cần ít nhất 1 chữ thường";
        if (!/[A-Z]/.test(value)) return "Mật khẩu cần ít nhất 1 chữ hoa";
        if (!/[0-9]/.test(value)) return "Mật khẩu cần ít nhất 1 số";
        return true;
    };

    return (
        <div className="container mx-auto p-4">
            <div className="bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto">
                <h2 className="text-xl font-bold mb-4">Thêm người dùng</h2>

                {errorMessage && (
                    <div className="text-red-500 mb-4">
                        <strong>{errorMessage}</strong>
                    </div>
                )}

                <form onSubmit={handleSubmit(handleUser)}>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-1 font-medium">Họ và tên</label>
                            <input
                                type="text"
                                className={`w-full p-2 border rounded ${errors.fullName ? 'border-red-500' : 'border-gray-300'}`}
                                {...register("fullName", {
                                    required: "Họ và tên không được để trống",
                                    minLength: {
                                        value: 5,
                                        message: "Họ và tên phải có ít nhất 5 ký tự"
                                    }
                                })}
                            />
                            {errors.fullName && <span className="text-red-500 text-sm">{errors.fullName.message}</span>}
                        </div>

                        <div className="mb-4">
                            <label className="block mb-1 font-medium">Email</label>
                            <input
                                type="email"
                                className={`w-full p-2 border rounded ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                                {...register("email", {
                                    required: "Email không được để trống",
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: "Email không đúng định dạng"
                                    }
                                })}
                            />
                            {errors.email && <span className="text-red-500 text-sm">{errors.email.message}</span>}
                        </div>

                        <div>
                            <label className="block mb-1 font-medium">Số điện thoại</label>
                            <input
                                type="text"
                                className={`w-full p-2 border rounded ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                                {...register("phone", {
                                    required: "Số điện thoại không được để trống",
                                    pattern: {
                                        value: /^[0-9\-\+]{10,15}$/,
                                        message: "Số điện thoại không đúng định dạng"
                                    }
                                })}
                            />
                            {errors.phone && <span className="text-red-500 text-sm">{errors.phone.message}</span>}
                        </div>

                        <div>
                            <label className="block mb-1 font-medium">Mật khẩu</label>
                            <input
                                type="password"
                                className={`w-full p-2 border rounded ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                                {...register("password", {
                                    validate: validatePassword
                                })}
                            />
                            {errors.password && <span className="text-red-500 text-sm">{errors.password.message}</span>}
                        </div>

                        <div>
                            <label className="block mb-1 font-medium">Vai trò</label>
                            <select
                                className="w-full p-2 border rounded"
                                {...register("role", {
                                    required: "Vai trò không được để trống"
                                })}
                            >
                                <option value="admin">Admin</option>
                                <option value="customer">Khách hàng</option>
                            </select>
                            {errors.role && <span className="text-red-500 text-sm">{errors.role.message}</span>}
                        </div>

                        <div>
                            <label className="block mb-1 font-medium">Trạng thái</label>
                            <select
                                className="w-full p-2 border rounded"
                                {...register("status", {
                                    required: "Trạng thái không được để trống"
                                })}
                            >
                                <option value="0">Khóa</option>
                                <option value="1">Đang hoạt động</option>
                            </select>
                            {errors.status && <span className="text-red-500 text-sm">{errors.status.message}</span>}
                        </div>
                    </div>

                    <div className="mt-4 flex gap-2 justify-end">
                        <button
                            type="submit"
                            className="bg-[#073272] hover:bg-blue-950 text-white px-4 py-2 rounded flex items-center"
                        >
                            <FaSave className="mr-2" /> Thêm người dùng
                        </button>
                        <Link
                            to="/admin/user/getAll"
                            className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded flex items-center"
                        >
                            <FaTimes className="mr-2" /> Hủy
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default UserCreate;