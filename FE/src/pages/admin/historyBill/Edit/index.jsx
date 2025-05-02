import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from "axios";
import Constants from "../../../../Constants";

function HistoryBillEdit() {
  const [queryParams] = useSearchParams();
  const navigate = useNavigate();
  const [tripInfo, setTripInfo] = useState({});
  const [seats, setSeats] = useState([]);
  const { register, handleSubmit, setValue } = useForm();

  useEffect(() => {
    if (queryParams.get("id")) {
      fetchBillData();
    }
  }, []);

  const fetchBillData = async () => {
    try {
      const res = await axios.get(
        `${Constants.DOMAIN_API}/admin/booking/getById/${queryParams.get("id")}`
      );
      const data = res.data.data;

      // Đặt giá trị form
      setValue("status", data.status);
      setValue("userName", data.userName);
      setValue("price", data.finalPrice);
      setValue("bookingTime", data.createdAt.slice(0, 16));

      // Lưu thông tin chuyến đi và danh sách ghế
      setTripInfo(data.Trip || {});
      setSeats([data.Seat?.seatNumber || data.seatId]); // fallback nếu seatNumber không có

    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu hóa đơn:", error);
    }
  };

  const getProvince = (location) => location?.split(",")[0]?.trim() || "?";

  const onSubmit = async (formData) => {
    try {
      await axios.patch(
        `${Constants.DOMAIN_API}/admin/booking/update/${queryParams.get("id")}`,
        { status: formData.status }
      );
      navigate("/admin/historyBill/getAll");
    } catch (error) {
      console.error("Lỗi khi cập nhật hóa đơn:", error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto">
        <h3 className="text-2xl font-bold mb-4">Chỉnh sửa trạng thái hóa đơn</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Tên khách */}
          <div>
            <label className="block font-medium">Tên khách</label>
            <input
              className="w-full p-2 border rounded bg-gray-100"
              {...register("userName")}
              readOnly
            />
          </div>

          {/* Chuyến đi */}
          <div>
            <label className="block font-medium">Chuyến đi</label>
            <input
              value={
                tripInfo.Route
                  ? `${getProvince(tripInfo.Route?.startPoint)} → ${getProvince(tripInfo.Route?.endPoint)}`
                  : ""
              }
              className="w-full p-2 border rounded bg-gray-100"
              readOnly
            />
          </div>

          {/* Chỗ ngồi */}
          <div>
            <label className="block font-medium">Chỗ ngồi</label>
            <input
              value={seats.join(", ")}
              className="w-full p-2 border rounded bg-gray-100"
              readOnly
            />
          </div>

          {/* Thời gian đặt */}
          <div>
            <label className="block font-medium">Thời gian đặt</label>
            <input
              type="datetime-local"
              {...register("bookingTime")}
              className="w-full p-2 border rounded bg-gray-100"
              readOnly
            />
          </div>

          {/* Giá */}
          <div>
            <label className="block font-medium">Giá</label>
            <input
              type="number"
              {...register("price")}
              className="w-full p-2 border rounded bg-gray-100"
              readOnly
            />
          </div>

          {/* Trạng thái */}
          <div>
            <label className="block font-medium">Trạng thái</label>
            <select
              {...register("status")}
              className="w-full p-2 border rounded"
            >
              <option value="pending">Chờ xử lý</option>
              <option value="confirmed">Đã xác nhận</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>

          {/* Nút cập nhật */}
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Cập nhật trạng thái
          </button>
        </form>
      </div>
    </div>
  );
}

export default HistoryBillEdit;
