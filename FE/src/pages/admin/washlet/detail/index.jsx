import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Constants from "../../../../Constants";
import { toast } from "react-toastify";
import axios from "axios";

function WalletDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [request, setRequest] = useState(null);

    useEffect(() => {
        fetchRefundDetail();
    }, []);

    const fetchRefundDetail = async () => {
        try {
            const res = await axios.get(`${Constants.DOMAIN_API}/admin/wallets/withdraw/${id}`);
            if (res.data.data) {
                setRequest(res.data.data);
            } else {
                toast.error("Không tìm thấy yêu cầu.");
                navigate("/admin/wallets");
            }
        } catch (error) {
            console.error("Lỗi khi lấy chi tiết yêu cầu hoàn tiền:", error);
            toast.error("Không thể lấy dữ liệu từ máy chủ");
            navigate("/admin/wallets");
        }
    };

    const translateWithdrawStatus = (status) => {
        switch (status) {
            case "pending": return "Đang chờ duyệt";
            case "approved": return "Đã duyệt";
            case "rejected": return "Đã từ chối";
            default: return "Không xác định";
        }
    };

    const translateWithdrawType = (type) => {
        switch (type) {
            case "withdraw": return "rút tiền";
            case "refund": return "hoàn tiền";
            default: return "Không xác định";
        }
    };

    const translateStatus = (status) => {
        switch (status) {
            case "pending": return "Chờ xác nhận";
            case "confirmed": return "Đã xác nhận";
            case "shipping": return "Đang giao";
            case "completed": return "Hoàn thành";
            case "delivered": return "Đã giao hàng thành công";
            case "cancelled": return "Đã hủy";
            default: return status;
        }
    };

    const formatCurrency = (amount) =>
        Number(amount).toLocaleString("vi-VN", {
            style: "currency",
            currency: "VND",
        });

    if (!request) return null;
    const order = request.order;

    return (
        <div className="container mx-auto p-4">
            <div className="bg-white shadow-md rounded-md p-4 mb-6">
                <h4 className="text-xl font-semibold mb-4">Thông tin yêu cầu {translateWithdrawType(request.type)}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                    <div><span className="font-medium">Khách hàng:</span> {request.user?.name}</div>
                    <div><span className="font-medium">Email:</span> {request.user?.email}</div>
                    <div><span className="font-medium">Hình thức:</span> {translateWithdrawType(request.type)}</div>
                    <div><span className="font-medium">Số tiền:</span> {formatCurrency(request.amount)}</div>
                    <div><span className="font-medium">Trạng thái:</span> {translateWithdrawStatus(request.status)}</div>
                    <div><span className="font-medium">Ngân hàng:</span> {request.bank_account}</div>
                    <div className="md:col-span-2"><span className="font-medium">Ghi chú:</span> {request.note || 'Không có'}</div>
                    <div><span className="font-medium">Ngày tạo:</span> {new Date(request.created_at).toLocaleDateString("vi-VN")}</div>
                </div>
            </div>

            {request.type === 'refund' && order && (
                <div className="bg-white shadow-md rounded-md p-4">
                    <h1 className="text-xl font-semibold mb-4">Thông tin đơn hàng</h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                        <div><span className="font-medium">Mã đơn:</span> {order.order_code || '—'}</div>
                        <div><span className="font-medium">Họ tên:</span> {order.user?.name || '—'}</div>
                        <div><span className="font-medium">Số điện thoại:</span> {order.user?.phone || '—'}</div>
                        <div><span className="font-medium">Email:</span> {order.user?.email || '—'}</div>
                        <div><span className="font-medium">Địa chỉ:</span> {order.shipping_address || '—'}</div>
                        <div><span className="font-medium">Phương thức thanh toán:</span> {order.payment_method || '—'}</div>
                        <div className="md:col-span-2">
                            <span className="font-medium">Ngày đặt hàng:</span>{" "}
                            {order.created_at ? new Date(order.created_at).toLocaleDateString("vi-VN") : '—'}
                        </div>
                    </div>

                    <div className="mt-4 overflow-x-auto">
                        <table className="w-full border-collapse border text-center">
                            <thead className="bg-gray-200">
                                <tr>
                                    <th className="border p-2">Trạng thái</th>
                                    <th className="border p-2">Tên sản phẩm</th>
                                    <th className="border p-2">Số lượng</th>
                                    <th className="border p-2">Đơn giá</th>
                                    <th className="border p-2">Thành tiền</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.orderDetails?.map((item, index) => (
                                    <tr key={index} className="border-b">
                                        <td className="p-2">{translateStatus(order.status)}</td>
                                        <td className="p-2">{item.variant?.product?.name} ({item.variant?.sku})</td>
                                        <td className="p-2">{item.quantity}</td>
                                        <td className="p-2 text-right">{formatCurrency(item.price)}</td>
                                        <td className="p-2 text-right">{formatCurrency(item.quantity * item.price)}</td>
                                    </tr>
                                ))}

                                {Number(order.shipping_fee) > 0 && (
                                    <tr>
                                        <td colSpan={4} className="text-right font-medium p-2">Phí vận chuyển:</td>
                                        <td className="text-right text-blue-600 font-medium">{formatCurrency(order.shipping_fee)}</td>
                                    </tr>
                                )}
                                {Number(order.discount_amount) > 0 && (
                                    <tr>
                                        <td colSpan={4} className="text-right font-medium p-2">Giảm giá:</td>
                                        <td className="text-right text-red-600 font-medium">-{formatCurrency(order.discount_amount)}</td>
                                    </tr>
                                )}
                                {Number(order.special_discount_amount) > 0 && (
                                    <tr>
                                        <td colSpan={4} className="text-right font-medium p-2">Giảm giá đặc biệt:</td>
                                        <td className="text-right text-red-600 font-medium">-{formatCurrency(order.special_discount_amount)}</td>
                                    </tr>
                                )}
                                <tr className="bg-gray-100 font-semibold">
                                    <td colSpan={4} className="text-right p-2">Tổng tiền:</td>
                                    <td className="text-right p-2 text-blue-700">{formatCurrency(order.total_price)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                </div>
            )}
            <div className="mt-4 flex gap-4">
                <button
                    onClick={() => navigate("/admin/washlets/getAll")}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                    Quay lại
                </button>
            </div>
        </div>
    );
}

export default WalletDetail;
