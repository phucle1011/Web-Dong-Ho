import axios from "axios";
import { useEffect, useState } from "react";
import Constants from "../../../../Constants.jsx";
import FormDelete from "../../../../components/formDelete";
import { Link } from "react-router-dom";

function OrderHistoryGetAll() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${Constants.DOMAIN_API}/admin/order-history/list`);
      setOrders(res.data.data);
    } catch (error) {
      console.error("Lỗi khi lấy đơn hàng:", error);
    }
  };

  return (
    <div className="container mx-auto p-2">
      <div className="bg-white p-4 shadow rounded-md">
        <h2 className="text-xl font-semibold mb-4">Danh sách lịch sử đơn hàng</h2>
        <table className="w-full border-collapse border border-gray-300 mt-3">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">#</th>
              <th className="p-2 border">Mã đơn</th>
              <th className="p-2 border">Người dùng</th>
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
                  <td className="p-2 border">
                    <select
                      value={order.status}
                      className="capitalize border rounded px-2 py-1"
                      disabled
                    >
                      <option value={order.status}>{order.status}</option>
                    </select>
                  </td>
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
    </div>
  );
}

export default OrderHistoryGetAll;
