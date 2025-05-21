import axios from "axios";
import { useEffect, useState } from "react";
import Constants from "../../../../Constants.jsx";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import { FaAngleDoubleLeft, FaChevronLeft, FaChevronRight, FaAngleDoubleRight, FaSearch } from 'react-icons/fa'; // Import icon tìm kiếm

function UserList() {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [searchError, setSearchError] = useState('');
    const navigate = useNavigate();
    const limit = 10;

    useEffect(() => {
        fetchUsers(currentPage);
    }, [currentPage]);

    const fetchUsers = async (page) => {
        setLoading(true);
        try {
            const res = await axios.get(`${Constants.DOMAIN_API}/admin/user/list?page=${page}&limit=${limit}`);
            setUsers(res.data.data);
            setTotalPages(res.data.totalPages);
            // Reset searchResults và searchError khi fetchUsers được gọi trực tiếp
            if (searchTerm.trim() === '') {
                setSearchResults([]);
                setSearchError('');
            }
        } catch (error) {
            console.error("Lỗi khi lấy danh sách người dùng:", error);
            toast.error("Lỗi khi tải danh sách người dùng");
        } finally {
            setLoading(false); // Kết thúc loading
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
                            fetchUsers(currentPage); 
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

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setSearchError('');
        setSearchResults([]);
        setShowDropdown(false);
    };

    const handleSearchSubmit = async () => {
        if (searchTerm.trim() === '') {
            toast.warning("Vui lòng nhập tên hoặc email người dùng cần tìm.");
            return;
        }
        setCurrentPage(1);
        setLoading(true);
        try {
            const res = await axios.get(`${Constants.DOMAIN_API}/admin/user/search?searchTerm=${searchTerm}&page=${1}&limit=${limit}`);
            if (res.data.data.length === 0) {
                setSearchError("Không tìm thấy người dùng nào.");
                setSearchResults([]);
                setTotalPages(1);
            } else {
                setSearchResults(res.data.data);
                setTotalPages(res.data.totalPages);
                setSearchError('');
            }
            setShowDropdown(false);
        } catch (error) {
            console.error("Lỗi khi tìm kiếm người dùng:", error);
            setSearchError("Không tìm thấy người dùng.");
            setSearchResults([]);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        setSearchResults([]);
        setShowDropdown(false);
        setCurrentPage(1);
        fetchUsers(1);
        setSearchError('');
    };

    const handleSelectUser = (userId) => {
        navigate(`/admin/user/detail/${userId}`);
        setSearchTerm('');
        setSearchResults([]);
        setShowDropdown(false);
        setSearchError('');
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    return (
        <div className="container mx-auto p-2">
            <div className="bg-white p-4 shadow rounded-md">
                <h2 className="text-xl font-semibold mb-4">Danh sách người dùng</h2>
                <div className="mb-4 relative flex">
                    <input
                        type="text"
                        className="shadow border border-gray-300 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Tìm kiếm theo tên hoặc email..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                    <button
                        type="button"
                        className="bg-blue-900 hover:bg-blue-800 text-white px-4 rounded ml-2"
                        onClick={handleSearchSubmit}
                    >
                        <FaSearch className="w-5 h-5" />
                    </button>

                    {searchResults.length > 0 && (
                        <button
                            onClick={handleClearSearch}
                            className="ms-2 p-2 border flex gap-2 bg-blue-900 hover:bg-blue-800 text-white py-1 px-3 rounded"
                        >
                            Xem tất cả
                        </button>
                    )}
                </div>
                {loading ? (
                    <div className="text-center py-4">Đang tải dữ liệu...</div>
                ) : (
                    <>
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
                                {searchResults.length > 0 ? (
                                    searchResults.map((user, index) => (
                                        <tr key={user.id} className="border-b">
                                            <td className="p-2 border">{(currentPage - 1) * limit + index + 1}</td>
                                            <td className="p-2 border">{user.name}</td>
                                            <td className="p-2 border">{user.email}</td>
                                            <td className="p-2 border">{user.phone}</td>
                                            <td className="p-2 border">
                                                <img src={`${Constants.DOMAIN_API}/uploads/${user.avatar}`} alt={user.name} className="w-16 h-16 object-cover rounded-full" />
                                            </td>
                                            <td className="p-2 border capitalize">{user.role}</td>
                                            <td className="p-2 border capitalize">
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
                                            </td>
                                            <td className="p-2 border">{new Date(user.created_at).toLocaleString("vi-VN", { hour12: false })}</td>
                                            <td className="p-2 border text-center align-middle">
                                                <div className="flex justify-center gap-2 items-center h-full">
                                                    <Link
                                                        to={`/admin/user/detail/${user.id}`}
                                                        className="bg-blue-500 text-white py-1 px-3 rounded"
                                                    >
                                                        Xem
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : searchError ? (
                                    <tr><td colSpan="9" className="p-4 text-center text-red-500">{searchError}</td></tr>
                                ) : (
                                    users.map((user, index) => (
                                        <tr key={user.id} className="border-b">
                                            <td className="p-2 border">{(currentPage - 1) * limit + index + 1}</td>
                                            <td className="p-2 border">{user.name}</td>
                                            <td className="p-2 border">{user.email}</td>
                                            <td className="p-2 border">{user.phone}</td>
                                            <td className="p-2 border">
                                                <img src={`${Constants.DOMAIN_API}/uploads/${user.avatar}`} alt={user.name} className="w-16 h-16 object-cover rounded-full" />
                                            </td>
                                            <td className="p-2 border capitalize">{user.role}</td>
                                            <td className="p-2 border capitalize">
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
                                            </td>
                                            <td className="p-2 border">{new Date(user.created_at).toLocaleString("vi-VN", { hour12: false })}</td>
                                            <td className="p-2 border text-center align-middle">
                                                <div className="flex justify-center gap-2 items-center h-full">
                                                    <Link
                                                        to={`/admin/user/detail/${user.id}`}
                                                        className="bg-blue-500 text-white py-1 px-3 rounded"
                                                    >
                                                        Xem
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>

                        <div className="flex justify-center mt-4 items-center">
                            <div className="flex items-center space-x-1">
                                <button
                                    disabled={currentPage === 1}
                                    onClick={() => handlePageChange(1)}
                                    className="px-2 py-1 border rounded disabled:opacity-50"
                                >
                                    <FaAngleDoubleLeft />
                                </button>

                                <button
                                    disabled={currentPage === 1}
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    className="px-2 py-1 border rounded disabled:opacity-50"
                                >
                                    <FaChevronLeft />
                                </button>

                                {currentPage > 2 && (
                                    <>
                                        <button
                                            onClick={() => handlePageChange(1)}
                                            className="px-3 py-1 border rounded"
                                        >
                                            1
                                        </button>
                                        {currentPage > 3 && <span className="px-2">...</span>}
                                    </>
                                )}

                                {[...Array(totalPages)].map((_, i) => {
                                    const page = i + 1;
                                    if (page >= currentPage - 1 && page <= currentPage + 1) {
                                        return (
                                            <button
                                                key={page}
                                                onClick={() => handlePageChange(page)}
                                                className={`px-3 py-1 border rounded ${currentPage === page
                                                    ? "bg-blue-500 text-white"
                                                    : "bg-blue-100 text-black hover:bg-blue-200"
                                                    }`}
                                            >
                                                {page}
                                            </button>
                                        );
                                    }
                                    return null;
                                })}

                                {currentPage < totalPages - 1 && (
                                    <>
                                        {currentPage < totalPages - 2 && <span className="px-2">...</span>}
                                        <button
                                            onClick={() => handlePageChange(totalPages)}
                                            className="px-3 py-1 border rounded"
                                        >
                                            {totalPages}
                                        </button>
                                    </>
                                )}

                                <button
                                    disabled={currentPage === totalPages}
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    className="px-2 py-1 border rounded disabled:opacity-50"
                                >
                                    <FaChevronRight />
                                </button>

                                <button
                                    disabled={currentPage === totalPages}
                                    onClick={() => handlePageChange(totalPages)}
                                    className="px-2 py-1 border rounded disabled:opacity-50"
                                >
                                    <FaAngleDoubleRight />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default UserList;