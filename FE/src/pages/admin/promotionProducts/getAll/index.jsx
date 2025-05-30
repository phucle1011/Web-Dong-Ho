import React, { useEffect, useState } from "react";
import axios from "axios";
import Constants from "../../../../Constants.jsx";
import { Link } from "react-router-dom";
import {
  FaAngleDoubleLeft,
  FaChevronLeft,
  FaChevronRight,
  FaAngleDoubleRight,
} from "react-icons/fa";

const PromotionProductList = () => {
  const [promotionProducts, setPromotionProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedPromos, setExpandedPromos] = useState({});
  const pageSize = 10;

  useEffect(() => {
    axios
      .get(`${Constants.DOMAIN_API}/admin/promotion?page=1&limit=1000`)
      .then((response) => {
        const data = Array.isArray(response.data?.data)
          ? response.data.data
          : [];
        setPromotionProducts(data);
        setFilteredProducts(data);
      })
      .catch((error) => {
        console.error("Lỗi khi lấy dữ liệu:", error);
      });
  }, []);

  const handleSearch = () => {
    const filtered = promotionProducts.filter((item) =>
      item?.promotion?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setFilteredProducts(promotionProducts);
    setCurrentPage(1);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa?")) {
      try {
        await axios.delete(`${Constants.DOMAIN_API}/admin/promotions/${id}`);
        alert("Xóa thành công!");
        const updated = promotionProducts.filter((item) => item.id !== id);
        setPromotionProducts(updated);
        setFilteredProducts(updated);
      } catch (err) {
        console.error("Lỗi khi xóa sản phẩm khuyến mãi:", err);
        alert("Xóa thất bại!");
      }
    }
  };

  const getPromotionStatus = (startDate, endDate) => {
    if (!startDate || !endDate) return "Không xác định";
    const currentDate = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (currentDate < start) return "Sắp bắt đầu";
    if (currentDate <= end) return "Đang hoạt động";
    return "Đã kết thúc";
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

  const groupedProducts = groupByPromotionName(filteredProducts);
  const totalPages = Math.ceil(groupedProducts.length / pageSize);
  const paginatedGroups = groupedProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const toggleExpand = (promoName) => {
    setExpandedPromos((prev) => ({
      ...prev,
      [promoName]: !prev[promoName],
    }));
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 border rounded ${
            i === currentPage ? "bg-blue-600 text-white" : "bg-white"
          }`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="flex justify-center items-center gap-1 mt-4 flex-wrap">
        <button
          disabled={currentPage === 1}
          onClick={() => handlePageChange(1)}
          className="px-2 py-1 border rounded disabled:opacity-50"
          title="Trang đầu"
        >
          <FaAngleDoubleLeft />
        </button>
        <button
          disabled={currentPage === 1}
          onClick={() => handlePageChange(currentPage - 1)}
          className="px-2 py-1 border rounded disabled:opacity-50"
          title="Trang trước"
        >
          <FaChevronLeft />
        </button>
        {pages}
        <button
          disabled={currentPage === totalPages}
          onClick={() => handlePageChange(currentPage + 1)}
          className="px-2 py-1 border rounded disabled:opacity-50"
          title="Trang sau"
        >
          <FaChevronRight />
        </button>
        <button
          disabled={currentPage === totalPages}
          onClick={() => handlePageChange(totalPages)}
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
          {paginatedGroups.length > 0 ? (
            paginatedGroups.map(([promoName, items, variantCount, promotionId]) => {
              const promo = items[0]?.promotion || {};
              const expanded = expandedPromos[promoName];

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
                    <td className="border p-2">
                      <span
                        className={
                          getPromotionStatus(promo.start_date, promo.end_date) ===
                          "Đang hoạt động"
                            ? "text-green-600"
                            : getPromotionStatus(promo.start_date, promo.end_date) ===
                              "Sắp bắt đầu"
                            ? "text-blue-600"
                            : "text-red-600"
                        }
                      >
                        {getPromotionStatus(promo.start_date, promo.end_date)}
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
                        {expanded ? "Thu gọn" : "Xem thêm"}
                      </button>
                    </td>
                  </tr>

                  {expanded && (
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
                            {items.map((item) => (
                              <tr key={item.id}>
                                <td className="border p-2">{item.id || "-"}</td>
                                <td className="border p-2">{promoName}</td>
                                <td className="border p-2">
                                  {item.variant?.sku || item.product_variant_id || "-"}
                                </td>
                                <td className="border p-2 text-center">
                                  <span
                                    className={
                                      getPromotionStatus(
                                        item.promotion?.start_date,
                                        item.promotion?.end_date
                                      ) === "Đang hoạt động"
                                        ? "text-green-600"
                                        : getPromotionStatus(
                                            item.promotion?.start_date,
                                            item.promotion?.end_date
                                          ) === "Sắp bắt đầu"
                                        ? "text-blue-600"
                                        : "text-red-600"
                                    }
                                  >
                                    {getPromotionStatus(
                                      item.promotion?.start_date,
                                      item.promotion?.end_date
                                    )}
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
                            ))}
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
      {renderPagination()}
    </div>
  );
};

export default PromotionProductList;