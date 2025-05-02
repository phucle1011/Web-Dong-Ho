import { Link, useLocation } from "react-router-dom";


function Bus() {
    const location = useLocation();
    const tripsData = location.state?.tripsData || [];
    console.log(tripsData);
    

    const renderTrips = () => {
        if (!Array.isArray(tripsData) ) {
            return (
                <div className="bg-white rounded p-3 w-full my-3">
                    Không có chuyến nào phù hợp với yêu cầu của bạn.
                </div>
            );
        }

        const hasNoTrips = tripsData.every(route => !Array.isArray(route.trips) || route.trips.length === 0);

        if (hasNoTrips) {
            return (
                <div className="bg-white rounded p-3 w-full my-3">
                    Không có chuyến nào phù hợp với yêu cầu của bạn.
                </div>
            );
        }
    
        return tripsData.map((route) =>
            route.trips.map((trip) => {
                const id = trip.tripId;
                const departure = new Date(trip.departureTime);
                const arrivalTime = new Date(trip.arrivalTime);
                const startHours = departure.getHours().toString().padStart(2, "0");
                const startMinutes = departure.getMinutes().toString().padStart(2, "0");
                const endHours = arrivalTime.getHours().toString().padStart(2, "0");
                const endMinutes = arrivalTime.getMinutes().toString().padStart(2, "0");
                const formattedPrice = new Intl.NumberFormat("vi-VN").format(trip.price);
    
                return (
                    <div key={trip.tripId} className="bg-white rounded p-3 w-full my-3">
                        <table className="w-full p-2">
                            <tbody>
                                <tr className="text-center">
                                    <td><span className="font-bold text-4xl">{`${startHours}:${startMinutes}`}</span></td>
                                    <td className="py-2 w-[25%]">
                                        <div className="flex items-center justify-center space-x-2">
                                            <i className="fas fa-dot-circle text-green-700"></i>
                                            <div className="flex-grow border-t-2 border-dashed border-gray-500"></div>
                                            <span className="text-gray-600 text-sm font-mono font-bold">{route.time} giờ</span>
                                            <div className="flex-grow border-t-2 border-dashed border-gray-500"></div>
                                            <i className="fa-solid fa-location-dot text-orange-600 text-xl"></i>
                                        </div>
                                    </td>
                                    <td><span className="font-bold text-4xl">{`${endHours}:${endMinutes}`}</span></td>
                                    <td className="w-[20%]"></td>
                                </tr>
    
                                <tr className="border-b-2 mb-1">
                                    <td className="py-2 text-center">
                                        <span className="text-[15px] text-center">{route.startPoint}</span>
                                    </td>
                                    <td></td>
                                    <td className="py-2 text-center">
                                        <span className="text-[15px] text-center">{route.endPoint}</span>
                                    </td>
                                    <td className="py-2 text-center">
                                        <p className="text-2xl text-center text-orange-600 font-bold">{formattedPrice}đ</p>
                                    </td>
                                </tr>
    
                                <tr className="py-2">
                                    <td className="py-2 text-gray-400 text-sm" colSpan="3">
                                        • {trip.bus.busType} <span className="text-green-600">• {trip.bus.totalSeats} chỗ trống</span>
                                    </td>
                                    <td className="py-2">
                                        <Link to={`/bookingTickets/${trip.tripId}`} className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-full text-white">
                                            Chọn chuyến
                                        </Link>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                );
            })
        );
    };
    

    return (
        <main className="mx-auto w-full md:w-[80%] flex pb-3 " id="busDetail">
            <div class="w-[40%] bg-white p-3 rounded-lg shadow-md">
                <div class="w-full">
                    <div class="flex justify-between items-center border-b pb-3">
                        <span class="font-bold text-xl text-[#043175]">Bộ lọc tìm kiếm</span>
                        <a href="#" class="text-lg text-orange-600 hover:underline">Bỏ lọc</a>
                    </div>

                    <div class="mt-4">
                        <span class="text-lg font-semibold text-gray-700">Giờ đi</span>
                        <div class="grid grid-cols-1 gap-y-2 mt-2 pl-2">
                            <label class="flex items-center space-x-3 cursor-pointer">
                                <input type="checkbox" class="accent-orange-700 w-4 h-4" />
                                <span class="text-[18px]">Sáng sớm 00:00 - 06:00 (0)</span>
                            </label>
                            <label class="flex items-center space-x-3 cursor-pointer">
                                <input type="checkbox" class="accent-orange-700 w-4 h-4" />
                                <span class="text-[18px]">Buổi sáng 06:00 - 12:00 (0)</span>
                            </label>
                            <label class="flex items-center space-x-3 cursor-pointer">
                                <input type="checkbox" class="accent-orange-700 w-4 h-4" />
                                <span class="text-[18px]">Buổi chiều 12:00 - 18:00 (0)</span>
                            </label>
                            <label class="flex items-center space-x-3 cursor-pointer">
                                <input type="checkbox" class="accent-orange-700 w-4 h-4" />
                                <span class="text-[18px]">Buổi tối 18:00 - 24:00 (0)</span>
                            </label>
                        </div>
                    </div>

                    <div class="mt-6">
                        <span class="text-lg font-semibold text-gray-700">Loại xe</span>
                        <div class="flex flex-wrap gap-3 mt-3">
                            <button class="border px-4 py-2 rounded-md text-orange-600 border-orange-300 bg-orange-50 hover:bg-orange-100">Ghế</button>
                            <button class="border px-4 py-2 rounded-md text-orange-600 border-orange-300 bg-orange-50 hover:bg-orange-100">Giường</button>
                            <button class="border px-4 py-2 rounded-md text-orange-600 border-orange-300 bg-orange-50 hover:bg-orange-100">Limousine</button>
                        </div>
                    </div>

                    <div class="mt-6">
                        <span class="text-lg font-semibold text-gray-700">Tầng</span>
                        <div class="flex flex-wrap gap-2 mt-3">
                            <button class="border px-4 py-2 rounded-md text-gray-700 border-gray-300 hover:bg-gray-100">Tầng trên</button>
                            <button class="border px-4 py-2 rounded-md text-gray-700 border-gray-300 hover:bg-gray-100">Tầng dưới</button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="w-full p-4 ">
                <h1 className="font-awesome text-[30px] font-bold pt-2">Điểm xuất phát - Điểm đến</h1>
                {renderTrips()}
            </div>
        </main>
    )
}
export default Bus;