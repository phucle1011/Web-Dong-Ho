import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Constants from "../../../../Constants.jsx";
import { toast } from "react-toastify";
import FormDelete from "../../../../components/formDelete";
import {
  FaChevronLeft,
  FaChevronRight,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
} from "react-icons/fa";

function CategoryGetAll() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const perPage = 10;

  useEffect(() => {
    getCategories(currentPage, searchTerm);
  }, [currentPage]);

  const getCategories = async (page = 1, search = "") => {
    try {
      const res = await axios.get(`${Constants.DOMAIN_API}/admin/category/list`, {
        params: { page, limit: perPage, searchTerm: search },
      });
      setCategories(res.data.data || []);
      setTotalPages(res.data.pagination?.totalPages || 1);
      if (search && (res.data.data || []).length === 0) {
        toast.info("Không tìm thấy danh mục nào.");
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách danh mục:", error);
      toast.error("Không thể tải danh mục.");
    }
  };

  const deleteCategory = async () => {
    if (!selectedCategory) return;

    try {
      await axios.delete(`${Constants.DOMAIN_API}/admin/category/${selectedCategory.id}`);
      toast.success("Xóa danh mục thành công");
      if (categories.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        getCategories(currentPage, searchTerm);
      }
    } catch (error) {
      console.error("Lỗi khi xóa danh mục:", error);
      if (error.response?.data?.error?.includes("foreign key constraint fails")) {
        toast.error("Không thể xóa vì có sản phẩm đang sử dụng danh mục này.");
      } else {
        toast.error("Xóa thất bại. Vui lòng thử lại.");
      }
    } finally {
      setSelectedCategory(null);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    getCategories(1, searchTerm);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setCurrentPage(1);
    getCategories(1, "");
  };

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
          className={`px-3 py-1 border rounded ${i === currentPage ? "bg-blue-600 text-white" : "bg-white"}`}
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
        <h2 className="text-xl font-semibold">Danh sách danh mục</h2>
        <Link
          to="/admin/categories/create"
          className="inline-block bg-[#073272] text-white px-4 py-2 rounded"
        >
          + Thêm danh mục
        </Link>
      </div>

      <div className="mb-4 flex gap-2">
        <input
          type="text"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="Nhập tên danh mục cần tìm..."
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
            <th className="border p-2">Tên</th>
            <th className="border p-2">Mô tả</th>
            <th className="border p-2">Trạng thái</th>
            <th className="border p-2">Ngày tạo</th>
            <th className="border p-2">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat, index) => (
            <tr key={cat.id} className="hover:bg-gray-50">
              <td className="border p-2 text-center">{(currentPage - 1) * perPage + index + 1}</td>
              <td className="border p-2">{cat.name}</td>
              <td className="border p-2">{cat.description || "-"}</td>
              <td className="border p-2 text-center">
                <span
                  className={`px-2 py-1 rounded-full text-xs ${cat.status === "active"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                    }`}
                >
                  {cat.status === "active" ? "Hiển thị" : "Ẩn"}
                </span>
              </td>
              <td className="border p-2 text-center">
                {new Date(cat.created_at).toLocaleDateString()}
              </td>
              <td className="border p-2 text-center space-x-2">
                <Link
                  to={`/admin/categories/edit/${cat.id}`}
                  className="bg-yellow-500 text-white py-1 px-3 rounded"
                >
                  <i className="fa-solid fa-pen-to-square"></i>
                </Link>
                <button
                  onClick={() => setSelectedCategory(cat)}
                  className="bg-red-500 text-white py-1 px-3 rounded"
                >
                  <i className="fa-solid fa-trash"></i>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {renderPagination()}

      {selectedCategory && (
        <FormDelete
          isOpen={true}
          onClose={() => setSelectedCategory(null)}
          onConfirm={deleteCategory}
          message={`Bạn có chắc chắn muốn xóa danh mục "${selectedCategory.name}" không?`}
        />
      )}
    </div>
  );
}

export default CategoryGetAll;
