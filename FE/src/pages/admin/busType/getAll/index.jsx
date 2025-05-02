import { Link } from "react-router-dom";
import FormDelete from "../../../../components/formDelete";
import axios from "axios";
import { useState, useEffect } from "react";
import Constants from "../../../../Constants.jsx";
import { toast } from 'react-toastify';

function BusTypeGetAll() {
    const [selectedBusType, setSelectedBusType] = useState(null);

    const [busTypesData, setBusTypesData] = useState([]);

    const deleteBusTypes = async () => {
        if (!selectedBusType) return;
        try {
            await axios.delete(`${Constants.DOMAIN_API}/admin/busType/delete/${selectedBusType.id}`);
            // alert("Xóa thành công");
            toast.success("Xóa thành công!");
            setSelectedBusType(null);
            getData();
        } catch (error) {
            console.log("Lỗi khi xóa:", error);
            // alert("Xóa thất bại");
            toast.error("Xóa thất bại!");
        }
    };


    useEffect(() => {
        getData();
    }, []);

    const getData = async () => {
        try {
            const res = await axios.get(`${Constants.DOMAIN_API}/admin/busType/list`);
            console.log('Response', res.data.data);

            setBusTypesData(res.data.data);
        } catch (err) {
            console.log("Error", err);
        }
    }

    return (
        <div className="container mx-auto p-2">
            <div className="bg-white p-4 shadow rounded-md">
                <Link
                    to="/admin/busType/create"
                    className="inline-block bg-[#073272] text-white px-4 py-2 rounded"
                >
                    Thêm loại xe
                </Link>
                <table className="w-full border-collapse border border-gray-300 mt-3">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="p-2 border">ID</th>
                            <th className="p-2 border">Tên loại xe</th>
                            <th className="p-2 border">Số ghế ngồi</th>
                            <th className="p-2 border">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {busTypesData.map((value, index) => (
                            <tr key={index} className="border-b">
                                <td className="p-2 border">{value.id}</td>
                                <td className="p-2 border">{value.typeName}</td>
                                <td className="p-2 border">{value.totalSeats}</td>
                                <td className="p-2 border flex gap-2">
                                    <Link
                                        to={`/admin/busType/update/${value.id}`}
                                        className="bg-yellow-500 text-white py-2 px-3 rounded"
                                    >
                                        <i className="fa-solid fa-pen-to-square text-md"></i>
                                    </Link>
                                    <button
                                        onClick={() => setSelectedBusType(value)}
                                        className="bg-red-500 text-white py-2 px-3 rounded"
                                    >
                                        <i className="fa-solid fa-trash text-md"></i>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedBusType && (
                <FormDelete
                    isOpen={true}
                    onClose={() => setSelectedBusType(null)}
                    onConfirm={deleteBusTypes} 
                    message={`Bạn có chắc chắn muốn xóa loại xe "${selectedBusType.typeName}" không?`}
                />
            )}
        </div>
    );
}

export default BusTypeGetAll;
