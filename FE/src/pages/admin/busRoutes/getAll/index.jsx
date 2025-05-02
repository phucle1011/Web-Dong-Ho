import { Link } from "react-router-dom";
import FormDelete from "../../../../components/formDelete";
import axios from "axios";
import { useState, useEffect } from "react";
import Constants from "../../../../Constants.jsx";
import { toast } from 'react-toastify';
import dayjs from "dayjs";

function BusRoutesGetAll() {
    const formatPrice = (price) => {
        return price.toLocaleString('vi-VN') + 'vnd';
    };
    const formatDate = (dateStr) => {
        return dayjs(dateStr).format("DD/MM/YYYY HH:mm");
    };

    const [selectedRoute, setSelectedRoute] = useState(null);
    const [routes, setRoutes] = useState([]);

    const deleteBusTypes = async () => {
        if (!selectedRoute) return;
        try {
            await axios.delete(`${Constants.DOMAIN_API}/admin/trips/${selectedRoute.id}`);
            toast.success("Xóa thành công!");
            setSelectedRoute(null);
            getData();
        } catch (error) {
            console.log("Lỗi khi xóa:", error);
            toast.error("Xóa thất bại!");
        }
    };


    useEffect(() => {
        getData();
    }, []);

    const getData = async () => {
        try {
            const res = await axios.get(`${Constants.DOMAIN_API}/admin/trips/list`);
            console.log('Response', res.data.data);
            setRoutes(res.data.data);
        } catch (err) {
            console.log("Error", err);
        }
    }
    

    return (
        <div className="container mx-auto p-2">
            <div className="bg-white p-4 shadow rounded-md">
                <Link
                    to="/admin/busRoutes/create"
                    className=" inline-block bg-[#073272] text-white px-4 py-2 rounded"
                >
                    Thêm tuyến xe
                </Link>
                <table className="w-full border-collapse border border-gray-300 mt-4">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="p-2 border">Tuyến đường</th>
                            <th className="p-2 border">Mã xe</th>
                            <th className="p-2 border">Tài xế</th>
                            <th className="p-2 border">Giờ bắt đầu</th>
                            <th className="p-2 border">Giờ kết thúc</th>
                            <th className="p-2 border">Giá vé</th>
                            <th className="p-2 border">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {routes.map((value) => (
                            <tr key={value.id} className="border-b">
                                <td className="p-2 border">{value.routes.startPoint} - {value.routes.endPoint}</td>
                                <td className="p-2 border">{value.buses.plateNumber}</td>
                                <td className="p-2 border"> {value.drivers ? value.drivers.fullName : "Chưa có tài xế"}</td>
                                <td className="p-2 border">{formatDate(value.departureTime) }</td>
                                <td className="p-2 border">{formatDate(value.arrivalTime)}</td>
                                <td className="p-2 border">{formatPrice(value.price)}</td>
                                <td className="p-2 border flex gap-2">
                                    <Link
                                        to={`/admin/busRoutes/edit/${value.id}`}
                                        className="bg-yellow-500 text-white py-2 px-3 rounded" >
                                        <i className="fa-solid fa-pen-to-square text-md"></i>
                                    </Link>
                                    <button 
                                        onClick={() => setSelectedRoute(value)} 
                                        className="bg-red-500 text-white py-2 px-3 rounded">
                                        <i className="fa-solid fa-trash text-md"></i>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedRoute && (
                <FormDelete
                    isOpen={true}
                    onClose={() => setSelectedRoute(null)}
                    onConfirm={deleteBusTypes} 
                    message={`Bạn có chắc chắn muốn xóa loại xe  không?`}
                />
            )}
        </div>
    )
}
export default BusRoutesGetAll;