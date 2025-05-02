import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Constants from '../../../Constants';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';

dayjs.extend(utc);
dayjs.extend(timezone);

function BookingTickets() {
    const { tripId } = useParams();
    const [tripData, setTripData] = useState(null);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [userName, setUserName] = useState('');
    const [phone, setPhone] = useState('');
    const [emailUser, setEmailUser] = useState('');

    const formatCurrency = (amount) => amount.toLocaleString('vi-VN') + ' VND';

    useEffect(() => {
        if (tripId) {
            axios
                .get(`${Constants.DOMAIN_API}/admin/trips/getById/${tripId}`)
                .then((response) => setTripData(response.data))
                .catch((error) => {
                    console.error('Lỗi khi lấy dữ liệu chuyến xe:', error);
                    toast.error('Không thể tải dữ liệu chuyến xe');
                });
        }
        const token = Cookies.get('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUserName(decoded.fullName || '');
                setEmailUser(decoded.email || '');
                setPhone(decoded.phone || '');
            } catch (error) {
                console.error("Lỗi giải mã token:", error);
            }
        }
    }, [tripId]);

    const handleSeatSelection = (seat) => {
        const exists = selectedSeats.find((s) => s.id === seat.id);
        setSelectedSeats((prev) =>
            exists ? prev.filter((s) => s.id !== seat.id) : [...prev, { id: seat.id, number: seat.seatNumber }]
        );
    };

    const getUserIdFromToken = () => {
        const token = Cookies.get('token');
        console.log('token', token);

        if (!token) {
            console.log('No token found');
            return null;
        }

        try {
            const decodedToken = jwtDecode(token);
            console.log('Decoded token', decodedToken);
            return decodedToken.id;
        } catch (error) {
            console.error('Error decoding token', error);
            return null;
        }
    };

    const handleCreateBooking = async () => {
        const userId = getUserIdFromToken();
        if (!userId) {
            toast.error('Vui lòng đăng nhập để thực hiện đặt vé!');
            return;
        }

        if (!userName || !phone || !emailUser || selectedSeats.length === 0) {
            toast.error("Vui lòng nhập đầy đủ thông tin và chọn ít nhất 1 ghế!");
            return;
        }

        const seatIds = selectedSeats.map(s => s.id);
        const trip = tripData.data;
        const busId = trip.buses?.id;
        const tripId = trip.id;
        const pricePerTicket = trip.price;
        const totalPrice = pricePerTicket * seatIds.length;

        try {
            const bookings = await axios.post(`${Constants.DOMAIN_API}/booking/add`, {
                userId,
                userName,
                phone,
                emailUser,
                seatIds,
                tripId,
                status: "confirmed",
                finalPrice: totalPrice,
                busId
            });

            console.log('Booking Response:', bookings.data);

            const bookingId = bookings.data.data.booking.id;
            if (!bookingId) {
                console.error('Không lấy được bookingId:', bookings.data);
                return;
            }

            const momoRes = await axios.post(`${Constants.DOMAIN_API}/payment/momo-url`, {
                amount: totalPrice,
                orderId: bookingId,
                orderInfo: `Thanh toán vé xe - Mã đơn: ${bookingId}`
            });

            console.log('Momo Res:', momoRes.data);

            const payUrl = momoRes.data.payUrl;
            if (!payUrl) {
                console.error('Không có đường dẫn thanh toán MOMO!');
                return;
            }

            window.location.href = payUrl;


        } catch (error) {
            console.error("Lỗi khi đặt vé hoặc thanh toán:", error?.response?.data || error.message || error);
            toast.error("Đặt vé thất bại hoặc lỗi khi tạo thanh toán MOMO.");
        }

    };


    if (!tripData) return <div>Đang tải dữ liệu chuyến xe...</div>;

    const seats = tripData?.data?.buses?.seats || [];

    return (
        <main className="mx-auto w-full md:w-[80%] flex pb-3" id="booktickets">
            {/* Phần bên trái */}
            <div className="w-[60%]">
                {/* Sơ đồ ghế */}
                <div className="w-full bg-white p-4 rounded-t-lg rounded-b-none shadow-md flex gap-2">
                    <div className="flex-1 p-[50px]">
                        <h3 className="text-xl font-semibold mb-4 text-center">Sơ đồ ghế</h3>
                        <div className="flex flex-wrap">
                            {seats.map((seat) => {
                                const isSelected = selectedSeats.some((s) => s.id === seat.id);
                                const isSold = seat.status === 'sold';
                                const isMaintenance = seat.status === 'maintenance';

                                return (
                                    <div key={seat.id} className="w-1/4 p-1">
                                        <label
                                            className={`max-w-[50px] flex justify-center cursor-pointer 
                                                px-3 py-2 text-sm border rounded-md
                                                ${isSold ? 'bg-gray-200 border-gray-600 cursor-not-allowed' : ''}
                                                ${seat.status === 'empty' ? 'bg-sky-100 border-sky-600' : ''}
                                                ${isMaintenance ? 'bg-orange-100 border-orange-600 cursor-not-allowed' : ''}
                                                ${isSelected ? 'bg-green-100 text-green-700 border-green-600' : ''}
                                                hover:bg-yellow-100 hover:border-yellow-600 
                                                transition-all duration-200 text-center`}
                                        >
                                            <input
                                                type="checkbox"
                                                value={seat.id}
                                                className="sr-only"
                                                disabled={isSold || isMaintenance}
                                                onChange={() => handleSeatSelection(seat)}
                                            />
                                            <span>{seat.seatNumber}</span>
                                        </label>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="mt-[5rem]">
                        {[
                            { color: 'gray-200', border: 'gray-600', label: 'Đã bán' },
                            { color: 'sky-100', border: 'sky-600', label: 'Còn trống' },
                            { color: 'orange-100', border: 'orange-600', label: 'Đang bảo trì' },
                            { color: 'green-100', border: 'green-600', label: 'Đang chọn' },
                        ].map((type, index) => (
                            <div key={index} className="flex items-center mb-2">
                                <div
                                    className={`w-[20px] h-[20px] bg-${type.color} mr-2 border border-${type.border} rounded-[4px]`}
                                ></div>
                                <span>{type.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form thông tin khách hàng */}
                <div className="w-full bg-white p-4 rounded-b-lg shadow-md mt-4 pb-[2rem]">
                    <div className="w-[50%]">
                        <h1 className="text-[25px] font-semibold pt-4">Thông tin khách hàng</h1>
                        {[
                            { label: 'Họ và tên', value: userName, onChange: setUserName, placeholder: 'Nhập họ và tên' },
                            { label: 'Số điện thoại', value: phone, onChange: setPhone, placeholder: 'Nhập số điện thoại' },
                            { label: 'Email', value: emailUser, onChange: setEmailUser, placeholder: 'Nhập email của bạn' },
                        ].map((field, index) => (
                            <div key={index} className="grid grid-cols-1 mt-4">
                                <div className="flex">
                                    <label className="text-[17px] font-semibold">{field.label}</label>
                                    <span className="text-red-500 ml-1">*</span>
                                </div>
                                <input
                                    type="text"
                                    value={field.value}
                                    onChange={(e) => field.onChange(e.target.value)}
                                    placeholder={field.placeholder}
                                    className="w-full border border-gray-300 p-2 rounded-lg mt-2 focus:border-orange-300 focus:ring-1 focus:ring-orange-100 outline-none transition"
                                />
                            </div>
                        ))}
                    </div>
                    <div className="w-[50%]">
                        <h1 className="text-center text-[25px] font-semibold p-4 text-orange-600">ĐIỀU KHOẢN & LƯU Ý</h1>
                        <span className="pl-4 pr-4 block text-justify text-[14px] font-semibold">
                            (*) Quý khách vui lòng có mặt tại bến xuất phát trước ít nhất 30 phút giờ khởi hành và mang theo thông báo đã thanh toán vé thành công.
                            <br /><br />
                            (*) Nếu quý khách có nhu cầu trung chuyển, vui lòng liên hệ Tổng đài trước khi đặt vé.
                        </span>
                    </div>
                </div>
            </div>

            {/* Thông tin vé */}
            <div className="w-[40%] pl-4">
                <div className="w-full bg-white p-4 rounded-lg shadow-md">
                    <h1 className="text-[25px] font-bold pt-4 pb-2">Thông tin vé xe</h1>
                    <div className="flex justify-between pt-2">
                        <span className="text-gray-500 font-semibold text-[17px]">Điểm xuất phát:</span>
                        <span className="font-semibold">{tripData.data.routes.startPoint}</span>
                    </div>
                    <div className="flex justify-between pt-2">
                        <span className="text-gray-500 font-semibold text-[17px]">Điểm đến:</span>
                        <span className="font-semibold">{tripData.data.routes.endPoint}</span>
                    </div>
                    <div className="flex justify-between pt-2">
                        <span className="text-gray-500 font-semibold text-[17px]">Thời gian khởi hành:</span>
                        <span className="font-semibold text-green-900">
                            {dayjs.utc(tripData.data.departureTime).tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY HH:mm')}
                        </span>
                    </div>
                    <div className="flex justify-between pt-2 text-[17px]">
                        <span className="text-gray-500 font-semibold">Số lượng ghế</span>
                        <span className="font-semibold text-green-900">{selectedSeats.length}</span>
                    </div>
                    <div className="flex justify-between pt-2 text-[17px]">
                        <span className="text-gray-500 font-semibold">Số ghế</span>
                        <span className="font-semibold text-green-900">
                            {selectedSeats.map((s) => s.number).join(', ')}
                        </span>
                    </div>
                    <div className="flex justify-between pt-2 text-[17px]">
                        <span className="text-gray-500 font-semibold">Giá vé</span>
                        <span className="font-semibold text-green-900">{formatCurrency(tripData.data.price)}</span>
                    </div>
                    <hr className="mt-2 mb-2 border-gray-300" />
                    <div className="flex justify-between pt-2 text-[17px] items-center">
                        <h1 className="font-semibold text-[22px] text-orange-600">
                            {formatCurrency(tripData.data.price * selectedSeats.length)}
                        </h1>
                        <button onClick={handleCreateBooking} className="p-2 px-4 rounded-[30px] bg-orange-500 text-white">
                            Thêm đơn vé
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default BookingTickets;
