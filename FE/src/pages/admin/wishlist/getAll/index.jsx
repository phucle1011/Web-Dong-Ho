import axios from "axios";
import { useEffect, useState } from "react";
import Constants from "../../../../Constants.jsx";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { FaAngleDoubleLeft, FaChevronLeft, FaChevronRight, FaAngleDoubleRight, FaSearch, FaEye, FaHeart, FaStar, FaClock, FaUser } from 'react-icons/fa';

function WishlistList() {
  const [groupedWishlistItems, setGroupedWishlistItems] = useState([]);
  const [mostFavoritedVariants, setMostFavoritedVariants] = useState([]);
  const [recentlyFavoritedVariants, setRecentlyFavoritedVariants] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedSearchTerm, setAppliedSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  useEffect(() => {
    fetchGroupedWishlist(currentPage);
    fetchStatistics();
  }, [currentPage]);

  const groupWishlistData = (data) => {
    const grouped = {};
    data.forEach(item => {
      const userId = item.user?.id;
      if (userId) {
        if (!grouped[userId]) {
          grouped[userId] = {
            user: item.user,
            wishlistItems: []
          };
        }
        grouped[userId].wishlistItems.push(item);
      }
    });
    return Object.values(grouped);
  };

  const fetchGroupedWishlist = async (page) => {
    setLoading(true);
    try {
      let url;
      let params = { page, limit };

      if (appliedSearchTerm.trim()) {
        url = `${Constants.DOMAIN_API}/admin/wishlist/search`;
        params.searchTerm = appliedSearchTerm.trim();
      } else {
        url = `${Constants.DOMAIN_API}/admin/wishlist`;
      }

      const res = await axios.get(url, { params });

      if (res.data.status === 200) {
        const groupedData = groupWishlistData(res.data.data);
        setGroupedWishlistItems(groupedData);
        setTotalPages(res.data.totalPages || 1);
        setSearchError('');
      } else {
        setGroupedWishlistItems([]);
        setTotalPages(1);
        setSearchError("Không tìm thấy danh sách yêu thích nào.");
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách yêu thích:", error);
      toast.error("Lỗi khi tải danh sách yêu thích");
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      // Lấy sản phẩm biến thể được yêu thích nhiều nhất
      const mostFavoritedRes = await axios.get(`${Constants.DOMAIN_API}/admin/wishlist/most-favorited?limit=5`);
      if (mostFavoritedRes.data.status === 200) {
        setMostFavoritedVariants(mostFavoritedRes.data.data);
      }

      // Lấy sản phẩm biến thể được yêu thích gần đây
      const recentlyFavoritedRes = await axios.get(`${Constants.DOMAIN_API}/admin/wishlist/recently-favorited?limit=5`);
      if (recentlyFavoritedRes.data.status === 200) {
        setRecentlyFavoritedVariants(recentlyFavoritedRes.data.data);
      }
    } catch (error) {
      console.error("Lỗi khi lấy thống kê sản phẩm yêu thích:", error);
      toast.error("Lỗi khi tải thống kê sản phẩm yêu thích");
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    // Không gọi API khi thay đổi input, chỉ cập nhật state
  };

  const handleSearchSubmit = () => {
    setCurrentPage(1);
    setAppliedSearchTerm(searchTerm);
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="container mx-auto p-2">
      <div className="bg-white p-4 shadow rounded-md">
        <h2 className="text-xl font-semibold mb-4">Danh sách yêu thích</h2>

        {/* Thống kê sản phẩm yêu thích */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Thống kê sản phẩm yêu thích</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sản phẩm biến thể được yêu thích nhiều nhất */}
            <div className="border p-4 rounded-md bg-gray-50 hover:bg-gray-100 transition">
              <h4 className="font-medium mb-2 flex items-center">
                <FaStar className="text-gray-600 mr-2" /> Top sản phẩm được yêu thích nhiều nhất
              </h4>
              {mostFavoritedVariants.length > 0 ? (
                <div className="space-y-3">
                  {mostFavoritedVariants.slice(0, 3).map((item, index) => (
                    <div key={item.product_variant_id} className="flex items-center space-x-3 p-3 bg-white rounded-md shadow-sm hover:shadow-md transition">
                      {item.variant?.product?.thumbnail && (
                        <img
                          src={item.variant.product.thumbnail.startsWith('http') 
                            ? item.variant.product.thumbnail 
                            : `${Constants.DOMAIN_API}/Uploads/${item.variant.product.thumbnail}`}
                          alt={item.variant.product.name}
                          className="w-16 h-16 object-cover rounded-md"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{item.variant?.product?.name} (SKU: {item.variant?.sku})</p>
                        <p className="text-gray-600 text-sm">Số lần: <span className="font-semibold">{item.favoriteCount}</span></p>
                        <p className="text-gray-600 text-sm">Giá: {formatCurrency(item.variant?.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic text-center">Không có dữ liệu</p>
              )}
            </div>

            {/* Sản phẩm biến thể được yêu thích gần đây */}
            <div className="border p-4 rounded-md bg-gray-50 hover:bg-gray-100 transition">
              <h4 className="font-medium mb-2 flex items-center">
                <FaClock className="text-gray-600 mr-2" /> Sản phẩm được yêu thích gần đây
              </h4>
              {recentlyFavoritedVariants.length > 0 ? (
                <div className="space-y-3">
                  {recentlyFavoritedVariants.slice(0, 3).map((item, index) => (
                    <div key={item.id} className="flex items-center space-x-3 p-3 bg-white rounded-md shadow-sm hover:shadow-md transition">
                      {item.variant?.product?.thumbnail && (
                        <img
                          src={item.variant.product.thumbnail.startsWith('http') 
                            ? item.variant.product.thumbnail 
                            : `${Constants.DOMAIN_API}/Uploads/${item.variant.product.thumbnail}`}
                          alt={item.variant.product.name}
                          className="w-16 h-16 object-cover rounded-md"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{item.variant?.product?.name} (SKU: {item.variant?.sku})</p>
                        <p className="text-gray-600 text-sm">Người thêm: <span className="font-semibold">{item.user?.name}</span></p>
                        <p className="text-gray-600 text-sm">Thời gian: {formatDate(item.created_at)}</p>
                        <p className="text-gray-600 text-sm">Giá: {formatCurrency(item.variant?.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic text-center">Không có dữ liệu</p>
              )}
            </div>
          </div>
        </div>

        {/* Tìm kiếm */}
        <div className="mb-4 relative flex items-center">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên sản phẩm hoặc người dùng..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="flex-grow shadow border border-gray-300 rounded py-2 px-4 text-gray-700 leading-tight focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            className="bg-blue-900 hover:bg-blue-800 text-white px-4 py-1.5 rounded ms-2 flex items-center"
            onClick={handleSearchSubmit}
          >
            <FaSearch className="mr-1" /> Tìm kiếm
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
                      <td className="p-2 border">
                        {userGroup.wishlistItems.length > 0 ? (
                          <div className="space-y-2">
                            {userGroup.wishlistItems.slice(0, 2).map((item) => {
                              const product = item.variant?.product;
                              return (
                                <div key={item.id} className="flex items-center space-x-3 p-2 border rounded-md">
                                  {product?.thumbnail && (
                                    <img
                                      src={product.thumbnail.startsWith('http') ? product.thumbnail : `${Constants.DOMAIN_API}/Uploads/${product.thumbnail}`}
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