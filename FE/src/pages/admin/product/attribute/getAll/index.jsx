import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Constants from "../../../../../Constants.jsx";
import { toast } from "react-toastify";
import FormDelete from "../../../../../components/formDelete";
import {
  FaChevronLeft,
  FaChevronRight,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaTrashAlt,
} from "react-icons/fa";

function AttributeGetAll() {
  const [attributes, setAttributes] = useState([]);
  const [selectedAttribute, setSelectedAttribute] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const perPage = 10;

  useEffect(() => {
    getAttributes(currentPage, searchTerm);
  }, [currentPage]);

  const getAttributes = async (page = 1, search = "") => {
    try {
      const res = await axios.get(`${Constants.DOMAIN_API}/admin/attribute`, {
        params: { page, limit: perPage, searchTerm: search },
      });
      setAttributes(res.data.data || []);
      setTotalPages(res.data.pagination?.totalPages || 1);
      if (search && (res.data.data || []).length === 0) {
        toast.info("Không tìm thấy thuộc tính nào.");
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách thuộc tính:", error);
      toast.error("Không thể tải danh sách.");
    }
  };

  const deleteAttribute = async () => {
    if (!selectedAttribute) return;

    try {
      await axios.delete(`${Constants.DOMAIN_API}/admin/attribute/${selectedAttribute.id}`);
      toast.success("Xoá thuộc tính thành công");
      if (attributes.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        getAttributes(currentPage, searchTerm);
      }
    } catch (error) {
      console.error("Lỗi khi xoá thuộc tính:", error);
      toast.error("Xóa thất bại. Vui lòng thử lại.");
    } finally {
      setSelectedAttribute(null);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    getAttributes(1, searchTerm);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setCurrentPage(1);
    getAttributes(1, "");
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
        <h2 className="text-xl font-semibold">Danh sách thuộc tính</h2>
        <Link
          to="/admin/attribute/create"
          className="inline-block bg-[#073272] text-white px-4 py-2 rounded"
        >
          + Thêm thuộc tính
        </Link>
      </div>

      <div className="mb-4 flex gap-2">
        <input
          type="text"
          className="shadow border rounded w-full py-2 px-3 text-gray-700"
          placeholder="Nhập tên thuộc tính cần tìm..."
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
            <th className="border p-2">Tên thuộc tính</th>
            <th className="border p-2">Ngày tạo</th>
            <th className="border p-2">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {attributes.map((attr, index) => (
            <tr key={attr.id} className="hover:bg-gray-50">
              <td className="border p-2 text-center">
                {(currentPage - 1) * perPage + index + 1}
              </td>
              <td className="border p-2">{attr.name}</td>
              <td className="border p-2 text-center">
                {new Date(attr.created_at).toLocaleDateString()}
              </td>
              <td className="border p-2 text-center space-x-2">
                <Link
                  to={`/admin/attribute/edit/${attr.id}`}
                  className="bg-yellow-500 text-white py-1 px-3 rounded"
                >
                  <i className="fa-solid fa-pen-to-square"></i>
                </Link>
                <button
                  onClick={() => setSelectedAttribute(attr)}
                  className="p-2 rounded-full bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 transition"
                >
                  <FaTrashAlt />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {renderPagination()}

      {selectedAttribute && (
        <FormDelete
          isOpen={true}
          onClose={() => setSelectedAttribute(null)}
          onConfirm={deleteAttribute}
          message={`Bạn có chắc chắn muốn xoá thuộc tính "${selectedAttribute.name}" không?`}
        />
      )}
    </div>
  );
}

export default AttributeGetAll;
