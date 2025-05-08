import { useEffect, useState } from "react";
import axios from "axios";
import Constants from "../../../Constants";
import { Link } from "react-router-dom";
function CommentPage() {
  const [comments, setComments] = useState([]);

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      const response = await axios.get(`${Constants.DOMAIN_API}/admin/comment/list`);
      setComments(response.data.data || []);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12 d-flex align-items-stretch">
          <div className="card w-100">
            <div className="card-body p-4">
              <h5 className="card-title fw-semibold mb-4">Danh sách bình luận</h5>
              <div className="table-responsive">
                <table className="table text-nowrap mb-0 align-middle">
                  <thead className="text-dark fs-4">
                    <tr>
                      <th><h6 className="fw-semibold mb-0">ID</h6></th>
                      <th><h6 className="fw-semibold mb-0">Người dùng</h6></th>
                      <th><h6 className="fw-semibold mb-0">Sản phẩm</h6></th>
                      <th><h6 className="fw-semibold mb-0">Nội dung</h6></th>
                      <th><h6 className="fw-semibold mb-0">Đánh giá</h6></th>
                      <th><h6 className="fw-semibold mb-0">Đánh giá</h6></th>
                    </tr>
                  </thead>
                  <tbody>
                    {comments.map((comment) => (
                      <tr key={comment.id}>
                        <td><h6 className="fw-normal mb-0">{comment.id}</h6></td>
                        <td><h6 className="fw-normal mb-0">{comment.user_name}</h6></td>
                        <td><h6 className="fw-normal mb-0">{comment.product_name}</h6></td>
                        <td><p className="mb-0 fw-normal">{comment.comment_text}</p></td>
                        <td><p className="mb-0 fw-normal">{comment.rating}</p></td>
                        <td>
                          {/* Sử dụng Link để điều hướng */}
                          <Link to={`/admin/comment/${comment.id}`} className="btn btn-info btn-sm">
                            Xem chi tiết
                          </Link>
                        </td> 


                      </tr>
                    ))}
                    {comments.length === 0 && (
                      <tr>
                        <td colSpan="7" className="text-center">Không có bình luận nào</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CommentPage;
