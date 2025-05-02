import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from "axios";
import Constants from "../../../../Constants.jsx";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

function BusRoutesEdit() {
    dayjs.extend(utc);
    dayjs.extend(timezone);

    const convertUTCToVNInputFormat = (utcString) => {
        return dayjs.utc(utcString).tz("Asia/Ho_Chi_Minh").format("YYYY-MM-DDTHH:mm");
    };


    const {
        register,
        handleSubmit,
        setValue,
        trigger,
        formState: { errors }
    } = useForm({ mode: "onChange" });

    const { id } = useParams();
    const navigate = useNavigate();
    const [routes, setRoutes] = useState([]);
    const [buses, setBuses] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [selectedSeatId, setSelectedSeatId] = useState("");
    const [seatStatus, setSeatStatus] = useState("");
    const [seats, setSeats] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(`${Constants.DOMAIN_API}/admin/trips/getById/${id}`);
                const trip = res.data.data;

                setValue("routeId", trip.routeId);
                setValue("busID", trip.busID);
                setValue("driverId", trip.driverId);
                setValue("departureTime", convertUTCToVNInputFormat(trip.departureTime.slice(0, 16)));
                setValue("arrivalTime", convertUTCToVNInputFormat(trip.arrivalTime.slice(0, 16)));
                setValue("price", trip.price);

                const seatRes = await axios.get(`${Constants.DOMAIN_API}/admin/seats/${trip.busID}`);
                setSeats(seatRes.data.data);
            } catch (e) {
                console.log("Fetch trip error:", e);
                toast.error("Không thể tải dữ liệu chuyến xe");
            }
        };

        const fetchDropdownData = async () => {
            try {
                const [routeRes, busRes, driverRes] = await Promise.all([
                    axios.get(`${Constants.DOMAIN_API}/admin/routes/list`),
                    axios.get(`${Constants.DOMAIN_API}/admin/bus/getAllByStatusEdit/${id}`),
                    axios.get(`${Constants.DOMAIN_API}/admin/driver/getByStatusEdit/${id}`)
                ]);
                setRoutes(routeRes.data.data);
                setBuses(busRes.data.data);
                setDrivers(driverRes.data.data);
            } catch (e) {
                console.error("Fetch list error", e);
            }
        };

        fetchData();
        fetchDropdownData();
    }, [id, setValue]);

    const onSubmit = async (data) => {
        try {
            data.departureTime = dayjs(data.departureTime).format("YYYY-MM-DDTHH:mm:ss");
            data.arrivalTime = dayjs(data.arrivalTime).format("YYYY-MM-DDTHH:mm:ss");

            await axios.patch(`${Constants.DOMAIN_API}/admin/trips/update/${id}`, data);

            if (selectedSeatId && seatStatus) {
                await axios.put(`${Constants.DOMAIN_API}/admin/seats/${selectedSeatId}`, {
                    status: seatStatus
                });
            }

            toast.success("Cập nhật chuyến xe thành công!");
            navigate("/admin/busRoutes/getAll");
        } catch (e) {
            console.log("Update error", e);
            toast.error("Cập nhật thất bại!");
        }
    };

    const handleChange = async (fieldName) => {
        await trigger(fieldName);
    };

    return (
        <div className="container mx-auto p-4">
            <div className="bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto">
                <h3 className="text-2xl font-bold mb-2">Chỉnh sửa chuyến xe</h3>
                <form onSubmit={handleSubmit(onSubmit)} className="p-4 border rounded-md shadow-lg">

                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Tuyến đường</label>
                        <select
                            className={`w-full p-2 border rounded ${errors.routeId ? '!border-red-500' : 'border-gray-300'}`}
                            {...register("routeId", { required: "Vui lòng chọn tuyến đường" })}
                            onChange={() => handleChange("routeId")}
                        >
                            <option value="">Chọn tuyến đường</option>
                            {routes.map(route => (
                                <option key={route.id} value={route.id}>
                                    {route.startPoint} → {route.endPoint}
                                </option>
                            ))}
                        </select>
                        {errors.routeId && <p className="text-red-700">{errors.routeId.message}</p>}
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Xe</label>
                        <select
                            className={`w-full p-2 border rounded ${errors.busID ? '!border-red-500' : 'border-gray-300'}`}
                            {...register("busID", { required: "Vui lòng chọn xe" })}
                            onChange={async (e) => {
                                const selectedBusId = e.target.value;
                                setValue("busID", selectedBusId);
                                await trigger("busID");
                                if (selectedBusId) {
                                    try {
                                        const seatRes = await axios.get(`${Constants.DOMAIN_API}/admin/seats/${selectedBusId}`);
                                        setSeats(seatRes.data.data);
                                        setSelectedSeatId("");
                                        setSeatStatus("");
                                    } catch (err) {
                                        console.error("Lỗi khi load ghế mới", err);
                                        toast.error("Không thể tải danh sách ghế");
                                    }
                                }
                            }}
                        >
                            <option value="">Chọn xe</option>
                            {buses.map(bus => (
                                <option key={bus.id} value={bus.id}>
                                    {bus.plateNumber} ({bus.totalSeats} chỗ)
                                </option>
                            ))}
                        </select>
                        {errors.busID && <p className="text-red-700">{errors.busID.message}</p>}
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Tài xế</label>
                        <select
                            className={`w-full p-2 border rounded ${errors.driverId ? '!border-red-500' : 'border-gray-300'}`}
                            {...register("driverId", { required: "Vui lòng chọn tài xế" })}
                            onChange={() => handleChange("driverId")}
                        >
                            <option value="">Chọn tài xế</option>
                            {drivers.map(driver => (
                                <option key={driver.id} value={driver.id}>
                                    {driver.fullName} - {driver.phone}
                                </option>
                            ))}
                        </select>
                        {errors.driverId && <p className="text-red-700">{errors.driverId.message}</p>}
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Giờ bắt đầu</label>
                        <input
                            type="datetime-local"
                            className={`w-full p-2 border rounded ${errors.departureTime ? '!border-red-500' : 'border-gray-300'}`}
                            {...register("departureTime", { required: "Vui lòng nhập giờ bắt đầu" })}
                        />
                        {errors.departureTime && <p className="text-red-700">{errors.departureTime.message}</p>}
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Giờ kết thúc</label>
                        <input
                            type="datetime-local"
                            className={`w-full p-2 border rounded ${errors.arrivalTime ? '!border-red-500' : 'border-gray-300'}`}
                            {...register("arrivalTime", { required: "Vui lòng nhập giờ kết thúc" })}
                        />
                        {errors.arrivalTime && <p className="text-red-700">{errors.arrivalTime.message}</p>}
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Giá vé</label>
                        <input
                            type="number"
                            className={`w-full p-2 border rounded ${errors.price ? '!border-red-500' : 'border-gray-300'}`}
                            {...register("price", {
                                required: "Vui lòng nhập giá vé",
                                min: { value: 1000, message: "Giá vé phải lớn hơn 1000" }
                            })}
                        />
                        {errors.price && <p className="text-red-700">{errors.price.message}</p>}
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Mã ghế</label>
                        <select
                            value={selectedSeatId}
                            onChange={(e) => setSelectedSeatId(e.target.value)}
                            className="w-full p-2 border rounded border-gray-300"
                        >
                            <option value="">Chọn mã ghế</option>
                            {seats.map((seat) => (
                                <option key={seat.id} value={seat.id}>
                                    {seat.seatNumber}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Trạng thái ghế</label>
                        <select
                            value={seatStatus}
                            onChange={(e) => setSeatStatus(e.target.value)}
                            className="w-full p-2 border rounded border-gray-300"
                        >
                            <option value="">Chọn trạng thái</option>
                            <option value="empty">Còn trống</option>
                            <option value="sold">Đã bán</option>
                            <option value="maintenance">Đang bảo trì</option>
                        </select>
                    </div>

                    <div className="w-full bg-white p-10 rounded-t-lg rounded-b-none shadow-md">
                        <div className="flex gap-2">
                            <div className="flex-1  p-[50px]">
                                <h3 className="text-xl font-semibold mb-4 text-center">Sơ đồ ghế</h3>

                                <div className="flex flex-wrap">
                                    {seats.map((seat) => (
                                        <div key={seat.id} className="w-1/4 p-1">
                                            <label
                                                className={`max-w-[50px] flex justify-center cursor-pointer 
                                px-3 py-2 text-sm border 
                                ${seat.status === 'sold' ? 'bg-gray-200 border-gray-600' : ''}
                                ${seat.status === 'empty' ? 'bg-sky-100 border-sky-600' : ''}
                                ${seat.status === 'maintenance' ? 'bg-orange-100 border-orange-600' : ''}
                                rounded-md hover:bg-yellow-100 hover:border-yellow-600 
                                peer-checked:bg-orange-100 peer-checked:text-orange-600 peer-checked:border-orange-600
                                transition-all duration-200 block text-center`}
                                            >
                                                <input
                                                    value={seat.id}
                                                    onChange={(e) => setSelectedSeatId(e.target.value)}
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    disabled={seat.status === 'sold' || seat.status === 'maintenance'}
                                                />
                                                <span>{seat.seatNumber}</span>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="ml-12 mt-10 flex flex-col gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-[20px] h-[20px] bg-gray-200 border border-gray-600 rounded-md"></div>
                                    <span>Đã bán</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-[20px] h-[20px] bg-sky-100 border border-sky-600 rounded-md"></div>
                                    <span>Còn trống</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-[20px] h-[20px] bg-orange-100 border border-orange-600 rounded-md"></div>
                                    <span>Đang bảo trì</span>
                                </div>
                            </div>
                        </div>
                    </div>


                    <button type="submit" className="px-4 py-2 bg-[#073272] text-white rounded">
                        Cập nhật chuyến xe
                    </button>
                </form>
            </div>
        </div>
    );
}

export default BusRoutesEdit;
