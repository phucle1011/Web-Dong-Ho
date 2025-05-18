import axios from "axios";
import { useEffect, useState } from "react";
import { FaChevronLeft, FaChevronRight, FaAngleDoubleLeft, FaAngleDoubleRight } from 'react-icons/fa';
import Constants from "../../../../Constants.jsx";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

function OrderHistoryGetAll() {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const recordsPerPage = 10;

  useEffect(() => {
    fetchOrders(currentPage);
  }, [currentPage]);

  const fetchOrders = async (page) => {
    try {
      const res = await axios.get(`${Constants.DOMAIN_API}/admin/order-history/list`, {
        params: { page, limit: recordsPerPage },
      });
      setOrders(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.error("Lỗi khi lấy đơn hàng:", error);
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const deleteOrder = async () => {
    if (!selectedOrder) return;
    try {
      await axios.delete(`${Constants.DOMAIN_API}/admin/orders/delete/${selectedOrder.id}`);
      toast.success("Hủy đơn hàng thành công");
      setSelectedOrder(null);
      fetchOrders();
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

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
  };

  const handleSearchSubmit = async () => {
    if (searchTerm.trim() === '') {
      toast.warning("Vui lòng nhập mã đơn hàng hoặc tên người dùng cần tìm.");
      return;
    }

    try {
      const res = await axios.get(`${Constants.DOMAIN_API}/admin/order-history/search?searchTerm=${searchTerm}`);
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

  return (
    <div className="container mx-auto p-2">
      <div className="bg-white p-4 shadow rounded-md">
        <h2 className="text-xl font-semibold mb-4">Danh sách lịch sử đơn hàng</h2>
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
              <th className="p-2 border">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center p-4 text-gray-500">
                  Chưa có đơn hàng nào.
                </td>
              </tr>
            ) : (
              orders.map((order, index) => (
                <tr key={index} className="border-b">
                  <td className="p-2 border">{order.id}</td>
                  <td className="p-2 border">{order.order_code}</td>
                  <td className="p-2 border">{order.user.name}</td>
                  <td className="p-2 border">{Number(order.total_price).toLocaleString("vi-VN", { style: "currency", currency: "VND" })}</td>
                  <td className="p-2 border">{order.status}</td>
                  <td className="p-2 border">{order.payment_method}</td>
                  <td className="p-2 border">{new Date(order.created_at).toLocaleString("vi-VN", { hour12: false })}</td>
                  <td className="p-2 border flex gap-2">
                    <Link
                      to={`/admin/orders/detail/${order.id}`}
                      className="bg-blue-500 text-white py-1 px-3 rounded"
                    >
                      Xem
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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

export default OrderHistoryGetAll;
