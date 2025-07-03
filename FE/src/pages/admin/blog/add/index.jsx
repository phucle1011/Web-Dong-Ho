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
  const [metaDescription, setMetaDescription] = useState("");
  const [focusKeyword, setFocusKeyword] = useState("");
  const [seoErrors, setSeoErrors] = useState([]);
  const [seoScore, setSeoScore] = useState(null);
  const navigate = useNavigate();
  const editorRef = useRef(null);

  const CLOUD_NAME = "ddkqka4b4";
  const UPLOAD_PRESET = "duantotnghiep_preset";

  // Hàm tính điểm SEO dựa trên nhiều tiêu chí
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

    if (!image) score -= 10;
    if (!userId) score -= 5;

    // Kiểm tra mật độ từ khóa
    if (focusKeyword) {
      const keyword = focusKeyword.toLowerCase().trim();
      const contentText = content.toLowerCase();
      const count = (contentText.match(new RegExp(`\\b${keyword}\\b`, "g")) || []).length;
      const wordsCount = contentText.split(/\s+/).filter(Boolean).length || 1;
      const density = (count / wordsCount) * 100;

      if (density < 0.5) score -= 10; // quá thấp
      else if (density > 3) score -= 10; // quá cao (nhồi nhét từ khóa)
    } else {
      score -= 10; // không có từ khóa trọng tâm
    }

    return Math.max(score, 0);
  };

  // Hàm kiểm tra SEO và phân tích lỗi chi tiết
  useEffect(() => {
    // Nếu chưa nhập gì thì reset lỗi, điểm
    if (!title && !content && !image && !userId && !metaDescription && !focusKeyword) {
      setSeoErrors([]);
      setSeoScore(null);
      return;
    }

    const errors = [];

    // Kiểm tra tiêu đề
    if (!title) {
      errors.push({ message: "Chưa nhập tiêu đề", detail: "Tiêu đề là thành phần quan trọng để thu hút người đọc và SEO." });
    } else {
      if (title.length < 40) {
        errors.push({ message: "Tiêu đề ngắn (dưới 40 ký tự)", detail: "Tiêu đề nên từ 40-70 ký tự để hiển thị tối ưu trên công cụ tìm kiếm." });
      }
      if (title.length > 70) {
        errors.push({ message: "Tiêu đề dài (trên 70 ký tự)", detail: "Tiêu đề quá dài sẽ bị cắt khi hiển thị trên kết quả tìm kiếm." });
      }
      if (focusKeyword && !title.toLowerCase().includes(focusKeyword.toLowerCase().trim())) {
        errors.push({ message: "Tiêu đề không chứa từ khóa trọng tâm", detail: "Nên chèn từ khóa trọng tâm vào tiêu đề để cải thiện SEO." });
      }
    }

    // Kiểm tra meta description
    if (!metaDescription) {
      errors.push({ message: "Chưa nhập meta description", detail: "Meta description giúp công cụ tìm kiếm hiểu nội dung bài viết." });
    } else {
      if (metaDescription.length < 70) {
        errors.push({ message: "Meta description quá ngắn (dưới 70 ký tự)", detail: "Nên từ 70-160 ký tự để mô tả đủ ý và hấp dẫn." });
      }
      if (metaDescription.length > 160) {
        errors.push({ message: "Meta description quá dài (trên 160 ký tự)", detail: "Meta description dài sẽ bị cắt trên kết quả tìm kiếm." });
      }
      if (focusKeyword && !metaDescription.toLowerCase().includes(focusKeyword.toLowerCase().trim())) {
        errors.push({ message: "Meta description không chứa từ khóa trọng tâm", detail: "Chèn từ khóa trọng tâm để tăng khả năng hiển thị." });
      }
    }

    // Kiểm tra nội dung bài viết
    if (!content) {
      errors.push({ message: "Chưa nhập nội dung bài viết", detail: "Nội dung là phần quan trọng nhất cho cả người đọc và SEO." });
    } else {
      if (content.length < 300) {
        errors.push({ message: "Nội dung ngắn (dưới 300 ký tự)", detail: "Nên có nội dung dài và chi tiết để cải thiện thứ hạng tìm kiếm." });
      }

      if (focusKeyword) {
        const keyword = focusKeyword.toLowerCase().trim();
        const contentText = content.toLowerCase();
        const count = (contentText.match(new RegExp(`\\b${keyword}\\b`, "g")) || []).length;
        const wordsCount = contentText.split(/\s+/).filter(Boolean).length || 1;
        const density = (count / wordsCount) * 100;

        if (density < 0.5) {
          errors.push({ message: "Mật độ từ khóa quá thấp", detail: `Từ khóa "${focusKeyword}" chỉ chiếm ${density.toFixed(2)}% trong bài viết. Nên đạt từ 0.5% đến 3%.` });
        }
        if (density > 3) {
          errors.push({ message: "Mật độ từ khóa quá cao (nhồi nhét)", detail: `Từ khóa "${focusKeyword}" chiếm ${density.toFixed(2)}%, có thể bị coi là spam.` });
        }
      } else {
        errors.push({ message: "Chưa nhập từ khóa trọng tâm", detail: "Nên xác định từ khóa trọng tâm cho bài viết để tối ưu SEO." });
      }
    }

    // Kiểm tra ảnh đại diện
    if (!image) {
      errors.push({ message: "Chưa chọn ảnh đại diện", detail: "Ảnh đại diện giúp bài viết thu hút và thân thiện với mạng xã hội." });
    }

    // Kiểm tra userId
    if (!userId) {
      errors.push({ message: "Chưa nhập User ID", detail: "User ID giúp xác định tác giả bài viết." });
    }

    setSeoErrors(errors);
    setSeoScore(calculateSeoScore());
  }, [title, content, image, userId, metaDescription, focusKeyword]);

  // Upload ảnh lên Cloudinary
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

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    const contentValue = editorRef.current?.getContent() || content;

    if (!title || !contentValue || !image || !userId) {
      Swal.fire("Cảnh báo", "Vui lòng nhập đầy đủ thông tin bắt buộc", "warning");
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
          meta_description: metaDescription,
          focus_keyword: focusKeyword,
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
        {/* Form nhập liệu bên trái */}
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
                  <label className="form-label fw-bold">Tiêu đề bài viết</label>
                  <input
                    type="text"
                    className="form-control"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Nhập tiêu đề"
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
                    placeholder="Nhập meta description (70-160 ký tự)"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Từ khóa trọng tâm (Focus Keyword)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={focusKeyword}
                    onChange={(e) => setFocusKeyword(e.target.value)}
                    placeholder="Nhập từ khóa trọng tâm"
                  />
                </div>

                <label className="form-label fw-bold">Nội dung bài viết</label>
                <Editor
                  apiKey="mbgpdbwopaohxwcxv17626sduqhgtdthc0wzo8524iq7nzgb"
                   onEditorChange={(newContent) => setContent(newContent)} 
                  init={{
plugins: [
  'anchor', 'autolink', 'charmap', 'codesample', 'emoticons',
  'image', 'link', 'lists', 'media', 'searchreplace',
  'table', 'visualblocks', 'wordcount'
],


                    toolbar:
                      'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat',

                    // 👇 Bật tính năng chọn ảnh từ máy
                    file_picker_types: 'image',
                    file_picker_callback: function (callback, value, meta) {
                      if (meta.filetype === 'image') {
                        const input = document.createElement('input');
                        input.setAttribute('type', 'file');
                        input.setAttribute('accept', 'image/*');

                        input.onchange = function () {
                          const file = this.files[0];
                          const reader = new FileReader();

                          reader.onload = function () {
                            const base64 = reader.result;
                            callback(base64, { title: file.name });
                          };

                          reader.readAsDataURL(file);
                        };

                        input.click();
                      }
                    },

                    // 👇 Để ảnh hiển thị luôn trong editor bằng base64
                    images_upload_handler: function (blobInfo, success, failure) {
                      const base64 = 'data:' + blobInfo.blob().type + ';base64,' + blobInfo.base64();
                      success(base64);
                    },

                    tinycomments_mode: 'embedded',
                    tinycomments_author: 'Author name',

                    mergetags_list: [
                      { value: 'First.Name', title: 'First Name' },
                      { value: 'Email', title: 'Email' }
                    ],

                    // 👇 Không dùng AI
                    ai_request: (request, respondWith) =>
                      respondWith.string(() => Promise.reject('See docs to implement AI Assistant'))
                  }}
                  initialValue="<p>Welcome to TinyMCE!</p>"
                />



                <div className="mb-3 mt-3">
                  <label className="form-label fw-bold">Ảnh đại diện</label>
                  <input
                    type="file"
                    className="form-control"
                    accept="image/*"
                    onChange={(e) => setImage(e.target.files[0])}
                    required
                  />

                  {uploading && <p>Đang tải ảnh lên...</p>}
                </div>

                <button type="submit" className="btn btn-primary" disabled={uploading}>
                  Thêm bài viết
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Phần SEO bên phải */}
        <div className="col-md-4">
          <div className="card mb-4">
            <div className="card-body p-4">
              <h5 className="card-title fw-semibold mb-4">Phân tích SEO</h5>
              {seoScore !== null && (
                <div className="mb-3">
                  <label className="form-label fw-bold">Điểm SEO:</label>
                  <div
                    className={`progress ${seoScore > 75 ? "bg-success" : seoScore > 40 ? "bg-warning" : "bg-danger"
                      }`}
                    style={{ height: "25px" }}
                  >
                    <div
                      className="progress-bar"
                      role="progressbar"
                      style={{ width: `${seoScore}%` }}
                      aria-valuenow={seoScore}
                      aria-valuemin="0"
                      aria-valuemax="100"
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
                {seoErrors.map((error, index) => (
                  <li key={index} className="list-group-item text-danger">
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

export default AddBlog;
