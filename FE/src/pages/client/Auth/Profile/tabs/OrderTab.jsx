import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import React, { useEffect, useState } from "react";
import {
  FaChevronLeft,
  FaChevronRight,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaEye,
  FaMapMarkerAlt,
  FaTrashAlt,
} from "react-icons/fa";
import Constants from "../../../../../Constants.jsx";
import { toast } from "react-toastify";
import FormDelete from "../../../../../components/formDelete";
import { Link } from "react-router-dom";

export default function OrderTab() {
  // const [orders, setOrders] = useState([]);
  // const [currentPage, setCurrentPage] = useState(1);
  // const [totalPages, setTotalPages] = useState(1);
  // const [selectedOrder, setSelectedOrder] = useState(null);
  // const recordsPerPage = 10;
  // const [startDate, setStartDate] = useState(null);
  // const [endDate, setEndDate] = useState(null);
  // const [statusFilter, setStatusFilter] = useState("all");
  // const [statusCounts, setStatusCounts] = useState({
  //   all: 0,
  //   pending: 0,
  //   confirmed: 0,
  //   shipping: 0,
  //   completed: 0,
  //   delivered: 0,
  //   cancelled: 0,
  // });

  const translateStatus = (status) => {
    // switch (status) {
    //   case "pending":
    //     return "Chờ xác nhận";
    //   case "confirmed":
    //     return "Đã xác nhận";
    //   case "shipping":
    //     return "Đang giao";
    //   case "completed":
    //     return "Hoàn thành";
    //   case "delivered":
    //     return "Đã giao hàng thành công";
    //   case "cancelled":
    //     return "Đã hủy";
    //   default:
    //     return status;
    // }
  };

  function formatDateLocal(date) {
    // const year = date.getFullYear();
    // const month = (date.getMonth() + 1).toString().padStart(2, '0');
    // const day = date.getDate().toString().padStart(2, '0');
    // return `${year}-${month}-${day}`;
  }

  const fetchOrders = async (page = 1) => {
    // try {
    //   const user = localStorage.getItem("user");
    //   const userId = user ? JSON.parse(user).id : null;

    //   if (!userId) {
    //     toast.error("Vui lòng đăng nhập để thực hiện hành động này");
    //     return;
    //   }
    //   const params = {
    //     page,
    //     limit: recordsPerPage,
    //   };

    //   if (statusFilter && statusFilter !== "all") {
    //     params.status = statusFilter;
    //   }

    //   if (startDate) {
    //     params.startDate = formatDateLocal(startDate);
    //   }
    //   if (endDate) {
    //     params.endDate = formatDateLocal(endDate);
    //   }

    //   const res = await axios.get(`${Constants.DOMAIN_API}/orders`, {
    //     params: { userId },
    //   });

    //   setOrders(res.data.data || []);
    //   setTotalPages(res.data.pagination?.totalPages || 1);
    //   setStatusCounts(res.data.statusCounts || statusCounts);

    //   if (!res.data.data.length) {
    //     if (!toast.isActive("no-orders")) {
    //       toast.info("Không tìm thấy đơn hàng nào.", { toastId: "no-orders" });
    //     }
    //   }
    // } catch (error) {
    //   console.error("Lỗi khi tải đơn hàng:", error);
    //   toast.error("Lỗi tải dữ liệu từ máy chủ.");
    // }
  };

  useEffect(() => {
    // fetchOrders(currentPage);
  }, [currentPage, statusFilter]);

  const deleteOrder = async () => {
    if (!selectedOrder) return;
    // try {
    //   await axios.delete(
    //     `${Constants.DOMAIN_API}/admin/orders/delete/${selectedOrder.id}`
    //   );
    //   toast.success("Hủy đơn hàng thành công");
    //   setSelectedOrder(null);
    // } catch (error) {
    //   const message = error.response?.data?.message || "";
    //   if (
    //     message === "Chỉ được hủy đơn hàng có trạng thái là 'Chờ xác nhận'"
    //   ) {
    //     toast.warning("Chỉ được hủy những đơn hàng có trạng thái là 'Chờ xác nhận'");
    //   } else if (message === "Id không tồn tại") {
    //     toast.error("Đơn hàng không tồn tại");
    //   } else {
    //     toast.error("Không thể hủy đơn hàng");
    //   }
    // } finally {
    //   setSelectedOrder(null);
    // }
  };

  return (
    <div className="container mx-auto p-2">
      <div className="bg-white p-4 shadow rounded-md">
        <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
          <h2 className="text-xl font-semibold whitespace-nowrap">Danh sách đơn hàng</h2>

          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                dateFormat="yyyy-MM-dd"
                className="border px-3 py-2 rounded w-40"
                placeholderText="Chọn ngày bắt đầu"
              />
            </div>
            <div className="flex items-center gap-2">
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                dateFormat="yyyy-MM-dd"
                className="border px-3 py-2 rounded w-40"
                placeholderText="Chọn ngày kết thúc"
              />
            </div>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              onClick={() => fetchOrders(1)}
            >
              Lọc theo ngày
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[700px] w-full text-sm text-left text-gray-500">
            <thead>
              <tr>
                <th className="text-center py-3">STT</th>
                <th className="text-center py-3">Mã đơn</th>
                <th className="text-center py-3">Tên khách hàng</th>
                <th className="text-center py-3">Ngày tạo</th>
                <th className="text-center py-3">Trạng thái</th>
                <th className="text-center py-3">Tổng tiền</th>
                <th className="text-center py-3">Thanh toán</th>
                <th className="text-center py-3">Xem chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order.id} className="bg-white border-b hover:bg-gray-50">
                    <td className="text-center py-4">{`${order.id}`}</td>
                    <td className="text-center py-4">{`#${order.order_code}`}</td>
                    <td className="text-center py-4">{`${order.user?.name || "N/A"}`}</td>
                    <td className="text-center py-4 px-2 whitespace-nowrap">
                      {new Date(order.created_at).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="text-center py-4 px-2">
                      {translateStatus(order.status)}
                    </td>
                    <td className="text-center py-4 px-2 whitespace-nowrap">
                      {Number(order.total_price).toLocaleString("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      })}
                    </td>
                    <td className="text-center py-4 px-2 whitespace-nowrap">{order.payment_method}</td>
                    <td className="text-center py-4">
                      <Link
                        to={`/admin/orders/detail/${order.id}`}
                        className="w-[116px] h-[46px] bg-yellow-400 text-black font-bold inline-flex items-center justify-center rounded"
                      >
                        Xem chi tiết
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-gray-500">
                    Không có đơn hàng nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex justify-center mt-6">
          <div className="flex items-center space-x-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(1)}
              className="px-2 py-1 border rounded disabled:opacity-50"
            >
              <FaAngleDoubleLeft />
            </button>

            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className="px-2 py-1 border rounded disabled:opacity-50"
            >
              <FaChevronLeft />
            </button>

            {[...Array(totalPages)].map((_, i) => {
              const page = i + 1;
              if (page >= currentPage - 1 && page <= currentPage + 1) {
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 border rounded ${page === currentPage
                      ? "bg-blue-600 text-white"
                      : "bg-white hover:bg-blue-100"
                      }`}
                  >
                    {page}
                  </button>
                );
              }
              return null;
            })}

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="px-2 py-1 border rounded disabled:opacity-50"
            >
              <FaChevronRight />
            </button>

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(totalPages)}
              className="px-2 py-1 border rounded disabled:opacity-50"
            >
              <FaAngleDoubleRight />
            </button>
          </div>
        </div>

        {selectedOrder && (
          <FormDelete
            isOpen={true}
            onClose={() => setSelectedOrder(null)}
            onConfirm={deleteOrder}
            message={`Bạn có chắc chắn muốn hủy đơn hàng "${selectedOrder.order_code}"?`}
          />
        )}
      </div>
    </div>
  );
}