import { useEffect, useState } from "react";
import Layout from "../../Partials/LayoutHomeThree";
import { FaGavel } from "react-icons/fa";
import { toast } from "react-toastify";
import { decodeToken } from "../../Helpers/jwtDecode";
import { Star, StarHalf, Star as StarOutline } from "lucide-react";
import useCountDown from "../../Helpers/CountDown";

export default function AuctionRoom() {

    const [bids, setBids] = useState([]);
    const [currentPrice, setCurrentPrice] = useState(65_000_000);
    const [user] = useState(decodeToken(localStorage.getItem("token")));

    const [bidStep] = useState(5_000_000);
    const [stepCount, setStepCount] = useState(2);

    const formatVnd = (n) => n.toLocaleString("vi-VN") + " ₫";
    const incrementAmount = bidStep * stepCount;
    const newBidPrice = currentPrice + incrementAmount;

    const toVietnameseMillions = (n) => {
        if (n % 1_000_000 !== 0) return null;
        const millions = Math.round(n / 1_000_000);

        const d = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
        const read2 = (x) => {
            if (x < 10) return d[x];
            const ch = Math.floor(x / 10), dv = x % 10;
            if (ch === 1) return "mười" + (dv ? " " + (dv === 5 ? "lăm" : dv === 1 ? "mốt" : d[dv]) : "");
            return d[ch] + " mươi" + (dv ? " " + (dv === 5 ? "lăm" : dv === 1 ? "mốt" : d[dv]) : "");
        };
        const read3 = (x) => {
            if (x < 10) return d[x];
            if (x < 100) return read2(x);
            const tr = Math.floor(x / 100), du = x % 100;
            return d[tr] + " trăm" + (du ? " " + (du < 10 ? "lẻ " + d[du] : read2(du)) : "");
        };
        return (read3(millions) + " triệu đồng").replace(/\s+/g, " ").trim();
    };
    const amountInWords = toVietnameseMillions(newBidPrice);

    const [selectedImage, setSelectedImage] = useState(
        "https://cdn.jdpower.com/JDPA_2018%20Hyundai%20Sonata%20Front%20Silver.jpg"
    );
    const images = [
        "https://cdn.jdpower.com/JDPA_2018%20Hyundai%20Sonata%20Front%20Silver.jpg",
        "https://cdn.motor1.com/images/mgl/0ANZz/s1/2021-hyundai-sonata-n-line.jpg",
    ];
    const [showFullShortDesc, setShowFullShortDesc] = useState(false);
    const shortDescription =
        "Đây là mẫu xe hiện đại, thiết kế sang trọng, hiệu suất cao.";

    const renderStars = (avgRating) => {
        const full = Math.floor(avgRating);
        const half = avgRating % 1 >= 0.5;
        const empty = 5 - full - (half ? 1 : 0);
        return (
            <>
                {Array(full)
                    .fill()
                    .map((_, i) => (
                        <Star key={`f-${i}`} className="text-yellow-400 w-4 h-4" />
                    ))}
                {half && <StarHalf className="text-yellow-400 w-4 h-4" />}
                {Array(empty)
                    .fill()
                    .map((_, i) => (
                        <StarOutline key={`e-${i}`} className="text-gray-300 w-4 h-4" />
                    ))}
            </>
        );
    };

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleBid = () => {
        if (newBidPrice <= currentPrice) {
            toast.warning("Giá đấu phải cao hơn giá hiện tại");
            return;
        }
        const newBid = {
            user: user?.name || "Người dùng ẩn danh",
            amount: newBidPrice,
            time: new Date().toLocaleTimeString("vi-VN"),
        };
        setBids([newBid, ...bids]);
        setCurrentPrice(newBidPrice);
        setStepCount(1);
    };

    return (
        <Layout>

            <div
                className="relative bg-center bg-cover h-[400px] flex items-center justify-center text-white text-4xl font-bold"
                style={{
                    backgroundImage:
                        "url('https://res.cloudinary.com/disgf4yl7/image/upload/v1753806364/ayx4l3umypbc3cwswdza.avif')",
                }}
            >
                <div className="bg-black bg-opacity-50 px-6 py-3 rounded">
                    Phòng Đấu Giá Trực Tuyến
                </div>
            </div>


            <div className="container-x mx-auto py-12 px-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <div className="border p-6 rounded-xl shadow">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div>
                                    <div className="w-full h-[480px] border border-gray-300 flex justify-center items-center overflow-hidden relative mb-3 rounded-lg">
                                        <img src={selectedImage} alt="Selected" className="object-contain" />
                                    </div>
                                    <div className="overflow-x-auto">
                                        <div className="flex gap-2 flex-nowrap">
                                            {images.map((img, index) => (
                                                <div
                                                    key={index}
                                                    onClick={() => setSelectedImage(img)}
                                                    className="w-[110px] h-[110px] p-[15px] border border-gray-300 cursor-pointer flex-shrink-0 rounded"
                                                >
                                                    <img
                                                        src={img}
                                                        alt="thumb"
                                                        className={`w-full h-full object-contain ${selectedImage !== img ? "opacity-50" : ""
                                                            }`}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <span className="text-gray-500 text-xs font-normal uppercase tracking-wider mb-2 inline-block">
                                        Danh mục: Phương tiện
                                    </span>
                                    <p className="text-xl font-medium text-black mb-2">
                                        2018 Hyundai Sonata
                                    </p>

                                    <div className="mb-4 text-sm text-gray-600">
                                        {showFullShortDesc || shortDescription.length <= 30
                                            ? shortDescription
                                            : shortDescription.slice(0, 30) + "..."}
                                        {shortDescription.length > 30 && (
                                            <button
                                                onClick={() => setShowFullShortDesc(!showFullShortDesc)}
                                                className="ml-2 text-blue-600 font-medium"
                                            >
                                                {showFullShortDesc ? "Thu gọn" : "Xem thêm"}
                                            </button>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="flex">{renderStars(4.5)}</div>
                                        <span className="text-sm text-gray-600">32 đánh giá</span>
                                    </div>

                                    <div className="mt-4">
                                        <h4 className="font-semibold mb-2">Thông tin biến thể</h4>
                                        <table className="w-full text-left border border-gray-300 rounded overflow-hidden text-sm">
                                            <thead className="bg-gray-100">
                                                <tr>
                                                    <th className="p-2 border">Tên thuộc tính</th>
                                                    <th className="p-2 border">Giá trị</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td className="p-2 border">Màu sắc</td>
                                                    <td className="p-2 border">
                                                        <div className="flex items-center gap-2">
                                                            <div
                                                                className="w-6 h-6 rounded border border-gray-400"
                                                                style={{ backgroundColor: "#d32f2f" }}
                                                                title="Đỏ"
                                                            ></div>
                                                        </div>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="p-2 border">Động cơ</td>
                                                    <td className="p-2 border">2.0 Turbo</td>
                                                </tr>
                                                <tr>
                                                    <td className="p-2 border">Năm</td>
                                                    <td className="p-2 border">2018</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="mt-6 text-sm text-gray-700">
                                        <p>
                                            <strong>Danh mục:</strong> Phương tiện
                                        </p>
                                        <p>
                                            <strong>Thương hiệu:</strong> Hyundai
                                        </p>
                                    </div>

                                    <div className="mt-6 text-base">
                                        Giá hiện tại:{" "}
                                        <span className="text-red-500 font-bold">
                                            {formatVnd(currentPrice)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="rounded-2xl bg-slate-900 text-slate-100 p-6 shadow-xl ring-1 ring-slate-800">
                            <div className="flex items-center justify-between">
                                <h2 className="text-base font-semibold flex items-center gap-2">
                                    Giá hiện tại
                                </h2>
                                <div className="text-lg font-bold">{formatVnd(currentPrice)}</div>
                            </div>

                            <div className="mt-4">
                                <div className="text-xs text-slate-400 mb-2">Bước giá</div>
                                <div className="flex items-center justify-between gap-3">

                                    <div className="px-4 py-2 bg-slate-800 rounded-lg font-semibold">
                                        {bidStep.toLocaleString("vi-VN")}
                                    </div>

                                    <div className="text-slate-400 font-bold">×</div>

                                    <div className="flex items-center gap-3 bg-slate-800 rounded-lg px-3 py-2">
                                        <button
                                            type="button"
                                            onClick={() => setStepCount((c) => Math.max(1, c - 1))}
                                            className="w-7 h-7 grid place-content-center rounded-full border border-slate-600 text-slate-200"
                                            aria-label="Giảm"
                                        >
                                            –
                                        </button>
                                        <div className="min-w-[24px] text-center font-semibold">{stepCount}</div>
                                        <button
                                            type="button"
                                            onClick={() => setStepCount((c) => Math.min(99, c + 1))}
                                            className="w-7 h-7 grid place-content-center rounded-full border border-slate-600 text-emerald-400"
                                            aria-label="Tăng"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="my-4 h-px bg-slate-800" />

                            <div className="text-center text-slate-300 font-medium">
                                {incrementAmount.toLocaleString("vi-VN")}
                            </div>

                            <button
                                type="button"
                                onClick={handleBid}
                                className="mt-4 w-full h-12 rounded-full font-semibold shadow 
                                bg-blue-200 hover:bg-blue-300 text-blue-900"
                            >
                                Trả giá <span className="font-extrabold">{formatVnd(newBidPrice)}</span>
                            </button>

                            <div className="mt-2 text-center text-slate-400 text-sm">
                                {amountInWords || `${formatVnd(newBidPrice)} (đồng)`}
                            </div>
                        </div>

                        <div className="mt-6 border p-4 rounded-xl shadow max-h-[300px] overflow-y-auto">
                            <h3 className="text-lg font-bold mb-2">Lịch sử đấu giá</h3>
                            {bids.length === 0 ? (
                                <p className="text-gray-500">Chưa có ai đặt giá</p>
                            ) : (
                                <ul className="text-sm space-y-2">
                                    {bids.map((bid, idx) => (
                                        <li key={idx} className="flex justify-between border-b pb-1">
                                            <span className="truncate max-w-[40%]">{bid.user}</span>
                                            <span className="text-blue-600 font-medium">
                                                {bid.amount.toLocaleString("vi-VN")}đ
                                            </span>
                                            <span className="text-gray-400 text-xs">{bid.time}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
