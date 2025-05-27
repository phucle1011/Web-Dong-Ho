import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { Editor } from '@tinymce/tinymce-react';
import Constants from "../../../../Constants";
import 'tinymce/skins/ui/oxide/skin.min.css';
import 'tinymce/skins/content/default/content.min.css';

function AddBlog() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [userId, setUserId] = useState("");
  const [seoErrors, setSeoErrors] = useState([]);
  const [seoScore, setSeoScore] = useState(null); // null nghĩa là chưa tính điểm
  const navigate = useNavigate();
  const editorRef = useRef(null);

  const CLOUD_NAME = "ddkqka4b4";
  const UPLOAD_PRESET = "duantotnghiep_preset";

  // Hàm tính điểm SEO kiểu RankMath
  const calculateSeoScore = () => {
    let score = 100;
    if (!title || title.length < 10) score -= 30;
    else if (title.length < 20) score -= 10;

    if (!content || content.length < 100) score -= 30;
    else if (content.length < 300) score -= 10;

    if (!image) score -= 20;
    if (!userId) score -= 10;

    return Math.max(score, 0);
  };

  // Kiểm tra SEO và cập nhật điểm
  useEffect(() => {
    // Nếu tất cả trường đều rỗng, bỏ qua tính điểm SEO
    if (!title && !content && !image && !userId) {
      setSeoErrors([]);
      setSeoScore(null); // null = chưa có điểm SEO
      return;
    }

    const errors = [];
    if (!title || title.length < 10) errors.push("Tiêu đề quá ngắn (tối thiểu 10 ký tự)");
    if (!content || content.length < 100) errors.push("Nội dung quá ngắn (tối thiểu 100 ký tự)");
    if (!image) errors.push("Chưa chọn ảnh đại diện cho bài viết");
    if (!userId) errors.push("Thiếu User ID");
    setSeoErrors(errors);
    setSeoScore(calculateSeoScore());
  }, [title, content, image, userId]);

  const handleImageUpload = async () => {
    if (!image) return "";

    const formData = new FormData();
    formData.append("file", image);
    formData.append("upload_preset", UPLOAD_PRESET);
    setUploading(true);

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      setUploading(false);
      return data.secure_url || "";
    } catch (error) {
      setUploading(false);
      Swal.fire("Lỗi", "Không thể tải ảnh lên Cloudinary", "error");
      return "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const contentValue = editorRef.current?.getContent() || content;

    if (!title || !contentValue || !image || !userId) {
      Swal.fire("Cảnh báo", "Vui lòng nhập đầy đủ thông tin", "warning");
      return;
    }

    const imageUrl = await handleImageUpload();
    if (!imageUrl) return;

    try {
      const response = await fetch(`${Constants.DOMAIN_API}/admin/blog/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content: contentValue,
          image_url: imageUrl,
          user_id: userId,
        }),
      });

      if (response.ok) {
        Swal.fire("Thành công", "Đã thêm bài viết mới", "success");
        navigate("/admin/blog/getAll");
      } else {
        Swal.fire("Lỗi", "Không thể thêm bài viết", "error");
      }
    } catch (error) {
      Swal.fire("Lỗi", "Gửi dữ liệu thất bại", "error");
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Form bên trái */}
        <div className="col-md-8">
          <div className="card mb-4">
            <div className="card-body p-4">
              <h5 className="card-title fw-semibold mb-4">Thêm bài viết mới</h5>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-bold">User ID</label>
                  <input
                    type="text"
                    className="form-control"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="Nhập user ID"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Tiêu đề</label>
                  <input
                    type="text"
                    className="form-control"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Nhập tiêu đề"
                    required
                  />
                </div>

                <Editor
                  apiKey="hxo8p07686juzc8t31sz6h654xhecoydtwwa89l3dcx3plg2"
                  onInit={(evt, editor) => (editorRef.current = editor)}
                  init={{
                    height: 400,
                    menubar: false,
                    plugins: ["table", "link", "image", "code", "lists", "paste", "autoresize"],
                    toolbar:
                      "undo redo | styles | bold italic underline | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | table | code",
                    images_upload_handler: async (blobInfo, success, failure) => {
                      const formData = new FormData();
                      formData.append("file", blobInfo.blob());
                      formData.append("upload_preset", UPLOAD_PRESET);
                      try {
                        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
                          method: "POST",
                          body: formData,
                        });
                        const data = await res.json();
                        data.secure_url ? success(data.secure_url) : failure("Không lấy được URL ảnh");
                      } catch (err) {
                        failure("Lỗi khi upload ảnh");
                      }
                    },
                  }}
                  onEditorChange={(newValue) => setContent(newValue)}
                  value={content}
                />

                <div className="mb-3 mt-3">
                  <label className="form-label fw-bold">Hình ảnh đại diện</label>
                  <input
                    type="file"
                    className="form-control"
                    accept="image/*"
                    onChange={(e) => setImage(e.target.files[0])}
                    required
                  />
                </div>

                {uploading && <p className="text-info">Đang tải ảnh lên Cloudinary...</p>}

                <button type="submit" className="btn btn-success mt-3">Thêm bài viết</button>
              </form>
            </div>
          </div>
        </div>

        {/* Bảng SEO bên phải */}
        <div className="col-md-4">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title fw-semibold mb-3">Kiểm tra SEO</h5>

              {seoScore === null ? (
                <div className="text-muted fst-italic">Nhập thông tin để kiểm tra SEO</div>
              ) : (
                <>
                  {/* Điểm SEO */}
                  <div className="mb-3">
                    <div className="fw-bold">
                      Điểm SEO: <span style={{
                        color: seoScore >= 80 ? "green" : seoScore >= 50 ? "orange" : "red"
                      }}>{seoScore}/100</span>
                    </div>
                    <div className="progress mt-2" style={{ height: "10px" }}>
                      <div
                        className={`progress-bar ${seoScore >= 80 ? "bg-success" : seoScore >= 50 ? "bg-warning" : "bg-danger"}`}
                        role="progressbar"
                        style={{ width: `${seoScore}%` }}
                        aria-valuenow={seoScore}
                        aria-valuemin="0"
                        aria-valuemax="100"
                      />
                    </div>
                  </div>

                  {/* Danh sách lỗi SEO */}
                  {seoErrors.length === 0 ? (
                    <div className="text-success">✔ Bài viết đáp ứng tiêu chí cơ bản</div>
                  ) : (
                    <ul className="text-danger ps-3">
                      {seoErrors.map((err, index) => (
                        <li key={index}>{err}</li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddBlog;
