// ProductReviewSection.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import StarRating from "../Helpers/StarRating";
import LoaderStyleOne from "../Helpers/Loaders/LoaderStyleOne";
import { decodeToken } from "../Helpers/jwtDecode";

const ProductReviewSection = ({ productId }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [visibleCount, setVisibleCount] = useState(5);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = decodeToken(token);
      setUserId(decoded?.user_id || decoded?.id || null);
    }
  }, []);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5000/comment/product/${productId}`);
      const data = res.data.data;

      const parentComments = data.filter(c => c.parent_id === null);
      const childComments = data.filter(c => c.parent_id !== null);

      const structured = parentComments.map(parent => {
        const replys = childComments
          .filter(c => c.parent_id === parent.id)
          .map(reply => ({
            ...reply,
            author: reply.user?.name || "Ẩn danh",
          }));

        return {
          ...parent,
          author: parent.user?.name || "Ẩn danh",
          replys,
        };
      });

      setComments(structured);
    } catch (error) {
      console.error("Lỗi khi lấy bình luận:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) fetchComments();
  }, [productId]);

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
        console.error("Upload ảnh lỗi:", err);
      }
    }

    return urls;
  };

  const reviewAction = async () => {
    if (!message || rating === 0) {
      alert("Vui lòng nhập nội dung và chọn số sao.");
      return;
    }

    setReviewLoading(true);

    let imageUrls = [];
    if (imageFiles?.length > 0) {
      imageUrls = await handleImageUploads(imageFiles);
    }

    try {
      const payload = {
        user_id: userId,
        rating,
        comment_text: message,
        order_detail_id: 1,
        images: imageUrls
      };

      await axios.post("http://localhost:5000/comments", payload);

      alert("Gửi đánh giá thành công!");
      setMessage("");
      setRating(0);
      setHoverRating(0);
      setImageFiles([]);
      fetchComments();
    } catch (error) {
      console.error("Lỗi khi gửi bình luận:", error);
      alert("Lỗi khi gửi bình luận");
    } finally {
      setReviewLoading(false);
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <span key={i} style={{ color: i < rating ? "#FFA500" : "#ccc", fontSize: "20px" }}>★</span>
    ));
  };

  const visibleComments = comments.slice(0, visibleCount);

  return (
    <>
      <div className="py-10 max-w-[900px] mx-auto">
        {visibleComments.map((comment) => (
          <div key={comment.id} className="bg-white border rounded-lg p-6 mb-6 shadow">
            <div className="flex flex-col gap-4">
              <div className="flex justify-between">
                <h3 className="text-lg font-semibold">{comment.author}</h3>
                <div className="flex items-center gap-2">
                  {renderStars(comment.rating)}
                  <span className="text-sm text-gray-500">({comment.rating.toFixed(1)})</span>
                </div>
              </div>
              <p className="text-gray-700 text-base">{comment.comment_text}</p>

              {comment.commentImages?.length > 0 && (
                <div className="flex gap-3 flex-wrap">
                  {comment.commentImages.map(img => (
                    <img key={img.id} src={img.image_url} alt="Comment" className="w-28 rounded-md" />
                  ))}
                </div>
              )}

              {comment.replys?.length > 0 && (
                <div className="pl-4 border-l mt-4 space-y-3">
                  {comment.replys.map(reply => (
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

        {visibleCount < comments.length && (
          <div className="flex justify-center mt-6">
            <button
              className="black-btn w-[300px] h-[50px] text-sm font-semibold"
              onClick={() => setVisibleCount(prev => prev + 2)}
            >
              Load More
            </button>
          </div>
        )}
      </div>

      {userId ? (
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

          <div className="mb-6">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows="4"
              placeholder="Nội dung đánh giá..."
              className="w-full border p-4 rounded-md outline-none"
            ></textarea>
          </div>

          <div className="mb-6">
            <label className="block mb-2 text-sm font-medium text-qblack">Tải hình ảnh (tuỳ chọn):</label>

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
              onChange={(e) => setImageFiles(Array.from(e.target.files))}
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
      ) : (
        <p className="text-center mt-10 text-gray-500">Vui lòng đăng nhập để viết đánh giá.</p>
      )}
    </>
  );
};

export default ProductReviewSection;
