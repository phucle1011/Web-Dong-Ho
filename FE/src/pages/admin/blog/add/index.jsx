import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { Editor } from "@tinymce/tinymce-react";
import Constants from "../../../../Constants";
import { decodeToken } from "../../../client/Helpers/jwtDecode";
import "tinymce/skins/ui/oxide/skin.min.css";
import "tinymce/skins/content/default/content.min.css";
import { uploadToCloudinary } from "../../../../Upload/uploadToCloudinary.js";

function AddBlog() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [metaDescription, setMetaDescription] = useState("");
  // const [focusKeyword, setFocusKeyword] = useState("");
  const [userId, setUserId] = useState("");
  const navigate = useNavigate();
  const editorRef = useRef(null);

  const CLOUD_NAME = "ddkqka4b4";
  const UPLOAD_PRESET = "duantotnghiep_preset";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = decodeToken(token);
      setUserId(decoded?.id || "");
    }
  }, []);

  const handleImageUpload = async () => {
    if (!image) return "";

    const formData = new FormData();
    formData.append("file", image);
    formData.append("upload_preset", UPLOAD_PRESET);
    setUploading(true);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
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
          // focus_keyword: focusKeyword,
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
        <div className="col-md-12">
          <div className="card mb-4">
            <div className="card-body p-4">
              <h5 className="card-title fw-semibold mb-4">Thêm bài viết mới</h5>
              <form onSubmit={handleSubmit}>
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

                {/* <div className="mb-3">
                  <label className="form-label fw-bold">Từ khóa trọng tâm (Focus Keyword)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={focusKeyword}
                    onChange={(e) => setFocusKeyword(e.target.value)}
                    placeholder="Nhập từ khóa trọng tâm"
                  />
                </div> */}

                <label className="form-label fw-bold">Nội dung bài viết</label>
                <Editor
                  apiKey="hn83ucgq5arqkhxqdclbke1h3fu5a2zqpprjn87b3fol67jm"
                  value={content}
                  onInit={(evt, editor) => (editorRef.current = editor)}
                  init={{
                    height: 400,
                    menubar: true,
                    plugins: [
                      "advlist",
                      "autolink",
                      "lists",
                      "link",
                      "image",
                      "charmap",
                      "preview",
                      "anchor",
                      "searchreplace",
                      "visualblocks",
                      "code",
                      "fullscreen",
                      "insertdatetime",
                      "media",
                      "table",
                      "help",
                      "wordcount",
                    ],
                    toolbar:
                      "undo redo | formatselect | bold italic backcolor | " +
                      "alignleft aligncenter alignright alignjustify | " +
                      "bullist numlist outdent indent | image | help",
                    image_title: true,
                    automatic_uploads: true,
                    file_picker_types: "image",
                    file_picker_callback: function (cb, value, meta) {
                      const input = document.createElement("input");
                      input.setAttribute("type", "file");
                      input.setAttribute("accept", "image/*");
                      input.onchange = async function () {
                        const file = input.files[0];
                        if (!file) return;
                        try {
                          const result = await uploadToCloudinary(file);
                          cb(result.url, { title: file.name });
                        } catch (err) {
                          console.error("Upload lỗi:", err);
                        }
                      };
                      input.click();
                    },
                  }}
                  onEditorChange={(newContent) => setContent(newContent)}
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

                <div className="d-flex justify-content-start gap-2 mt-3">
                  <button type="submit" className="btn btn-primary" disabled={uploading}>
                    Thêm bài viết
                  </button>
                  <button
                    type="button"
                    className="btn"
                    style={{
                      backgroundColor: "#6c757d",
                      color: "#fff",
                      border: "none"
                    }}
                    onClick={() => navigate(-1)}
                  >
                    Quay lại
                  </button>
                </div>
              </form>

              

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddBlog;
