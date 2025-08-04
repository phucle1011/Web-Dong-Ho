import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Constants from "../../../../Constants";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

export default function PromotionAppliedDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  useEffect(() => {
    axios.get(`${Constants.DOMAIN_API}/admin/promotions/applied/${id}`)
      .then(res => {
        if (res.data.success) setOrders(res.data.orders || []);
      })
      .catch(() => alert("Không thể tải đơn hàng."));
  }, [id]);

  const toggleExpand = (id) => {
    setExpandedOrderId(prev => (prev === id ? null : id));
  };

  const formatCurrency = (amount) => Number(amount).toLocaleString("vi-VN", {
    style: "currency", currency: "VND"
  });

  const translateStatus = (status) => {
    switch (status) {
      case "pending": return "Chờ xác nhận";
      case "confirmed": return "Đã xác nhận";
      case "shipping": return "Đang giao";
      case "completed": return "Hoàn thành";
      case "delivered": return "Đã giao";
      case "cancelled": return "Đã hủy";
      default: return status;
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Chi tiết đơn hàng đã áp dụng khuyến mãi</h2>
        <button onClick={() => navigate(-1)} className="bg-gray-700 text-white px-4 py-1 rounded">← Quay lại</button>
      </div>

      {orders.length === 0 ? (
        <p className="text-gray-600">Không có đơn hàng nào áp dụng.</p>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="border rounded p-4 shadow">
              <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleExpand(order.id)}>
                <div>
                  <p><strong>Mã đơn:</strong> {order.order_code}</p>
                  <p><strong>Khách:</strong> {order.user?.name} ({order.user?.email})</p>
                  <p><strong>Trạng thái:</strong> {translateStatus(order.status)}</p>
                  <p><strong>Tổng tiền:</strong> {formatCurrency(order.total_price)}</p>
                </div>
                {expandedOrderId === order.id ? <FaChevronUp /> : <FaChevronDown />}
              </div>

              {expandedOrderId === order.id && (
                <div className="mt-3 text-sm text-gray-700 space-y-2">
                  <p><strong>Ngày đặt:</strong> {new Date(order.created_at).toLocaleDateString("vi-VN")}</p>
                  <p><strong>Phương thức thanh toán:</strong> {order.payment_method}</p>
                  <p><strong>Địa chỉ:</strong> {order.shipping_address}</p>
                  <p><strong>Ghi chú:</strong> {order.note || "—"}</p>

                  <h4 className="font-semibold mt-2">Sản phẩm:</h4>
                  <table className="w-full border mt-1 text-xs text-left">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border p-1">Tên sản phẩm</th>
                        <th className="border p-1 text-center">Số lượng</th>
                        <th className="border p-1 text-right">Đơn giá</th>
                        <th className="border p-1 text-right">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.orderDetails?.map((item, idx) => (
                        <tr key={idx}>
                          <td className="border p-1">{item.variant?.product?.name || "SP"} ({item.variant?.sku})</td>
                          <td className="border p-1 text-center">{item.quantity}</td>
                          <td className="border p-1 text-right">{formatCurrency(item.price)}</td>
                          <td className="border p-1 text-right">{formatCurrency(item.price * item.quantity)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
