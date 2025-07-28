import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Constants from "../../../../Constants.jsx";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link } from "react-router-dom";
import {
  FaChevronRight,
  FaChevronLeft,
  FaAngleDoubleRight,
  FaAngleDoubleLeft,
  FaEdit,
  FaTrashAlt,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";

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
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteItem, setDeleteItem] = useState({});
  const dialogRef = useRef(null);

  const itemsPerPage = 5;

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

  const handleDeleteClick = (item) => {
    setDeleteItem(item);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    try {
      const res = await axios.delete(`${Constants.DOMAIN_API}/admin/flashSale/${deleteItem.id}`);
      toast.success(res.data.message || "Xóa thành công");
      fetchNotifications();
    } catch (err) {
      console.error("Lỗi khi xóa:", err);
      toast.error("Xóa thất bại!");
    } finally {
      setShowDeleteDialog(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteDialog(false);
    setDeleteItem({});
  };

  const handleDialogKeyDown = (e) => {
    if (e.key === "Escape") {
      cancelDelete();
    }
  };

  const filteredNotifications = notifications.filter((noti) =>
    noti.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedNotifications = filteredNotifications.slice(
    startIndex,
    startIndex + itemsPerPage
  );
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
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

      <div className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Tìm theo tiêu đề..."
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setSearchTerm(searchInput.trim());
              setCurrentPage(1);
            }
          }}
        />
        <button
          onClick={() => {
            setSearchTerm(searchInput.trim());
            setCurrentPage(1);
          }}
          className="bg-[#073272] text-white px-4 py-2 rounded"
        >
          Tìm
        </button>
      </div>

      {loading ? (
        <div className="text-center py-6">...Đang tải</div>
      ) : error ? (
        <div className="text-center text-red-600 py-6">{error}</div>
      ) : paginatedNotifications.length === 0 ? (
        <div className="text-center text-gray-500 py-6">Không có Flash Sale nào.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-auto border border-collapse border-gray-300">
  <thead className="bg-gray-100">
    <tr>
      <th className="border p-2 text-center">#</th>
      <th className="border p-2">Ảnh</th>
      <th className="border p-2">Tiêu đề</th>
      <th className="border p-2">Trạng thái</th>
      <th className="border p-2">Hành động</th>
    </tr>
  </thead>
  <tbody>
    {paginatedNotifications.map((noti, idx) => {
      const isExpanded = expandedRow === noti.id;
      const status = noti.status;
      const stt = (currentPage - 1) * itemsPerPage + idx + 1;

      return (
        <React.Fragment key={noti.id}>
          <tr className="hover:bg-gray-50">
            <td className="border p-2 text-center">{stt}</td>
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
            <td className="border p-2 font-medium">{noti.title}</td>
            <td className="border p-2 text-center">
              <span
                className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}
              >
                {STATUS_VI[status] || "Không xác định"}
              </span>
            </td>
            <td className="border p-2 text-center">
  <Link
    to={`/admin/notification/edit/${noti.id}`}
    className="p-2 rounded w-8 h-8 inline-flex items-center justify-center bg-yellow-500 text-white hover:bg-yellow-600"
    title="Sửa"
  >
    <FaEdit size={20} />
  </Link>

  <button
    className="p-2 rounded-full bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 transition duration-200"
onClick={() => handleDeleteClick()}
    title="Xóa"
  >
    <FaTrashAlt size={20} />
  </button>

  <button
    onClick={() => setExpandedRow(isExpanded ? null : noti.id)}
    className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
    title={isExpanded ? "Ẩn" : "Xem thêm"}
  >
    {isExpanded ? <FaChevronUp size={16} /> : <FaChevronDown size={16} />}
  </button>
</td>

          </tr>

          {isExpanded && (
            <tr>
              <td colSpan={5} className="p-2 bg-blue-50 border border-blue-300">
                <table className="w-full table-auto border border-collapse border-blue-300 mt-2 text-sm">
                  <thead className="bg-blue-100 text-blue-900 font-semibold">
                    <tr>
                      <th className="p-2 border text-center">#</th>
                      <th className="p-2 border">Tên khuyến mãi</th>
                      <th className="p-2 border">Giảm giá</th>
                      <th className="p-2 border">Giá tối thiểu</th>
                      <th className="p-2 border">Số lượng áp dụng</th>
                      <th className="p-2 border">Thời gian</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(noti.flashSale) && noti.flashSale.length > 0 ? (
                      noti.flashSale.map((fs, i) => {
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
                            <td className="p-2 border text-center">{i + 1}</td>
                            <td className="p-2 border">{promo.name || "Không tên"}</td>
                            <td className="p-2 border">
                              {promo.discount_value}
                              {promo.discount_type === "percentage" ? "%" : "₫"}
                            </td>
                            <td className="p-2 border">
                              {Number(promo.min_price_threshold || 0).toLocaleString("vi-VN")}₫
                            </td>
                            <td className="p-2 border text-center">{promo.quantity || 0}</td>
                            <td className="p-2 border">{timeStatus}</td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center p-3 italic text-gray-500">
                          Không có Flash Sale nào trong thông báo này.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
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

      <div className="flex justify-center items-center mt-4 gap-1 text-sm">
        <button
          disabled={currentPage === 1}
          onClick={() => handlePageChange(1)}
          className="px-2 py-1 border rounded disabled:opacity-50"
          title="Trang đầu"
        >
          <FaAngleDoubleLeft />
        </button>
        <button
          disabled={currentPage === 1}
          onClick={() => handlePageChange(currentPage - 1)}
          className="px-2 py-1 border rounded disabled:opacity-50"
          title="Trang trước"
        >
          <FaChevronLeft />
        </button>

        {[...Array(totalPages)].map((_, i) => {
          const page = i + 1;
          if (page >= currentPage - 1 && page <= currentPage + 1) {
            return (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-1 border rounded ${
                  currentPage === page
                    ? "bg-blue-500 text-white"
                    : "bg-blue-100 text-black hover:bg-blue-200"
                }`}
              >
                {page}
              </button>
            );
          }
          return null;
        })}

        {currentPage < totalPages - 1 && (
          <>
            {currentPage < totalPages - 2 && (
              <span className="px-2 text-gray-500">...</span>
            )}
            <button
              onClick={() => handlePageChange(totalPages)}
              className="px-3 py-1 border rounded hover:bg-blue-200"
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          disabled={currentPage === totalPages}
          onClick={() => handlePageChange(currentPage + 1)}
          className="px-2 py-1 border rounded disabled:opacity-50"
          title="Trang sau"
        >
          <FaChevronRight />
        </button>
        <button
          disabled={currentPage === totalPages}
          onClick={() => handlePageChange(totalPages)}
          className="px-2 py-1 border rounded disabled:opacity-50"
          title="Trang cuối"
        >
          <FaAngleDoubleRight />
        </button>
      </div>

       {showDeleteDialog && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          role="dialog"
          aria-labelledby="delete-dialog-title"
          aria-modal="true"
          onKeyDown={handleDialogKeyDown}
          ref={dialogRef}
          tabIndex={-1}
        >
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
            <h3 id="delete-dialog-title" className="text-lg font-semibold mb-4">
              Xác nhận xóa
            </h3>
            <p className="mb-6 text-gray-700">
              Bạn có chắc chắn muốn xóa <strong>{deleteItem?.title || "thông báo"}</strong>?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Xóa
              </button>
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}


      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
};

export default NotificationList;
