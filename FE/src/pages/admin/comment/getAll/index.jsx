import { useEffect, useState } from "react";
import axios from "axios";
import Constants from "../../../../Constants";
import { Link } from "react-router-dom";
import {
  FaAngleDoubleLeft,
  FaChevronLeft,
  FaChevronRight,
  FaAngleDoubleRight,
} from "react-icons/fa";

function CommentPage() {
  const [allProducts, setAllProducts] = useState([]); // tất cả sản phẩm có bình luận
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(5);

  const [statusFilter, setStatusFilter] = useState("all"); // filter hiện tại
  const [filteredProducts, setFilteredProducts] = useState([]);

  // Lấy dữ liệu từ API khi load trang
  useEffect(() => {
    fetchComments();
  }, []);

  // Khi allProducts hoặc filter thay đổi thì áp dụng filter
  useEffect(() => {
    applyFilter();
  }, [allProducts, statusFilter]);

  // Khi searchTerm thay đổi, reset trang về 1
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Lấy tổng số cho từng filter để hiển thị số lượng
  const countAll = allProducts.length;

  // Số lượng sản phẩm nhiều bình luận nhất (lấy tất cả để phân trang, ở đây vẫn là allProducts)
  // Nhưng để thống nhất, filter lấy sản phẩm có ít nhất 1 comment
  const countMostComments = allProducts.filter((p) => p.total_comments > 0).length;

  // Số lượng sản phẩm đánh giá cao nhất (ví dụ, rating trên 4)
  const countHighestRating = allProducts.filter((p) => parseFloat(p.average_rating) >= 4).length;

  // Số lượng sản phẩm đánh giá thấp nhất (rating dưới 2)
  const countLowestRating = allProducts.filter((p) => parseFloat(p.average_rating) <= 2).length;

  // Áp dụng filter theo statusFilter
  const applyFilter = () => {
    let data = [...allProducts];

    switch (statusFilter) {
      case "most_comments":
        data = data.filter(p => p.total_comments > 0);
        data.sort((a, b) => b.total_comments - a.total_comments);
        break;
      case "highest_rating":
        data = data.filter(p => parseFloat(p.average_rating) >= 4);
        data.sort(
          (a, b) => parseFloat(b.average_rating) - parseFloat(a.average_rating)
        );
        break;
      case "lowest_rating":
        data = data.filter(p => parseFloat(p.average_rating) <= 2);
        data.sort(
          (a, b) => parseFloat(a.average_rating) - parseFloat(b.average_rating)
        );
        break;
      case "all":
      default:
        data.sort((a, b) => a.product_sku.localeCompare(b.product_sku));
        break;
    }

    setFilteredProducts(data);
    setCurrentPage(1);
  };

  // Lọc theo searchTerm trực tiếp trên filteredProducts
  const filteredAndSearched = filteredProducts.filter((product) =>
    product.product_sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredAndSearched.length / limit);
  const currentData = filteredAndSearched.slice(
    (currentPage - 1) * limit,
    currentPage * limit
  );

  // Hàm lấy dữ liệu bình luận từ API
  const fetchComments = async () => {
    try {
      const response = await axios.get(
        `${Constants.DOMAIN_API}/admin/comment/list`
      );
      const comments = response.data.data || [];

      const productMap = {};

      comments.forEach((comment) => {
        const productId = comment?.orderDetail?.product_variant_id;
        const sku = comment?.orderDetail?.variant?.sku;
        const rating = comment?.rating;

        if (!productId || !sku) return;

        if (!productMap[productId]) {
          productMap[productId] = {
            product_id: productId,
            product_sku: sku,
            total_comments: 0,
            total_rating: 0,
          };
        }

        productMap[productId].total_comments += 1;
        productMap[productId].total_rating += rating || 0;
      });

      const result = Object.values(productMap).map((item) => ({
        ...item,
        average_rating:
          item.total_comments > 0
            ? (item.total_rating / item.total_comments).toFixed(1)
            : "0.0",
      }));

      setAllProducts(result);
      setCurrentPage(1);
      setSearchTerm("");
    } catch (error) {
      console.error("Lỗi lấy danh sách bình luận:", error);
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
              <h5 className="card-title fw-semibold mb-4">
                Bình luận theo sản phẩm
              </h5>

              <div className="flex flex-wrap items-center gap-6 border-b border-gray-200 px-6 py-4 mb-4">
                {[
                  {
                    key: "all",
                    label: "Tất cả sản phẩm",
                    color: "bg-gray-800",
                    textColor: "text-white",
                    count: countAll,
                  },
                  {
                    key: "most_comments",
                    label: "Nhiều bình luận nhất",
                    color: "bg-amber-300",
                    textColor: "text-amber-800",
                    count: countMostComments,
                  },
                  {
                    key: "highest_rating",
                    label: "Đánh giá cao nhất",
                    color: "bg-emerald-300",
                    textColor: "text-emerald-800",
                    count: countHighestRating,
                  },
                  {
                    key: "lowest_rating",
                    label: "Đánh giá thấp nhất",
                    color: "bg-rose-300",
                    textColor: "text-rose-800",
                    count: countLowestRating,
                  },
                ].map(({ key, label, color, textColor, count }) => (
                  <button
                    key={key}
                    onClick={() => setStatusFilter(key)}
                    className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-semibold ${statusFilter === key
                        ? "bg-blue-900 text-white"
                        : "bg-white text-gray-700"
                      }`}
                  >
                    <span>{label}</span>
                    <span
                      className={`inline-block ml-1 rounded-full px-2 py-0.5 text-xs font-bold ${statusFilter === key
                          ? "bg-white text-blue-900"
                          : `${color} ${textColor}`
                        }`}
                    >
                      {count}
                    </span>
                  </button>
                ))}
              </div>


              {/* Tìm kiếm */}
              <div
                className="mb-4 d-flex"
                style={{ maxWidth: "100%" }}
              >
                <input
                  type="text"
                  className="shadow border border-gray-300 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tìm sản phẩm ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Bảng dữ liệu */}
              <div className="table-responsive">
                <table className="table text-nowrap mb-0 align-middle">
                  <thead className="text-dark fs-4">
                    <tr>
                      <th>STT</th>
                      <th>Sản phẩm</th>
                      <th>Tổng bình luận</th>
                      <th>Trung bình đánh giá</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentData.length > 0 ? (
                      currentData.map((product, index) => (
                        <tr key={product.product_id}>
                          <td>{(currentPage - 1) * limit + index + 1}</td>
                          <td>{product.product_sku}</td>
                          <td>{product.total_comments}</td>
                          <td>{product.average_rating}</td>
                          <td>
                            <Link
                              to={`/admin/comments/detail/${product.product_id}`}
                              className="btn btn-info btn-sm"
                            >
                              Xem bình luận
                            </Link>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center">
                          Không có sản phẩm nào có bình luận
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Phân trang */}
              {totalPages > 0 && (
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
                            className={`px-3 py-1 border rounded ${currentPage === page
                                ? "bg-primary text-white"
                                : "bg-light text-dark"
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
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CommentPage;
