import { useEffect, useState } from "react";
import Layout from "../Partials/LayoutHomeThree";
import { FaGavel, FaBookOpen } from "react-icons/fa";
import axios from "axios";
import Constants from "../../../Constants";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const MIN_BALANCE = 10_000_000;

function AuctionProductDetail() {
    const navigate = useNavigate();

    const [otpRequested, setOtpRequested] = useState(false);
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [sendingOtp, setSendingOtp] = useState(false);
    const [verifying, setVerifying] = useState(false);

    const [upcomingAuctions, setUpcomingAuctions] = useState([]);
    const [loadingAuctions, setLoadingAuctions] = useState(true);
    const [showFullName, setShowFullName] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchUpcomingAuctions();
    }, []);

    const fetchUpcomingAuctions = async () => {
        try {
            setLoadingAuctions(true);
            const res = await axios.get(`${Constants.DOMAIN_API}/admin/auctions`, {
                params: { status: "upcoming", limit: 6 },
            });
            setUpcomingAuctions(res.data.data || []);
        } catch (error) {
            console.error("Lỗi khi tải danh sách phiên đấu giá:", error);
            toast.error("Không thể tải danh sách phiên đấu giá.");
        } finally {
            setLoadingAuctions(false);
        }
    };

    const getAuthHeader = () => {
        const token = localStorage.getItem("token");
        if (!token) return null;
        return { Authorization: `Bearer ${token}` };
    };

    const handleEnterAuctionRoom = async () => {
        const headers = getAuthHeader();
        if (!headers) {
            toast.error("Vui lòng đăng nhập để vào phòng đấu giá.");
            return;
        }

        try {
            setLoading(true);
            const balanceRes = await axios.get(`${Constants.DOMAIN_API}/auctions/balance`, { headers });
            const balance = Number(balanceRes.data.balance || 0);

            if (balance < MIN_BALANCE) {
                toast.warning(
                    `Bạn cần ít nhất ${MIN_BALANCE.toLocaleString("vi-VN")} VNĐ trong ví để vào phòng đấu giá. Vui lòng vào ví tiền để nạp tiền vào để tiếp tục thực hiện đấu giá!`
                );
                return;
            }

            setSendingOtp(true);
            const otpRes = await axios.post(`${Constants.DOMAIN_API}/auctions/entry-otp`, {}, { headers });
            toast.success(otpRes.data?.message || "Đã gửi OTP đến email của bạn. Vui lòng kiểm tra hộp thư.");
            setOtpRequested(true);
        } catch (error) {
            console.error("Lỗi khi kiểm tra số dư / gửi OTP:", error);
            const msg =
                error.response?.data?.message ||
                (error.response?.status === 401
                    ? "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
                    : "Có lỗi xảy ra. Vui lòng thử lại.");
            toast.error(msg);
        } finally {
            setSendingOtp(false);
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        const headers = getAuthHeader();
        if (!headers) {
            toast.error("Vui lòng đăng nhập để xác thực.");
            return;
        }

        if (!otp.trim()) {
            toast.warning("Vui lòng nhập mã OTP.");
            return;
        }

        try {
            setVerifying(true);
            const verifyRes = await axios.post(
                `${Constants.DOMAIN_API}/auctions/entry-otp/verify`,
                { otp: otp.trim() },
                { headers }
            );

            toast.success(verifyRes.data?.message || "Xác thực OTP thành công. Đang vào phòng đấu giá...");
            setOtp("");
            setOtpRequested(false);
            navigate("/room");
        } catch (error) {
            console.error("Lỗi xác thực OTP:", error);
            const msg = error.response?.data?.message || "Xác thực OTP thất bại. Vui lòng thử lại.";
            toast.error(msg);
        } finally {
            setVerifying(false);
        }
    };

    const handleCancelOtp = () => {
        setOtp("");
        setOtpRequested(false);
        toast.info("Đã hủy xác thực OTP.");
    };

    return (
        <Layout>
            <div className="flashsale-wrapper w-full">
                <div
                    className="relative bg-cover bg-center rounded-b-[80px] pb-24 pt-12 text-white overflow-hidden"
                    style={{
                        backgroundImage: `url("https://res.cloudinary.com/disgf4yl7/image/upload/v1753806364/ayx4l3umypbc3cwswdza.avif")`,
                    }}
                >
                    <div className="container-x mx-auto">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 px-4 max-w-4xl mx-auto -mt-16 z-10 relative">
                            <div className="bg-white rounded-2xl p-6 text-center shadow-xl hover:shadow-2xl transition transform hover:-translate-y-1 cursor-pointer ring-1 ring-white/10">
                                <FaBookOpen className="text-blue-600 text-4xl mx-auto mb-3" />
                                <h3 className="text-lg font-bold text-gray-800 mb-1">HƯỚNG DẪN ĐẤU GIÁ</h3>
                                <p className="text-gray-500 text-sm">Xem cách tham gia đấu giá</p>
                            </div>

                            <div
                                className={`bg-white rounded-2xl p-6 text-center shadow-xl transition transform hover:-translate-y-1 cursor-pointer ring-1 ring-white/10 ${loading ? "opacity-70 pointer-events-none" : "hover:shadow-2xl"
                                    }`}
                                onClick={handleEnterAuctionRoom}
                                title="Vào phòng đấu giá"
                            >
                                <FaGavel className="text-pink-600 text-4xl mx-auto mb-3" />
                                <h3 className="text-lg font-bold text-gray-800 mb-1">
                                    {sendingOtp ? "ĐANG GỬI OTP..." : "VÀO PHÒNG ĐẤU GIÁ"}
                                </h3>
                                <p className="text-gray-500 text-sm">
                                    {sendingOtp ? "Vui lòng chờ trong giây lát" : "Tham gia và bắt đầu đấu giá"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Danh sách phiên sắp diễn ra */}
                <div className="container-x mx-auto">
                    <h2 className="text-2xl font-bold my-6">Phiên đấu giá sắp diễn ra</h2>

                    {loadingAuctions ? (
                        <p className="text-center text-gray-500">Đang tải dữ liệu...</p>
                    ) : upcomingAuctions.length === 0 ? (
                        <p className="text-center text-gray-500">Hiện không có phiên đấu giá nào sắp diễn ra.</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 my-6">
                            {upcomingAuctions.map((auction) => (
                                <div
                                    key={auction.id}
                                    className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 transition hover:shadow-2xl"
                                >
                                    <div className="relative">
                                        <img
                                            src={auction.variant?.product?.thumbnail || "https://via.placeholder.com/300x200"}
                                            alt={auction.variant?.product?.name}
                                            className="w-full h-48 object-contain bg-gray-100 p-3"
                                        />
                                        <button className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow text-pink-500">
                                            <FaGavel className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="p-4">
                                        <h3
                                            className={`text-lg font-semibold text-gray-800 mb-2 ${showFullName ? "" : "line-clamp-2"
                                                }`}
                                        >
                                            {auction.variant?.product?.name || "Không có tên sản phẩm"}
                                        </h3>

                                        {auction.variant?.product?.name?.length > 40 && (
                                            <button
                                                className="text-blue-500 text-sm"
                                                onClick={() => setShowFullName(!showFullName)}
                                            >
                                                {showFullName ? "Ẩn bớt" : "Xem thêm"}
                                            </button>
                                        )}

                                        <div className="flex justify-between text-sm font-medium mb-2">
                                            <div className="text-green-600">
                                                Giá khởi điểm:{" "}
                                                <strong>
                                                    {Number(auction.variant.price || 0).toLocaleString("vi-VN")} ₫
                                                </strong>
                                            </div>
                                            <div className="text-pink-600">
                                                Bước giá:{" "}
                                                <strong>
                                                    {Number(auction.priceStep || 0).toLocaleString("vi-VN")} ₫
                                                </strong>
                                            </div>
                                        </div>

                                        <div className="text-gray-500 text-sm mb-4">
                                            Thời gian bắt đầu:{" "}
                                            <strong>{auction.start_time.replace("T", " ").substring(0, 19)}</strong>
                                        </div>

                                        <Link
                                            to="/AcutionsDetail"
                                            className="w-full block text-center py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-semibold shadow hover:from-blue-600 hover:to-indigo-700 transition"
                                        >
                                            Xem chi tiết
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-[#f5f7ff] py-12 px-4 sm:px-10 rounded-2xl shadow-md my-10">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold text-gray-800">Các Bước Tham Gia Đấu Giá</h2>
                        <p className="text-gray-500 mt-2">3 bước đơn giản</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">

                        <div className="flex flex-col items-center">
                            <img
                                src="https://res.cloudinary.com/disgf4yl7/image/upload/v1753802825/sdsl1yjzz8lkbamzuhpj.png"
                                alt="Đăng ký"
                                className="w-24 h-24 mb-4"
                            />
                            <h3 className="text-xl font-semibold text-gray-800">Đăng ký tài khoản</h3>
                            <p className="text-gray-500 mt-1">Tài khoản đăng ký</p>
                        </div>

                        <div className="flex flex-col items-center">
                            <img
                                src="https://res.cloudinary.com/disgf4yl7/image/upload/v1753802875/hol0im8itaz2ui8yxxg4.png"
                                alt="Đăng ký tài sản"
                                className="w-24 h-24 mb-4"
                            />
                            <h3 className="text-xl font-semibold text-gray-800">Đăng ký tài sản</h3>
                            <p className="text-gray-500 mt-1">Lựa chọn tài sản mong muốn đăng ký đấu giá</p>
                        </div>

                        <div className="flex flex-col items-center">
                            <img
                                src="https://res.cloudinary.com/disgf4yl7/image/upload/v1753802913/he80cgvjuqoorjakl7gq.png"
                                alt="Đấu giá"
                                className="w-24 h-24 mb-4"
                            />
                            <h3 className="text-xl font-semibold text-gray-800">Đấu giá</h3>
                            <p className="text-gray-500 mt-1">Đặt giá và chiến thắng</p>
                        </div>
                    </div>
                </div>

                {/* Modal nhập OTP */}
                {otpRequested && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                        <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6">
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">Xác thực OTP</h3>
                            <p className="text-gray-600 text-sm mb-4">
                                Mã OTP đã được gửi đến email của bạn. Vui lòng nhập mã để vào phòng đấu giá.
                            </p>

                            <input
                                type="text"
                                inputMode="numeric"
                                maxLength={6}
                                placeholder="Nhập mã OTP (6 số)"
                                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                                disabled={verifying}
                            />

                            <div className="flex items-center justify-end gap-3">
                                <button
                                    className="px-4 py-2 rounded-lg border bg-white hover:bg-gray-50"
                                    onClick={handleCancelOtp}
                                    disabled={verifying}
                                >
                                    Hủy
                                </button>
                                <button
                                    className={`px-5 py-2 rounded-lg text-white ${verifying ? "bg-blue-300" : "bg-blue-600 hover:bg-blue-700"
                                        }`}
                                    onClick={handleVerifyOtp}
                                    disabled={verifying || !otp.trim()}
                                >
                                    {verifying ? "Đang xác thực..." : "Xác nhận"}
                                </button>
                            </div>

                            <p className="text-xs text-gray-500 mt-3">
                                * OTP có hiệu lực trong 10 phút. Nếu không nhận được email, hãy kiểm tra hộp thư rác (Spam).
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}

export default AuctionProductDetail;