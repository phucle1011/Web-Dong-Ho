import axios from "axios";
import { useEffect, useState } from "react";
import Constants from "../../../../Constants.jsx";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { FaAngleDoubleLeft, FaChevronLeft, FaChevronRight, FaAngleDoubleRight, FaSearch } from 'react-icons/fa';

function WishlistList() {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  useEffect(() => {
    fetchWishlist(currentPage);
  }, [currentPage]);

  const fetchWishlist = async (page) => {
    setLoading(true);
    try {
      const userId = 1;
      const res = await axios.get(`${Constants.DOMAIN_API}/admin/users/${userId}/wishlist?page=${page}&limit=${limit}`);
      setWishlistItems(res.data.data);
      setTotalPages(res.data.totalPages);
      if (searchTerm.trim() === '') {
        setSearchResults([]);
        setSearchError('');
      }
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
    setSearchResults([]);
  };

  const handleSearchSubmit = async () => {
    if (searchTerm.trim() === '') {
      toast.warning("Vui lòng nhập tên sản phẩm cần tìm.");
      return;
    }
    setCurrentPage(1);
    setLoading(true);
    try {
      const userId = 1;
      const res = await axios.get(`${Constants.DOMAIN_API}/admin/users/wishlist/search?userId=${userId}&searchTerm=${searchTerm}&page=${1}&limit=${limit}`);
      if (res.data.data.length === 0) {
        setSearchError("Không tìm thấy sản phẩm nào trong danh sách yêu thích.");
        setSearchResults([]);
        setTotalPages(1);
      } else {
        setSearchResults(res.data.data);
        setTotalPages(res.data.totalPages);
        setSearchError('');
      }

    } catch (error) {
      console.error("Lỗi khi tìm kiếm trong danh sách yêu thích:", error);
      setSearchError("Không tìm thấy sản phẩm nào trong danh sách yêu thích.");
      setSearchResults([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    setCurrentPage(1);
    fetchWishlist(1);
    setSearchError('');
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
            className="shadow border border-gray-300 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Tìm kiếm theo tên sản phẩm..."
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
                <tr>
                  <th className="p-2 border text-left">STT</th>
                  <th className="p-2 border text-left">Tên sản phẩm</th>
                  <th className="p-2 border text-left">Hình ảnh</th>
                  <th className="p-2 border text-left">Giá</th>
                  <th className="p-2 border text-center">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {searchResults.length > 0 ? (
                  searchResults.map((item, index) => (
                    <tr key={item.id} className="border-b">
                      <td className="p-2 border">{(currentPage - 1) * limit + index + 1}</td>
                      <td className="p-2 border">{item.variant?.product?.name}</td>
                      <td className="p-2 border">
                        {item.variant?.product?.thumbnail && (
                          <img
                            src={`${Constants.DOMAIN_API}/uploads/${item.variant.product.thumbnail}`}
                            alt={item.variant.product.name}
                            className="w-20 h-20 object-cover rounded"
                          />
                        )}
                      </td>
                      <td className="p-2 border">{formatCurrency(item.variant?.price)}</td>
                      <td className="p-2 border text-center">
                        <Link
                          to={`/product/${item.variant?.product?.slug}`}
                          className="bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-700"
                        >
                          Xem
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : searchError ? (
                  <tr><td colSpan="5" className="p-4 text-center text-red-500">{searchError}</td></tr>
                ) : (
                  wishlistItems.map((item, index) => (
                    <tr key={item.id} className="border-b">
                      <td className="p-2 border">{(currentPage - 1) * limit + index + 1}</td>
                      <td className="p-2 border">{item.variant?.product?.name}</td>
                      <td className="p-2 border">
                        {item.variant?.product?.thumbnail && (
                          <img
                            src={`${Constants.DOMAIN_API}/uploads/${item.variant.product.thumbnail}`}
                            alt={item.variant.product.name}
                            className="w-20 h-20 object-cover rounded"
                          />
                        )}
                      </td>
                      <td className="p-2 border">{formatCurrency(item.variant?.price)}</td>
                      <td className="p-2 border text-center">
                        <Link
                          to={`/product/${item.variant?.product?.slug}`}
                          className="bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-700"
                        >
                          Xem
                        </Link>
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

export default WishlistList;