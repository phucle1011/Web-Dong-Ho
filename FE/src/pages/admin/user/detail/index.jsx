import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Constants from "../../../../Constants";
import { toast } from "react-toastify";
import axios from "axios";
import Swal from 'sweetalert2';

function UserDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState({});
    const [addresses, setAddresses] = useState([]);

    useEffect(() => {
        fetchUserDetail();
    }, []);

    const fetchUserDetail = async () => {
        try {
            const res = await axios.get(`${Constants.DOMAIN_API}/admin/user/${id}`);
            if (res.data.data) {
                setUser(res.data.data);
                setAddresses(res.data.data.addresses || []);
            } else {
                setUser({});
                setAddresses([]);
            }
        } catch (error) {
            console.error("Lỗi khi lấy chi tiết người dùng:", error);
            toast.error("Không thể lấy chi tiết người dùng");
            navigate("/admin/user/getAll");
        }
    };

    const handleStatusChange = async (newStatus) => {
        Swal.fire({
            title: 'Xác nhận đổi trạng thái',
            text: `Bạn có chắc chắn muốn đổi trạng thái của người dùng "${user.name}" thành "${getVietnameseStatus(newStatus)}" không?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Vâng, đổi!',
            cancelButtonText: 'Hủy'
        }).then((result) => {
            if (result.isConfirmed) {
                try {
                    axios.put(`${Constants.DOMAIN_API}/admin/user/${id}/status`, { status: newStatus })
                        .then(response => {
                            toast.success(`Cập nhật trạng thái thành công thành: ${getVietnameseStatus(newStatus)}`);
                            fetchUserDetail();
                        })
                        .catch(error => {
                            console.error("Lỗi khi cập nhật trạng thái người dùng:", error);
                            toast.error("Lỗi khi cập nhật trạng thái người dùng");
                        });
                } catch (error) {
                    console.error("Lỗi không mong muốn:", error);
                    toast.error("Đã có lỗi xảy ra");
                }
            }
        });
    };

    const handleAddAddress = async (addressData) => {
        try {
            const res = await axios.post(`${Constants.DOMAIN_API}/admin/user/${id}/addresses`, addressData);
            Swal.fire({
                icon: 'success',
                title: 'Thêm địa chỉ thành công!',
                text: res.data.message,
            });
            fetchUserDetail();
        } catch (error) {
            console.error("Lỗi khi thêm địa chỉ:", error);
            Swal.fire({
                icon: 'error',
                title: 'Lỗi!',
                text: error.response?.data?.message || 'Không thể thêm địa chỉ.',
            });
        }
    };

    const showAddAddressModal = () => {
        Swal.fire({
            title: '<span class="text-xl font-bold text-gray-800">Thêm địa chỉ mới</span>',
            html: `
            <div class="p-4 bg-white rounded-lg space-y-4 text-left">
                <div>
                    <label for="swal-address_line" class="block text-gray-700 text-sm font-semibold mb-1">Địa chỉ:</label>
                    <input type="text" id="swal-address_line" class="shadow-sm border border-gray-300 rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
                <div>
                    <label for="swal-city" class="block text-gray-700 text-sm font-semibold mb-1">Thành phố:</label>
                    <input type="text" id="swal-city" class="shadow-sm border border-gray-300 rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
                <div>
                    <label for="swal-district" class="block text-gray-700 text-sm font-semibold mb-1">Quận/Huyện:</label>
                    <input type="text" id="swal-district" class="shadow-sm border border-gray-300 rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
                <div>
                    <label for="swal-province" class="block text-gray-700 text-sm font-semibold mb-1">Tỉnh/Thành phố:</label>
                    <input type="text" id="swal-province" class="shadow-sm border border-gray-300 rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
                <div>
                    <label for="swal-postal_code" class="block text-gray-700 text-sm font-semibold mb-1">Mã bưu điện:</label>
                    <input type="text" id="swal-postal_code" class="shadow-sm border border-gray-300 rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
                <div class="col-span-2 flex items-center mt-2">
                    <input type="checkbox" id="swal-is_default" class="form-checkbox h-5 w-5 text-green-600 rounded focus:ring-green-500">
                    <label for="swal-is_default" class="ml-2 text-gray-700 text-sm">Đặt làm địa chỉ mặc định</label>
                </div>
            </div>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Thêm địa chỉ',
            cancelButtonText: 'Hủy',
            customClass: {
                confirmButton: 'bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded',
                cancelButton: 'bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded'
            },
            buttonsStyling: false, // Disable SweetAlert2 default styling
            preConfirm: () => {
                const address_line = document.getElementById('swal-address_line').value;
                const city = document.getElementById('swal-city').value;
                const district = document.getElementById('swal-district').value;
                const province = document.getElementById('swal-province').value;
                const postal_code = document.getElementById('swal-postal_code').value;
                const is_default = document.getElementById('swal-is_default').checked;

                if (!address_line || !city || !district || !province) {
                    Swal.showValidationMessage('Vui lòng điền đầy đủ các trường bắt buộc (Địa chỉ, Thành phố, Quận/Huyện, Tỉnh/Thành phố).');
                    return false;
                }

                return { address_line, city, district, province, postal_code, is_default };
            }
        }).then((result) => {
            if (result.isConfirmed) {
                handleAddAddress(result.value);
            }
        });
    };

    const getVietnameseStatus = (englishStatus) => {
        switch (englishStatus) {
            case "active":
                return "Hoạt động";
            case "inactive":
                return "Ngưng hoạt động";
            case "pending":
                return "Chờ duyệt";
            case "locked":
                return "Bị khóa";
            default:
                return englishStatus;
        }
    };

    return (
        <div className="container mx-auto p-6 bg-gray-100 min-h-screen">
            <h2 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">Chi Tiết Người Dùng</h2>

            <div className="bg-white shadow-lg rounded-xl p-6 mb-8 border border-gray-200">
                <h3 className="text-2xl font-bold text-gray-700 mb-5 border-b pb-3">Thông Tin Cơ Bản</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
                    <div className="flex items-center">
                        <strong className="text-gray-600 w-24">ID:</strong> <span className="text-gray-800">{user.id}</span>
                    </div>
                    <div className="flex items-center">
                        <strong className="text-gray-600 w-24">Họ tên:</strong> <span className="text-gray-800">{user.name}</span>
                    </div>
                    <div className="flex items-center">
                        <strong className="text-gray-600 w-24">Email:</strong> <span className="text-blue-600 hover:underline">{user.email}</span>
                    </div>
                    <div className="flex items-center">
                        <strong className="text-gray-600 w-24">SĐT:</strong> <span className="text-gray-800">{user.phone || 'N/A'}</span>
                    </div>
                    <div className="flex items-center">
                        <strong className="text-gray-600 w-24">Vai trò:</strong> <span className="capitalize px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">{user.role}</span>
                    </div>
                    <div className="flex items-center">
                        <strong className="text-gray-600 w-24">Trạng thái:</strong>
                        <div className="flex items-center">
                            <span className={`capitalize px-3 py-1 rounded-full text-sm font-medium
                                ${user.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                                ${user.status === 'inactive' ? 'bg-red-100 text-red-800' : ''}
                                ${user.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                                ${user.status === 'locked' ? 'bg-purple-100 text-purple-800' : ''}
                            `}>
                                {getVietnameseStatus(user.status)}
                            </span>
                            <select
                                value={user.status}
                                onChange={(e) => handleStatusChange(e.target.value)}
                                className="ml-3 border border-gray-300 rounded-md px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            >
                                <option value="active">Hoạt động</option>
                                <option value="inactive">Ngưng hoạt động</option>
                                <option value="pending">Chờ duyệt</option>
                                <option value="locked">Bị khóa</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <strong className="text-gray-600 w-24">Ngày tạo:</strong> <span className="text-gray-800">{user.created_at && new Date(user.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center">
                        <strong className="text-gray-600 w-24">Ngày cập nhật:</strong> <span className="text-gray-800">{user.updated_at && new Date(user.updated_at).toLocaleDateString()}</span>
                    </div>
                    {user.avatar && (
                        <div className="col-span-1 md:col-span-2 flex flex-col items-start mt-4">
                            <strong className="text-gray-600 mb-2">Ảnh đại diện:</strong>
                            <img src={`${Constants.DOMAIN_API}/uploads/${user.avatar}`} alt={user.name} className="w-32 h-32 object-cover rounded-full shadow-md border-2 border-gray-300" />
                        </div>
                    )}
                </div>
            </div>

            {addresses && addresses.length > 0 && (
                <div className="bg-white shadow-lg rounded-xl p-6 mb-8 border border-gray-200">
                    <h3 className="text-2xl font-bold text-gray-700 mb-5 border-b pb-3">Địa Chỉ</h3>
                    <ul className="space-y-4">
                        {addresses.map((address) => (
                            <li key={address.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50 rounded-lg shadow-sm hover:bg-gray-100 transition-colors duration-200">
                                <div className="flex-1 mb-2 sm:mb-0">
                                    <p className="text-gray-800 font-medium">
                                        {address.address_line}
                                        {address.address_line2 && `, ${address.address_line2}`}
                                        {address.district && `, ${address.district}`}
                                        {address.city && `, ${address.city}`}
                                        {address.province && `, ${address.province}`}
                                        {address.postal_code && ` - ${address.postal_code}`}
                                    </p>
                                    {address.is_default === 1 && <span className="mt-1 inline-block bg-green-200 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">Địa chỉ mặc định</span>}
                                </div>
                                <div className="flex space-x-2">
                                    <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-3 py-1.5 rounded-md text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1">
                                        Cập nhật
                                    </button>
                                    <button className="bg-red-500 hover:bg-red-600 text-white font-semibold px-3 py-1.5 rounded-md text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1">
                                        Xóa
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="bg-white shadow-md rounded-md p-4 mb-6">
                <h3 className="font-semibold mb-3">Thêm địa chỉ mới</h3>
                <button onClick={showAddAddressModal} className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 focus:outline-none focus:shadow-outline">
                    Thêm địa chỉ mới
                </button>
            </div>

            <div className="mt-4">
                <button
                    onClick={() => navigate("/admin/user/getAll")}
                    className="bg-gray-500 text-white px-4 py-2 rounded"
                >
                    Quay lại
                </button>
            </div>
        </div>
    );
}

export default UserDetail;