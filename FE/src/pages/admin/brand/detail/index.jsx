import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Constants from "../../../../Constants";
import { toast } from "react-toastify";
import axios from "axios";
import Swal from 'sweetalert2';

function BrandDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [brand, setBrand] = useState({});
    const [originalBrand, setOriginalBrand] = useState({});
    const [editableBrand, setEditableBrand] = useState({});
    const [errors, setErrors] = useState({});
    const [countries, setCountries] = useState([]);

    useEffect(() => {
        fetchBrandDetail();
        fetchCountries();
    }, []);

    const fetchBrandDetail = async () => {
        try {
            const res = await axios.get(`${Constants.DOMAIN_API}/admin/brand/${id}`);
            if (res.data.data) {
                setBrand(res.data.data);
                setOriginalBrand(res.data.data);
                setEditableBrand(res.data.data);
            } else {
                setBrand({});
                setOriginalBrand({});
                setEditableBrand({});
            }
        } catch (error) {
            console.error("Lỗi khi lấy chi tiết thương hiệu:", error);
            toast.error("Không thể lấy chi tiết thương hiệu");
            navigate("/admin/brand/getAll");
        }
    };

    const fetchCountries = async () => {
        try {
            const res = await axios.get("https://restcountries.com/v3.1/all?fields=name");
            const countryNames = res.data.map(country => country.name.common).sort();
            setCountries(countryNames);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách quốc gia:", error);
            toast.error("Không thể lấy danh sách quốc gia");
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditableBrand(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleUpdate = async () => {
        const newErrors = {};
        if (!editableBrand.name || editableBrand.name.trim() === '') {
            newErrors.name = "Tên thương hiệu không được để trống.";
        }
        if (!editableBrand.country || editableBrand.country.trim() === '') {
            newErrors.country = "Quốc gia không được để trống.";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast.error("Vui lòng sửa các lỗi trong biểu mẫu.");
            return;
        }

        Swal.fire({
            title: 'Xác nhận cập nhật',
            text: `Bạn có chắc chắn muốn cập nhật thông tin thương hiệu "${originalBrand.name}" không?`,
            icon: 'info',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Cập nhật',
            cancelButtonText: 'Hủy'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const res = await axios.put(`${Constants.DOMAIN_API}/admin/brand/update/${id}`, editableBrand);
                    if (res.status === 200) {
                        toast.success("Cập nhật thông tin thương hiệu thành công!");
                        setBrand(res.data.data); // Cập nhật trạng thái chính
                        setOriginalBrand(res.data.data); // Cập nhật dữ liệu gốc
                        setEditableBrand(res.data.data); // Cập nhật dữ liệu chỉnh sửa
                    } else {
                        toast.error("Có lỗi xảy ra khi cập nhật.");
                    }
                } catch (error) {
                    console.error("Lỗi khi cập nhật thương hiệu:", error);
                    toast.error(error.response?.data?.message || "Lỗi khi cập nhật thương hiệu.");
                }
            }
        });
    };

    const handleStatusChange = async (newStatus) => {
        // Chỉ cho phép thay đổi trạng thái nếu nó khác trạng thái hiện tại
        if (newStatus === editableBrand.status) return;

        Swal.fire({
            title: 'Xác nhận đổi trạng thái',
            text: `Bạn có chắc chắn muốn đổi trạng thái của thương hiệu "${editableBrand.name}" thành "${getVietnameseStatus(newStatus)}" không?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'OK',
            cancelButtonText: 'Hủy'
        }).then((result) => {
            if (result.isConfirmed) {
                try {
                    axios.put(`${Constants.DOMAIN_API}/admin/brand/update/${id}`, { status: newStatus })
                        .then(response => {
                            toast.success(`Cập nhật trạng thái thành công thành: ${getVietnameseStatus(newStatus)}`);
                            fetchBrandDetail(); // Tải lại chi tiết để cập nhật toàn bộ dữ liệu
                        })
                        .catch(error => {
                            console.error("Lỗi khi cập nhật trạng thái thương hiệu:", error);
                            toast.error(error.response?.data?.message || "Lỗi khi cập nhật trạng thái thương hiệu.");
                        });
                } catch (error) {
                    console.error("Lỗi không mong muốn:", error);
                    toast.error("Đã có lỗi xảy ra");
                }
            }
        });
    };

    const getVietnameseStatus = (englishStatus) => {
        switch (englishStatus) {
            case "active":
                return "Hoạt động";
            case "inactive":
                return "Ngưng hoạt động";
            default:
                return englishStatus;
        }
    };

    return (
        <div className="container mx-auto p-6 bg-gray-100 min-h-screen">
            <h2 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">Chi Tiết Thương Hiệu</h2>

            {editableBrand.id ? (
                <div className="bg-white shadow-lg rounded-xl p-6 mb-8 border border-gray-200">
                    <h3 className="text-2xl font-bold text-gray-700 mb-5 border-b pb-3">Thông Tin Cơ Bản</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
                        <div className="flex items-center">
                            <strong className="text-gray-600 w-24">ID:</strong>
                            <input
                                type="text"
                                className="text-gray-800 border border-gray-200 rounded px-3 py-1.5 bg-gray-50 w-full focus:outline-none"
                                value={editableBrand.id || ''}
                                readOnly // ID không cho phép sửa
                            />
                        </div>
                        <div className="flex items-center relative">
                            <strong className="text-gray-600 w-24">Tên:</strong>
                            <input
                                type="text"
                                name="name"
                                className={`text-gray-800 border ${errors.name ? 'border-red-500' : 'border-gray-200'} rounded px-3 py-1.5 w-full focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                value={editableBrand.name || ''}
                                onChange={handleChange}
                            />
                            {errors.name && <p className="absolute -bottom-5 left-24 text-red-500 text-xs">{errors.name}</p>}
                        </div>
                        <div className="flex items-center">
                            <strong className="text-gray-600 w-24">Slug:</strong>
                            <input
                                type="text"
                                className="text-gray-800 border border-gray-200 rounded px-3 py-1.5 bg-gray-50 w-full focus:outline-none"
                                value={editableBrand.slug || ''}
                                readOnly // Slug không cho phép sửa, sẽ tự động cập nhật ở backend
                            />
                        </div>
                        <div className="flex items-center relative">
                            <strong className="text-gray-600 w-24">Quốc gia:</strong>
                            <select
                                name="country"
                                className={`text-gray-800 border ${errors.country ? 'border-red-500' : 'border-gray-200'} rounded px-3 py-1.5 w-full focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                value={editableBrand.country || ''}
                                onChange={handleChange}
                            >
                                <option value="">Chọn quốc gia</option>
                                {countries.map((country, index) => (
                                    <option key={index} value={country}>{country}</option>
                                ))}
                            </select>
                            {errors.country && <p className="absolute -bottom-5 left-24 text-red-500 text-xs">{errors.country}</p>}
                        </div>
                        <div className="col-span-1 md:col-span-2 relative">
                            <strong className="text-gray-600 w-24 block mb-2">Mô tả:</strong>
                            <textarea
                                name="description"
                                className="text-gray-800 border border-gray-200 rounded px-3 py-1.5 w-full min-h-[80px] focus:outline-none resize-y focus:ring-2 focus:ring-blue-500"
                                value={editableBrand.description || ''}
                                onChange={handleChange}
                            ></textarea>
                        </div>
                        <div className="flex items-center">
                            <strong className="text-gray-600 w-24">Trạng thái:</strong>
                            <div className="flex items-center flex-grow">
                                <span className={`capitalize px-3 py-1 rounded-full text-sm font-medium
                                    ${editableBrand.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                                    ${editableBrand.status === 'inactive' ? 'bg-red-100 text-red-800' : ''}
                                `}>
                                    {getVietnameseStatus(editableBrand.status)}
                                </span>
                                <select
                                    value={editableBrand.status}
                                    onChange={(e) => handleStatusChange(e.target.value)}
                                    className="ml-3 border border-gray-300 rounded-md px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm flex-grow"
                                >
                                    <option value="active">Hoạt động</option>
                                    <option value="inactive">Ngưng hoạt động</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <strong className="text-gray-600 w-24">Ngày tạo:</strong>
                            <input
                                type="text"
                                className="text-gray-800 border border-gray-200 rounded px-3 py-1.5 bg-gray-50 w-full focus:outline-none"
                                value={editableBrand.created_at ? new Date(editableBrand.created_at).toLocaleDateString('vi-VN') : ''}
                                readOnly
                            />
                        </div>
                        <div className="flex items-center">
                            <strong className="text-gray-600 w-24">Ngày cập nhật:</strong>
                            <input
                                type="text"
                                className="text-gray-800 border border-gray-200 rounded px-3 py-1.5 bg-gray-50 w-full focus:outline-none"
                                value={editableBrand.updated_at ? new Date(editableBrand.updated_at).toLocaleDateString('vi-VN') : ''}
                                readOnly
                            />
                        </div>
                        {editableBrand.logo && (
                            <div className="col-span-1 md:col-span-2 flex flex-col items-start mt-4">
                                <strong className="text-gray-600 mb-2">Logo:</strong>
                                <img src={`${Constants.DOMAIN_API}${editableBrand.logo}`} alt={editableBrand.name} className="w-32 h-32 object-contain shadow-md border-2 border-gray-300 rounded-lg" />
                            </div>
                        )}
                    </div>

                    <div className="mt-8 flex justify-end gap-4">
                        <button
                            onClick={handleUpdate}
                            className="bg-blue-600 text-white px-6 py-2 rounded-md shadow-md hover:bg-blue-700 transition duration-200 ease-in-out"
                        >
                            Lưu thay đổi
                        </button>
                        <button
                            onClick={() => setEditableBrand(originalBrand)} // Hoàn tác về dữ liệu gốc
                            className="bg-red-500 text-white px-6 py-2 rounded-md shadow-md hover:bg-red-600 transition duration-200 ease-in-out"
                        >
                            Hủy
                        </button>
                    </div>
                </div>
            ) : (
                <div className="bg-white shadow-lg rounded-xl p-6 mb-8 border border-gray-200 text-center text-gray-700">
                    <p>Không tìm thấy thông tin thương hiệu.</p>
                </div>
            )}

            <div className="mt-4 text-left">
                <button
                    onClick={() => navigate("/admin/brand/getAll")}
                    className="bg-gray-600 text-white px-6 py-2 rounded-md shadow-md hover:bg-gray-700 transition duration-200 ease-in-out"
                >
                    Quay lại danh sách
                </button>
            </div>
        </div>
    );
}

export default BrandDetail;