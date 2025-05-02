import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useNavigate } from "react-router";
import Constants from "../../../../Constants.jsx";
import { toast } from "react-toastify";

function BusRoutesCreate() {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const navigate = useNavigate();
  const [routes, setRoutes] = useState([]);
  const [buses, setBuses] = useState([]);
  const [drivers, setDrivers] = useState([]);


  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [routesRes, busesRes, driversRes] = await Promise.all([
        axios.get(`${Constants.DOMAIN_API}/admin/routes/list`),
        axios.get(`${Constants.DOMAIN_API}/admin/bus/getAllBusByStatusCreate`),
        axios.get(`${Constants.DOMAIN_API}/admin/driver/getByStatusCreate`)
      ]);

      setRoutes(routesRes.data.data);
      setBuses(busesRes.data.data);
      setDrivers(driversRes.data.data);
    } catch (err) {
      console.error("Lỗi khi lấy dữ liệu:", err);
      toast.error("Không thể tải dữ liệu ban đầu");
    }
  };

  const onSubmit = async (data) => {
    try {
      const newTrip = {
        routeId: parseInt(data.routeId),
        busID: parseInt(data.busID),
        driverId: parseInt(data.driverId),
        departureTime: data.startTime,
        arrivalTime: data.endTime,
        price: parseInt(data.ticketPrice)
      };

      const res = await axios.post(`${Constants.DOMAIN_API}/admin/trips/add`, newTrip);
      toast.success("Thêm chuyến xe thành công!");
      navigate("/admin/busRoutes/getAll");
    } catch (error) {
      console.error("Lỗi khi tạo chuyến:", error);
      toast.error("Tạo chuyến xe thất bại!");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto">
        <h3 className="text-2xl font-bold mb-2">Thêm chuyến xe</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="p-4 border rounded-md shadow-lg space-y-4">

          <div>
            <label className="block font-medium mb-1">Tuyến đường</label>
            <select
              {...register("routeId", { required: "Vui lòng chọn tuyến đường" })}
              className={`w-full border p-2 rounded ${errors.routeId ? "border-red-500" : "border-gray-300"}`}
            >
              <option value="">-- Chọn tuyến --</option>
              {routes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.startPoint} → {r.endPoint}
                </option>
              ))}
            </select>
            {errors.routeId && <p className="text-red-600">{errors.routeId.message}</p>}
          </div>

          <div>
            <label className="block font-medium mb-1">Xe</label>
            <select
              {...register("busID", { required: "Vui lòng chọn xe" })}
              className={`w-full border p-2 rounded ${errors.busID ? "border-red-500" : "border-gray-300"}`}
            >
              <option value="">-- Chọn xe --</option>
              {buses.map((bus) => (
                <option key={bus.id} value={bus.id}>
                  {bus.plateNumber}
                </option>
              ))}
            </select>
            {errors.busID && <p className="text-red-600">{errors.busID.message}</p>}
          </div>

          <div>
            <label className="block font-medium mb-1">Tài xế</label>
            <select
              {...register("driverId", { required: "Vui lòng chọn tài xế" })}
              className={`w-full border p-2 rounded ${errors.driverId ? "border-red-500" : "border-gray-300"}`}
            >
              <option value="">-- Chọn tài xế --</option>
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.fullName} - {d.phone}
                </option>
              ))}
            </select>
            {errors.driverId && <p className="text-red-600">{errors.driverId.message}</p>}
          </div>

          <div>
            <label className="block font-medium mb-1">Giờ bắt đầu</label>
            <input
              type="datetime-local"
              {...register("startTime", { required: "Vui lòng nhập giờ bắt đầu" })}
              className={`w-full p-2 border rounded ${errors.startTime ? "border-red-500" : "border-gray-300"}`}
            />
            {errors.startTime && <p className="text-red-600">{errors.startTime.message}</p>}
          </div>

          <div>
            <label className="block font-medium mb-1">Giờ kết thúc</label>
            <input
              type="datetime-local"
              {...register("endTime", { required: "Vui lòng nhập giờ kết thúc" })}
              className={`w-full p-2 border rounded ${errors.endTime ? "border-red-500" : "border-gray-300"}`}
            />
            {errors.endTime && <p className="text-red-600">{errors.endTime.message}</p>}
          </div>

          <div>
            <label className="block font-medium mb-1">Giá vé</label>
            <input
              type="number"
              {...register("ticketPrice", {
                required: "Vui lòng nhập giá vé",
                min: { value: 1000, message: "Giá vé phải lớn hơn 1000đ" }
              })}
              className={`w-full p-2 border rounded ${errors.ticketPrice ? "border-red-500" : "border-gray-300"}`}
            />
            {errors.ticketPrice && <p className="text-red-600">{errors.ticketPrice.message}</p>}
          </div>

          <button type="submit" className="px-4 py-2 bg-[#073272] text-white rounded">
            Thêm chuyến xe
          </button>
        </form>
      </div>
    </div>
  );
}

export default BusRoutesCreate;
