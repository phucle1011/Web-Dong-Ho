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
                            <strong className="text-gray-600 w-24">ID:</strong> <span className="text-gray-800">{brand.id}</span>
                        </div>
                        <div className="flex items-center">
                            <strong className="text-gray-600 w-24">Tên:</strong> <span className="text-gray-800">{brand.name}</span>
                        </div>
                        <div className="flex items-center">
                            <strong className="text-gray-600 w-24">Slug:</strong> <span className="text-gray-800">{brand.slug}</span>
                        </div>
                        <div className="flex items-center">
                            <strong className="text-gray-600 w-24">Quốc gia:</strong> <span className="text-gray-800">{brand.country}</span>
                        </div>
                        <div className="col-span-1 md:col-span-2">
                            <strong className="text-gray-600 w-24 block mb-2">Mô tả:</strong> <span className="text-gray-800">{brand.description || 'Không có mô tả'}</span>
                        </div>
                        <div className="flex items-center">
                            <strong className="text-gray-600 w-24">Trạng thái:</strong>
                            <div className="flex items-center">
                                <span className={`capitalize px-3 py-1 rounded-full text-sm font-medium
                                    ${brand.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                                    ${brand.status === 'inactive' ? 'bg-red-100 text-red-800' : ''}
                                `}>
                                    {getVietnameseStatus(brand.status)}
                                </span>
                                <select
                                    value={brand.status}
                                    onChange={(e) => handleStatusChange(e.target.value)}
                                    className="ml-3 border border-gray-300 rounded-md px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                >
                                    <option value="active">Hoạt động</option>
                                    <option value="inactive">Ngưng hoạt động</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <strong className="text-gray-600 w-24">Ngày tạo:</strong> <span className="text-gray-800">{brand.created_at && new Date(brand.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center">
                            <strong className="text-gray-600 w-24">Ngày cập nhật:</strong> <span className="text-gray-800">{brand.updated_at && new Date(brand.updated_at).toLocaleDateString()}</span>
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

            <div className="mt-4">
                <button
                    onClick={() => navigate("/admin/brand/getAll")}
                    className="bg-gray-500 text-white px-4 py-2 rounded"
                >
                    Quay lại
                </button>
            </div>
        </div>
    );
}

export default BrandDetail;