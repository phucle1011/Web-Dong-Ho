import React, { useEffect, useState } from "react";
import axios from "axios";
import Constants from "../../../../Constants.jsx";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link } from "react-router-dom";

const STATUS_VI = {
  1: "Hiển thị",
  0: "Ẩn",
};

const getStatusColor = (status) => {
  if (status === 1) return "bg-green-100 text-green-800";
  if (status === 0) return "bg-gray-200 text-gray-800";
  return "bg-gray-100 text-gray-700";
};

const NotificationList = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedRow, setExpandedRow] = useState(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${Constants.DOMAIN_API}/admin/flashSale`);
      setNotifications(res.data?.data || []);
    } catch (err) {
      setError("Không thể tải danh sách Flash Sale!");
      toast.error("Không thể tải danh sách Flash Sale!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 bg-white shadow rounded">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Danh sách Flash Sale</h2>
        <Link
          to="/admin/notification/create"
          className="inline-block bg-[#073272] text-white px-4 py-2 rounded"
        >
          + Thêm thông báo
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-6">Đang tải...</div>
      ) : error ? (
        <div className="text-center text-red-600 py-6">{error}</div>
      ) : notifications.length === 0 ? (
        <div className="text-center text-gray-500 py-6">
          Không có Flash Sale nào.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-auto border border-collapse border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">STT</th>
                <th className="border p-2">Ảnh</th>
                <th className="border p-2">Tiêu đề</th>
                <th className="border p-2">Trạng thái</th>
                <th className="border p-2">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {notifications.map((noti, idx) => {
  const isExpanded = expandedRow === noti.id;
  const status = noti.status;
  return (
    <React.Fragment key={noti.id}>
      <tr>
        <td className="border p-2 text-center">{idx + 1}</td>
        <td className="border p-2 text-center">
          {noti.thumbnail ? (
            <img
              src={noti.thumbnail}
              alt="thumb"
              className="w-12 h-12 object-cover rounded mx-auto"
            />
          ) : (
            <span className="inline-block w-12 h-12 bg-gray-200 rounded" />
          )}
        </td>
        <td className="border p-2">{noti.title}</td>
        <td className="border p-2 text-center">
          <span
            className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
              status
            )}`}
          >
            {STATUS_VI[status] || "Không xác định"}
          </span>
        </td>
        <td className="border p-2 text-center">
          <button
            className="text-blue-600 underline text-sm"
            onClick={() =>
              setExpandedRow(isExpanded ? null : noti.id)
            }
          >
            {isExpanded ? "Ẩn" : "Xem thêm"}
          </button>
        </td>
      </tr>

      {/* Chi tiết flash sales */}
      {isExpanded && (
  <tr className="bg-blue-50">
    <td colSpan="5" className="p-3 border border-blue-400 rounded-md shadow-md">
      <div className="transition-all duration-300 ease-in-out">
        <table className="w-full table-auto text-sm border border-blue-300 rounded">
          <thead className="bg-blue-100 text-blue-900 font-semibold">
            <tr>
              <th className="p-2 border">Tên khuyến mãi</th>
              <th className="p-2 border">Giảm giá</th>
              <th className="p-2 border">Giá tối thiểu</th>
              <th className="p-2 border">Số lượng áp dụng</th>
              <th className="p-2 border">Thời gian</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(noti.flashSale) && noti.flashSale.length > 0 ? (
              noti.flashSale.map((fs) => {
                const promo = fs.promotion;
                if (!promo) return null;

                const now = new Date();
                const start = new Date(promo.start_date);
                const end = new Date(promo.end_date);

                let timeStatus = "";
                if (now < start) {
                  const diff = Math.ceil((start - now) / (1000 * 60 * 60 * 24));
                  timeStatus = `Còn ${diff} ngày nữa bắt đầu`;
                } else if (now >= start && now <= end) {
                  const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
                  timeStatus = `Còn ${diff} ngày nữa kết thúc`;
                } else {
                  timeStatus = `Đã kết thúc`;
                }

                return (
                  <tr key={fs.id}>
                    <td className="p-2 border">{promo.name || "Không tên"}</td>
                    <td className="p-2 border">
                      {promo.discount_value}
                      {promo.discount_type === "percentage" ? "%" : "₫"}
                    </td>
                    <td className="p-2 border">
                      {Number(promo.min_price_threshold || 0).toLocaleString("vi-VN")}₫
                    </td>
                    <td className="p-2 border">{promo.quantity || 0}</td>
                    <td className="p-2 border">{timeStatus}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className="text-center p-3 italic text-gray-500">
                  Không có Flash Sale nào trong thông báo này.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </td>
  </tr>
)}

    </React.Fragment>
  );
})}

            </tbody>
          </table>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
};

export default NotificationList;
