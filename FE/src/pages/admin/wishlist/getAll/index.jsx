import axios from "axios";
import { useEffect, useState } from "react";
import Constants from "../../../../Constants.jsx";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { FaAngleDoubleLeft, FaChevronLeft, FaChevronRight, FaAngleDoubleRight, FaSearch, FaEye } from 'react-icons/fa';

function WishlistList() {
  const [groupedWishlistItems, setGroupedWishlistItems] = useState([]); // Lưu trữ dữ liệu đã nhóm
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;
  useEffect(() => {
    fetchGroupedWishlist(currentPage);
  }, [currentPage]);

  // Hàm để nhóm dữ liệu từ API
  const groupWishlistData = (data) => {
    const grouped = {};
    data.forEach(item => {
      const userId = item.user?.id;
      if (userId) {
        if (!grouped[userId]) {
          grouped[userId] = {
            user: item.user,
            wishlistItems: [] // Chứa các mục sản phẩm yêu thích
          };
        }
        grouped[userId].wishlistItems.push(item); // Thêm toàn bộ item vào mảng
      }
    });
    return Object.values(grouped); // Chuyển đổi thành mảng các nhóm người dùng
  };

  const fetchGroupedWishlist = async (page) => {
    setLoading(true);
    try {
      const res = await axios.get(`${Constants.DOMAIN_API}/admin/wishlist?page=${page}&limit=${limit}`);
      // Nhóm dữ liệu nhận được từ API theo user_id
      const groupedData = groupWishlistData(res.data.data);
      setGroupedWishlistItems(groupedData);
      setTotalPages(res.data.totalPages);
      setSearchError('');
    } catch (error) {
      console.error("Lỗi khi lấy danh sách yêu thích:", error);
      toast.error("Lỗi khi tải danh sách yêu thích");
    } finally {
      setLoading(false);
    }
  };
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setSearchError('');
  };

  const handleSearchSubmit = async () => {
    const value = searchTerm.trim();
    if (!value) {
      toast.warning("Vui lòng nhập từ khóa tìm kiếm.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get(
        `${Constants.DOMAIN_API}/admin/users/wishlist/search?searchTerm=${value}&page=1&limit=${limit}`
      );

      const groupedSearchData = groupWishlistData(res.data.data);

      if (groupedSearchData.length === 0) {
        setSearchError("Không tìm thấy kết quả phù hợp.");
        setGroupedWishlistItems([]);
        setTotalPages(1);
      } else {
        setGroupedWishlistItems(groupedSearchData);
        setTotalPages(res.data.totalPages || 1);
        setSearchError('');
      }
    } catch (error) {
      console.error("Lỗi khi tìm kiếm:", error);
      setSearchError("Không thể tải kết quả tìm kiếm.");
      setGroupedWishlistItems([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setCurrentPage(1);
    fetchGroupedWishlist(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const formatCurrency = (price) => {
    if (price) {
      return parseFloat(price).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
    }
    return '';
  };

  return (
    <div className="container mx-auto p-2">
      <div className="bg-white p-4 shadow rounded-md">
        <h2 className="text-xl font-semibold mb-4">Danh sách yêu thích</h2>
        <div className="mb-4 relative flex">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên người dùng..."
            value={searchTerm}
            onChange={(e) => {
              const value = e.target.value;
              setSearchTerm(value);
              if (!value.trim()) {
                handleClearSearch(); // Tự động load lại toàn bộ danh sách
              }
            }}
            className="flex-grow shadow border border-gray-300 rounded py-2 px-4 text-gray-700 leading-tight focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            className="bg-blue-900 hover:bg-blue-800 text-white px-4 py-1.5 rounded ms-2"
            onClick={handleSearchSubmit}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 3a7.5 7.5 0 006.15 13.65z" />
            </svg>
          </button>
        </div>
        {loading ? (
          <div className="text-center py-4">Đang tải dữ liệu...</div>
        ) : (
          <>
            <table className="w-full border-collapse border border-gray-300 mt-3">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-2 border text-left">STT</th>
                  <th className="p-2 border text-left">Tên Người dùng</th>
                  <th className="p-2 border text-left">Sản phẩm yêu thích</th>
                  <th className="p-2 border text-center">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {searchError ? (
                  <tr>
                    <td colSpan="5" className="p-4 text-center text-red-500">{searchError}</td>
                  </tr>
                ) : groupedWishlistItems.length > 0 ? (
                  groupedWishlistItems.map((userGroup, userIndex) => (
                    <tr key={userGroup.user.id} className="border-b hover:bg-gray-50 transition">
                      <td className="p-2 border">
                        {(currentPage - 1) * limit + userIndex + 1}
                      </td>
                      <td className="p-2 border font-medium">{userGroup.user.name}</td>
                      {/* <td className="p-2 border text-blue-600">{userGroup.user.email}</td> */}
                      <td className="p-2 border">
                        {userGroup.wishlistItems.length > 0 ? (
                          <div className="space-y-2">
                            {userGroup.wishlistItems.slice(0, 2).map((item) => {
                              const product = item.variant?.product;
                              return (
                                <div key={item.id} className="flex items-center space-x-3 p-2 border rounded-md">
                                  {product?.thumbnail && (
                                    <img
                                      src={product.thumbnail.startsWith('http') ? product.thumbnail : `${Constants.DOMAIN_API}/uploads/${product.thumbnail}`}
                                      alt={product.name}
                                      className="w-16 h-16 object-cover rounded"
                                    />
                                  )}
                                  <div>
                                    <p className="font-medium">{product?.name}</p>
                                    <p className="text-gray-600">{formatCurrency(item.variant?.price)}</p>
                                  </div>
                                </div>
                              );
                            })}
                            {userGroup.wishlistItems.length > 2 && (
                              <div className="text-gray-500 italic mt-1">... Xem thêm</div>
                            )}
                          </div>
                        ) : (
                          <span>Không có sản phẩm nào trong danh sách yêu thích.</span>
                        )}
                      </td>
                      <td className="p-2 border text-center">
                        <Link
                          to={`/admin/wishlist/detail/${userGroup.user.id}`}
                          className="bg-blue-500 text-white p-2 rounded w-10 h-10 inline-flex items-center justify-center"
                        >
                          <FaEye size={16} className="font-bold" />
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="p-4 text-center text-gray-500 italic">
                      {loading ? "Đang tải dữ liệu..." : "Không có dữ liệu"}
                    </td>
                  </tr>
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

export default WishlistList;