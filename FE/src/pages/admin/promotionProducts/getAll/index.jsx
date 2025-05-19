import React, { useEffect, useState } from "react";
import axios from "axios";
import Constants from "../../../../Constants.jsx";
import { Link } from "react-router-dom";
import { FaAngleDoubleLeft, FaChevronLeft, FaChevronRight, FaAngleDoubleRight } from "react-icons/fa";

const PromotionProductList = () => {
  const [promotionProducts, setPromotionProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    axios
      .get(`${Constants.DOMAIN_API}/admin/promotion`)
      .then((response) => {
        const data = Array.isArray(response.data) ? response.data : [];
        setPromotionProducts(data);
        setFilteredProducts(data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  const handleSearch = () => {
    const filtered = promotionProducts.filter((item) =>
      item?.Promotion?.name?.toLowerCase().includes(searchTerm.toLowerCase())
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
        await axios.delete(`${Constants.DOMAIN_API}/admin/promotion/${id}`);
        alert("Xóa thành công!");
        const updated = promotionProducts.filter((item) => item.id !== id);
        setPromotionProducts(updated);
        setFilteredProducts(updated);
      } catch (err) {
        console.error(err);
        alert("Xóa thất bại!");
      }
    }
  };

  const totalPages = Math.ceil(filteredProducts.length / pageSize);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const renderPagination = () => {
    const pages = [];
    const start = Math.max(1, currentPage - 1);
    const end = Math.min(totalPages, currentPage + 1);

    for (let i = start; i <= end; i++) {
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
      <div className="flex justify-center items-center gap-1 mt-4">
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

        {pages}

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
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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
        >
          <i className="fa fa-search"></i>
        </button>

        {searchTerm && (
          <button
            onClick={handleClearSearch}
            className="bg-[#073272] text-white px-4 py-2 text-sm rounded whitespace-nowrap"
          >
            Xem tất cả
          </button>
        )}
      </div>

       <table className="w-full table-auto border border-collapse border-gray-300">
      <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">#</th>
            <th className="border p-2">Mã khuyến mại</th>
            <th  className="border p-2">ID biến thể sản phẩm</th>
            <th  className="border p-2">Giá trị chiết khấu(%)</th>
            <th  className="border p-2">Ngày tạo</th>
            <th className="border p-2">Ngày cập nhật</th>
            <th  className="border p-2">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {paginatedProducts.length > 0 ? (
            paginatedProducts.map((item) => (
              <tr key={item.id}>
                <td className="border p-2 text-center">{item.id}</td>
                <td className="border p-2">{item.Promotion?.name || item.promotion_id}</td>
                <td className="border p-2">
                  {item.ProductVariant?.product?.name ||
                    item.product_variant_id}
                </td >
                <td className="border p-2">{item.discount_value}%</td>
                <td className="border p-2">
                  {new Date(item.created_at).toLocaleString("vi-VN", {
                    hour12: false,
                  })}
                </td>
                <td className="border p-2">
                  {new Date(item.updated_at).toLocaleString("vi-VN", {
                    hour12: false,
                  })}
                </td >
                <td className="border p-2 text-center space-x-2">
                  <Link
                    to={`/admin/promotion/edit/${item.id}`}
                    className="bg-yellow-500 text-white py-1 px-3 rounded"
                  >
                    <i className="fa-solid fa-pen-to-square"></i>
                  </Link>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="bg-red-500 text-white py-1 px-3 rounded"
                  >
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="text-center">
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
