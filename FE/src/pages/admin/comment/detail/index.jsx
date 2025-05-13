import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import Constants from "../../../../Constants";

function CommentDetailPage() {
  const [comment, setComment] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    fetchCommentDetail();
  }, []);

  const fetchCommentDetail = async () => {
    try {
      const response = await axios.get(`${Constants.DOMAIN_API}/admin/comment/${id}`);
      setComment(response.data.data);
    } catch (error) {
      console.error("Lỗi lấy chi tiết bình luận:", error);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return isNaN(date)
      ? "Không xác định"
      : date.toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
  };

  if (!comment) {
    return (
      <div className="container-fluid">
        <div className="text-center py-5">Đang tải dữ liệu...</div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12 d-flex align-items-stretch">
          <div className="card w-100">
            <div className="card-body p-4">
              <h5 className="card-title fw-semibold mb-4">Chi tiết bình luận</h5>
              <table className="table">
                <tbody>
                  <tr>
                    <th scope="row">ID</th>
                    <td>{comment.id}</td>
                  </tr>
                  <tr>
                    <th scope="row">Tên người dùng</th>
                    <td>{comment.user_name}</td>
                  </tr>
                  <tr>
                    <th scope="row">Sản phẩm</th>
                    <td>{comment.product_name}</td>
                  </tr>
                  <tr>
                    <th scope="row">Đánh giá</th>
                    <td>{comment.rating}</td>
                  </tr>
                  <tr>
                    <th scope="row">Nội dung</th>
                    <td>{comment.comment_text}</td>
                  </tr>
                  <tr>
                    <th scope="row">Ngày tạo</th>
                    <td>{formatDate(comment.created_at)}</td>
                  </tr>
                  <tr>
                    <th scope="row">Ngày cập nhật</th>
                    <td>{formatDate(comment.updated_at)}</td>
                  </tr>
                </tbody>
              </table>
              <div className="mt-3">
                <Link to="/admin/comment/getAll" className="btn btn-secondary btn-sm">
                  Quay lại danh sách
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CommentDetailPage;
