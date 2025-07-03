import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { Editor } from "@tinymce/tinymce-react";
import Constants from "../../../../Constants";

function EditBlog() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [userId, setUserId] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [focusKeyword, setFocusKeyword] = useState("");
  const [seoErrors, setSeoErrors] = useState([]);
  const [seoScore, setSeoScore] = useState(null);

  const navigate = useNavigate();
  const { id } = useParams();
  const editorRef = useRef(null);

  const CLOUD_NAME = "ddkqka4b4";
  const UPLOAD_PRESET = "duantotnghiep_preset";

  useEffect(() => {
    fetch(`${Constants.DOMAIN_API}/admin/blog/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setTitle(data.title);
        setContent(data.content);
        setUserId(data.user_id);
        setImagePreview(data.image_url);
        setMetaDescription(data.meta_description || "");
        setFocusKeyword(data.focus_keyword || "");
      })
      .catch(() => {
        Swal.fire("Lỗi", "Không thể tải dữ liệu bài viết", "error");
      });
  }, [id]);

  const calculateSeoScore = () => {
    let score = 100;
    if (!title) score -= 25;
    else if (title.length < 40) score -= 10;
    else if (title.length > 70) score -= 10;

    if (!metaDescription) score -= 20;
    else if (metaDescription.length < 70) score -= 10;
    else if (metaDescription.length > 160) score -= 10;

    if (!content) score -= 30;
    else if (content.length < 300) score -= 10;

    if (!image && !imagePreview) score -= 10;
    if (!userId) score -= 5;

    if (focusKeyword) {
      const keyword = focusKeyword.toLowerCase().trim();
      const contentText = content.toLowerCase();
      const count = (contentText.match(new RegExp(`\\b${keyword}\\b`, "g")) || []).length;
      const wordsCount = contentText.split(/\s+/).filter(Boolean).length || 1;
      const density = (count / wordsCount) * 100;

      if (density < 0.5) score -= 10;
      else if (density > 3) score -= 10;
    } else {
      score -= 10;
    }

    return Math.max(score, 0);
  };

  useEffect(() => {
    if (!title && !content && !imagePreview && !userId && !metaDescription && !focusKeyword) {
      setSeoErrors([]);
      setSeoScore(null);
      return;
    }

    const errors = [];

    if (!title) {
      errors.push({ message: "Chưa nhập tiêu đề", detail: "Tiêu đề là thành phần quan trọng để thu hút người đọc và SEO." });
    } else {
      if (title.length < 40) {
        errors.push({ message: "Tiêu đề ngắn (dưới 40 ký tự)", detail: "Tiêu đề nên từ 40-70 ký tự." });
      }
      if (title.length > 70) {
        errors.push({ message: "Tiêu đề dài (trên 70 ký tự)", detail: "Tiêu đề quá dài sẽ bị cắt trên kết quả tìm kiếm." });
      }
      if (focusKeyword && !title.toLowerCase().includes(focusKeyword.toLowerCase().trim())) {
        errors.push({ message: "Tiêu đề không chứa từ khóa trọng tâm", detail: "Nên chèn từ khóa trọng tâm vào tiêu đề." });
      }
    }

    if (!metaDescription) {
      errors.push({ message: "Chưa nhập meta description", detail: "Meta description giúp công cụ tìm kiếm hiểu nội dung." });
    } else {
      if (metaDescription.length < 70) {
        errors.push({ message: "Meta description quá ngắn", detail: "Nên từ 70-160 ký tự." });
      }
      if (metaDescription.length > 160) {
        errors.push({ message: "Meta description quá dài", detail: "Meta description dài sẽ bị cắt." });
      }
      if (focusKeyword && !metaDescription.toLowerCase().includes(focusKeyword.toLowerCase().trim())) {
        errors.push({ message: "Meta description không chứa từ khóa", detail: "Chèn từ khóa để tăng khả năng hiển thị." });
      }
    }

    if (!content) {
      errors.push({ message: "Chưa nhập nội dung bài viết", detail: "Nội dung là phần quan trọng nhất." });
    } else {
      if (content.length < 300) {
        errors.push({ message: "Nội dung ngắn (dưới 300 ký tự)", detail: "Nên có nội dung dài và chi tiết." });
      }

      if (focusKeyword) {
        const keyword = focusKeyword.toLowerCase().trim();
        const contentText = content.toLowerCase();
        const count = (contentText.match(new RegExp(`\\b${keyword}\\b`, "g")) || []).length;
        const wordsCount = contentText.split(/\s+/).filter(Boolean).length || 1;
        const density = (count / wordsCount) * 100;

        if (density < 0.5) {
          errors.push({ message: "Mật độ từ khóa quá thấp", detail: `Từ khóa "${focusKeyword}" chỉ chiếm ${density.toFixed(2)}%.` });
        }
        if (density > 3) {
          errors.push({ message: "Mật độ từ khóa quá cao", detail: `Từ khóa "${focusKeyword}" chiếm ${density.toFixed(2)}%, có thể bị coi là spam.` });
        }
      } else {
        errors.push({ message: "Chưa nhập từ khóa trọng tâm", detail: "Nên xác định từ khóa trọng tâm để tối ưu SEO." });
      }
    }

    if (!imagePreview && !image) {
      errors.push({ message: "Chưa có ảnh đại diện", detail: "Ảnh giúp bài viết nổi bật và thân thiện với mạng xã hội." });
    }

    if (!userId) {
      errors.push({ message: "Chưa nhập User ID", detail: "User ID giúp xác định tác giả bài viết." });
    }

    setSeoErrors(errors);
    setSeoScore(calculateSeoScore());
  }, [title, content, image, imagePreview, userId, metaDescription, focusKeyword]);

  const handleImageUpload = async () => {
    if (!image) return imagePreview;

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
      return data.secure_url || imagePreview;
    } catch (error) {
      setUploading(false);
      Swal.fire("Lỗi", "Có lỗi khi tải ảnh", "error");
      return imagePreview;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const contentValue = editorRef.current?.getContent() || content;

    if (!title || !contentValue || !userId) {
      Swal.fire("Cảnh báo", "Vui lòng nhập đầy đủ thông tin", "warning");
      return;
    }

    const imageUrl = await handleImageUpload();

    try {
      const response = await fetch(`${Constants.DOMAIN_API}/admin/blog/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content: contentValue,
          image_url: imageUrl,
          user_id: userId,
          meta_description: metaDescription,
          focus_keyword: focusKeyword,
        }),
      });

      if (response.ok) {
        Swal.fire("Thành công", "Đã cập nhật bài viết", "success");
        navigate("/admin/blog/getAll");
      } else {
        Swal.fire("Lỗi", "Không thể cập nhật bài viết", "error");
      }
    } catch (error) {
      Swal.fire("Lỗi", "Có lỗi xảy ra khi gửi dữ liệu", "error");
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Cột trái: Form chỉnh sửa */}
        <div className="col-md-8">
          <div className="card mb-4">
            <div className="card-body p-4">
              <h5 className="card-title fw-semibold mb-4">Chỉnh sửa bài viết</h5>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-bold">User ID</label>
                  <input
                    type="text"
                    className="form-control"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
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
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">Mô tả bài viết</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">Từ khóa trọng tâm</label>
                  <input
                    type="text"
                    className="form-control"
                    value={focusKeyword}
                    onChange={(e) => setFocusKeyword(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">Nội dung</label>
                  <Editor
                    apiKey="mbgpdbwopaohxwcxv17626sduqhgtdthc0wzo8524iq7nzgb"
                    value={content}
                    onInit={(evt, editor) => (editorRef.current = editor)}
                    init={{
                      height: 400,
                      plugins: ["table", "link", "image", "code", "lists", "paste", "autoresize"],
                      toolbar:
                        "undo redo | styles | bold italic underline | alignleft aligncenter alignright | bullist numlist | link image | table | code",
                    }}
                    onEditorChange={(newValue) => setContent(newValue)}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">Hình ảnh</label>
                  <input
                    type="file"
                    className="form-control"
                    accept="image/*"
                    onChange={(e) => setImage(e.target.files[0])}
                  />
                  {imagePreview && (
                    <div className="mt-2">
                      <img src={imagePreview} alt="preview" style={{ maxWidth: "200px" }} />
                    </div>
                  )}
                </div>
                {uploading && <p className="text-info">Đang tải ảnh lên Cloudinary...</p>}
                <button type="submit" className="btn btn-primary">
                  Cập nhật bài viết
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Cột phải: Phân tích SEO */}
        <div className="col-md-4">
          <div className="card mb-4">
            <div className="card-body p-4">
              <h5 className="card-title fw-semibold mb-4">Phân tích SEO</h5>
              {seoScore !== null && (
                <div className="mb-3">
                  <label className="form-label fw-bold">Điểm SEO:</label>
                  <div className="progress" style={{ height: "25px" }}>
                    <div
                      className={`progress-bar ${seoScore > 75 ? "bg-success" : seoScore > 40 ? "bg-warning" : "bg-danger"}`}
                      role="progressbar"
                      style={{ width: `${seoScore}%` }}
                    >
                      {seoScore}%
                    </div>
                  </div>
                </div>
              )}
              <ul className="list-group list-group-flush">
                {seoErrors.length === 0 && seoScore !== null && (
                  <li className="list-group-item text-success">
                    Bài viết của bạn đã tối ưu SEO rất tốt!
                  </li>
                )}
                {seoErrors.map((error, idx) => (
                  <li key={idx} className="list-group-item text-danger">
                    <strong>{error.message}</strong>
                    <br />
                    <small>{error.detail}</small>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditBlog;
