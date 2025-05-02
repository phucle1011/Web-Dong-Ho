import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import Constants from "../../../../Constants";

function ReviewEdit() {

     const [queryParams] = useSearchParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        userID: "",
        tripID: "",
        rating: "",
        comment: "",
        createAt: "",
        status: "1",
    });

    useEffect(() => {
        getReview();
    }, []);

    const getReview = async () => {
        try {
            const res = await axios.get(`${Constants.DOMAIN_API}/admin/review/getById/${queryParams.get("id")}`);
            const data = res.data.data;
            setFormData({
                userID: data.User.fullName,
                tripID: data.tripId,
                rating: data.rating,
                comment: data.comment,
                createAt: new Date(data.createdAt).toLocaleDateString("vi-VN"),
                status: data.status.toString(),
            });
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu đánh giá:", error);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.patch(`${Constants.DOMAIN_API}/admin/review/update/${queryParams.get("id")}`, {
                status: formData.status,
            });
            navigate("/admin/review/getAll");
        } catch (error) {
            console.error("Lỗi khi cập nhật đánh giá:", error);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <div className="bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto">
                <h3 className="text-2xl font-bold mb-4">Chỉnh sửa đánh giá</h3>
                <form onSubmit={handleSubmit} className="p-4 border rounded-md shadow-lg">
                    <div className="mb-4">
                        <label className="block text-sm font-medium">Người dùng</label>
                        <input type="text" name="userID" value={formData.userID} disabled className="w-full p-2 border rounded" />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium">Mã chuyến xe</label>
                        <input type="text" name="tripID" value={formData.tripID} disabled className="w-full p-2 border rounded" />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium">Đánh giá</label>
                        <div className="flex items-center gap-2">
                            <input type="text" name="rating" value={formData.rating} disabled className="w-[35px] p-2 rounded" />
                            <span>{Array.from({ length: formData.rating }, (_, i) =><span key={i} className="pr-1 text-yellow-500">★</span>)}</span>
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium">Bình luận</label>
                        <input type="text" name="comment" value={formData.comment} disabled className="w-full p-2 border rounded" />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium">Ngày đăng</label>
                        <input type="text" name="createAt" value={formData.createAt} disabled className="w-full p-2 border rounded" />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium">Trạng thái</label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                        >
                            <option value="1">Hiển thị</option>
                            <option value="0">Ẩn</option>
                        </select>
                    </div>
                    <button type="submit" className="px-4 py-2 bg-[#073272] text-white rounded">Cập nhật đánh giá</button>
                </form>
            </div>
        </div>
    );
}

export default ReviewEdit;
