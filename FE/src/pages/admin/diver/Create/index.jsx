import { Link } from "react-router";
import { FaSave, FaTimes } from 'react-icons/fa';
import { useForm } from "react-hook-form";
import axios from "axios";
import Constants from "../../../../Constants";
import { useNavigate } from "react-router-dom";
import { useState } from "react";


const DiverCreate = () => {
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm();

    const [errorMessage, setErrorMessage] = useState("");
    const handleDriver = async (props) => {
        try {
            const formData = new FormData();
            formData.append("fullName", props.fullName);
            formData.append("phone", props.phone);
            formData.append("licenseNumber", props.licenseNumber);
            formData.append("licenseType", props.licenseType);
            formData.append("experienceYears", props.experienceYears);
            formData.append("birthDate", props.birthDate);
            formData.append("hireDate", props.hireDate);
            formData.append("status", props.status);
            formData.append("image", props.image[0]);
            const res = await axios.post(`${Constants.DOMAIN_API}/admin/driver/add`, formData);
            console.log("Thành công === ", res);
            navigate("/admin/driver/getAll");
        } catch (error) {
            console.error("Lỗi khi thêm tài xế === ", error);
            setErrorMessage("Thêm tài xế thất bại. Vui lòng thử lại.");
        }
    };
    const validateImage = (fileList) => {
        if (fileList.length === 0) return "Ảnh là bắt buộc";
        const file = fileList[0];
        const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/gif"];
        if (!allowedTypes.includes(file.type)) return "Định dạng ảnh không hợp lệ";
        if (file.size > 10 * 1024 * 1024) return "Kích thước ảnh không vượt quá 10MB";
        return true;
    };


    return (
        <>
            <div className="container mx-auto p-4">
                <div className="bg-white p-6 shadow rounded-md">
                    <h2 className="text-xl font-bold mb-4">Thêm tài xế</h2>
                    {/* Hiển thị thông báo lỗi nếu có */}
                    {errorMessage && (
                        <div className="text-red-500 mb-4">
                            <strong>{errorMessage}</strong>
                        </div>
                    )}
                    <form onSubmit={handleSubmit(handleDriver)}>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block mb-1 font-medium">Họ và tên</label>
                                <input type="text" className="w-full p-2 border rounded" id="fullName"
                                    {...register("fullName", {
                                        required: "Họ và tên không được để trống",
                                    })} />
                                {errors.fullName && <span className="text-danger">{errors.fullName.message}</span>}
                            </div>
                            <div>
                                <label className="block mb-1 font-medium">Số điện thoại</label>
                                <input type="text" className="w-full p-2 border rounded" id="phone"
                                    {...register("phone", {
                                        required: "Số điện thoại không được để trống",
                                    })} />
                                {errors.phone && <span className="text-danger">{errors.phone.message}</span>}
                            </div>
                            <div>
                                <label className="block mb-1 font-medium">Số GPLX</label>
                                <input type="text" className="w-full p-2 border rounded" id="licenseNumber"
                                    {...register("licenseNumber", {
                                        required: "Số GPLX không được để trống",
                                    })} />
                                {errors.licenseNumber && <span className="text-danger">{errors.licenseNumber.message}</span>}
                            </div>
                            <div>
                                <label className="block mb-1 font-medium">Loại GPLX</label>
                                <select className="w-full p-2 border rounded" defaultValue="" id="licenseType"
                                    {...register("licenseType", {
                                        required: "Loại GPLX không được để trống",
                                    })}>
                                    <option value="">Vui lòng chọn lại GPLX</option>
                                    <option value="B1">B1</option>
                                    <option value="B2" >B2</option>
                                    <option value="C">C</option>
                                    <option value="D">D</option>
                                    <option value="E">E</option>
                                </select>
                                {errors.licenseType && <span className="text-danger">{errors.licenseType.message}</span>}
                            </div>
                            <div>
                                <label className="block mb-1 font-medium">Kinh nghiệm (năm)</label>
                                <input type="number" className="w-full p-2 border rounded" id="experienceYears"
                                    {...register("experienceYears", {
                                        required: "Kinh nghiệm (năm) không được để trống",
                                    })} />
                                {errors.experienceYears && <span className="text-danger">{errors.experienceYears.message}</span>}
                            </div>
                            <div>
                                <label className="block mb-1 font-medium">Ngày sinh</label>
                                <select className="w-full p-2 border rounded" defaultValue="" id="birthDate"
                                    {...register("birthDate", {
                                        required: "Ngày sinh không được để trống",
                                    })}>
                                    <option value="">Chọn ngày sinh</option>
                                    {Array.from({ length: 100 }, (_, i) => (
                                        <option key={i} value={new Date().getFullYear() - i}>
                                            {new Date().getFullYear() - i}
                                        </option>
                                    ))}
                                </select>
                                {errors.birthDate && <span className="text-danger">{errors.birthDate.message}</span>}
                            </div>
                            <div>
                                <label className="block mb-1 font-medium">Ngày thuê</label>
                                <input type="date" className="w-full p-2 border rounded" id="hireDate"
                                    {...register("hireDate", {
                                        required: "Ngày thuê không được để trống",
                                    })} />
                                {errors.hireDate && <span className="text-danger">{errors.hireDate.message}</span>}
                            </div>
                            <div>
                                <label className="block mb-1 font-medium">Trạng thái</label>
                                <select className="w-full p-2 border rounded" defaultValue="" id="status"
                                    {...register("status", {
                                        required: "Trạng thái không được để trống",
                                    })}>
                                    <option value="">Vui lòng chọn trạng thái</option>
                                    <option value="active" >Đang làm việc</option>
                                    <option value="inactive">Tạm nghỉ</option>
                                </select>
                                {errors.status && <span className="text-danger">{errors.status.message}</span>}
                            </div>
                            <div>
                                <label className="block mb-1 font-medium">Ảnh</label>
                                <input type="file" className="w-full p-2 border rounded" id="image"
                                    {...register("image", { validate: validateImage })} />
                                {errors.image && <span className="text-danger">{errors.image.message}</span>}
                            </div>
                        </div>
                        <div className="mt-4 flex gap-2 justify-end">
                            <button type="submit" className="bg-[#073272] hover:bg-blue-950 text-white px-4 py-2 rounded flex justify-center align-items-center">
                                <FaSave className="mr-2" /> Thêm tài xế
                            </button>
                            <Link to="/admin/driver/getAll" className="bg-gray-400 text-white px-4 py-2 rounded">Hủy</Link>
                        </div>
                    </form>
                </div>
            </div>
        </>
    )
}
export default DiverCreate;