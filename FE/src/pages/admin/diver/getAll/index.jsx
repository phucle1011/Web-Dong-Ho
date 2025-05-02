import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import FormDelete from "../../../../components/formDelete";
import axios from "axios";
import Constants from "../../../../Constants";

const DriverGetAll = () => {

    const [driversData, setData] = useState([]);
    const [selectedDriver, setSelectedDriver] = useState(null);

    useEffect(() => {
        getAll();
    }, []);

    const getAll = async () => {
        try {
            const res = await axios.get(`${Constants.DOMAIN_API}/admin/driver/list`);
            console.log(res.data.data);
            setData(res.data.data);
        } catch (error) {
            console.log(error);
        }
    };

    const deleteDiver = async () => {
        if (!selectedDriver) return;
        try {
            await axios.delete(`${Constants.DOMAIN_API}/admin/driver/${selectedDriver.id}`);
            setSelectedDriver(null);
            getAll();
        } catch (error) {
            console.log("Lỗi khi xóa:", error);
        }
    };

    const renderDriver = (driver, index) => {
        return (
            <tr key={driver.id} className="border-b">
                <td className="p-2 border text-center">{index + 1}</td>
                <td className="p-2 border text-center">
                    <img
                        src={driver?.image ? `${Constants.DOMAIN_API}/public/images/${driver.image}` : "https://media-public.canva.com/mDo-I/MAGCJcmDo-I/1/t.png"}
                        className="w-10 h-10 rounded-full"
                        alt="Driver"
                    />
                </td>
                <td className="p-2 border">{driver.fullName}</td>
                <td className="p-2 border">{driver.phone}</td>
                <td className="p-2 border">{driver.licenseNumber}</td>
                <td className="p-2 border">{driver.licenseType}</td>
                <td className="p-2 border text-center">{driver.experienceYears}</td>
                <td className="p-2 border">{new Date(driver.birthDate).getFullYear()}</td>
                <td className="p-2 border"> {new Date(driver.hireDate).toLocaleDateString("vi-VN")}</td>
                <td className="p-2 border text-nowrap">
                    <span
                        className={`px-2 py-1 rounded-full text-xs ${driver.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                    >
                        {driver.status === "active" ? "Đang làm việc" : "Tạm nghỉ"}
                    </span>
                </td>
                <td className="p-2 border flex gap-2">
                    <Link to={`/admin/driver/edit?id=${driver.id}`} className="bg-yellow-500 text-white py-2 px-3 rounded">
                        <i className="fa-solid fa-pen-to-square text-md"></i>
                    </Link>
                    <button
                        onClick={() => setSelectedDriver(driver)}
                        className="bg-red-500 text-white py-2 px-3 rounded"
                    >
                        <i className="fa-solid fa-trash text-md"></i>
                    </button>
                </td>
            </tr>

        );
    };

    return (
        <div className="mx-auto p-4">
            <div className="bg-white p-4 shadow rounded-md">
                <Link to="/admin/driver/create" className="inline-block bg-[#073272] text-white px-4 py-2 rounded">
                    Thêm tài xế
                </Link>
                <table className="w-full border-collapse border border-gray-300 mt-4">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="p-2 border">#</th>
                            <th className="p-2 border">Ảnh</th>
                            <th className="p-2 border">Họ và tên</th>
                            <th className="p-2 border">Số điện thoại</th>
                            <th className="p-2 border">Số GPLX</th>
                            <th className="p-2 border">Loại GPLX</th>
                            <th className="p-2 border">Kinh nghiệm (năm)</th>
                            <th className="p-2 border">Năm sinh</th>
                            <th className="p-2 border">Ngày thuê</th>
                            <th className="p-2 border">Trạng thái</th>
                            <th className="p-2 border">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {driversData.map(renderDriver)}
                    </tbody>
                </table>
            </div>

            <FormDelete
                isOpen={selectedDriver !== null}
                onClose={() => setSelectedDriver(null)}
                onConfirm={deleteDiver}
                message={`Bạn có chắc chắn muốn xóa tài xế "${selectedDriver?.fullName}" không?`}
            />
        </div>
    );
};

export default DriverGetAll;
