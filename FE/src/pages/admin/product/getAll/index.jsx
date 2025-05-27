import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Constants from "../../../../Constants.jsx";
import FormDelete from "../../../../components/formDelete";
import {
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

const AdminProductList = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState(""); // dùng để lưu input tạm thời
  const recordsPerPage = 10;

  useEffect(() => {
    if (searchTerm === "") {
      // Nếu không tìm kiếm thì gọi lấy sản phẩm bình thường
      fetchProducts(currentPage);
    } else {
      searchProducts(currentPage, searchTerm);
    }
  }, [currentPage, searchTerm]);

  // Tách hàm search riêng
  const searchProducts = async (page, search) => {
    try {
      const res = await axios.get(
        `${Constants.DOMAIN_API}/admin/products/productList/search`,
        {
          params: { searchTerm: search, page, limit: recordsPerPage },
        }
      );
      setProducts(res.data.data);
      setTotalPages(res.data.totalPages || 1);
    } catch (error) {
      console.error("Lỗi khi tìm kiếm sản phẩm:", error);
      setProducts([]);
      setTotalPages(1);
    }
  };
  const deleteProduct = async () => {
    if (!selectedProduct) return;

    try {
      await axios.delete(
        `${Constants.DOMAIN_API}/admin/products/${selectedProduct.id}`
      );
      toast.success("Xóa sản phẩm thành công");
      if (products.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        fetchProducts(currentPage, searchTerm);
      }
    } catch (error) {
      console.error("Lỗi khi xóa sản phẩm:", error);
      if (
        error.response?.data?.error?.includes("foreign key constraint fails")
      ) {
        toast.error("Không thể xóa vì có sản phẩm đang sử dụng sản phẩm này.");
      } else {
        toast.error("Xóa thất bại. Vui lòng thử lại.");
      }
    } finally {
      setSelectedProduct(null);
    }
  };

  const fetchProducts = async (page, search = "") => {
    try {
      const params = { page, limit: recordsPerPage };
      if (search) params.searchTerm = search;

      const res = await axios.get(`${Constants.DOMAIN_API}/admin/products`, {
        params,
      });
      console.log(res.data);

      setProducts(res.data.data);
      setTotalPages(res.data.pagination.totalPages);
    } catch (error) {
      console.error("Lỗi khi lấy sản phẩm:", error);
    }
  };

  const handleSearchInputChange = (e) => {
    setSearchInput(e.target.value);
  };

  const handleSearchSubmit = async () => {
    const trimmedSearch = searchInput.trim();
    if (!trimmedSearch) {
      // Nếu search rỗng thì gọi lại fetchProducts bình thường (reset search)
      setSearchTerm("");
      setCurrentPage(1);
      return;
    }

    try {
      setCurrentPage(1); // Reset trang 1 khi tìm kiếm
      // Gọi API riêng cho tìm kiếm
      const res = await axios.get(
        `${Constants.DOMAIN_API}/admin/products/productList/search`,
        {
          params: {
            searchTerm: trimmedSearch,
            page: 1,
            limit: recordsPerPage,
          },
        }
      );

      setProducts(res.data.data);
      setTotalPages(res.data.totalPages || 1);
      setSearchTerm(trimmedSearch);
    } catch (error) {
      console.error("Lỗi khi tìm kiếm sản phẩm:", error);
      setProducts([]);
      setTotalPages(1);
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="container mx-auto p-2">
      <div className="bg-white p-4 shadow rounded-md">
        <h2 className="text-xl font-semibold mb-4">Danh sách sản phẩm</h2>

        <div className="flex justify-end mb-2">
          <Link
            to="/admin/products/create"
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            + Thêm sản phẩm
          </Link>
        </div>

        <div className="mb-3 flex gap-2">
          <input
            type="text"
            value={searchInput}
            onChange={handleSearchInputChange}
            placeholder="Tìm kiếm theo tên sản phẩm..."
            className="border p-2 rounded flex-grow"
            onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
          />
          <button
            onClick={handleSearchSubmit}
            className="ms-2 p-2 border flex gap-2 bg-blue-900 hover:bg-blue-800 text-white py-1 px-3 rounded"
          >
            Tìm kiếm
          </button>
        </div>

        <table className="w-full border-collapse border border-gray-300 mt-3">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">#</th>
              <th className="p-2 border">Tên</th>
              <th className="p-2 border">Ảnh</th>
              <th className="p-2 border">Trạng thái</th>
              <th className="p-2 border">Danh mục</th>
              <th className="p-2 border">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-4 text-center">
                  Không có sản ph ẩm nào.
                </td>
              </tr>
            ) : (
              products.map((product, index) => (
                <tr key={product.id} className="border-b">
                  <td className="p-2 border">
                    {(currentPage - 1) * recordsPerPage + index + 1}
                  </td>
                  <td className="p-2 border">{product.name}</td>
                  <td className="p-2 border">
                    <img
                      src={
                        product.thumbnail || "https://via.placeholder.com/60"
                      }
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  </td>
                  <td className="border p-2 text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        product.status === 1
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {product.status === 1 ? "Hiển thị" : "Ẩn"}
                    </span>
                  </td>{" "}
                  <td className="p-2 border">
                    {product.category?.name || "Không có"}
                  </td>
                  <td className="p-2 border flex gap-2 justify-center flex-wrap">
                    <Link
                      to={`/admin/products/detail/${product.id}`}
                      className="bg-green-500 text-white py-1 px-3 rounded"
                    >
                      Xem
                    </Link>
                    <Link
                      to={`/admin/products/addVariant/${product.id}`}
                      className="bg-yellow-500 text-white py-1 px-3 rounded"
                    >
                      Thêm biến thể
                    </Link>
                    <button
                      onClick={() => setSelectedProduct(product)}
                      className="bg-red-500 text-white py-1 px-3 rounded"
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
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
                  className={`px-3 py-1 border rounded ${
                    currentPage === page
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
              {currentPage < totalPages - 2 && (
                <span className="px-2">...</span>
              )}
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
      {selectedProduct && (
        <FormDelete
          isOpen={true}
          onClose={() => setSelectedProduct(null)}
          onConfirm={deleteProduct}
          message={`Bạn có chắc chắn muốn xóa sản phẩm "${selectedProduct.name}" không?`}
        />
      )}
    </div>
  );
};

export default AdminProductList;
