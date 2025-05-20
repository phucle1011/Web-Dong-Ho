import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import Constants from "../../../../Constants";

function CommentDetailPage() {
  const { id: productId } = useParams();
  const [comments, setComments] = useState([]);

  useEffect(() => {
    fetchCommentsByProduct();
  }, [productId]);

  const fetchCommentsByProduct = async () => {
    try {
      const response = await axios.get(`${Constants.DOMAIN_API}/admin/comment/list`);
      const allComments = response.data.data || [];

      const filteredComments = allComments.filter(
        (comment) => comment.orderDetail?.product_variant_id === Number(productId)
      );

      setComments(filteredComments);
    } catch (error) {
      console.error("Lỗi lấy bình luận sản phẩm:", error);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <i
          key={i}
          className={`fa${i <= rating ? "s" : "r"} fa-star text-warning me-1`}
          aria-hidden="true"
        ></i>
      );
    }

    return (
      <div className="position-relative d-inline-block text-center">
        <div
          className="position-absolute top-0 start-50 translate-middle-x text-primary fw-bold"
          style={{ fontSize: "0.9rem" }}
        >
          {rating} sao
        </div>
        <div className="pt-4">{stars}</div>
      </div>
    );
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return isNaN(date)
      ? "Không xác định"
      : date.toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12 d-flex align-items-stretch">
          <div className="card w-100">
            <div className="card-body p-4">
              <h5 className="card-title fw-semibold mb-4">Chi tiết bình luận theo sản phẩm</h5>
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Người dùng</th>
                      <th>Đánh giá</th>
                      <th>Nội dung</th>
                      <th>Ảnh</th>
                      <th>Ngày tạo</th>
                      <th>Ngày cập nhật</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comments.length > 0 ? (
                      comments.map((comment) => (
                        <tr key={comment.id}>
                          <td>{comment.id}</td>
                          <td>{comment.user?.name || "N/A"}</td>
                          <td>{renderStars(comment.rating)}</td>
                          <td>{comment.comment_text || "Không có nội dung"}</td>
                          <td>
                            {comment.commentImages && comment.commentImages.length > 0 ? (
                              comment.commentImages.map((img) => (
                                <img
                                  key={img.id}
                                  src={img.image_url}
                                  alt="Comment"
                                  width="60"
                                  className="me-2"
                                />
                              ))
                            ) : (
                              "Không có ảnh"
                            )}
                          </td>
                          <td>{formatDate(comment.created_at)}</td>
                          <td>{formatDate(comment.updated_at)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="9" className="text-center">
                          Không có bình luận nào
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <Link to="/admin/comments/getAll" className="btn btn-secondary btn-sm mt-3">
                Quay lại danh sách
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CommentDetailPage;
