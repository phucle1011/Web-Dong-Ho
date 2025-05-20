import axios from "axios";
import React, { useEffect, useState } from "react";
import { FaChevronLeft, FaChevronRight, FaAngleDoubleLeft, FaAngleDoubleRight } from 'react-icons/fa';
import Constants from "../../../../Constants.jsx";
import { toast } from "react-toastify";
import FormDelete from "../../../../components/formDelete";
import { Link } from "react-router-dom";

function OrderGetAll() {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [trackingInfoMap, setTrackingInfoMap] = useState({});
  const recordsPerPage = 10;
  const [statusFilter, setStatusFilter] = useState("");
  const [statusCounts, setStatusCounts] = useState({
    all: 0,
    pending: 0,
    confirmed: 0,
    shipping: 0,
    completed: 0,
    delivered: 0,
    cancelled: 0,
  });

  const translateStatus = (status) => {
    switch (status) {
      case "pending":
        return "Chờ xác nhận";
      case "confirmed":
        return "Đã xác nhận";
      case "shipping":
        return "Đang giao";
      case "completed":
        return "Hoàn thành";
      case "delivered":
        return "Đã giao hàng thành công";
      case "cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  useEffect(() => {
    fetchOrders(currentPage, statusFilter, searchTerm);
  }, [currentPage, statusFilter, searchTerm]);

  const fetchOrders = async (page, status = "", search = "") => {
    try {
      const params = { page, limit: recordsPerPage };
      if (status) params.status = status;
      if (search) params.searchTerm = search;

      const res = await axios.get(`${Constants.DOMAIN_API}/admin/orders/list`, { params });

      setOrders(res.data.data);
      setTotalPages(res.data.totalPages);

      if (res.data.counts) {
        setStatusCounts({
          all: res.data.counts.all || 0,
          pending: res.data.counts.pending || 0,
          confirmed: res.data.counts.confirmed || 0,
          shipping: res.data.counts.shipping || 0,
          completed: res.data.counts.completed || 0,
          delivered: res.data.counts.delivered || 0,
          cancelled: res.data.counts.cancelled || 0,
        });
      }
    } catch (error) {
      console.error("Lỗi khi lấy đơn hàng:", error);
    }
  };

  const deleteOrder = async () => {
    if (!selectedOrder) return;
    try {
      await axios.delete(`${Constants.DOMAIN_API}/admin/orders/delete/${selectedOrder.id}`);
      toast.success("Hủy đơn hàng thành công");
      setSelectedOrder(null);
      fetchOrders(currentPage);
    } catch (error) {
      console.error("Lỗi khi hủy đơn hàng:", error);
      const message = error.response?.data?.message || "";

      if (message === "Chỉ được hủy đơn hàng có trạng thái là 'Chờ xác nhận'") {
        toast.warning("Chỉ được hủy những đơn hàng có trạng thái là 'Chờ xác nhận'");
      } else if (message === "Id không tồn tại") {
        toast.error("Đơn hàng không tồn tại");
      } else {
        toast.error("Không thể hủy đơn hàng");
      }
    } finally {
      setSelectedOrder(null);
    }
  };

  const getStatusesForOrder = (currentStatus) => {
    switch (currentStatus) {
      case "pending":
        return ["pending", "confirmed", "shipping", "completed", "delivered", "cancelled"];
      case "confirmed":
        return ["confirmed", "shipping", "completed", "delivered", "cancelled"];
      case "shipping":
        return ["shipping", "completed", "delivered", "cancelled"];
      case "completed":
        return ["completed", "delivered", "cancelled"];
      case "delivered":
        return ["delivered", "cancelled"];
      case "cancelled":
        return ["cancelled"];
      default:
        return ["pending", "confirmed", "shipping", "completed", "delivered", "cancelled"];
    }
  };

  const handleChangeStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`${Constants.DOMAIN_API}/admin/orders/edit/${orderId}`, {
        status: newStatus,
      });
      toast.success("Cập nhật trạng thái thành công");
      fetchOrders(currentPage);
    } catch (error) {
      toast.error("Lỗi khi cập nhật trạng thái");
      console.error("Lỗi cập nhật:", error);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterClick = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleSearchSubmit = async () => {
    if (searchTerm.trim() === '') {
      toast.warning("Vui lòng nhập mã đơn hàng hoặc tên người dùng cần tìm.");
      return;
    }
    setCurrentPage(1);
    try {
      const res = await axios.get(`${Constants.DOMAIN_API}/admin/orders/search?searchTerm=${searchTerm}`);
      if (res.data.data.length === 0) {
        toast.warning("Không tìm thấy đơn hàng nào.");
      }
      setOrders(res.data.data);
      toast.success("Tìm kiếm đơn hàng thành công");
    } catch (error) {
      console.error("Lỗi khi tìm kiếm đơn hàng:", error);
      toast.error("Không tìm thấy đơn hàng");
      setOrders([]);
    }
  };

  const handleTrackOrder = async (orderCode) => {
    // Test cứng nha cô
    if (orderCode === "ORD012") {
      setTrackingInfoMap((prev) => ({
        ...prev,
        [orderCode]: {
          orderCode,
          status: "Đã giao",
          location: "Cần Thơ",
          locations: [
            {
              time: new Date().toISOString(),
              location: "Kho Cần Thơ",
              status: "Đã giao hàng thành công",
              note: "Đã rời kho ở Bình Thủy",
            },
            {
              time: new Date(Date.now() - 3600 * 1000).toISOString(),
              location: "Kho Hồ Chí Minh",
              status: "Xuất kho",
              note: "Chuẩn bị vận chuyển",
            },
          ],
        },
      }));
      return;
    }

    try {
      const res = await axios.get(`${Constants.DOMAIN_API}/admin/orders/track/${orderCode}`);
      const data = res.data.data;

      if (!data.locations || data.locations.length === 0) {
        toast.info("Đơn hàng chưa có thông tin theo dõi vận chuyển.");
      }

      setTrackingInfoMap((prev) => ({
        ...prev,
        [orderCode]: {
          orderCode,
          status: data.status,
          location: data.locations && data.locations.length > 0 ? data.locations[0].location : "Không có thông tin vị trí",
          locations: data.locations || [],
        },
      }));
    } catch (error) {
      console.error("Lỗi khi theo dõi đơn hàng:", error);
      toast.error("Không thể theo dõi đơn hàng");
      setTrackingInfoMap((prev) => {
        const newMap = { ...prev };
        delete newMap[orderCode];
        return newMap;
      });
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="container mx-auto p-2">
      <div className="bg-white p-4 shadow rounded-md">
        <h2 className="text-xl font-semibold mb-2">Danh sách đơn hàng</h2>
        <div className="flex flex-wrap items-center gap-6 border-b border-gray-200 px-6 py-4">
          {[
            { key: "", label: "Tất cả", color: "bg-gray-800", textColor: "text-white", count: statusCounts.all },
            { key: "pending", label: "Chờ xác nhận", color: "bg-amber-300", textColor: "text-amber-800", count: statusCounts.pending },
            { key: "confirmed", label: "Đã xác nhận", color: "bg-yellow-300", textColor: "text-yellow-900", count: statusCounts.confirmed },
            { key: "shipping", label: "Đang giao", color: "bg-blue-300", textColor: "text-blue-900", count: statusCounts.shipping },
            { key: "completed", label: "Hoàn thành", color: "bg-emerald-300", textColor: "text-emerald-800", count: statusCounts.completed },
            { key: "delivered", label: "Đã giao", color: "bg-green-300", textColor: "text-green-800", count: statusCounts.delivered },
            { key: "cancelled", label: "Đã hủy", color: "bg-rose-300", textColor: "text-rose-800", count: statusCounts.cancelled },
          ].map(({ key, label, color, textColor, count }) => (
            <button
              key={key}
              onClick={() => handleFilterClick(key)}
              className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-semibold ${statusFilter === key ? "bg-blue-900 text-white" : "bg-white text-gray-700"
                }`}
            >
              <span>{label}</span>
              <span className={`${color} ${textColor} rounded-md px-2 py-0.5 text-xs font-semibold leading-none`}>
                {count}
              </span>
            </button>
          ))}
        </div>

        <div className="mb-4 relative flex">
          <input
            type="text"
            className="shadow border border-gray-300 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:ring-2 focus:ring-blue-500"
            placeholder="Vui lòng nhập mã đơn hàng hoặc tên khách hàng..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <button
            type="button"
            className="bg-blue-900 hover:bg-blue-800 text-white px-4 rounded ml-2"
            onClick={handleSearchSubmit}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 3a7.5 7.5 0 006.15 13.65z" />
            </svg>
          </button>

          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('');
                fetchOrders(currentPage);
              }}
              className="ms-2 p-2 border flex gap-2 bg-blue-900 hover:bg-blue-800 text-white py-1 px-3 rounded"
            >
              Xem tất cả đơn hàng
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 mt-3 text-left text-sm">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="w-12 px-6 py-3 border border-gray-300">#</th>
                <th className="px-6 py-3 border border-gray-300 font-semibold cursor-pointer">Mã đơn</th>
                <th className="px-6 py-3 border border-gray-300 font-semibold">Tên khách hàng</th>
                <th className="px-6 py-3 border border-gray-300 font-semibold">Ngày tạo</th>
                <th className="px-6 py-3 border border-gray-300 font-semibold">Tổng tiền</th>
                <th className="px-6 py-3 border border-gray-300 font-semibold">Trạng thái</th>
                <th className="px-6 py-3 border border-gray-300 font-semibold">Thanh toán</th>
                <th className="px-6 py-3 border border-gray-300 font-semibold">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {orders.length > 0 ? orders.map((order) => (
                <React.Fragment key={order.id}>
                  <tr>
                    <td className="p-2 border border-gray-300">{order.id}</td>
                    <td className="p-2 border border-gray-300">{order.order_code}</td>
                    <td className="p-2 border border-gray-300">{order.user.name}</td>
                    <td className="p-2 border border-gray-300">{new Date(order.created_at).toLocaleString("vi-VN", { hour12: false })}</td>
                    <td className="p-2 border border-gray-300">{Number(order.total_price).toLocaleString("vi-VN", { style: "currency", currency: "VND" })}</td>
                    <td className="p-2 border border-gray-300">
                      <select
                        value={order.status}
                        onChange={(e) => handleChangeStatus(order.id, e.target.value)}
                        className="capitalize border rounded px-2 py-1"
                      >
                        {getStatusesForOrder(order.status).map(status => (
                          <option key={status} value={status}>{translateStatus(status)}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-2 border border-gray-300">{order.payment_method}</td>
                    <td className="p-2 border border-gray-300 flex gap-2">
                      <Link to={`/admin/orders/detail/${order.id}`} className="bg-blue-500 text-white py-1 px-3 rounded">Xem</Link>
                      {["pending"].includes(order.status) && ( 
                        <button onClick={() => setSelectedOrder(order)} className="bg-red-500 text-white py-1 px-3 rounded">Hủy</button>
                      )}
                      <button onClick={() => handleTrackOrder(order.order_code)} className="bg-green-600 hover:bg-green-500 text-white px-2 py-1 rounded">Vị trí</button>
                    </td>
                  </tr>
                  {trackingInfoMap[order.order_code] && (
                    <tr>
                      <td colSpan={9} className="p-4">
                        <div className="bg-yellow-100 p-4 rounded-lg w-full">
                          <h2 className="text-lg font-semibold mb-2">Thông tin theo dõi đơn hàng</h2>
                          <p className="mb-1"><span className="font-semibold">Mã đơn hàng:</span> <span className="text-blue-600 font-medium">{order.order_code}</span></p>
                          <p className="mb-4"><span className="font-semibold">Trạng thái hiện tại:</span> <span className="text-green-600 font-medium">{translateStatus(order.status)}</span></p>

                          <div className="relative ml-4 border-l-4 border-blue-500">
                            {trackingInfoMap[order.order_code].locations.map((value, index) => (
                              <div key={index} className="relative pl-6 mb-6">
                                <div className="absolute -left-2 top-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white z-10"></div>
                                <div className="bg-white rounded-md shadow-sm border border-gray-200 p-3">
                                  <p className="text-sm mb-1"><span className="font-semibold">Thời gian:</span> {new Date(value.time).toLocaleString("vi-VN", { hour12: false })}</p>
                                  <p className="text-sm mb-1"><span className="font-semibold">Vị trí:</span> {value.location}</p>
                                  <p className="text-sm mb-1"><span className="font-semibold">Trạng thái:</span> {value.status}</p>
                                  {value.note && <p className="text-sm"><span className="font-semibold">Ghi chú:</span> {value.note}</p>}
                                </div>
                              </div>
                            ))}
                          </div>
                          <button onClick={() => {
                            const updated = { ...trackingInfoMap };
                            delete updated[order.order_code];
                            setTrackingInfoMap(updated);
                          }} className="mt-2 bg-red-500 text-white py-1 px-3 rounded">Đóng</button>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              )) : (
                <tr>
                  <td colSpan={9} className="text-center py-4 text-gray-500">Không có đơn hàng nào.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedOrder && (
        <FormDelete
          isOpen={true}
          onClose={() => setSelectedOrder(null)}
          onConfirm={deleteOrder}
          message={`Bạn có chắc chắn muốn hủy đơn hàng có mã đơn "${selectedOrder.order_code}" không?`}
        />
      )}

      <div className="flex justify-center mt-4 items-center">
        <div className="flex items-center space-x-1">
          <button disabled={currentPage === 1} onClick={() => handlePageChange(1)} className="px-2 py-1 border rounded disabled:opacity-50"><FaAngleDoubleLeft /></button>
          <button disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)} className="px-2 py-1 border rounded disabled:opacity-50"><FaChevronLeft /></button>

          {currentPage > 2 && (
            <>
              <button onClick={() => handlePageChange(1)} className="px-3 py-1 border rounded">1</button>
              {currentPage > 3 && <span className="px-2">...</span>}
            </>
          )}

          {[...Array(totalPages)].map((_, i) => {
            const page = i + 1;
            if (page >= currentPage - 1 && page <= currentPage + 1) {
              return (
                <button key={page} onClick={() => handlePageChange(page)} className={`px-3 py-1 border rounded ${currentPage === page ? "bg-blue-500 text-white" : "bg-blue-100 text-black hover:bg-blue-200"}`}>
                  {page}
                </button>
              );
            }
            return null;
          })}

          {currentPage < totalPages - 1 && (
            <>
              {currentPage < totalPages - 2 && <span className="px-2">...</span>}
              <button onClick={() => handlePageChange(totalPages)} className="px-3 py-1 border rounded">{totalPages}</button>
            </>
          )}

          <button disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)} className="px-2 py-1 border rounded disabled:opacity-50"><FaChevronRight /></button>
          <button disabled={currentPage === totalPages} onClick={() => handlePageChange(totalPages)} className="px-2 py-1 border rounded disabled:opacity-50"><FaAngleDoubleRight /></button>
        </div>
      </div>
    </div>
  );
}

export default OrderGetAll;