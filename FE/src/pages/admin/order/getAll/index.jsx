import axios from "axios";
import { useEffect, useState } from "react";
import Constants from "../../../../Constants.jsx";
import { toast } from "react-toastify";
import FormDelete from "../../../../components/formDelete";
import { Link } from "react-router-dom";

function OrderGetAll() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${Constants.DOMAIN_API}/admin/orders/list`);
      setOrders(res.data.data);
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
      fetchOrders();
    } catch (error) {
      toast.error("Lỗi khi cập nhật trạng thái");
      console.error("Lỗi cập nhật:", error);
    }
  };

  return (
    <div className="container mx-auto p-2">
      <div className="bg-white p-4 shadow rounded-md">
        <h2 className="text-xl font-semibold mb-4">Danh sách đơn hàng</h2>
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
            {orders.map((order, index) => (
              <tr key={index} className="border-b">
                <td className="p-2 border">{order.id}</td>
                <td className="p-2 border">{order.order_code}</td>
                <td className="p-2 border">{order.user.name}</td>
                <td className="p-2 border">{Number(order.total_price).toLocaleString("vi-VN", { style: "currency", currency: "VND" })}</td>
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
                <td className="p-2 border">{new Date(order.created_at).toLocaleString("vi-VN", { hour12: false })}</td>
                <td className="p-2 border flex gap-2">
                  <Link
                    to={`/admin/orders/detail/${order.id}`}
                    className="bg-blue-500 text-white py-1 px-3 rounded"
                  >
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
            ))}
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
    </div>
  );
}

export default OrderGetAll;
