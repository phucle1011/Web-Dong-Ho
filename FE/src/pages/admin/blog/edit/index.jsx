import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { Editor } from '@tinymce/tinymce-react';
import Constants from "../../../../Constants";

function EditBlog() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [userId, setUserId] = useState("");
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
      })
      .catch((err) => {
        Swal.fire("Lỗi", "Không thể tải dữ liệu bài viết", "error");
      });
  }, [id]);

  const handleImageUpload = async () => {
    if (!image) return imagePreview;

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

      if (data.secure_url) {
        return data.secure_url;
      } else {
        Swal.fire("Lỗi", "Tải ảnh lên thất bại", "error");
        return imagePreview;
      }
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
        <div className="col-12 d-flex align-items-stretch">
          <div className="card w-100">
            <div className="card-body p-4">
              <div className="d-flex justify-between items-center mb-4">
                <h5 className="card-title fw-semibold">Chỉnh sửa bài viết</h5>
              </div>
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

                <div className="mb-3">
                  <label className="form-label fw-bold">Nội dung</label>
                  <Editor
                    apiKey="hxo8p07686juzc8t31sz6h654xhecoydtwwa89l3dcx3plg2"
                    onInit={(evt, editor) => (editorRef.current = editor)}
                    init={{
                      height: 400,
                      menubar: false,
                      plugins: [
                        "table",
                        "link",
                        "image",
                        "code",
                        "lists",
                        "paste",
                        "autoresize",
                      ],
                      toolbar:
                        "undo redo | styles | bold italic underline | " +
                        "alignleft aligncenter alignright alignjustify | " +
                        "bullist numlist outdent indent | link image | table | code",
                    }}
                    onEditorChange={(newValue) => setContent(newValue)}
                    value={content}
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
                      <img
                        src={imagePreview}
                        alt="preview"
                        style={{ maxWidth: "200px" }}
                      />
                    </div>
                  )}
                </div>

                {uploading && (
                  <p className="text-info">Đang tải ảnh lên Cloudinary...</p>
                )}

                <button type="submit" className="btn btn-primary">
                  Cập nhật bài viết
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditBlog;
