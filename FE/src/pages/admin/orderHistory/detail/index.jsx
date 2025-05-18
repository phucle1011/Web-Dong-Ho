import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Constants from "../../../../Constants";
import { toast } from "react-toastify";
import axios from "axios";

function OrderHistoryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState({});
  const [orderDetails, setOrderDetails] = useState([]);
  const [user, setUser] = useState([]);

  useEffect(() => {
    fetchOrderDetail();
  }, []);

  const fetchOrderDetail = async () => {
    try {
      const res = await axios.get(`${Constants.DOMAIN_API}/admin/orders/${id}`);
      if (res.data.data) { 
        setOrder(res.data.data); 
        setOrderDetails(res.data.data.orderDetails);
        setUser(res.data.data.user);  
      } else {
        setOrderDetails([]);
      }
    } catch (error) {
      console.error("Lỗi khi lấy chi tiết đơn hàng:", error);
      toast.error("Không thể lấy chi tiết đơn hàng");
      navigate("/admin/orders");
    }
  };
  
  const totalAmount = Array.isArray(orderDetails) ? orderDetails.reduce(
    (sum, item) => sum + item.quantity * item.price, 
    0
  ) : 0;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Chi tiết đơn hàng</h2>

      <div className="bg-white shadow-md rounded-md p-4 mb-6">
        <h3 className="font-semibold mb-3">Thông tin khách hàng</h3>
        <div className="grid grid-cols-2 gap-4">
          <div><strong>Mã đơn:</strong> {order.order_code}</div>
          <div><strong>Họ tên:</strong> {user.name}</div>
          <div><strong>SĐT:</strong> {user.phone}</div>
          <div><strong>Email:</strong> {user.email}</div>
          <div><strong>Địa chỉ:</strong> {order.shipping_address}</div>
          <div><strong>Phương thức thanh toán:</strong> {order.payment_method}</div>
          <div><strong>Ngày đặt hàng:</strong> {new Date(order.created_at).toLocaleDateString()}</div> 
        </div>
      </div>

      <div className="bg-white shadow-md rounded-md p-4">
        <h3 className="font-semibold mb-3">Sản phẩm</h3>
        <table className="w-full border-collapse border text-center">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Trạng thái</th>
              <th className="border p-2">Tên sản phẩm</th>
              <th className="border p-2">Số lượng</th>
              <th className="border p-2">Đơn giá</th>
              <th className="border p-2">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {orderDetails.map((item, index) => (
              <tr key={index}>
                <td className="border p-2">{order.status}</td>
                <td className="border p-2">{item.product.name}</td>
                <td className="border p-2">{item.quantity}</td>
                <td className="border p-2">{Number(item.price).toLocaleString("vi-VN", { style: "currency", currency: "VND" })}</td>
                <td className="border p-2">{Number(item.quantity * item.price).toLocaleString("vi-VN", { style: "currency", currency: "VND" })}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th colSpan={4} className="text-end p-2 border">Tổng cộng:</th>
              <th className="p-2 border">{totalAmount.toLocaleString("vi-VN")} đ</th>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="mt-4">
        <button
          onClick={() => navigate("/admin/orders/getAll")}
          className="bg-gray-500 text-white px-4 py-2 rounded"
        >
          Quay lại
        </button>
      </div>
    </div>
  );
}

export default OrderHistoryDetail;
