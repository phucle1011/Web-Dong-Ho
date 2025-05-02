import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import FormDelete from "../../../../components/formDelete";
import axios from "axios";
import Constants from "../../../../Constants";

const HistoryBillGetAll = () => {
  const [bills, setBills] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedBillDetail, setSelectedBillDetail] = useState(null);

  useEffect(() => {
    getAllBills();
  }, []);

  const getAllBills = async () => {
    try {
      const res = await axios.get(`${Constants.DOMAIN_API}/admin/booking/list`);
      const grouped = groupBills(res.data.data);
      setBills(grouped);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách hóa đơn:", error);
    }
  };

  const groupBills = (bills) => {
    const groupedMap = new Map();
  
    bills.forEach((bill) => {
      const key = `${bill.createdAt}-${bill.tripId}-${bill.userName}`;
      const seatNumber = bill.Seat?.seatNumber || bill.seatId;
      const price = bill.finalPrice || 0;
  
      if (groupedMap.has(key)) {
        const existing = groupedMap.get(key);
        existing.seats.push(seatNumber);
        existing.finalPrice += price; 
      } else {
        groupedMap.set(key, {
          ...bill,
          seats: [seatNumber],
          finalPrice: price,
        });
      }
    });
  
    return Array.from(groupedMap.values());
  };
  

  const deleteBill = async () => {
    if (!selectedBill) return;
    try {
      await axios.delete(`${Constants.DOMAIN_API}/admin/booking/${selectedBill.id}`);
      setSelectedBill(null);
      getAllBills();
    } catch (error) {
      console.error("Lỗi khi xóa hóa đơn:", error);
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "confirmed":
        return "Đã xác nhận";
      case "pending":
        return "Chờ xử lý";
      case "cancelled":
        return "Đã hủy";
      default:
        return "Không xác định";
    }
  };

  const getProvince = (location) => location?.split(",")[0] || "?";

  const renderBill = (bill, index) => (
    <tr key={bill.id} className="border-b">
      <td className="p-2 border">{index + 1}</td>
      <td className="p-2 border">{bill.userName}</td>
      <td className="p-2 border">
        {getProvince(bill.Trip?.Route?.startPoint)} → {getProvince(bill.Trip?.Route?.endPoint)}
      </td>
      <td className="p-2 border">{bill.seats.join(", ")}</td>
      <td className="p-2 border">{new Date(bill.createdAt).toLocaleString("vi-VN")}</td>
      <td className="p-2 border">
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            bill.status === "confirmed"
              ? "bg-green-100 text-green-800"
              : bill.status === "pending"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {getStatusText(bill.status)}
        </span>
      </td>
      <td className="p-2 border">{bill.finalPrice?.toLocaleString("vi-VN")} ₫</td>
      <td className="p-2 border flex gap-2 justify-center">
        <Link
          to={`/admin/historyBill/edit?id=${bill.id}`}
          className="bg-yellow-500 text-white py-2 px-3 rounded"
          title="Chỉnh sửa"
        >
          <i className="fa-solid fa-pen-to-square text-md"></i>
        </Link>
        <button
          onClick={() => {
            setSelectedBillDetail(bill);
            setShowDetail(true);
          }}
          className="bg-blue-500 text-white py-2 px-3 rounded"
          title="Xem chi tiết"
        >
          <i className="fa-solid fa-eye text-md"></i>
        </button>
        <button
          onClick={() => setSelectedBill(bill)}
          className="bg-red-500 text-white py-2 px-3 rounded"
          title="Xóa hóa đơn"
        >
          <i className="fa-solid fa-trash text-md"></i>
        </button>
      </td>
    </tr>
  );

  return (
    <div className="container mx-auto p-2">
      <div className="bg-white p-4 shadow rounded-md">
        <h2 className="text-xl font-bold mb-3">Quản lý Hóa Đơn</h2>
        <table className="w-full border-collapse border border-gray-300 mt-3">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">#</th>
              <th className="p-2 border">Tên khách</th>
              <th className="p-2 border">Chuyến đi</th>
              <th className="p-2 border">Chỗ ngồi</th>
              <th className="p-2 border">Thời gian đặt</th>
              <th className="p-2 border">Trạng thái</th>
              <th className="p-2 border">Giá</th>
              <th className="p-2 border">Hành động</th>
            </tr>
          </thead>
          <tbody>{bills.map(renderBill)}</tbody>
        </table>
      </div>

      {/* Modal xem chi tiết */}
      {showDetail && selectedBillDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
            <h3 className="text-lg font-bold mb-3">Chi tiết hóa đơn</h3>
            <p>
              <strong>Tuyến xe:</strong>{" "}
              {getProvince(selectedBillDetail.Trip?.Route?.startPoint)} →{" "}
              {getProvince(selectedBillDetail.Trip?.Route?.endPoint)}
            </p>
            <p>
              <strong>Thời gian xuất bến:</strong>{" "}
              {new Date(selectedBillDetail.Trip?.departureTime).toLocaleString("vi-VN")}
            </p>
            <p>
              <strong>Số lượng ghế:</strong>{" "}
              {selectedBillDetail.seats?.length || 1} ghế
            </p>
            <p>
              <strong>Số ghế:</strong> {selectedBillDetail.seats?.join(", ")}
            </p>
            <p>
              <strong>Điểm trả khách:</strong> {selectedBillDetail.Trip?.Route?.endPoint || "Chưa rõ"}
            </p>
            <p>
              <strong>Tổng tiền lượt đi:</strong>{" "}
              <span className="text-orange-600 font-semibold">
                {selectedBillDetail.finalPrice?.toLocaleString("vi-VN")}₫
              </span>
            </p>
            <div className="text-right mt-4">
              <button
                onClick={() => {
                  setShowDetail(false);
                  setSelectedBillDetail(null);
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal xóa */}
      <FormDelete
        isOpen={!!selectedBill && !showDetail}
        onClose={() => setSelectedBill(null)}
        onConfirm={deleteBill}
        Id={selectedBill?.id}
        action={`${Constants.DOMAIN_API}/admin/booking/${selectedBill?.id}`}
        message={`Bạn có chắc chắn muốn xóa hóa đơn của "${
          selectedBill?.User?.fullName || selectedBill?.userName
        }" không?`}
      />
    </div>
  );
};

export default HistoryBillGetAll;
