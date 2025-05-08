import axios from "axios";
import { useEffect, useState } from "react";
import Constants from "../../../../Constants.jsx";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';

function UserList() {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await axios.get(`${Constants.DOMAIN_API}/admin/user/list`);
            setUsers(res.data.data);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách người dùng:", error);
            toast.error("Lỗi khi tải danh sách người dùng");
        }
    };

    const handleStatusChange = async (userId, newStatus) => {
        const user = users.find(u => u.id === userId);
        if (!user) return;

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
                    axios.put(`${Constants.DOMAIN_API}/admin/user/${userId}/status`, { status: newStatus })
                        .then(response => {
                            toast.success(`Cập nhật trạng thái thành công thành: ${getVietnameseStatus(newStatus)}`);
                            fetchUsers();
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

    const handleSearchChange = async (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        setSearchResults([]);
        setShowDropdown(false);

        if (value.trim() !== '') {
            try {
                const res = await axios.get(`${Constants.DOMAIN_API}/admin/user/search?searchTerm=${value}`);
                setSearchResults(res.data.data);
                setShowDropdown(res.data.data.length > 0);
            } catch (error) {
                console.error("Lỗi khi tìm kiếm người dùng:", error);
            }
        }
    };

    const handleSelectUser = (userId) => {
        navigate(`/admin/user/detail/${userId}`);
        setSearchTerm('');
        setSearchResults([]);
        setShowDropdown(false);
    };

    return (
        <div className="container mx-auto p-2">
            <div className="bg-white p-4 shadow rounded-md">
                <h2 className="text-xl font-semibold mb-4">Danh sách người dùng</h2>
                <div className="mb-4 relative">
                    <input
                        type="text"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder="Tìm kiếm theo tên hoặc email..."
                        value={searchTerm}
                        onChange={handleSearchChange} // Gọi API ngay khi input thay đổi
                        onFocus={() => setShowDropdown(searchResults.length > 0 && searchTerm.trim() !== '')}
                        onBlur={() => setTimeout(() => setShowDropdown(false), 100)}
                    />
                    {showDropdown && (
                        <div className="absolute left-0 mt-2 w-full bg-white border border-gray-300 rounded-md shadow-md z-10">
                            {searchResults.map(user => (
                                <div
                                    key={user.id}
                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                    onClick={() => handleSelectUser(user.id)}
                                >
                                    {user.name} ({user.email})
                                </div>
                            ))}
                            {searchResults.length === 0 && searchTerm.trim() !== '' && (
                                <div className="px-4 py-2 text-gray-500">Không tìm thấy người dùng nào.</div>
                            )}
                        </div>
                    )}
                </div>
                <table className="w-full border-collapse border border-gray-300 mt-3">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="p-2 border">#</th>
                            <th className="p-2 border">Tên</th>
                            <th className="p-2 border">Email</th>
                            <th className="p-2 border">Điện thoại</th>
                            <th className="p-2 border">Avatar</th>
                            <th className="p-2 border">Vai trò</th>
                            <th className="p-2 border">Trạng thái</th>
                            <th className="p-2 border">Ngày tạo</th>
                            <th className="p-2 border">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user, index) => (
                            <tr key={user.id} className="border-b">
                                <td className="p-2 border">{index + 1}</td>
                                <td className="p-2 border">{user.name}</td>
                                <td className="p-2 border">{user.email}</td>
                                <td className="p-2 border">{user.phone}</td>
                                <td className="p-2 border">
                                    <img src={`${Constants.DOMAIN_API}/uploads/${user.avatar}`} alt={user.name} className="w-16 h-16 object-cover rounded-full" />
                                </td>
                                <td className="p-2 border capitalize">{user.role}</td>
                                <td className="p-2 border capitalize">{getVietnameseStatus(user.status)}</td>
                                <td className="p-2 border">{new Date(user.created_at).toLocaleString("vi-VN", { hour12: false })}</td>
                                <td className="p-2 border text-center align-middle">
                                    <div className="flex justify-center gap-2 items-center h-full">
                                        <select
                                            value={user.status}
                                            onChange={(e) => handleStatusChange(user.id, e.target.value)}
                                            className="border rounded px-2 py-1"
                                        >
                                            <option value="active">Hoạt động</option>
                                            <option value="inactive">Ngưng hoạt động</option>
                                            <option value="pending">Chờ duyệt</option>
                                            <option value="locked">Bị khóa</option>
                                        </select>
                                        <Link
                                            to={`/admin/user/detail/${user.id}`}
                                            className="bg-yellow-500 text-white py-1 px-3 rounded hover:bg-yellow-600"
                                        >
                                            Xem chi tiết
                                        </Link>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default UserList;