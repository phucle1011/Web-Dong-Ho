import Navbar from "../../../components/client/Navbar";
import axios from "axios";
import { useState, useEffect } from "react";
import Constants from "../../../Constants.jsx";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";

function BookingHistory() {

    const [BusBookingDetailData, setBusBookingDetailData] = useState([]);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);

    useEffect(() => {
        getData();
    }, []);

    const getData = async () => {
        try {
            const token = Cookies.get("token");
            if (!token) {
                setErrorMessage("Bạn cần đăng nhập để xem lịch sử.");
                return;
            }

            const decoded = jwtDecode(token);
            const userId = decoded.id;

            const res = await axios.get(`${Constants.DOMAIN_API}/booking-detail/list`, {
                params: { userId }
            });

            if (res.data.status === 200) {
                setBusBookingDetailData(res.data.data);
                setErrorMessage(null);
            } else {
                setErrorMessage("Không thể lấy lịch sử đặt vé. Vui lòng thử lại.");
            }
        } catch (err) {
            console.log('Lỗi:', err);
            setErrorMessage("Lỗi khi kết nối đến server. Vui lòng thử lại.");
            console.log("Lỗi khi lấy lịch sử đặt vé", err);
        }
    };

    const deleteBooking = async () => {
        if (!selectedBooking || selectedBooking.booking.status === 'canceled') {
            setErrorMessage("Không thể hủy vé này.");
            return;
        }
        try {
            await axios.delete(`${Constants.DOMAIN_API}/booking/delete/${selectedBooking.id}`);
            alert("Hủy vé thành công");
            setShowCancelModal(false);
            setSelectedBooking(null);
            getData();
        } catch (error) {
            setErrorMessage("Không thể hủy vé, vui lòng thử lại.");
            console.log("Lỗi khi hủy vé:", error);
        }
    };


    return (
        <>
            <main className="history mb-4 mt-[11%]">
                <div className="flex w-[80%] mx-auto">
                    <div className="w-[20%] bg-gray-100 p-3 rounded-md border border-gray-200">
                        <Navbar />
                    </div>
                    <div className="w-[80%] bg-white p-3 rounded-md ml-4">
                        <h1 className="text-3xl font-bold">Lịch sử đặt vé</h1>
                        <p className="text-gray-600 mb-3">Theo dõi và quản lý quá trình lịch sử mua vé của bạn.</p>

                        {errorMessage && (
                            <div className="text-red-500 text-center mb-4">{errorMessage}</div>
                        )}

                        {BusBookingDetailData.length === 0 ? (
                            <div className="alert alert-info text-center text-gray-600 fw-bold" role="alert">
                                Hiện tại bạn chưa đặt vé. Bạn vui lòng đặt vé để xem lịch sử đặt vé của mình tại đây!
                            </div>
                        ) : (
                            BusBookingDetailData.map((item, index) => (
                                <div key={index} className="bg-white mb-3 shadow-lg rounded-lg flex border border-gray-300">
                                    <div className="w-2/3 border-r border-dashed border-gray-400">
                                        <div className="text-white font-mono rounded-tl-lg text-lg font-bold bg-[#043175] px-3 py-2">
                                            Mã vé: {item.booking.id}
                                        </div>
                                        <div className="text-gray-800 font-mono text-lg font-bold px-3">
                                            Giá <span className="float-right">Chuyến xe</span>
                                        </div>
                                        <div className="text-xl font-bold text-gray-900 px-3">
                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                                            <span className="float-right">{item.booking.trips.id}</span>
                                        </div>

                                        <div className="mt-2 flex justify-between px-3">
                                            <div>
                                                <p className="text-gray-700 font-mono text-sm">TỪ</p>
                                                <p className="text-lg font-bold">{item.booking.trips.routes.startPoint}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-700 font-mono text-sm">GIỜ ĐI</p>
                                                <p className="text-lg font-bold">
                                                    {item.booking.trips?.departureTime
                                                        ? new Date(new Date(item.booking.trips.departureTime.replace('Z', '')).getTime() + 7 * 60 * 60 * 1000).toLocaleString('vi-VN', {
                                                            timeZone: 'Asia/Ho_Chi_Minh',
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                            hour12: false,
                                                        })
                                                        : 'Thời gian không hợp lệ'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-2 flex justify-between px-3">
                                            <div>
                                                <p className="text-gray-700 font-mono text-sm">ĐẾN</p>
                                                <p className="text-lg font-bold">{item.booking.trips.routes.endPoint}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-700 font-mono text-sm">GIỜ ĐẾN</p>
                                                <p className="text-lg font-bold">
                                                    {item.booking.trips?.arrivalTime
                                                        ? new Date(new Date(item.booking.trips.arrivalTime.replace('Z', '')).getTime() + 7 * 60 * 60 * 1000).toLocaleString('vi-VN', {
                                                            timeZone: 'Asia/Ho_Chi_Minh',
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                            hour12: false,
                                                        })
                                                        : 'Thời gian không hợp lệ'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex justify-between p-3">
                                            <div>
                                                <p className="text-gray-700 font-mono text-sm">NGÀY</p>
                                                <p className="text-lg font-bold">{new Date(item.booking.trips?.departureTime).toLocaleDateString('vi-VN')}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-700 font-mono text-sm">GHẾ</p>
                                                <p className="text-lg font-bold">{item?.seatNumber}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="w-1/3 p-3 text-center">
                                        <div className="flex justify-between align-items-center">
                                            <b>
                                                {item.booking.status === 'pending'
                                                    ? 'Chưa khởi hành'
                                                    : item.booking.status === 'confirmed'
                                                        ? 'Đã khởi hành'
                                                        : item.booking.status === 'canceled'
                                                            ? 'Đã hủy'
                                                            : item.booking.status}
                                            </b>
                                            {item.booking.status === 'pending' && (
                                                <button
                                                    className="bg-red-400 text-white px-4 py-2 font-mono rounded-md hover:bg-red-600"
                                                    onClick={() => {
                                                        setSelectedBooking(item);
                                                        setShowCancelModal(true);
                                                    }}
                                                >
                                                    Hủy vé
                                                </button>
                                            )}
                                            {item.booking.status !== 'pending' && (
                                                <p className="text-red-500">Không thể hủy vé</p>
                                            )}
                                        </div>
                                        <div className="border-b border-gray-400 my-2"></div>

                                        <div className="flex justify-between">
                                            <p className="text-gray-700 font-mono text-sm">TÊN</p>
                                            <p className="text-lg font-bold">{item.booking.userName}</p>
                                        </div>

                                        <div className="flex justify-between mt-2">
                                            <p className="text-gray-700 font-mono text-sm">TỪ</p>
                                            <p className="text-lg font-bold">{item.booking.trips.routes.startPoint}</p>
                                        </div>

                                        <div className="flex justify-between mt-2">
                                            <p className="text-gray-700 font-mono text-sm">ĐẾN</p>
                                            <p className="text-lg font-bold">{item.booking.trips.routes.endPoint}</p>
                                        </div>

                                        <div className="flex justify-between mt-2">
                                            <p className="text-gray-700 font-mono text-sm">CHUYẾN</p>
                                            <p className="text-lg font-bold">{item.booking.trips.id}</p>
                                        </div>

                                        <div className="flex justify-between mt-2">
                                            <p className="text-gray-700 font-mono text-sm">GHẾ</p>
                                            <p className="text-lg font-bold">{item?.seatNumber}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>

            {showCancelModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="absolute inset-0 bg-black opacity-50"></div>

                    <div className="relative bg-white p-6 rounded-lg shadow-lg w-96 z-10">
                        <h2 className="text-lg font-bold mb-4 text-center">Xác nhận hủy vé</h2>

                        <p className="font-medium mb-2">Bạn có chắc chắn muốn hủy vé này không?</p>

                        <div className="flex justify-end mt-4">
                            <button
                                className="bg-gray-300 text-black px-4 py-2 rounded-md mr-2"
                                onClick={() => setShowCancelModal(false)}
                            >
                                Hủy
                            </button>
                            <button
                                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-700"
                                onClick={deleteBooking}
                            >
                                Xác nhận
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-gray-100 text-center py-4 text-sm text-gray-600 mb-0">
                <div className="space-x-4">
                    <a href="#" className="hover:underline">Về chúng tôi</a>
                    <span>·</span>
                    <a href="#" className="hover:underline">Điều khoản và điều kiện</a>
                    <span>·</span>
                    <a href="#" className="hover:underline">Cách chúng tôi hoạt động</a>
                    <span>·</span>
                    <a href="#" className="hover:underline">Chính sách bảo mật & Cookie</a>
                    <span>·</span>
                    <a href="#" className="hover:underline">Trung tâm trợ giúp</a>
                </div>
                <p className="mt-2">&copy; 2025 Công ty của bạn. Bảo lưu mọi quyền.</p>
            </div>

        </>
    );
}

export default BookingHistory;
