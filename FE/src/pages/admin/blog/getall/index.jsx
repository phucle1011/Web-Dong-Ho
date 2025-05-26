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
  FaTrash,
  FaPlus,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

function BlogList() {
  const [blogs, setBlogs] = useState([]);
  const [limit] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // useRef để giữ timer debounce
  const debounceTimer = useRef(null);

  // Lấy danh sách blog với phân trang và tìm kiếm
  const fetchBlogs = async (page = 1, search = "") => {
    try {
      const response = await axios.get(`${Constants.DOMAIN_API}/admin/blog/list`, {
        params: {
          page,
          limit,
          search,
        },
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(() => {
      setCurrentPage(1); // reset page khi search
      fetchBlogs(1, searchTerm);
    }, 500);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [searchTerm]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchBlogs(1, searchTerm);
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Bạn có chắc muốn xóa?",
      text: "Thao tác này không thể hoàn tác!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    });

    if (confirm.isConfirmed) {
      try {
        await axios.delete(`${Constants.DOMAIN_API}/admin/blog/${id}`);
        Swal.fire("Đã xóa!", "Bài viết đã được xóa.", "success");
        fetchBlogs(currentPage, searchTerm);
      } catch (error) {
        Swal.fire("Lỗi", "Không thể xóa bài viết", "error");
      }
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
                  className="btn btn-success d-flex align-items-center gap-2"
                  onClick={() => navigate("/admin/blog/add")}
                >
                  <FaPlus /> Thêm bài viết
                </button>
              </div>

              <div className="mb-4 d-flex" style={{ maxWidth: "100%" }}>
                <input
                  type="text"
                  className="form-control me-2"
                  placeholder="Tìm theo tiêu đề bài viết..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button className="btn btn-primary" onClick={handleSearch}>
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
                      <th>ID người viết</th>
                      <th>Ngày tạo</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {blogs.length > 0 ? (
                      blogs.map((blog, index) => (
                        <tr key={blog.id}>
                          <td>{(currentPage - 1) * limit + index + 1}</td> {/* ID tăng dần theo trang */}
                          <td>{blog.title}</td>
                          <td>
                            <img
                              src={blog.image_url}
                              alt={blog.title}
                              style={{ width: "100px", height: "auto" }}
                            />
                          </td>
                          <td>
                            {(() => {
                              const div = document.createElement("div");
                              div.innerHTML = blog.content;
                              const text = div.textContent || div.innerText || "";
                              return text.length > 20 ? text.slice(0, 20) + "..." : text;
                            })()}
                          </td>
                          <td>{blog.user_id}</td>
                          <td>{new Date(blog.created_at).toLocaleDateString("vi-VN")}</td>
                          <td>
                            <div className="d-flex gap-2">
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => navigate(`/admin/blog/detail/${blog.id}`)}
                              >
                                <FaEye />
                              </button>
                              <button
                                className="btn btn-warning btn-sm"
                                onClick={() => navigate(`/admin/blog/edit/${blog.id}`)}
                              >
                                <FaEdit />
                              </button>
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleDelete(blog.id)}
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="text-center text-muted">
                          Không có bài viết nào.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BlogList;
