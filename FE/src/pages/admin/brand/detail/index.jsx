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

    useEffect(() => {
        fetchBrandDetail();
    }, []);

    const fetchBrandDetail = async () => {
        try {
            const res = await axios.get(`${Constants.DOMAIN_API}/admin/brand/${id}`);
            if (res.data.data) {
                setBrand(res.data.data);
            } else {
                setBrand({});
            }
        } catch (error) {
            console.error("Lỗi khi lấy chi tiết thương hiệu:", error);
            toast.error("Không thể lấy chi tiết thương hiệu");
            navigate("/admin/brand/getAll");
        }
    };

    const handleStatusChange = async (newStatus) => {
        Swal.fire({
            title: 'Xác nhận đổi trạng thái',
            text: `Bạn có chắc chắn muốn đổi trạng thái của thương hiệu "${brand.name}" thành "${getVietnameseStatus(newStatus)}" không?`,
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
                            fetchBrandDetail();
                        })
                        .catch(error => {
                            console.error("Lỗi khi cập nhật trạng thái thương hiệu:", error);
                            toast.error("Lỗi khi cập nhật trạng thái thương hiệu");
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

            {brand.id ? (
                <div className="bg-white shadow-lg rounded-xl p-6 mb-8 border border-gray-200">
                    <h3 className="text-2xl font-bold text-gray-700 mb-5 border-b pb-3">Thông Tin Cơ Bản</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
                        <div className="flex items-center">
                            <strong className="text-gray-600 w-24">ID:</strong>
                            <input
                                type="text"
                                className="text-gray-800 border border-gray-200 rounded px-3 py-1.5 bg-gray-50 w-full focus:outline-none"
                                value={brand.id || ''}
                                readOnly
                            />
                        </div>
                        <div className="flex items-center">
                            <strong className="text-gray-600 w-24">Tên:</strong>
                            <input
                                type="text"
                                className="text-gray-800 border border-gray-200 rounded px-3 py-1.5 bg-gray-50 w-full focus:outline-none"
                                value={brand.name || ''}
                                readOnly
                            />
                        </div>
                        <div className="flex items-center">
                            <strong className="text-gray-600 w-24">Slug:</strong>
                            <input
                                type="text"
                                className="text-gray-800 border border-gray-200 rounded px-3 py-1.5 bg-gray-50 w-full focus:outline-none"
                                value={brand.slug || ''}
                                readOnly
                            />
                        </div>
                        <div className="flex items-center">
                            <strong className="text-gray-600 w-24">Quốc gia:</strong>
                            <input
                                type="text"
                                className="text-gray-800 border border-gray-200 rounded px-3 py-1.5 bg-gray-50 w-full focus:outline-none"
                                value={brand.country || ''}
                                readOnly
                            />
                        </div>
                        <div className="col-span-1 md:col-span-2">
                            <strong className="text-gray-600 w-24 block mb-2">Mô tả:</strong>
                            {/* Dùng textarea cho mô tả để hiển thị tốt hơn văn bản dài */}
                            <textarea
                                className="text-gray-800 border border-gray-200 rounded px-3 py-1.5 bg-gray-50 w-full min-h-[80px] focus:outline-none resize-y"
                                value={brand.description || 'Không có mô tả'}
                                readOnly
                            ></textarea>
                        </div>
                        <div className="flex items-center">
                            <strong className="text-gray-600 w-24">Trạng thái:</strong>
                            <div className="flex items-center flex-grow">
                                <span className={`capitalize px-3 py-1 rounded-full text-sm font-medium
                                    ${brand.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                                    ${brand.status === 'inactive' ? 'bg-red-100 text-red-800' : ''}
                                `}>
                                    {getVietnameseStatus(brand.status)}
                                </span>
                                <select
                                    value={brand.status}
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
                                value={brand.created_at ? new Date(brand.created_at).toLocaleDateString() : ''}
                                readOnly
                            />
                        </div>
                        <div className="flex items-center">
                            <strong className="text-gray-600 w-24">Ngày cập nhật:</strong>
                            <input
                                type="text"
                                className="text-gray-800 border border-gray-200 rounded px-3 py-1.5 bg-gray-50 w-full focus:outline-none"
                                value={brand.updated_at ? new Date(brand.updated_at).toLocaleDateString() : ''}
                                readOnly
                            />
                        </div>
                        {brand.logo && (
                            <div className="col-span-1 md:col-span-2 flex flex-col items-start mt-4">
                                <strong className="text-gray-600 mb-2">Logo:</strong>
                                <img src={`${Constants.DOMAIN_API}/uploads/${brand.logo}`} alt={brand.name} className="w-32 h-32 object-contain shadow-md border-2 border-gray-300 rounded-lg" />
                            </div>
                        )}
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
                    Quay lại
                </button>
            </div>
        </div>  
    );
}

export default BrandDetail;