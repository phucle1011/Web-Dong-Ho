import React, { useEffect, useState } from "react";
import axios from "axios";
import Constants from "../../../../Constants.jsx";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FaAngleDoubleLeft,
  FaChevronLeft,
  FaChevronRight,
  FaAngleDoubleRight,
} from "react-icons/fa";

const PromotionProductList = () => {
  const [promotionProducts, setPromotionProducts] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getPromotionStatus = (startDate, endDate) => {
    if (!startDate || !endDate) return "inactive";
    const currentDate = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (currentDate < start) return "upcoming";
    if (currentDate <= end) return "active";
    return "expired";
  };

  const getStatusDisplayName = (status) => ({
    active: "Đang diễn ra",
    upcoming: "Sắp diễn ra",
    expired: "Đã hết hạn",
    inactive: "Vô hiệu hóa",
    exhausted: "Hết lượt sử dụng",
  }[status] || "Vô hiệu hóa");

  const getStatusBadgeClass = (status) => ({
    active: "bg-green-100 text-green-800",
    upcoming: "bg-blue-100 text-blue-800",
    expired: "bg-red-100 text-red-800",
    inactive: "bg-gray-200 text-gray-800",
    exhausted: "bg-yellow-100 text-yellow-800",
  }[status] || "bg-gray-200 text-gray-800");

  const fetchPromotions = async (page = 1, search = "") => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${Constants.DOMAIN_API}/admin/promotion`, {
        params: { page, limit: pagination.limit, searchTerm: search },
      });
      const data = Array.isArray(response.data?.data) ? response.data.data : [];
      setPromotionProducts(data);
      setPagination(
        response.data?.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 }
      );
    } catch (err) {
      console.error("Lỗi khi lấy dữ liệu:", err);
      setError("Không thể tải danh sách khuyến mãi!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions(1, "");
  }, []);

  const handleSearch = () => {
    fetchPromotions(1, searchTerm);
    setExpanded(null);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    fetchPromotions(1, "");
    setExpanded(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa?")) {
      try {
        await axios.delete(`${Constants.DOMAIN_API}/admin/promotions/${id}`);
        toast.success("Xóa thành công!");
        fetchPromotions(pagination.page, searchTerm);
      } catch (err) {
        console.error("Lỗi khi xóa sản phẩm khuyến mãi:", err);
        toast.error("Xóa thất bại!");
      }
    }
  };

  const groupByPromotionName = (products) => {
    const grouped = {};
    products.forEach((item) => {
      const promoName = item.promotion?.name || "Không rõ tên";
      if (!grouped[promoName]) grouped[promoName] = [];
      grouped[promoName].push(item);
    });

    return Object.entries(grouped).map(([name, items]) => {
      const variantCount = items.length;
      const promotionId = items[0]?.promotion?.id || null;
      return [name, items, variantCount, promotionId];
    });
  };

  const groupedProducts = groupByPromotionName(promotionProducts);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      fetchPromotions(page, searchTerm);
      setExpanded(null);
    }
  };

  const toggleExpand = (promoName) => {
    setExpanded(expanded === promoName ? null : promoName);
  };

  const renderPagination = () => {
    const pages = [];
    const maxPagesToShow = 5;
    const startPage = Math.max(1, pagination.page - Math.floor(maxPagesToShow / 2));
    const endPage = Math.min(pagination.totalPages, startPage + maxPagesToShow - 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 border rounded ${
            i === pagination.page ? "bg-blue-600 text-white" : "bg-white"
          }`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="flex justify-center items-center gap-1 mt-4 flex-wrap">
        <button
          disabled={pagination.page === 1}
          onClick={() => handlePageChange(1)}
          className="px-2 py-1 border rounded disabled:opacity-50"
          title="Trang đầu"
        >
          <FaAngleDoubleLeft />
        </button>
        <button
          disabled={pagination.page === 1}
          onClick={() => handlePageChange(pagination.page - 1)}
          className="px-2 py-1 border rounded disabled:opacity-50"
          title="Trang trước"
        >
          <FaChevronLeft />
        </button>
        {pages}
        <button
          disabled={pagination.page === pagination.totalPages}
          onClick={() => handlePageChange(pagination.page + 1)}
          className="px-2 py-1 border rounded disabled:opacity-50"
          title="Trang sau"
        >
          <FaChevronRight />
        </button>
        <button
          disabled={pagination.page === pagination.totalPages}
          onClick={() => handlePageChange(pagination.totalPages)}
          className="px-2 py-1 border rounded disabled:opacity-50"
          title="Trang cuối"
        >
          <FaAngleDoubleRight />
        </button>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4 bg-white shadow rounded">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Danh sách khuyến mãi</h2>
        <Link
          to="/admin/promotion-products/create"
          className="inline-block bg-[#073272] text-white px-4 py-2 rounded"
        >
          + Thêm khuyến mãi
        </Link>
      </div>

      <div className="mb-4 flex gap-2">
        <input
          type="text"
          className="shadow border rounded w-full py-2 px-3 text-gray-700 focus:outline-none"
          placeholder="Nhập tên khuyến mãi cần tìm..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch();
          }}
        />
        <button
          onClick={handleSearch}
          className="bg-[#073272] text-white px-4 py-2 rounded"
          title="Tìm kiếm"
        >
          <i className="fa fa-search"></i>
        </button>
        {searchTerm && (
          <button
            onClick={handleClearSearch}
            className="bg-[#073272] text-white px-4 py-2 text-sm rounded whitespace-nowrap"
            title="Xem tất cả"
          >
            Xem tất cả
          </button>
        )}
      </div>

      {loading && <div className="text-center py-4">Đang tải...</div>}
      {error && <div className="text-center py-4 text-red-600">{error}</div>}

      {!loading && !error && (
        <table className="w-full table-auto border border-collapse border-gray-300">
          <thead>
            <tr>
              <th className="border p-2">Tên khuyến mãi</th>
              <th className="border p-2">Ngày bắt đầu</th>
              <th className="border p-2">Ngày kết thúc</th>
              <th className="border p-2">Trạng thái</th>
              <th className="border p-2">Số lượng biến thể</th>
              <th className="border p-2">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {groupedProducts.length > 0 ? (
              groupedProducts.map(([promoName, items, variantCount, promotionId]) => {
                const promo = items[0]?.promotion || {};
                const isExpanded = expanded === promoName;
                const status = getPromotionStatus(promo.start_date, promo.end_date);

                return (
                  <React.Fragment key={promoName}>
                    <tr className="bg-gray-100">
                      <td className="border p-2 font-bold">{promoName}</td>
                      <td className="border p-2">
                        {promo.start_date
                          ? new Date(promo.start_date).toLocaleDateString("vi-VN")
                          : "-"}
                      </td>
                      <td className="border p-2">
                        {promo.end_date
                          ? new Date(promo.end_date).toLocaleDateString("vi-VN")
                          : "-"}
                      </td>
                      <td className="border p-2 text-center">
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(
                            status
                          )}`}
                        >
                          {getStatusDisplayName(status)}
                        </span>
                      </td>
                      <td className="border p-2 text-center">{variantCount}</td>
                      <td className="border p-2 text-right space-x-2">
                        {promotionId ? (
                          <Link
                            to={`/admin/promotion-products/edit/${promotionId}`}
                            className="bg-yellow-500 text-white py-1 px-3 rounded"
                            title="Sửa"
                          >
                            <i className="fa-solid fa-pen-to-square"></i>
                          </Link>
                        ) : (
                          <span
                            className="bg-gray-400 text-white py-1 px-3 rounded cursor-not-allowed"
                            title="Không thể sửa do thiếu ID khuyến mãi"
                          >
                            <i className="fa-solid fa-pen-to-square"></i>
                          </span>
                        )}
                        <button
                          onClick={() => toggleExpand(promoName)}
                          className="bg-blue-500 text-white py-1 px-3 rounded"
                        >
                          {isExpanded ? "Thu gọn" : "Xem thêm"}
                        </button>
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr>
                        <td colSpan={6}>
                          <table className="w-full table-auto border border-collapse border-gray-300">
                            <thead>
                              <tr>
                                <th className="border p-2">ID</th>
                                <th className="border p-2">Tên khuyến mãi</th>
                                <th className="border p-2">SKU biến thể</th>
                                <th className="border p-2">Trạng thái</th>
                                <th className="border p-2">Hành động</th>
                              </tr>
                            </thead>
                            <tbody>
                              {items.map((item) => {
                                const itemStatus = getPromotionStatus(
                                  item.promotion?.start_date,
                                  item.promotion?.end_date
                                );
                                return (
                                  <tr key={item.id}>
                                    <td className="border p-2">{item.id || "-"}</td>
                                    <td className="border p-2">{promoName}</td>
                                    <td className="border p-2">
                                      {item.variant?.sku || item.product_variant_id || "-"}
                                    </td>
                                    <td className="border p-2 text-center">
                                      <span
                                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(
                                          itemStatus
                                        )}`}
                                      >
                                        {getStatusDisplayName(itemStatus)}
                                      </span>
                                    </td>
                                    <td className="border p-2 text-center">
                                      <button
                                        onClick={() => handleDelete(item.id)}
                                        className="bg-red-500 text-white py-1 px-3 rounded"
                                        title="Xóa"
                                      >
                                        <i className="fa-solid fa-trash"></i>
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-4">
                  Không có dữ liệu
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {renderPagination()}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default PromotionProductList;