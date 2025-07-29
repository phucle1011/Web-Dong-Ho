import { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

const PromotionOrderListModal = ({ orders = [], onClose }) => {
    const [expandedOrderId, setExpandedOrderId] = useState(null);

    const toggleExpand = (id) => {
        setExpandedOrderId(prev => (prev === id ? null : id));
    };

    const formatCurrency = (amount) =>
        Number(amount).toLocaleString("vi-VN", { style: "currency", currency: "VND" });

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
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded shadow p-6">
                <h2 className="text-2xl font-semibold mb-4">Danh sách đơn hàng áp dụng</h2>

                {orders.length === 0 ? (
                    <p className="text-gray-500">Không có đơn hàng áp dụng mã khuyến mãi này.</p>
                ) : (
                    <div className="space-y-4">
                        {orders.map(order => (
                            <div key={order.id} className="border rounded p-3 shadow">
                                <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleExpand(order.id)}>
                                    <div>
                                        <div><strong>Mã đơn:</strong> {order.order_code}</div>
                                        <div><strong>Khách:</strong> {order.user?.name} ({order.user?.email})</div>
                                        <div><strong>Trạng thái:</strong> {translateStatus(order.status)}</div>
                                        <div><strong>Tổng tiền:</strong> {formatCurrency(order.total_price)}</div>
                                    </div>
                                    <div>
                                        {expandedOrderId === order.id ? <FaChevronUp /> : <FaChevronDown />}
                                    </div>
                                </div>

                                {expandedOrderId === order.id && (
                                    <div className="mt-4 border-t pt-3 text-sm text-gray-700 space-y-2">
                                        <div><strong>Phương thức thanh toán:</strong> {order.payment_method}</div>
                                        <div><strong>Địa chỉ giao hàng:</strong> {order.shipping_address}</div>
                                        <div><strong>Ngày đặt:</strong> {new Date(order.created_at).toLocaleDateString("vi-VN")}</div>
                                        <div><strong>Ghi chú:</strong> {order.note || "—"}</div>

                                        {order.orderDetails?.length > 0 && (
                                            <div>
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
                                                        {order.orderDetails.map((item, idx) => (
                                                            <tr key={idx}>
                                                                <td className="border p-1">
                                                                    {item.variant?.product?.name || "SP"} ({item.variant?.sku})
                                                                </td>
                                                                <td className="border p-1 text-center">{item.quantity}</td>
                                                                <td className="border p-1 text-right">{formatCurrency(item.price)}</td>
                                                                <td className="border p-1 text-right">{formatCurrency(item.quantity * item.price)}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-6 text-right">
                    <button
                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
                        onClick={onClose}
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PromotionOrderListModal;
