import axios from "axios";
import React from "react";
import { useEffect, useState } from "react";
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

  useEffect(() => {
    fetchOrders(currentPage, searchTerm);
  }, [currentPage, searchTerm]);

  const fetchOrders = async (page, status = '', search = '') => {
    try {
      const params = { page, limit: recordsPerPage };
      if (status) params.status = status;
      if (search) params.searchTerm = search;

      const res = await axios.get(`${Constants.DOMAIN_API}/admin/orders/list`, { params });
      setOrders(res.data.data);
      setTotalPages(res.data.totalPages);
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
      case "Chờ xác nhận":
        return ["Chờ xác nhận", "Đã xác nhận", "Đang giao", "Hoàn thành", "Đã giao hàng thành công", "Đã hủy"];
      case "Đã xác nhận":
        return ["Đã xác nhận", "Đang giao", "Hoàn thành", "Đã giao hàng thành công", "Đã hủy"];
      case "Đang giao":
        return ["Đang giao", "Hoàn thành", "Đã giao hàng thành công", "Đã hủy"];
      case "Hoàn thành":
        return ["Hoàn thành", "Đã giao hàng thành công", "Đã hủy"];
      case "Đã giao hàng thành công":
        return ["Đã giao hàng thành công", "Đã hủy"];
      case "Đã hủy":
        return ["Đã hủy"];
      default:
        return ["Chờ xác nhận", "Đã xác nhận", "Đang giao", "Hoàn thành", "Đã giao hàng thành công", "Đã hủy"];
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
              status: "Đang giao",
              note: "Đã rời kho",
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
        <h2 className="text-xl font-semibold mb-4">Danh sách đơn hàng</h2>
        <div className="mb-4 relative flex">
          <input
            type="text"
            className="shadow border border-gray-300 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
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

        <table className="w-full border-collapse border border-gray-300 mt-3">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">#</th>
              <th className="p-2 border">Mã đơn</th>
              <th className="p-2 border">Tên khách hàng</th>
              <th className="p-2 border">Tổng tiền</th>
              <th className="p-2 border">Trạng thái</th>
              <th className="p-2 border">Thanh toán</th>
              <th className="p-2 border">Ngày tạo</th>
              <th className="p-2 border">Theo dõi đơn hàng</th>
              <th className="p-2 border">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? (
              orders.map((order, index) => (
                <React.Fragment key={index}>
                  <tr className="border-b">
                    <td className="p-2 border">{order.id}</td>
                    <td className="p-2 border">{order.order_code}</td>
                    <td className="p-2 border">{order.user.name}</td>
                    <td className="p-2 border">
                      {Number(order.total_price).toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
                    </td>
                    <td className="p-2 border">
                      <select
                        value={order.status}
                        onChange={(e) => handleChangeStatus(order.id, e.target.value)}
                        className="capitalize border rounded px-2 py-1"
                      >
                        {getStatusesForOrder(order.status).map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-2 border">{order.payment_method}</td>
                    <td className="p-2 border">
                      {new Date(order.created_at).toLocaleString("vi-VN", { hour12: false })}
                    </td>
                    <td className="p-2 border text-center">
                      <button
                        onClick={() => handleTrackOrder(order.order_code)}
                        className="bg-green-600 hover:bg-green-500 text-white px-2 py-1 rounded"
                      >
                        Xem vị trí đơn hàng
                      </button>
                    </td>
                    <td className="p-2 border flex gap-2">
                      <Link to={`/admin/orders/detail/${order.id}`} className="bg-blue-500 text-white py-1 px-3 rounded">
                        Xem
                      </Link>
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="bg-red-500 text-white py-1 px-3 rounded"
                      >
                        Hủy
                      </button>
                    </td>
                  </tr>
                  {trackingInfoMap[order.order_code] && (
                    <tr>
                      <td colSpan={10} className="p-4">
                        <div className="bg-yellow-100 p-4 rounded-lg w-full">
                          <h2 className="text-lg font-semibold mb-2">Thông tin theo dõi đơn hàng</h2>
                          <p className="mb-1">
                            <span className="font-semibold">Mã đơn hàng:</span>{" "}
                            <span className="text-blue-600 font-medium">{order.order_code}</span>
                          </p>
                          <p className="mb-4">
                            <span className="font-semibold">Trạng thái hiện tại:</span>{" "}
                            <span className="text-green-600 font-medium">{order.status}</span>
                          </p>

                          <div className="relative ml-4 border-l-4 border-blue-500">
                            {trackingInfoMap[order.order_code].locations.map((value, index) => (
                              <div key={index} className="relative pl-6 mb-6">
                                <div className="absolute -left-2 top-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white z-10"></div>

                                <div className="bg-white rounded-md shadow-sm border border-gray-200 p-3">
                                  <p className="text-sm mb-1"><span className="font-semibold">Thời gian:</span> {new Date(value.time).toLocaleString("vi-VN", { hour12: false })}</p>
                                  <p className="text-sm mb-1"><span className="font-semibold">Vị trí:</span> {value.location}</p>
                                  <p className="text-sm mb-1"><span className="font-semibold">Trạng thái:</span> {value.status}</p>
                                  {value.note && (
                                    <p className="text-sm"><span className="font-semibold">Ghi chú:</span> {value.note}</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                          <button
                            onClick={() => {
                              const updated = { ...trackingInfoMap };
                              delete updated[order.order_code];
                              setTrackingInfoMap(updated);
                            }}
                            className="mt-2 bg-red-500 text-white py-1 px-3 rounded"
                          >
                            Đóng
                          </button>
                        </div>
                      </td>
                    </tr>

                  )}
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="text-center py-4 text-gray-500">
                  Không có đơn hàng nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
          <button
            disabled={currentPage === 1}
            onClick={() => handlePageChange(1)}
            className="px-2 py-1 border rounded disabled:opacity-50"
          >
            <FaAngleDoubleLeft />
          </button>

          <button
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
            className="px-2 py-1 border rounded disabled:opacity-50"
          >
            <FaChevronLeft />
          </button>

          {currentPage > 2 && (
            <>
              <button
                onClick={() => handlePageChange(1)}
                className="px-3 py-1 border rounded"
              >
                1
              </button>
              {currentPage > 3 && <span className="px-2">...</span>}
            </>
          )}

          {[...Array(totalPages)].map((_, i) => {
            const page = i + 1;
            if (page >= currentPage - 1 && page <= currentPage + 1) {
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 border rounded ${currentPage === page
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
              {currentPage < totalPages - 2 && <span className="px-2">...</span>}
              <button
                onClick={() => handlePageChange(totalPages)}
                className="px-3 py-1 border rounded"
              >
                {totalPages}
              </button>
            </>
          )}

          <button
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            className="px-2 py-1 border rounded disabled:opacity-50"
          >
            <FaChevronRight />
          </button>

          <button
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(totalPages)}
            className="px-2 py-1 border rounded disabled:opacity-50"
          >
            <FaAngleDoubleRight />
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderGetAll;