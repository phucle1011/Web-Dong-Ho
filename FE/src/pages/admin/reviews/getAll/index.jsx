import FormDelete from "../../../../components/formDelete";
import axios from "axios";
import Constants from "../../../../Constants";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";


const ReviewGetAll = () => {
    const [reviews, setReviews] = useState([]);
    const [selectedReview, setSelectedReview] = useState(null);

    useEffect(() => {
        getAllReviews();
    }, []);

    const getAllReviews = async () => {
        try {
            const res = await axios.get(`${Constants.DOMAIN_API}/admin/review/list`);
            setReviews(res.data.data);
        } catch (err) {
            console.error("Lỗi khi lấy đánh giá:", err);
        }
    };

    const deleteReview = async () => {
        if (!selectedReview) return;
        try {
            await axios.delete(`${Constants.DOMAIN_API}/admin/review/${selectedReview.id}`);
            setSelectedReview(null);
            getAllReviews();
        } catch (err) {
            console.error("Lỗi khi xóa đánh giá:", err);
        }
    };

    const renderReview = (review, index) => {
        return (
            <tr key={review.id} className="border-b">
                <td className="p-2 border">{review.User.fullName}</td>
                <td className="p-2 border text-center">{review.tripId}</td>
                <td className="p-2 border text-center">
                    <span className="pr-1 text-yellow-500">★</span>{review.rating}/5
                </td>
                <td className="p-2 border max-w-[200px]">
                    <div className="line-clamp-3" dangerouslySetInnerHTML={{ __html: review.comment }} />
                </td>

                <td className="p-2 border text-center">
                    {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                </td>

                <td className="p-2 border text-center">
                    <span className={`px-2 py-1 rounded-full text-xs ${review.status === 1 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}>
                        {review.status === 1 ? "Hiển thị" : "Ẩn bài viết"}
                    </span>
                </td>
                <td className="p-2 flex gap-2 justify-center">
                    <Link
                        to={`/admin/review/edit?id=${review.id}`}
                        className="bg-yellow-500 text-white py-2 px-3 rounded"
                    >
                        <i className="fa-solid fa-pen-to-square text-md"></i>
                    </Link>
                    <button
                        onClick={() => setSelectedReview(review)}
                        className="bg-red-500 text-white py-2 px-3 rounded"
                    >
                        <i className="fa-solid fa-trash text-md"></i>
                    </button>
                </td>
            </tr>
        )
    };

    return (
        <div className="container mx-auto p-2">
            <div className="bg-white p-4 shadow rounded-md">
                <h2 className="text-xl font-bold mb-3">Quản lý đánh giá</h2>
                <table className="w-full border-collapse border border-gray-300 mt-4">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="p-2 border">Người dùng</th>
                            <th className="p-2 border">Mã chuyến</th>
                            <th className="p-2 border">Đánh giá</th>
                            <th className="p-2 border">Bình luận</th>
                            <th className="p-2 border">Ngày đăng</th>
                            <th className="p-2 border">Trạng thái</th>
                            <th className="p-2 border">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reviews.map((renderReview))}
                    </tbody>
                </table>
            </div>
            <FormDelete
                isOpen={!!selectedReview}
                onClose={() => setSelectedReview(null)}
                onConfirm={deleteReview}
                Id={selectedReview?.id}
                action={`${Constants.DOMAIN_API}/admin/review/${selectedReview?.id}`}
                message={`Bạn có chắc chắn muốn xóa đánh giá "${selectedReview?.comment}" không?`}
            />
        </div>
    );
};

export default ReviewGetAll;
