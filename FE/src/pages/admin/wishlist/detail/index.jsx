import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Constants from "../../../../Constants";
import { toast } from "react-toastify";
import axios from "axios";
import Swal from "sweetalert2";
import { FaTrashAlt } from "react-icons/fa";

function WishlistDetail() {
    const { id: userId } = useParams();
    const navigate = useNavigate();

    const [wishlistItems, setWishlistItems] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchInput, setSearchInput] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 10;

    const formatCurrency = (price) => {
        if (!price) return "0 ₫";
        return parseFloat(price).toLocaleString("vi-VN") + " ₫";
    };

    const fetchWishlist = async (page = 1) => {
        setLoading(true);
        try {
            const res = await axios.get(`${Constants.DOMAIN_API}/admin/users/${userId}/wishlist?page=${page}&limit=${limit}`);
            if (res.data.data && res.data.data.length > 0) {
                setWishlistItems(res.data.data);
                setTotalPages(res.data.totalPages || 1);
                setUser(res.data.data[0]?.user || null);
            } else {
                setWishlistItems([]);
                setUser(null);
            }
        } catch (error) {
            console.error("Lỗi khi lấy danh sách yêu thích:", error);
            toast.error("Không thể tải danh sách yêu thích");
            navigate("/admin/user/getAll");
        } finally {
            setLoading(false);
        }
    };

    const handleSearchSubmit = async () => {
        const value = searchInput.trim();
        if (!value) {
            toast.warning("Vui lòng nhập từ khóa cần tìm.");
            return;
        }

        setLoading(true);
        try {
            const res = await axios.get(
                `${Constants.DOMAIN_API}/admin/users/${userId}/wishlist/search?searchTerm=${value}&page=1&limit=${limit}`
            );

            setWishlistItems(res.data.data || []);
            setTotalPages(res.data.totalPages || 1);
            setCurrentPage(1);
        } catch (error) {
            console.error("Lỗi khi tìm kiếm:", error);
            setWishlistItems([]);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFromWishlist = async (productVariantId) => {
        Swal.fire({
            title: "Xác nhận xóa",
            text: "Bạn có chắc chắn muốn xóa sản phẩm này khỏi danh sách yêu thích?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Xóa",
            cancelButtonText: "Hủy",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axios.delete(
                        `${Constants.DOMAIN_API}/admin/users/${userId}/wishlist/${productVariantId}`
                    );
                    toast.success("Đã xóa sản phẩm khỏi danh sách yêu thích");
                    fetchWishlist(currentPage);
                } catch (error) {
                    console.error("Lỗi khi xóa sản phẩm khỏi wishlist:", error);
                    toast.error("Không thể xóa sản phẩm khỏi danh sách yêu thích");
                }
            }
        });
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        fetchWishlist(newPage);
    };

    const handleSearchChange = (e) => {
        setSearchInput(e.target.value);

        if (e.target.value.trim() === "") {
            handleClearSearch();
        } else {
            setCurrentPage(1);
        }
    };

    const handleClearSearch = () => {
        setSearchInput("");
        setCurrentPage(1);
        fetchWishlist(1);
    };

    useEffect(() => {
        fetchWishlist(currentPage);
    }, [currentPage]);

    return (
        <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
            <h2 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">
                Danh Sách Yêu Thích Của Người Dùng
            </h2>

            {user && (
                <div className="bg-white shadow-lg rounded-xl p-6 mb-8 border border-gray-200">
                    <h3 className="text-2xl font-bold text-gray-700 mb-4 border-b pb-3">
                        Thông Tin Người Dùng
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
                        <div className="flex items-center">
                            <strong className="text-gray-600 w-24">ID:</strong>
                            <input
                                type="text"
                                value={user.id}
                                readOnly
                                className="text-gray-800 border border-gray-200 rounded px-3 py-1.5 bg-gray-50 w-full focus:outline-none"
                            />
                        </div>
                        <div className="flex items-center">
                            <strong className="text-gray-600 w-24">Tên:</strong>
                            <input
                                type="text"
                                value={user.name}
                                readOnly
                                className="text-gray-800 border border-gray-200 rounded px-3 py-1.5 bg-gray-50 w-full focus:outline-none"
                            />
                        </div>
                        <div className="flex items-center">
                            <strong className="text-gray-600 w-24">Email:</strong>
                            <input
                                type="text"
                                value={user.email}
                                readOnly
                                className="text-blue-600 border border-gray-200 rounded px-3 py-1.5 bg-gray-50 w-full cursor-pointer hover:underline focus:outline-none"
                            />
                        </div>
                    </div>
                </div>
            )}

            <div className="mb-4 relative flex">
                <input
                    type="text"
                    className="shadow border border-gray-300 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Tìm kiếm theo tên sản phẩm..."
                    value={searchInput}
                    onChange={handleSearchChange}
                />
                <button
                    type="button"
                    className="bg-blue-900 hover:bg-blue-800 text-white px-4 rounded ml-2"
                    onClick={handleSearchSubmit}
                >
                    Tìm
                </button>
            </div>

            {loading ? (
                <div className="text-center py-4">Đang tải dữ liệu...</div>
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="min-w-full border border-gray-300 rounded-md divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                                        STT
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                                        Sản phẩm
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                                        Giá
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                                        Hành động
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {wishlistItems.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="p-4 text-center text-gray-500 italic">
                                            Người dùng này chưa có sản phẩm yêu thích nào.
                                        </td>
                                    </tr>
                                ) : (
                                    wishlistItems.map((item, index) => {
                                        const product = item.variant?.product;
                                        return (
                                            <tr key={item.id} className="hover:bg-gray-50 transition">
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                                    {(currentPage - 1) * limit + index + 1}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <div className="flex items-center space-x-3">
                                                        {product?.thumbnail && (
                                                            <img
                                                                src={`${Constants.DOMAIN_API}/uploads/${product.thumbnail}`}
                                                                alt={product.name}
                                                                className="w-12 h-12 object-cover rounded"
                                                            />
                                                        )}
                                                        <span>{product?.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm">
                                                    {formatCurrency(item.variant?.price)}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-center">
                                                    <button
                                                        onClick={() =>
                                                            handleRemoveFromWishlist(
                                                                item.product_variant_id
                                                            )
                                                        }
                                                        className="text-red-600 hover:text-red-800"
                                                        title="Xóa khỏi danh sách yêu thích"
                                                    >
                                                        <FaTrashAlt />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-center mt-4 items-center">
                        <div className="flex items-center space-x-1">
                            <button
                                disabled={currentPage === 1}
                                onClick={() => handlePageChange(1)}
                                className="px-2 py-1 border rounded disabled:opacity-50"
                            >
                                &laquo;
                            </button>
                            <button
                                disabled={currentPage === 1}
                                onClick={() => handlePageChange(currentPage - 1)}
                                className="px-2 py-1 border rounded disabled:opacity-50"
                            >
                                
                            </button>

                            {[...Array(totalPages)].map((_, i) => {
                                const page = i + 1;
                                if (
                                    page >= currentPage - 1 &&
                                    page <= currentPage + 1 &&
                                    page <= totalPages
                                ) {
                                    return (
                                        <button
                                            key={page}
                                            onClick={() => handlePageChange(page)}
                                            className={`px-3 py-1 border rounded ${
                                                currentPage === page
                                                    ? "bg-blue-500 text-white"
                                                    : "bg-blue-100 hover:bg-blue-200"
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    );
                                }
                                return null;
                            })}

                            <button
                                disabled={currentPage === totalPages}
                                onClick={() => handlePageChange(currentPage + 1)}
                                className="px-2 py-1 border rounded disabled:opacity-50"
                            >
                                
                            </button>
                            <button
                                disabled={currentPage === totalPages}
                                onClick={() => handlePageChange(totalPages)}
                                className="px-2 py-1 border rounded disabled:opacity-50"
                            >
                                &raquo;
                            </button>
                        </div>
                    </div>
                </>
            )}

            <div className="mt-6 text-left">
                <button
                    onClick={() => navigate("/admin/wishlist/getAll")}
                    className="bg-gray-600 text-white px-6 py-2 rounded-md shadow-md hover:bg-gray-700 transition duration-200 ease-in-out"
                >
                    Quay lại
                </button>
            </div>
        </div>
    );
}

export default WishlistDetail;