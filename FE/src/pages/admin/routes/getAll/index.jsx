import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { Link } from "react-router-dom";
import FormDelete from "../../../../components/formDelete";
import axios from "axios";
import { toast } from 'react-toastify';
import ReactPaginate from "react-paginate";
import Constants from '../../../../Constants';

const URL = Constants.DOMAIN_API;
const ENDPOIND = `admin/routes`;

export default function RoutesGetAll() {
    const [data, setData] = useState([]);
    const [selectedRoute, setSelectedRoute] = useState(null);
    const [queryParams] = useSearchParams();
    const [error, setError] = useState(null);

    const [currentItems, setCurrentItems] = useState([]);
    const [itemOffset, setItemOffset] = useState(0);
    const itemsPerPage = 10;

    const endOffset = itemOffset + itemsPerPage;
    const pageCount = Math.ceil(data.length / itemsPerPage);

    useEffect(() => {
        Data();
    }, []);

    useEffect(() => {
        const newItems = data.slice(itemOffset, endOffset);
        setCurrentItems(newItems);
    }, [itemOffset, data]);

    const handlePageClick = (event) => {
        const newOffset = (event.selected * itemsPerPage) % data.length;
        setItemOffset(newOffset);
    };

    const Data = async () => {
        try {
            const res = await axios.get(`${URL}/${ENDPOIND}/list`);
            setData(res.data.data);
        } catch (err) {
            console.error("Error:", err);
        }
    };

    const handleDelete = async ({ id }) => {
        try {
            await axios.delete(`${URL}/${ENDPOIND}/delete/${id}`);
            toast.success("Tuyến đường đã được xóa thành công!");
            Data();
            setSelectedRoute(null);
        } catch (err) {
            console.error("Chi tiết lỗi:", err);
            toast.error("Có lỗi khi xóa tuyến đường.");
        }
    };

    return (
        <div className="container mx-auto p-2">
            <div className="bg-white p-4 shadow rounded-md">
                <Link
                    to="/admin/routes/create"
                    className="inline-block bg-[#073272] text-white px-4 py-2 rounded"
                >
                    Thêm tuyến đường
                </Link>

                <table className="w-full border-collapse border border-gray-300 mt-4">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="p-2 border">STT</th>
                            <th className="p-2 border">Điểm bắt đầu</th>
                            <th className="p-2 border">Điểm kết thúc</th>
                            <th className="p-2 border">Khoảng cách (km)</th>
                            <th className="p-2 border">Thời gian dự kiến (giờ)</th>
                            <th className="p-2 border">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.map((route, index) => (
                            <tr key={route.id} className="border-b">
                                <td className="p-2 border">{index+1}</td>
                                <td className="p-2 border">{route.startPoint}</td>
                                <td className="p-2 border">{route.endPoint}</td>
                                <td className="p-2 border">{route.distance} km</td>
                                <td className="p-2 border">{route.time} giờ</td>
                                <td className="p-2 border flex gap-2">
                                    <Link
                                        to={`/admin/routes/edit?id=${route.id}`}
                                        className="bg-yellow-500 text-white py-2 px-3 rounded"
                                    >
                                        <i className="fa-solid fa-pen-to-square text-md"></i>
                                    </Link>
                                    <button
                                        onClick={() => setSelectedRoute(route)}
                                        className="bg-red-500 text-white py-2 px-3 rounded"
                                    >
                                        <i className="fa-solid fa-trash text-md"></i>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="mt-4">
                    <ReactPaginate
                        breakLabel="..."
                        nextLabel=">"
                        onPageChange={handlePageClick}
                        pageRangeDisplayed={3}
                        pageCount={pageCount}
                        previousLabel="<"
                        containerClassName="flex justify-center gap-2 mt-4"
                        pageClassName="px-3 py-1 border rounded hover:bg-gray-200"
                        activeClassName="bg-blue-500 text-white"
                        previousClassName="px-3 py-1 border rounded"
                        nextClassName="px-3 py-1 border rounded"
                    />
                </div>
            </div>

            {selectedRoute && (
                <FormDelete
                    isOpen={!!selectedRoute}
                    onClose={() => setSelectedRoute(null)}
                    onConfirm={handleDelete}
                    Id={selectedRoute?.id}
                    message={`Bạn có chắc chắn muốn xóa tuyến đường từ "${selectedRoute.startPoint}" đến "${selectedRoute.endPoint}" không?`}
                />
            )}
        </div>
    );
}
