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
            confirmButtonText: 'Vâng, đổi!',
            cancelButtonText: 'Hủy'
        }).then((result) => {
            if (result.isConfirmed) {
                try {
                    axios.put(`${Constants.DOMAIN_API}/admin/brands/edit/${id}`, { status: newStatus })
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
        <div className="container mx-auto p-4">
            <h2 className="text-xl font-bold mb-4">Chi tiết thương hiệu</h2>

            {brand.id ? (
                <div className="bg-white shadow-md rounded-md p-4 mb-6">
                    <h3 className="font-semibold mb-3">Thông tin cơ bản</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div><strong>ID:</strong> {brand.id}</div>
                        <div><strong>Tên:</strong> {brand.name}</div>
                        <div><strong>Slug:</strong> {brand.slug}</div>
                        <div><strong>Quốc gia:</strong> {brand.country}</div>
                        {brand.logo && (
                            <div className="col-span-2">
                                <strong>Logo:</strong>
                                <img src={`${Constants.DOMAIN_API}/uploads/${brand.logo}`} alt={brand.name} className="w-32 h-32 object-cover rounded-full mt-2" />
                            </div>
                        )}
                        <div className="col-span-2"><strong>Mô tả:</strong> {brand.description}</div>
                        <div>
                            <strong>Trạng thái:</strong> <span className="capitalize">{getVietnameseStatus(brand.status)}</span>
                            <select
                                value={brand.status}
                                onChange={(e) => handleStatusChange(e.target.value)}
                                className="border rounded px-2 py-1 ml-2"
                            >
                                <option value="active">Hoạt động</option>
                                <option value="inactive">Ngưng hoạt động</option>
                            </select>
                        </div>
                        <div><strong>Ngày tạo:</strong> {brand.created_at && new Date(brand.created_at).toLocaleDateString()}</div>
                        <div><strong>Ngày cập nhật:</strong> {brand.updated_at && new Date(brand.updated_at).toLocaleDateString()}</div>
                    </div>
                </div>
            ) : (
                <div className="bg-white shadow-md rounded-md p-4 mb-6">
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