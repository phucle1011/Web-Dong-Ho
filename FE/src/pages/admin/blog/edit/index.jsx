// Các import giữ nguyên
import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { Editor } from "@tinymce/tinymce-react";
import Constants from "../../../../Constants";
import "tinymce/skins/ui/oxide/skin.min.css";
import "tinymce/skins/content/default/content.min.css";
import { uploadToCloudinary } from "../../../../Upload/uploadToCloudinary.js";

function EditBlog() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [metaDescription, setMetaDescription] = useState("");
  const [userId, setUserId] = useState("");
  const [categories, setCategories] = useState([]);
  const [blogCategoryId, setBlogCategoryId] = useState("");

  const navigate = useNavigate();
  const { id } = useParams();
  const editorRef = useRef(null);

  const CLOUD_NAME = "ddkqka4b4";
  const UPLOAD_PRESET = "duantotnghiep_preset";

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await fetch(`${Constants.DOMAIN_API}/admin/blog/${id}`);
        const data = await res.json();
        setTitle(data.title);
        setContent(data.content);
        setUserId(data.user_id);
        setImagePreview(data.image_url);
        setMetaDescription(data.meta_description || "");
        setBlogCategoryId(data.blogCategory_id || "");
      } catch (err) {
        Swal.fire("Lỗi", "Không thể tải dữ liệu bài viết", "error");
      }
    };

    const fetchCategories = async () => {
      try {
        const res = await fetch(`${Constants.DOMAIN_API}/admin/blogcategory/list`);
        const data = await res.json();
        setCategories(data.data || []);
      } catch (error) {
        console.error("Lỗi lấy danh mục:", error);
      }
    };

    fetchBlog();
    fetchCategories();
  }, [id]);

  const handleImageUpload = async () => {
    if (!image) return imagePreview;
    const formData = new FormData();
    formData.append("file", image);
    formData.append("upload_preset", UPLOAD_PRESET);
    setUploading(true);
    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setUploading(false);
      return data.secure_url || imagePreview;
    } catch (err) {
      setUploading(false);
      Swal.fire("Lỗi", "Không thể tải ảnh lên Cloudinary", "error");
      return imagePreview;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const contentValue = editorRef.current?.getContent() || content;
    if (!title || !contentValue || !userId || !blogCategoryId) {
      Swal.fire("Cảnh báo", "Vui lòng nhập đầy đủ thông tin", "warning");
      return;
    }

    const imageUrl = await handleImageUpload();

    try {
      const res = await fetch(`${Constants.DOMAIN_API}/admin/blog/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content: contentValue,
          image_url: imageUrl,
          user_id: userId,
          meta_description: metaDescription,
          blogCategory_id: blogCategoryId,
        }),
      });

      if (res.ok) {
        Swal.fire("Thành công", "Cập nhật bài viết thành công", "success");
        navigate("/admin/blog/getAll");
      } else {
        Swal.fire("Lỗi", "Không thể cập nhật bài viết", "error");
      }
    } catch (err) {
      Swal.fire("Lỗi", "Gửi dữ liệu thất bại", "error");
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-12">
          <div className="card mb-4">
            <div className="card-body p-4">
              <h5 className="card-title fw-semibold mb-4">Chỉnh sửa bài viết</h5>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-bold">Tiêu đề bài viết</label>
                  <input type="text" className="form-control" value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Danh mục</label>
                  <select className="form-select" value={blogCategoryId} onChange={(e) => setBlogCategoryId(e.target.value)} required>
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Mô tả bài viết</label>
                  <textarea className="form-control" rows="3" value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} />
                </div>

                <label className="form-label fw-bold">Nội dung bài viết</label>
                <Editor
                  apiKey="hn83ucgq5arqkhxqdclbke1h3fu5a2zqpprjn87b3fol67jm"
                  value={content}
                  onInit={(evt, editor) => (editorRef.current = editor)}
                  init={{
                    height: 400,
                    menubar: true,
                    plugins: ["advlist", "autolink", "lists", "link", "image", "charmap", "preview", "anchor", "searchreplace", "visualblocks", "code", "fullscreen", "insertdatetime", "media", "table", "help", "wordcount"],
                    toolbar: "undo redo | formatselect | bold italic backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | image | help",
                    image_title: true,
                    automatic_uploads: true,
                    file_picker_types: "image",
                    file_picker_callback: function (cb) {
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
                  <input type="file" className="form-control" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
                  {imagePreview && <div className="mt-2"><img src={imagePreview} alt="preview" style={{ maxWidth: "200px" }} /></div>}
                  {uploading && <p className="text-info">Đang tải ảnh lên...</p>}
                </div>

                <div className="d-flex justify-content-start gap-2 mt-3">
                  <button type="submit" className="btn btn-primary" disabled={uploading}>Cập nhật bài viết</button>
                  <button type="button" className="btn" style={{ backgroundColor: "#6c757d", color: "#fff", border: "none" }} onClick={() => navigate(-1)}>Quay lại</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditBlog;
