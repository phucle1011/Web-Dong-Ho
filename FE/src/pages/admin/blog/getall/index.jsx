import { useEffect, useState, useRef } from "react";
import axios from "axios";
import Constants from "../../../../Constants";
import {
  FaSearch,
  FaAngleDoubleLeft,
  FaChevronLeft,
  FaChevronRight,
  FaAngleDoubleRight,
  FaEye,
  FaEdit,
  FaTrashAlt,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import FormDelete from "../../../../components/formDelete";

function BlogList() {
  const [blogs, setBlogs] = useState([]);
  const [limit] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedIdToDelete, setSelectedIdToDelete] = useState(null);
  const navigate = useNavigate();
  const debounceTimer = useRef(null);

  const fetchBlogs = async (page = 1, search = "") => {
    try {
      const response = await axios.get(`${Constants.DOMAIN_API}/admin/blog/list`, {
        params: { page, limit, search },
      });
      setBlogs(response.data.data);
      setTotalPages(response.data.pagination.totalPages);
      setCurrentPage(response.data.pagination.currentPage);
    } catch (error) {
      console.error("Lỗi khi tải bài viết:", error);
    }
  };

  useEffect(() => {
    fetchBlogs(currentPage, searchTerm);
  }, [currentPage]);

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setCurrentPage(1);
      fetchBlogs(1, searchTerm);
    }, 500);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [searchTerm]);

  const confirmDelete = (id) => {
    setSelectedIdToDelete(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async ({ id }) => {
    try {
      await axios.delete(`${Constants.DOMAIN_API}/admin/blog/${id}`);
      setShowDeleteModal(false);
      Swal.fire("Đã xóa!", "Bài viết đã được xóa.", "success");
      fetchBlogs(currentPage, searchTerm);
    } catch (error) {
      setShowDeleteModal(false);
      Swal.fire("Lỗi", "Không thể xóa bài viết", "error");
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12 d-flex align-items-stretch">
          <div className="card w-100">
            <div className="card-body p-4">
              <div className="d-flex justify-between items-center mb-4">
                <h5 className="card-title fw-semibold">Danh sách bài viết</h5>
                <button
                  className="inline-block bg-[#073272] text-white px-4 py-2 rounded"
                  onClick={() => navigate("/admin/blog/add")}
                >
                  + Thêm bài viết
                </button>
              </div>

              <div className="mb-4 d-flex" style={{ maxWidth: "100%" }}>
                <input
                  type="text"
                  className="flex-grow shadow border border-gray-300 rounded py-2 px-4 text-gray-700"
                  placeholder="Tìm theo tiêu đề..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button
                  className="bg-blue-900 hover:bg-blue-800 text-white px-4 py-1.5 rounded ms-2"
                  onClick={() => fetchBlogs(1, searchTerm)}
                >
                  <FaSearch />
                </button>
              </div>

              <div className="table-responsive">
                <table className="table text-nowrap mb-0 align-middle">
                  <thead className="text-dark fs-4">
                    <tr>
                      <th>ID</th>
                      <th>Tiêu đề</th>
                      <th>Hình ảnh</th>
                      <th>Nội dung</th>
                      <th>Người viết</th>
                      <th>Danh mục</th>
                      <th>Ngày tạo</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {blogs.length > 0 ? (
                      blogs.map((blog, index) => (
                        <tr key={blog.id}>
                          <td>{(currentPage - 1) * limit + index + 1}</td>
                          <td>{blog.title}</td>
                          <td>
                            <img
                              src={blog.image_url}
                              alt={blog.title}
                              style={{ width: "100px", height: "auto" }}
                            />
                          </td>
                          <td>{blog.content.replace(/<[^>]*>?/gm, '').slice(0, 30)}...</td>
                          <td>{blog.user?.name || "Không xác định"}</td>
                          <td>{blog.category?.name || "Không rõ"}</td>
                          <td>{new Date(blog.created_at).toLocaleDateString("vi-VN")}</td>
                          <td>
                            <div className="d-flex gap-2">
                              <button
                                className="bg-blue-500 text-white p-2 rounded"
                                onClick={() => navigate(`/admin/blog/detail/${blog.id}`)}
                              >
                                <FaEye size={16} />
                              </button>
                              <button
                                className="btn btn-warning btn-sm"
                                onClick={() => navigate(`/admin/blog/edit/${blog.id}`)}
                              >
                                <FaEdit />
                              </button>
                              <button
                                className="p-2 rounded-full bg-red-50 text-red-500"
                                onClick={() => confirmDelete(blog.id)}
                              >
                                <FaTrashAlt size={20} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="text-center text-muted">
                          Không có bài viết nào.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-center mt-4 items-center">
                <div className="flex items-center space-x-1">
                  <button disabled={currentPage === 1} onClick={() => handlePageChange(1)}>
                    <FaAngleDoubleLeft />
                  </button>
                  <button disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}>
                    <FaChevronLeft />
                  </button>
                  {[...Array(totalPages)].map((_, i) => {
                    const page = i + 1;
                    if (page >= currentPage - 1 && page <= currentPage + 1) {
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-1 border rounded ${currentPage === page ? "bg-blue-500 text-white" : "bg-blue-100"}`}
                        >
                          {page}
                        </button>
                      );
                    }
                    return null;
                  })}
                  <button disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)}>
                    <FaChevronRight />
                  </button>
                  <button disabled={currentPage === totalPages} onClick={() => handlePageChange(totalPages)}>
                    <FaAngleDoubleRight />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <FormDelete
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        message="Bạn có chắc chắn muốn xóa bài viết này không?"
        Id={selectedIdToDelete}
      />
    </div>
  );
}

export default BlogList; 