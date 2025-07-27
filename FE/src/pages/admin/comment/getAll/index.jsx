// CommentPage.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import Constants from "../../../../Constants";
import { Link } from "react-router-dom";
import {
  FaAngleDoubleLeft,
  FaChevronLeft,
  FaChevronRight,
  FaAngleDoubleRight,
  FaEye
} from "react-icons/fa";

function CommentPage() {
  const [allProducts, setAllProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(5);
  const [statusFilter, setStatusFilter] = useState("all");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [unrepliedComments, setUnrepliedComments] = useState([]);
  const [expandedCommentId, setExpandedCommentId] = useState(null);
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    fetchComments();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [allProducts, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const applyFilter = () => {
    if (statusFilter === "reply") return;
    let data = [...allProducts];
    switch (statusFilter) {
      case "most_comments":
        data = data.filter((p) => p.total_comments > 0);
        data.sort((a, b) => b.total_comments - a.total_comments);
        break;
      case "highest_rating":
        data = data.filter((p) => p.total_comments > 0);
        data.sort((a, b) => parseFloat(b.average_rating) - parseFloat(a.average_rating));
        break;
      case "lowest_rating":
        data = data.filter((p) => parseFloat(p.average_rating) <= 2);
        data.sort((a, b) => parseFloat(a.average_rating) - parseFloat(b.average_rating));
        break;
      default:
        data.sort((a, b) => a.product_sku.localeCompare(b.product_sku));
    }
    setFilteredProducts(data);
    setCurrentPage(1);
  };

  const filteredAndSearched = filteredProducts.filter((product) =>
    product.product_sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredAndSearched.length / limit);
  const currentData = filteredAndSearched.slice(
    (currentPage - 1) * limit,
    currentPage * limit
  );

  const fetchComments = async () => {
    try {
      const response = await axios.get(`${Constants.DOMAIN_API}/admin/comment/list`);
      const comments = response.data.data || [];
      const productMap = {};
      const unrepliedList = [];

      comments.forEach((comment) => {
        const productId = comment?.orderDetail?.product_variant_id;
        const sku = comment?.orderDetail?.variant?.sku;
        const rating = comment?.rating;
        const parentId = comment?.parent_id;

        if (!productId || !sku) return;

        if (!productMap[productId]) {
          productMap[productId] = {
            product_id: productId,
            product_sku: sku,
            total_comments: 0,
            total_rating: 0,
            unreplied_comments: 0,
          };
        }

        productMap[productId].total_comments += 1;
        productMap[productId].total_rating += rating || 0;

        if (parentId === null) {
          const hasReply = comments.some((c) => c.parent_id === comment.id);
          if (!hasReply) {
            productMap[productId].unreplied_comments += 1;
            unrepliedList.push(comment);
          }
        }
      });

      const result = Object.values(productMap).map((item) => ({
        ...item,
        average_rating:
          item.total_comments > 0
            ? (item.total_rating / item.total_comments).toFixed(1)
            : "0.0",
      }));

      setAllProducts(result);
      setUnrepliedComments(unrepliedList);
    } catch (error) {
      console.error("Lỗi lấy danh sách bình luận:", error);
    }
  };

  const handleReplySubmit = async (parentId) => {
    if (!replyText.trim()) return;
    try {
      await axios.post(`${Constants.DOMAIN_API}/admin/comment/reply`, {
        parent_id: parentId,
        comment_text: replyText,
      });
      setReplyText("");
      setExpandedCommentId(null);
      fetchComments();
    } catch (error) {
      console.error("Lỗi gửi trả lời:", error);
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12 d-flex align-items-stretch">
          <div className="card w-100">
            <div className="card-body p-4">
              <h5 className="card-title fw-semibold mb-4">Bình luận theo sản phẩm</h5>

              <div className="flex flex-wrap items-center gap-6 border-b border-gray-200 px-6 py-4 mb-4">
                {[{
                  key: "all", label: "Tất cả sản phẩm"
                }, {
                  key: "most_comments", label: "Nhiều bình luận nhất"
                }, {
                  key: "highest_rating", label: "Đánh giá cao nhất"
                }, {
                  key: "lowest_rating", label: "Đánh giá thấp nhất"
                }, {
                  key: "reply", label: "Trả lời bình luận", count: unrepliedComments.length, color: "bg-blue-300", textColor: "text-blue-800"
                }].map(({ key, label, count, color, textColor }) => (
                  <button
                    key={key}
                    onClick={() => setStatusFilter(key)}
                    className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-semibold ${statusFilter === key ? "bg-blue-900 text-white" : "bg-white text-gray-700"
                      }`}
                  >
                    <span>{label}</span>
                    {key === "reply" && (
                      <span className={`inline-block ml-1 rounded-full px-2 py-0.5 text-xs font-bold ${statusFilter === key ? "bg-white text-blue-900" : `${color} ${textColor}`}`}>{count}</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Tìm kiếm */}
              {statusFilter !== "reply" && (
                <div className="mb-4 d-flex" style={{ maxWidth: "100%" }}>
                  <input
                    type="text"
                    className="flex-grow border border-gray-300 rounded py-2 px-4 text-gray-700 leading-tight focus:ring-2 focus:ring-blue-500"
                    placeholder="Tìm sản phẩm ..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button
                    type="button"
                    className="bg-blue-900 hover:bg-blue-800 text-white px-4 py-1.5 rounded ms-2"

                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 3a7.5 7.5 0 006.15 13.65z" />
                    </svg>
                  </button>
                </div>
              )}

              {/* Hiển thị bảng */}
              {statusFilter !== "reply" ? (
                <div className="table-responsive">
                  <table className="table text-nowrap mb-0 align-middle">
                    <thead className="text-dark fs-4">
                      <tr>
                        <th>STT</th>
                        <th>Sản phẩm</th>
                        <th>Tổng bình luận</th>
                        <th>Chưa trả lời</th>
                        <th>Trung bình đánh giá</th>
                        <th>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentData.map((product, index) => (
                        <tr key={product.product_id}>
                          <td>{(currentPage - 1) * limit + index + 1}</td>
                          <td>{product.product_sku}</td>
                          <td>{product.total_comments}</td>
                          <td>{product.unreplied_comments || 0}</td>
                          <td>{product.average_rating}</td>
                          <td>
                            <Link to={`/admin/comments/detail/${product.product_id}`} className="bg-blue-500 text-white p-2 rounded w-10 h-10 inline-flex items-center justify-center"><FaEye size={16} className="font-bold" /></Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table text-nowrap mb-0 align-middle">
                    <thead className="text-dark fs-4">
                      <tr>
                        <th>STT</th>
                        <th>Người dùng</th>
                        <th>Nội dung</th>
                        <th>Số sao</th>
                        <th>Ngày</th>
                        <th>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {unrepliedComments.map((comment, index) => (
                        <>
                          <tr key={comment.id}>
                            <td>{index + 1}</td>
                            <td>{comment.user?.full_name || 'Ẩn danh'}</td>
                            <td>{comment.comment_text}</td>
                            <td>{comment.rating}</td>
                            <td>{new Date(comment.created_at).toLocaleDateString()}</td>
                            <td>
                              <button onClick={() => setExpandedCommentId(expandedCommentId === comment.id ? null : comment.id)} className="btn btn-sm btn-primary">Trả lời</button>
                            </td>
                          </tr>
                          {expandedCommentId === comment.id && (
                            <tr>
                              <td colSpan="6">
                                <textarea className="form-control mb-2" rows="3" value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Nhập nội dung trả lời..."></textarea>
                                <button className="btn btn-success btn-sm" onClick={() => handleReplySubmit(comment.id)}>Gửi trả lời</button>
                              </td>
                            </tr>
                          )}
                        </>
                      ))}
                    </tbody>
                  </table>
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