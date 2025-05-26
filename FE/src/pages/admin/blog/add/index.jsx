import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { Editor } from '@tinymce/tinymce-react';
import Constants from "../../../../Constants";

function AddBlog() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [userId, setUserId] = useState("");  // thêm state cho userId nhập từ input
  const navigate = useNavigate();

  const editorRef = useRef(null);

  const CLOUD_NAME = "ddkqka4b4";
  const UPLOAD_PRESET = "duantotnghiep_preset";

  // const userIdFromStorage = localStorage.getItem("user_id"); // nếu bạn muốn mặc định lấy từ localStorage

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

      if (data.secure_url) {
        return data.secure_url;
      } else {
        Swal.fire("Lỗi", "Tải ảnh lên thất bại", "error");
        return "";
      }
    } catch (error) {
      setUploading(false);
      Swal.fire("Lỗi", "Có lỗi khi tải ảnh", "error");
      return "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const contentValue = editorRef.current?.getContent() || content;

    if (!title || !contentValue || !image || !userId) {
      Swal.fire(
        "Cảnh báo",
        "Vui lòng nhập đầy đủ tiêu đề, nội dung, ảnh và user_id",
        "warning"
      );
      return;
    }

    const imageUrl = await handleImageUpload();
    if (!imageUrl) return;

    try {
      const response = await fetch(`${Constants.DOMAIN_API}/admin/blog/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content: contentValue,
          image_url: imageUrl,
          user_id: userId,  // lấy từ state userId
        }),
      });

      if (response.ok) {
        Swal.fire("Thành công", "Đã thêm bài viết mới", "success");
        navigate("/admin/blog/getAll"); 
      } else {
        Swal.fire("Lỗi", "Không thể thêm bài viết", "error");
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
                <h5 className="card-title fw-semibold">Thêm bài viết mới</h5>
              </div>
              <form onSubmit={handleSubmit}>
                {/* Input user_id mới */}
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
                    required
                  />
                </div>

                {uploading && (
                  <p className="text-info">Đang tải ảnh lên Cloudinary...</p>
                )}

                <button type="submit" className="btn btn-success">
                  Thêm bài viết
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddBlog;
