// import { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import Constants from "../../../../Constants";
// import { toast } from "react-toastify";
// import axios from "axios";
// import Swal from 'sweetalert2';

// function UserDetail() {
//     const { id } = useParams();
//     const navigate = useNavigate();
//     const [user, setUser] = useState({});
//     const [addresses, setAddresses] = useState([]);

//     useEffect(() => {
//         fetchUserDetail();
//     }, []);

//     const fetchUserDetail = async () => {
//         try {
//             const res = await axios.get(`${Constants.DOMAIN_API}/admin/user/${id}`);
//             if (res.data.data) {
//                 setUser(res.data.data);
//                 setAddresses(res.data.data.addresses || []);
//             } else {
//                 setUser({});
//                 setAddresses([]);
//             }
//         } catch (error) {
//             console.error("Lỗi khi lấy chi tiết người dùng:", error);
//             toast.error("Không thể lấy chi tiết người dùng");
//             navigate("/admin/user/getAll");
//         }
//     };

//     const handleStatusChange = async (newStatus) => {
//         Swal.fire({
//             title: 'Xác nhận đổi trạng thái',
//             text: `Bạn có chắc chắn muốn đổi trạng thái của người dùng "${user.name}" thành "${getVietnameseStatus(newStatus)}" không?`,
//             icon: 'warning',
//             showCancelButton: true,
//             confirmButtonColor: '#3085d6',
//             cancelButtonColor: '#d33',
//             confirmButtonText: 'Vâng, đổi!',
//             cancelButtonText: 'Hủy'
//         }).then((result) => {
//             if (result.isConfirmed) {
//                 try {
//                     axios.put(`${Constants.DOMAIN_API}/admin/user/${id}/status`, { status: newStatus })
//                         .then(response => {
//                             toast.success(`Cập nhật trạng thái thành công thành: ${getVietnameseStatus(newStatus)}`);
//                             fetchUserDetail();
//                         })
//                         .catch(error => {
//                             console.error("Lỗi khi cập nhật trạng thái người dùng:", error);
//                             toast.error("Lỗi khi cập nhật trạng thái người dùng");
//                         });
//                 } catch (error) {
//                     console.error("Lỗi không mong muốn:", error);
//                     toast.error("Đã có lỗi xảy ra");
//                 }
//             }
//         });
//     };

//     const handleAddAddress = async (addressData) => {
//         try {
//             const res = await axios.post(`${Constants.DOMAIN_API}/admin/user/${id}/addresses`, addressData);
//             Swal.fire({
//                 icon: 'success',
//                 title: 'Thêm địa chỉ thành công!',
//                 text: res.data.message,
//             });
//             fetchUserDetail(); // Làm mới thông tin người dùng và địa chỉ
//         } catch (error) {
//             console.error("Lỗi khi thêm địa chỉ:", error);
//             Swal.fire({
//                 icon: 'error',
//                 title: 'Lỗi!',
//                 text: error.response?.data?.message || 'Không thể thêm địa chỉ.',
//             });
//         }
//     };

//     const showAddAddressModal = () => {
//         Swal.fire({
//             title: 'Thêm địa chỉ mới',
//             html: `
//                 <div class="grid grid-cols-2 gap-4">
//                     <div>
//                         <label for="swal-address_line1" class="block text-gray-700 text-sm font-bold mb-2">Địa chỉ 1:</label>
//                         <input type="text" id="swal-address_line1" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
//                     </div>
//                     <div>
//                         <label for="swal-address_line2" class="block text-gray-700 text-sm font-bold mb-2">Địa chỉ 2 (tùy chọn):</label>
//                         <input type="text" id="swal-address_line2" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
//                     </div>
//                     <div>
//                         <label for="swal-city" class="block text-gray-700 text-sm font-bold mb-2">Thành phố:</label>
//                         <input type="text" id="swal-city" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
//                     </div>
//                     <div>
//                         <label for="swal-district" class="block text-gray-700 text-sm font-bold mb-2">Quận/Huyện (tùy chọn):</label>
//                         <input type="text" id="swal-district" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
//                     </div>
//                     <div>
//                         <label for="swal-province" class="block text-gray-700 text-sm font-bold mb-2">Tỉnh/Thành phố:</label>
//                         <input type="text" id="swal-province" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
//                     </div>
//                     <div>
//                         <label for="swal-postal_code" class="block text-gray-700 text-sm font-bold mb-2">Mã bưu điện (tùy chọn):</label>
//                         <input type="text" id="swal-postal_code" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
//                     </div>
//                     <div class="col-span-2">
//                         <label for="swal-is_default" class="inline-flex items-center mt-2">
//                             <input type="checkbox" id="swal-is_default" class="form-checkbox h-5 w-5 text-green-500 rounded focus:outline-none focus:shadow-outline">
//                             <span class="ml-2 text-gray-700 text-sm">Đặt làm địa chỉ mặc định</span>
//                         </label>
//                     </div>
//                 </div>
//             `,
//             showCancelButton: true,
//             confirmButtonText: 'Thêm',
//             cancelButtonText: 'Hủy',
//             preConfirm: () => {
//                 return {
//                     address_line1: document.getElementById('swal-address_line1').value,
//                     address_line2: document.getElementById('swal-address_line2').value,
//                     city: document.getElementById('swal-city').value,
//                     district: document.getElementById('swal-district').value,
//                     province: document.getElementById('swal-province').value,
//                     postal_code: document.getElementById('swal-postal_code').value,
//                     is_default: document.getElementById('swal-is_default').checked,
//                 };
//             }
//         }).then((result) => {
//             if (result.isConfirmed) {
//                 handleAddAddress(result.value);
//             }
//         });
//     };

//     const getVietnameseStatus = (englishStatus) => {
//         switch (englishStatus) {
//             case "active":
//                 return "Hoạt động";
//             case "inactive":
//                 return "Ngưng hoạt động";
//             case "pending":
//                 return "Chờ duyệt";
//             case "locked":
//                 return "Bị khóa";
//             default:
//                 return englishStatus;
//         }
//     };

//     return (
//         <div className="container mx-auto p-4">
//             <h2 className="text-xl font-bold mb-4">Chi tiết người dùng</h2>

//             <div className="bg-white shadow-md rounded-md p-4 mb-6">
//                 <h3 className="font-semibold mb-3">Thông tin cơ bản</h3>
//                 <div className="grid grid-cols-2 gap-4">
//                     <div><strong>ID:</strong> {user.id}</div>
//                     <div><strong>Họ tên:</strong> {user.name}</div>
//                     <div><strong>Email:</strong> {user.email}</div>
//                     <div><strong>SĐT:</strong> {user.phone}</div>
//                     <div><strong>Vai trò:</strong> <span className="capitalize">{user.role}</span></div>
//                     <div>
//                         <strong>Trạng thái:</strong> <span className="capitalize">{getVietnameseStatus(user.status)}</span>
//                         <select
//                             value={user.status}
//                             onChange={(e) => handleStatusChange(e.target.value)}
//                             className="border rounded px-2 py-1 ml-2"
//                         >
//                             <option value="active">Hoạt động</option>
//                             <option value="inactive">Ngưng hoạt động</option>
//                             <option value="pending">Chờ duyệt</option>
//                             <option value="locked">Bị khóa</option>
//                         </select>
//                     </div>
//                     <div><strong>Ngày tạo:</strong> {user.created_at && new Date(user.created_at).toLocaleDateString()}</div>
//                     <div><strong>Ngày cập nhật:</strong> {user.updated_at && new Date(user.updated_at).toLocaleDateString()}</div>
//                     {user.avatar && (
//                         <div className="col-span-2">
//                             <strong>Avatar:</strong>
//                             <img src={`${Constants.DOMAIN_API}/uploads/${user.avatar}`} alt={user.name} className="w-32 h-32 object-cover rounded-full mt-2" />
//                         </div>
//                     )}
//                 </div>
//             </div>

//             {addresses && addresses.length > 0 && (
//                 <div className="bg-white shadow-md rounded-md p-4 mb-6">
//                     <h3 className="font-semibold mb-3">Địa chỉ</h3>
//                     <ul>
//                         {addresses.map((address) => (
//                             <li key={address.id} className="mb-2 flex items-center justify-between">
//                                 <div>
//                                     {address.address_line1} {address.address_line2 && `, ${address.address_line2}`}
//                                     {address.district && `, ${address.district}`}
//                                     {address.city && `, ${address.city}`}
//                                     {address.province && `, ${address.province}`}
//                                     {address.postal_code && ` - ${address.postal_code}`}
//                                     {address.is_default === 1 && <span className="text-green-500 ml-2">(Mặc định)</span>}
//                                 </div>
//                                 <div>
//                                     <button className="bg-blue-500 text-white px-2 py-1 rounded text-sm mr-1">
//                                         Cập nhật
//                                     </button>
//                                     <button className="bg-red-500 text-white px-2 py-1 rounded text-sm">
//                                         Xóa
//                                     </button>
//                                 </div>
//                             </li>
//                         ))}
//                     </ul>
//                 </div>
//             )}

//             <div className="bg-white shadow-md rounded-md p-4 mb-6">
//                 <h3 className="font-semibold mb-3">Thêm địa chỉ mới</h3>
//                 <button onClick={showAddAddressModal} className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 focus:outline-none focus:shadow-outline">
//                     Thêm địa chỉ mới
//                 </button>
//             </div>

//             <div className="mt-4">
//                 <button
//                     onClick={() => navigate("/admin/user/getAll")}
//                     className="bg-gray-500 text-white px-4 py-2 rounded"
//                 >
//                     Quay lại
//                 </button>
//             </div>
//         </div>
//     );
// }

// export default UserDetail;