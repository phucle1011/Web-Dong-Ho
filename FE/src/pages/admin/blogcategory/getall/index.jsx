import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Constants from "../../../../Constants.jsx";
import { toast } from "react-toastify";
import FormDelete from "../../../../components/formDelete";
import {
  FaChevronLeft,
  FaChevronRight,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaEdit,
  FaTrashAlt
} from "react-icons/fa";

function Blogcategory() {
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const perPage = 10;
  const navigate = useNavigate();

  // Modal xóa
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    fetchCategories(currentPage, searchTerm);
  }, [currentPage]);

  const fetchCategories = async (page = 1, search = "") => {
    try {
      const res = await axios.get(`${Constants.DOMAIN_API}/admin/blogcategory/list`, {
        params: { page, limit: perPage, searchTerm: search }
      });
      setCategories(res.data.data || []);
      setTotalPages(res.data.pagination?.totalPages || 1);
      if (search && res.data.data?.length === 0) {
        toast.info("Không tìm thấy danh mục nào.");
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh mục bài viết:", error);
      toast.error("Không thể tải danh mục.");
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchCategories(1, searchTerm);
  };

  const confirmDelete = async ({ id }) => {
    try {
      const res = await axios.delete(`${Constants.DOMAIN_API}/admin/blogcategory/${id}`);
      if (res.data.success) {
        toast.success("Xóa danh mục thành công!");
        fetchCategories(currentPage, searchTerm);
      } else {
        toast.error(res.data.message || "Xóa thất bại.");
      }
    } catch (error) {
      console.error("Lỗi khi xóa danh mục:", error);
      toast.error("Không thể xóa danh mục.");
    }
    setIsDeleteOpen(false); // đóng modal sau khi xử lý
  };

  const renderPagination = () => {
    const pages = [];
    const start = Math.max(1, currentPage - 1);
    const end = Math.min(totalPages, currentPage + 1);
    for (let i = start; i <= end; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`px-3 py-1 border rounded ${i === currentPage ? "bg-blue-600 text-white" : "bg-white"}`}
        >
          {i}
        </button>
      );
    }
    return (
      <div className="flex justify-center gap-2 mt-4">
        <button disabled={currentPage === 1} onClick={() => setCurrentPage(1)}><FaAngleDoubleLeft /></button>
        <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}><FaChevronLeft /></button>
        {pages}
        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}><FaChevronRight /></button>
        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(totalPages)}><FaAngleDoubleRight /></button>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4 bg-white shadow rounded">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Danh mục bài viết</h2>
        <Link to="/admin/blogcategory/add" className="bg-[#073272] text-white px-4 py-2 rounded">+ Thêm danh mục</Link>
      </div>

      <div className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Tìm danh mục..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="border rounded w-full px-3 py-2"
        />
        <button onClick={handleSearch} className="bg-[#073272] text-white px-4 py-2 rounded">Tìm</button>
      </div>

      <table className="w-full table-auto border border-collapse border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">#</th>
            <th className="border p-2">Tên danh mục</th>
            <th className="border p-2">Slug</th>
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
              <td className="border p-2">{cat.slug}</td>
              <td className="border p-2 text-center">
                <span className={`px-2 py-1 rounded-full text-xs ${cat.status ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                  {cat.status ? "Hiển thị" : "Ẩn"}
                </span>
              </td>
              <td className="border p-2 text-center">{new Date(cat.created_at).toLocaleDateString("vi-VN")}</td>
              <td>
                <div className="flex gap-2 justify-center">
                  <button
                    className="btn btn-warning btn-sm"
                    onClick={() => navigate(`/admin/blogcategory/edit/${cat.id}`)}
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="p-2 rounded-full bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 transition duration-200"
                    onClick={() => {
                      setDeleteId(cat.id);
                      setIsDeleteOpen(true);
                    }}
                  >
                    <FaTrashAlt size={20} className="font-bold" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {renderPagination()}

      {/* Gọi modal FormDelete */}
      <FormDelete
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={confirmDelete}
        message="Bạn có chắc chắn muốn xóa danh mục này không?"
        Id={deleteId}
      />
    </div>
  );
}

export default Blogcategory;
