import { useEffect, useState } from "react";
import axios from "axios";
import Constants from "../../../../Constants";
import { Link } from "react-router-dom";
import {
  FaSearch,
  FaAngleDoubleLeft,
  FaChevronLeft,
  FaChevronRight,
  FaAngleDoubleRight,
} from "react-icons/fa";

function CommentPage() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(5);

  const totalPages = Math.ceil(products.length / limit);
  const currentData = products.slice((currentPage - 1) * limit, currentPage * limit);

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      const response = await axios.get(`${Constants.DOMAIN_API}/admin/comment/list`);
      const comments = response.data.data || [];

      const productMap = {};
      comments.forEach((comment) => {
        const productId = comment?.orderDetail?.product_variant_id;
        const productName = comment?.orderDetail?.productVariant?.sku;

        if (productId && !productMap[productId]) {
          productMap[productId] = {
            product_id: productId,
            product_name: productName,
          };
        }
      });

      setProducts(Object.values(productMap));
      setCurrentPage(1);
      setSearchTerm("");
    } catch (error) {
      console.error("Lỗi lấy danh sách bình luận:", error);
    }
  };

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      fetchComments();
      return;
    }

    const filtered = products.filter((product) =>
      product.product_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setProducts(filtered);
    setCurrentPage(1);
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
              <h5 className="card-title fw-semibold mb-4">Bình luận theo sản phẩm</h5>

              {/* Tìm kiếm */}
              <div className="mb-4 d-flex" style={{ maxWidth: "100%" }}>
                <input
                  type="text"
                  className="shadow border border-gray-300 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tìm theo tên sản phẩm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                <button className="bg-blue-900 hover:bg-blue-800 text-white px-4 rounded ml-2" onClick={handleSearch}>
                  <FaSearch />
                </button>
                <button className="ms-2 p-2 border flex gap-2 bg-blue-900 hover:bg-blue-800 text-white py-1 px-3 rounded" onClick={fetchComments}>
                  Xem tất cả
                </button>
              </div>

              {/* Bảng dữ liệu */}
              <div className="table-responsive">
                <table className="table text-nowrap mb-0 align-middle">
                  <thead className="text-dark fs-4">
                    <tr>
                      <th>ID Sản phẩm</th>
                      <th>Tên sản phẩm </th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentData.length > 0 ? (
                      currentData.map((product) => (
                        <tr key={product.product_id}>
                          <td>{product.product_id}</td>
                          <td>{product.product_name}</td>
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
                        <td colSpan="3" className="text-center">
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
