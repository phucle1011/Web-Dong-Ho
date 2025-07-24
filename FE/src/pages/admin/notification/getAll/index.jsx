import React, { useEffect, useState } from "react";
import axios from "axios";
import Constants from "../../../../Constants.jsx";
import { toast, ToastContainer,  } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link } from "react-router-dom";

const STATUS_VI = {
  active: "Đang diễn ra",
  inactive: "Ngưng hoạt động",
  expired: "Hết hạn",
  upcoming: "Sắp diễn ra",
  unknown: "Không xác định"
};

const NotificationList = () => {
  const [flashSales, setFlashSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const limit = 10;

  useEffect(() => {
    fetchFlashSales(page, searchTerm);
    // eslint-disable-next-line
  }, [page]);

  const fetchFlashSales = async (curPage = 1, search = "") => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${Constants.DOMAIN_API}/admin/flashSale`, {
        params: { page: curPage, limit, search },
      });
      setFlashSales(res.data?.data || []);
      setTotal(res.data?.pagination?.total || res.data?.data?.length || 0);
    } catch (err) {
      setError("Không thể tải danh sách Flash Sale!");
      setFlashSales([]);
      toast.error("Không thể tải danh sách Flash Sale!");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchFlashSales(1, searchTerm.trim());
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  // Tính trạng thái khuyến mãi để đổi màu
  const getStatusColor = (status) => {
    if (status === "active") return "bg-green-100 text-green-800";
    if (status === "inactive") return "bg-gray-200 text-gray-800";
    if (status === "expired") return "bg-red-100 text-red-800";
    if (status === "upcoming") return "bg-blue-100 text-blue-800";
    return "bg-gray-100 text-gray-700";
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

<div className="mb-4 flex gap-2">
  <input
    type="text"
    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
    placeholder="Nhập tên thông báo cần tìm..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    onKeyDown={(e) => {
      if (e.key === "Enter") handleSearch();
    }}
  />
  <button
    onClick={handleSearch}
    className="bg-[#073272] text-white px-4 py-2 rounded"
  >
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 3a7.5 7.5 0 006.15 13.65z" />
    </svg>
  </button>
</div>

      {loading ? (
        <div className="text-center py-6">Đang tải...</div>
      ) : error ? (
        <div className="text-center text-red-600 py-6">{error}</div>
      ) : flashSales.length === 0 ? (
        <div className="text-center text-gray-500 py-6">Không có Flash Sale nào.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-auto border border-collapse border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">STT</th>
                <th className="border p-2">Ảnh</th>
                <th className="border p-2">Tiêu đề thông báo (Tên khuyến mãi)</th>
                <th className="border p-2">Ngày bắt đầu</th>
                <th className="border p-2">Ngày kết thúc</th>
                <th className="border p-2">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {flashSales.map((fs, idx) => {
                const promo = fs.promotion;
                const noti = fs.notification;
                const status = promo?.status || "unknown";
                const statusClass = getStatusColor(status);

                return (
                  <tr key={fs.id}>
                    <td className="border p-2 text-center">{(page - 1) * limit + idx + 1}</td>
                    <td className="border p-2 text-center">
                      {noti?.thumbnail ? (
                        <img
                          src={noti.thumbnail}
                          alt="thumb"
                          className="w-12 h-12 object-cover rounded mx-auto"
                          loading="lazy"
                        />
                      ) : (
                        <span className="inline-block w-12 h-12 bg-gray-200 rounded" />
                      )}
                    </td>
                    <td className="border p-2">
                      <b>{noti?.title || "-"}</b>
                      {promo?.name ? (
                        <span className="text-gray-500 text-xs ml-1">({promo.name})</span>
                      ) : ""}
                    </td>
                    <td className="border p-2">
                      {promo?.start_date ? new Date(promo.start_date).toLocaleString('vi-VN') : '-'}
                    </td>
                    <td className="border p-2">
                      {promo?.end_date ? new Date(promo.end_date).toLocaleString('vi-VN') : '-'}
                    </td>
                    <td className="border p-2 text-center">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${statusClass}`}>
                        {STATUS_VI[status] || "Không xác định"}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          <button
            className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300"
            disabled={page === 1 || loading}
            onClick={() => setPage(page - 1)}
          >
            Trang trước
          </button>
          <span className="text-sm">Trang {page} / {totalPages}</span>
          <button
            className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300"
            disabled={page === totalPages || loading}
            onClick={() => setPage(page + 1)}
          >
            Trang sau
          </button>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
};

export default NotificationList;
