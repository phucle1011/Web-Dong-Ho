import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { Filter } from "bad-words";
import StarRating from "../Helpers/StarRating";
import LoaderStyleOne from "../Helpers/Loaders/LoaderStyleOne";
import { decodeToken } from "../Helpers/jwtDecode";

const ProductReviewSection = () => {
  const { id: productId } = useParams();
  const [orderDetailId, setOrderDetailId] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [visibleCount, setVisibleCount] = useState(5);
  const [filterType, setFilterType] = useState("all");
  const [filterRating, setFilterRating] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = decodeToken(token);
      setUserId(decoded?.user_id || decoded?.id || null);
    }
    const storedOrderDetailId = localStorage.getItem("pendingReviewOrderDetailId");
    if (storedOrderDetailId) {
      setOrderDetailId(storedOrderDetailId);
      localStorage.removeItem("pendingReviewOrderDetailId");
    }
  }, []);

  useEffect(() => {
    if (productId) {
      fetchComments();
    } else {
      Swal.fire("Thiếu thông tin", "Không tìm thấy sản phẩm.", "warning");
    }
  }, [productId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5000/comment/product/${productId}`);
      const data = res.data.data;
      const parentComments = data.filter((c) => c.parent_id === null);
      const childComments = data.filter((c) => c.parent_id !== null);
      const structured = parentComments.map((parent) => {
        const replys = childComments
          .filter((c) => c.parent_id === parent.id)
          .map((reply) => ({ ...reply, author: reply.user?.name || "Ẩn danh" }));
        return { ...parent, author: parent.user?.name || "Ẩn danh", replys };
      });
      setComments(structured);
    } catch (error) {
      console.error("Lỗi khi lấy bình luận:", error);
    } finally {
      setLoading(false);
    }
  };

const handleImageChange = async (e) => {
  const files = Array.from(e.target.files);
  if (files.length > 3) {
    Swal.fire({
      icon: "error",
      title: "Chỉ được tải tối đa 3 ảnh",
      text: "Vui lòng chọn lại ảnh.",
    });
    e.target.value = null;
    return;
  }

  const urls = await handleImageUploads(files);
  setImageFiles(urls);
};


  const handleSingleImageUpload = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "duantotnghiep_preset");
    formData.append("cloud_name", "ddkqka4b4");
    formData.append("moderation", "aws_rek");

    try {
      const res = await fetch("https://api.cloudinary.com/v1_1/ddkqka4b4/image/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      const moderationResult = data.moderation?.[0]?.response;
      const isAdult = moderationResult?.Adult?.Confidence > 80;
      const isViolence = moderationResult?.Violence?.Confidence > 80;

      if (isAdult || isViolence) {
        Swal.fire({
          icon: "error",
          title: "Ảnh không phù hợp",
          text: "Ảnh chứa nội dung phản cảm hoặc bạo lực. Vui lòng chọn ảnh khác.",
        });
        return null;
      }

      return data.secure_url;
    } catch (error) {
      console.error("Lỗi kiểm duyệt ảnh:", error);
      return null;
    }
  };


  const handleImageUploads = async (files) => {
  const urls = [];
  for (const file of files) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "duantotnghiep_preset");
    formData.append("cloud_name", "ddkqka4b4");

    try {
      const res = await fetch("https://api.cloudinary.com/v1_1/ddkqka4b4/image/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.secure_url) urls.push(data.secure_url);
    } catch (err) {
      console.error("Lỗi upload ảnh:", err);
    }
  }
  return urls;
};

  
  const reviewAction = async () => {
    if (!message || rating === 0) {
      Swal.fire({ icon: "warning", title: "Thiếu thông tin", text: "Vui lòng nhập nội dung và chọn số sao trước khi gửi." });
      return;
    }

    const filter = new Filter();
    const badWordsVi = [
      "địt", "cặc", "lồn", "buồi", "vãi", "vcl", "dm", "đmm", "đm", "cl", "ngu", "đần", "đụ", "chó", "mẹ mày", "con mẹ",
      "óc chó", "đồ ngu", "thằng ngu", "thằng khùng", "khốn nạn", "fuck", "shit"
    ];
    filter.addWords(...badWordsVi);

    if (filter.isProfane(message)) {
      Swal.fire({ icon: "error", title: "Ngôn ngữ không phù hợp", text: "Nội dung đánh giá chứa từ ngữ không phù hợp. Vui lòng chỉnh sửa." });
      return;
    }

    if (!orderDetailId) {
      Swal.fire({ icon: "error", title: "Thiếu mã đơn hàng", text: "Không thể gửi đánh giá do thiếu mã chi tiết đơn hàng." });
      return;
    }

    setReviewLoading(true);
    let imageUrls = [];
    if (imageFiles?.length > 0) imageUrls = await handleImageUploads(imageFiles);

    try {
      const payload = {
        user_id: userId,
        rating,
        comment_text: message,
        order_detail_id: Number(orderDetailId),
        images: imageUrls,
      };
      await axios.post("http://localhost:5000/comments", payload);
      Swal.fire({ icon: "success", title: "Đánh giá thành công!", text: "Cảm ơn bạn đã gửi đánh giá cho sản phẩm." });
      setMessage(""); setRating(0); setHoverRating(0); setImageFiles([]); setOrderDetailId(null);
      fetchComments();
    } catch (error) {
      console.error("Lỗi khi gửi bình luận:", error);
      Swal.fire({ icon: "error", title: "Lỗi gửi đánh giá", text: "Chúng Tôi Kiểm Tra hình Ảnh Của Bạn Không Hợp Lệ" });
    } finally {
      setReviewLoading(false);
    }
  };

  const renderStars = (rating) => [...Array(5)].map((_, i) => (
    <span key={i} style={{ color: i < rating ? "#FFA500" : "#ccc", fontSize: "20px" }}>★</span>
  ));

  const getRatingStats = (comments) => {
    const stats = { total: 0, count: 0, byStar: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }, withText: 0, withImage: 0 };
    comments.forEach((c) => {
      stats.total += c.rating;
      stats.count += 1;
      stats.byStar[c.rating] += 1;
      if (c.comment_text?.trim()) stats.withText += 1;
      if (c.commentImages?.length > 0) stats.withImage += 1;
    });
    return { average: stats.count ? (stats.total / stats.count).toFixed(1) : 0, ...stats };
  };

  const ratingStats = getRatingStats(comments);
  const filteredComments = comments.filter((comment) => {
    if (filterType === "image") return comment.commentImages?.length > 0;
    if (filterType === "text") return comment.comment_text?.trim();
    if (filterType === "rating" && filterRating) return comment.rating === filterRating;
    return true;
  });
  const visibleComments = filteredComments.slice(0, visibleCount);


  return (
    <>
    {selectedImage && (
  <div
    className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
    onClick={() => setSelectedImage(null)}
  >
    <img
      src={selectedImage}
      alt="Full View"
      className="max-w-[90%] max-h-[90%] rounded-lg shadow-lg"
    />
  </div>
)}
      {/* Filter & Rating Summary */}
      <div className="max-w-[900px] mx-auto mt-5 px-6 bg-[#fff7f4] rounded-md border py-6">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          <div className="text-center md:text-left">
            <p className="text-4xl font-bold text-red-500">{ratingStats.average}</p>
            <p className="text-sm text-gray-500 mb-2">trên 5</p>
            <div className="flex justify-center md:justify-start">
              {renderStars(Math.round(ratingStats.average))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { setFilterType("all"); setFilterRating(null); }}
              className={`border rounded px-3 py-1 text-sm ${filterType === "all" ? "bg-red-500 text-white" : "bg-white text-black"}`}
            >
              Tất Cả
            </button>
            {[5, 4, 3, 2, 1].map((star) => (
              <button
                key={star}
                onClick={() => { setFilterType("rating"); setFilterRating(star); }}
                className={`border rounded px-3 py-1 text-sm ${filterType === "rating" && filterRating === star ? "bg-red-500 text-white" : "bg-white text-black"}`}
              >
                {star} Sao ({ratingStats.byStar[star]})
              </button>
            ))}
            <button
              onClick={() => { setFilterType("text"); setFilterRating(null); }}
              className={`border rounded px-3 py-1 text-sm ${filterType === "text" ? "bg-red-500 text-white" : "bg-white text-black"}`}
            >
              Có Bình Luận ({ratingStats.withText})
            </button>
            <button
              onClick={() => { setFilterType("image"); setFilterRating(null); }}
              className={`border rounded px-3 py-1 text-sm ${filterType === "image" ? "bg-red-500 text-white" : "bg-white text-black"}`}
            >
              Có Hình Ảnh / Video ({ratingStats.withImage})
            </button>
          </div>
        </div>
      </div>

      {/* Danh sách bình luận */}
      <div className="py-10 max-w-[900px] mx-auto">
{visibleComments.map((comment) => (
  <div key={comment.id} className="bg-white border rounded-lg p-6 mb-6 shadow relative">
    {/* Góc phải trên: Số sao */}
    <div className="absolute top-4 right-4 flex items-center gap-1">
      {renderStars(comment.rating)}
      <span className="text-sm text-gray-500">({comment.rating.toFixed(1)})</span>
    </div>

    <div className="flex flex-col gap-4">
      {/* Tên người dùng */}
      <div className="text-lg font-semibold">{comment.user?.name || comment.author}</div>

      {/* Phân loại + Ngày */}
      <div className="text-sm text-gray-500">
        Phân loại hàng:{" "}
        <span className="font-medium">{comment.orderDetail?.variant?.sku || "Không rõ"}</span>{" "}
        | {new Date(comment.created_at).toLocaleDateString("vi-VN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })}
      </div>

      {/* Nội dung bình luận */}
      <p className="text-gray-700 text-base">{comment.comment_text}</p>

      {/* Ảnh hoặc video */}
      {comment.commentImages?.length > 0 && (
        <div className="flex gap-3 flex-wrap mt-2">
          {comment.commentImages.map((media, idx) =>
            media.image_url.endsWith(".mp4") ? (
              <video key={idx} controls width="150" className="rounded-md">
                <source src={media.image_url} type="video/mp4" />
              </video>
            ) : (
              <img
  key={idx}
  src={media.image_url}
  alt={`comment-img-${idx}`}
  className="w-28 h-28 rounded-md object-cover cursor-pointer hover:opacity-80 transition"
  onClick={() => setSelectedImage(media.image_url)}
/>

            )
          )}
        </div>
      )}

      {/* Trả lời (nếu có) */}
      {comment.replys?.length > 0 && (
        <div className="pl-4 border-l mt-4 space-y-3">
          {comment.replys.map((reply) => (
            <div key={reply.id}>
              <strong>{reply.author}</strong>
              <p className="text-sm text-gray-600">{reply.comment_text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
))}


      </div>

      {/* Form viết đánh giá */}
      {userId && orderDetailId ? (
        <div className="write-review w-full mt-10 px-6 max-w-[900px] mx-auto">
          <h1 className="text-2xl font-medium text-qblack mb-5">Viết đánh giá của bạn</h1>
          <div className="flex space-x-1 items-center mb-6">
            <StarRating
              hoverRating={hoverRating}
              hoverHandler={(val) => setHoverRating(val)}
              rating={rating}
              ratingHandler={(val) => setRating(val)}
            />
            <span className="text-qblack text-[15px] font-normal mt-1">
              ({rating}.0)
            </span>
          </div>

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows="4"
            placeholder="Nội dung đánh giá..."
            className="w-full border p-4 rounded-md outline-none mb-6"
          ></textarea>

          <div className="mb-6">
            <label className="block mb-2 text-sm font-medium text-qblack">Tải hình ảnh (tối đa 3):</label>
            <label
              htmlFor="upload-images"
              className="w-full max-w-[300px] h-[45px] border border-gray-300 rounded-md flex items-center justify-center cursor-pointer hover:bg-gray-100 transition"
            >
              <span className="text-sm text-gray-600">Chọn ảnh từ thiết bị</span>
            </label>
            <input
              id="upload-images"
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files);
                if (files.length > 3) {
                  Swal.fire({
                    icon: "error",
                    title: "Chỉ được tải tối đa 3 ảnh",
                    text: "Vui lòng chọn lại ảnh.",
                  });
                  e.target.value = null;
                  return;
                }
                setImageFiles(files);
              }}
              className="hidden"
            />

            {imageFiles?.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-4">
                {imageFiles.map((file, idx) => (
                  <div key={idx} className="w-24 h-24 border rounded-md overflow-hidden">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${idx}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              onClick={reviewAction}
              type="button"
              className="black-btn w-[300px] h-[50px] flex justify-center"
            >
              <span className="flex space-x-1 items-center h-full">
                <span className="text-sm font-semibold">Gửi đánh giá</span>
                {reviewLoading && (
                  <span className="w-5" style={{ transform: "scale(0.3)" }}>
                    <LoaderStyleOne />
                  </span>
                )}
              </span>
            </button>
          </div>
        </div>
      ) : userId && !orderDetailId ? (
        <></>
      ) : (
        <p className="text-center mt-10 text-gray-500">Vui lòng đăng nhập để viết đánh giá.</p>
      )}
    </>
  );
};

export default ProductReviewSection;
