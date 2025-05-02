import { Link } from "react-router-dom";
import { FaSave, FaCamera } from 'react-icons/fa';
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import Constants from "../../../../Constants";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";

const DriverEditForm = () => {
    const navigate = useNavigate();
    const [queryParams] = useSearchParams();
    const [imagePreview, setImagePreview] = useState("https://media-public.canva.com/g5u4I/MAGCJZg5u4I/1/t.png");

    const {
        register,
        formState: { errors },
        handleSubmit,
        setValue,
    } = useForm();

    useEffect(() => {
        if (queryParams.get("id")) {
            getDriverInfo();
        }
    }, []);

    const getDriverInfo = async () => {
        try {
            const res = await axios.get(`${Constants.DOMAIN_API}/admin/driver/getById/${queryParams.get("id")}`);
            const data = res.data.data;
            setValue("fullName", data.fullName);
            setValue("phone", data.phone);
            setValue("licenseNumber", data.licenseNumber);
            setValue("licenseType", data.licenseType);
            setValue("experienceYears", data.experienceYears);
            setValue("birthDate", new Date(data.birthDate).getFullYear().toString());
            setValue("hireDate", data.hireDate);
            setValue("status", data.status);
            if (data.image) {
                setImagePreview(data.image);
            }
        } catch (error) {
            console.log("Error fetching user info: ", error);
        }
    };


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
            if (props.image && props.image[0]) {
                formData.append("image", props.image[0]);
            }

            await axios.patch(
                `${Constants.DOMAIN_API}/admin/driver/update/${queryParams.get("id")}`,
                formData
            );

            navigate("/admin/driver/getAll");
        } catch (error) {
            console.log("Error === ", error);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <div className="bg-white p-6 shadow rounded-md">
                <h2 className="text-xl font-bold mb-4">Chỉnh sửa tài xế</h2>
                <form onSubmit={handleSubmit(handleDriver)}>
                    <div className="relative w-40 h-40 mx-auto">
                        <label className="block mb-1 font-bold text-gray-600 text-center">Ảnh đại diện</label>
                        <img
                            src={
                                imagePreview.startsWith("blob:")
                                    ? imagePreview
                                    : `${Constants.DOMAIN_API}/public/images/${imagePreview}`
                            }
                            className="w-full h-full object-cover border rounded-full"
                            alt="Avatar"
                        />
                        <label className="absolute bottom-0 right-0 bg-gray-800 p-2 rounded-full cursor-pointer">
                            <FaCamera className="text-white" />
                            <input
                                type="file"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                accept="image/*"
                                {...register("image", {
                                    required: !imagePreview ? "Ảnh không được để trống" : false,
                                })}
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        setImagePreview(URL.createObjectURL(file));
                                    }
                                }}
                            />
                        </label>
                        {errors.image && !imagePreview && <span className="text-red-500">{errors.image.message}</span>}
                    </div>

                    <div className="grid mt-5 grid-cols-2 gap-4 font-medium">
                        <div>
                            <label className="block mb-1">Họ và tên</label>
                            <input type="text" className="w-full p-2 border rounded" id="fullName"
                                {...register("fullName", { required: "Họ và tên không được để trống" })} />
                            {errors.fullName && <span className="text-red-500">{errors.fullName.message}</span>}
                        </div>
                        <div>
                            <label className="block mb-1 font-medium">Số điện thoại</label>
                            <input type="text" className="w-full p-2 border rounded" id="phone"
                                {...register("phone", { required: "Số điện thoại không được để trống" })} />
                            {errors.phone && <span className="text-red-500">{errors.phone.message}</span>}
                        </div>
                        <div>
                            <label className="block mb-1 font-medium">Số GPLX</label>
                            <input type="text" className="w-full p-2 border rounded" id="licenseNumber"
                                {...register("licenseNumber", { required: "Số GPLX không được để trống" })} />
                            {errors.licenseNumber && <span className="text-red-500">{errors.licenseNumber.message}</span>}
                        </div>
                        <div>
                            <label className="block mb-1 font-medium">Loại GPLX</label>
                            <select className="w-full p-2 border rounded" id="licenseType"
                                {...register("licenseType", { required: "Loại GPLX không được để trống" })}>
                                <option value="">Vui lòng chọn loại GPLX</option>
                                <option value="B1">B1</option>
                                <option value="B2">B2</option>
                                <option value="C">C</option>
                                <option value="D">D</option>
                                <option value="E">E</option>
                            </select>
                            {errors.licenseType && <span className="text-red-500">{errors.licenseType.message}</span>}
                        </div>
                        <div>
                            <label className="block mb-1 font-medium">Kinh nghiệm (năm)</label>
                            <input type="number" className="w-full p-2 border rounded" id="experienceYears"
                                {...register("experienceYears", { required: "Kinh nghiệm không được để trống" })} />
                            {errors.experienceYears && <span className="text-red-500">{errors.experienceYears.message}</span>}
                        </div>
                        <div>
                            <label className="block mb-1 font-medium">Năm sinh</label>
                            <select className="w-full p-2 border rounded" id="birthDate"
                                {...register("birthDate", { required: "Năm sinh không được để trống" })}>
                                <option value="">Chọn năm sinh</option>
                                {Array.from({ length: 100 }, (_, i) => {
                                    const year = new Date().getFullYear() - i;
                                    return <option key={i} value={year}>{year}</option>;
                                })}
                            </select>
                            {errors.birthDate && <span className="text-red-500">{errors.birthDate.message}</span>}
                        </div>
                        <div>
                            <label className="block mb-1 font-medium">Ngày thuê</label>
                            <input type="date" className="w-full p-2 border rounded" id="hireDate"
                                {...register("hireDate", { required: "Ngày thuê không được để trống" })} />
                            {errors.hireDate && <span className="text-red-500">{errors.hireDate.message}</span>}
                        </div>
                        <div>
                            <label className="block mb-1 font-medium">Trạng thái</label>
                            <select className="w-full p-2 border rounded" id="status"
                                {...register("status", { required: "Trạng thái không được để trống" })}>
                                <option value="">Chọn trạng thái</option>
                                <option value="active">Đang làm việc</option>
                                <option value="inactive">Tạm nghỉ</option>
                            </select>
                            {errors.status && <span className="text-red-500">{errors.status.message}</span>}
                        </div>
                    </div>

                    <div className="mt-4 flex gap-2 justify-end">
                        <button type="submit" className="bg-[#073272] hover:bg-blue-950 text-white px-4 py-2 rounded flex items-center">
                            <FaSave className="mr-2" /> Lưu thay đổi
                        </button>
                        <Link to="/admin/driver/getAll" className="bg-gray-400 text-white px-4 py-2 rounded">Hủy</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
export default DriverEditForm