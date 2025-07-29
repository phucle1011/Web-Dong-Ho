import { useEffect, useState, useMemo } from "react";
import Layout from "../../Partials/LayoutHomeThree";
import { FaGavel } from "react-icons/fa";
import { toast } from "react-toastify";
import { decodeToken } from "../../Helpers/jwtDecode";
import { Star, StarHalf, Star as StarOutline } from "lucide-react";
import axios from "axios";
import Constants from "../../../../Constants";

export default function AuctionRoom() {

    const [activeAuction, setActiveAuction] = useState(null);
    const [loadingAuction, setLoadingAuction] = useState(true);

    const [bids, setBids] = useState([]);
    const [currentPrice, setCurrentPrice] = useState(0);
    const [user] = useState(decodeToken(localStorage.getItem("token")));

    const [bidStep, setBidStep] = useState(5_000_000);
    const [stepCount, setStepCount] = useState(2);

    const [selectedImage, setSelectedImage] = useState("");
    const [images, setImages] = useState([]);

    const [showFullShortDesc, setShowFullShortDesc] = useState(false);
    const [showFullName, setShowFullName] = useState(false);

    const incrementAmount = bidStep * stepCount;
    const newBidPrice = currentPrice + incrementAmount;

    const [showAllAttributes, setShowAllAttributes] = useState(false);

    const formatVnd = (n) => (Number(n) || 0).toLocaleString("vi-VN") + " ₫";

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
        fetchActiveAuction();
    }, []);

    const fetchActiveAuction = async () => {
        try {
            setLoadingAuction(true);

            const res = await axios.get(`${Constants.DOMAIN_API}/admin/auctions`, {
                params: { status: "active", limit: 1 },
            });

            const auction = res.data?.data?.[0];
            if (!auction) {
                setActiveAuction(null);
                toast.info("Hiện không có phiên đấu giá nào đang diễn ra.");
                return;
            }

            setActiveAuction(auction);

            const startPrice = Number(auction.start_price || 0);
            const variantPrice = Number(auction.variant?.price || 0);
            const initialPrice = startPrice || variantPrice || 0;
            setCurrentPrice(initialPrice);

            if (auction.priceStep) setBidStep(Number(auction.priceStep));

            const imgList = [];
            if (auction.variant?.product?.thumbnail) imgList.push(auction.variant.product.thumbnail);

            if (imgList.length === 0) {
                imgList.push("https://via.placeholder.com/800x600?text=No+Image");
            }
            setImages(imgList);
            setSelectedImage(imgList[0]);
        } catch (error) {
            console.error("Lỗi lấy phiên đang diễn ra:", error);
            toast.error("Không thể tải phiên đấu giá đang diễn ra.");
        } finally {
            setLoadingAuction(false);
        }
    };

    const shortDescription = useMemo(() => {
        const desc = activeAuction?.variant?.product?.short_description || "";

        return desc || "Sản phẩm đang được đấu giá với nhiều ưu đãi hấp dẫn.";
    }, [activeAuction]);


    const handleBid = () => {
        if (!activeAuction) {
            toast.warning("Chưa có phiên đấu giá để đặt giá.");
            return;
        }
        if (newBidPrice <= currentPrice) {
            toast.warning("Giá đấu phải cao hơn giá hiện tại");
            return;
        }
        const newBid = {
            user: user?.name || "Người dùng ẩn danh",
            amount: newBidPrice,
            time: new Date().toLocaleTimeString("vi-VN"),
        };
        setBids((prev) => [newBid, ...prev]);
        setCurrentPrice(newBidPrice);
        setStepCount(1);
    };


    const productName = activeAuction?.variant?.product?.name || "Sản phẩm";
    const productSku = activeAuction?.variant?.sku ? ` (${activeAuction.variant.sku})` : "";
    const fullName = productName + productSku;
    const brand = activeAuction?.variant?.product?.brand.name;
    const selectedVariant = activeAuction?.variant;

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
                {loadingAuction ? (
                    <div className="text-center text-gray-500 py-12">Đang tải phiên đang diễn ra...</div>
                ) : !activeAuction ? (
                    <div className="text-center text-gray-500 py-12">
                        Hiện không có phiên đấu giá nào đang diễn ra.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        <div className="lg:col-span-2">
                            <div className="border p-6 rounded-xl shadow">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                                    <div>
                                        <div className="w-full h-[480px] border border-gray-300 flex justify-center items-center overflow-hidden relative mb-3 rounded-lg">
                                            <img src={selectedImage} alt="Selected" className="object-contain max-h-full" />
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
                                            Danh mục: {activeAuction?.variant?.product?.category.name || "Khác"}
                                        </span>

                                        <p
                                            className={`text-xl font-medium text-black mb-2 ${showFullName ? "" : "line-clamp-2"
                                                }`}
                                            title={fullName}
                                        >
                                            {fullName}
                                        </p>
                                        {fullName.length > 50 && (
                                            <button
                                                className="text-blue-600 text-sm font-medium"
                                                onClick={() => setShowFullName((v) => !v)}
                                            >
                                                {showFullName ? "Ẩn bớt" : "Xem thêm"}
                                            </button>
                                        )}

                                        {/* Mô tả ngắn: xem thêm/thu gọn */}
                                        <div className="mb-4 text-sm text-gray-600">
                                            {showFullShortDesc || shortDescription.length <= 100
                                                ? shortDescription
                                                : shortDescription.slice(0, 100) + "..."}
                                            {shortDescription.length > 100 && (
                                                <button
                                                    onClick={() => setShowFullShortDesc(!showFullShortDesc)}
                                                    className="text-blue-600 text-sm font-medium"
                                                >
                                                    {showFullShortDesc ? "Thu gọn" : "Xem thêm"}
                                                </button>
                                            )}
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
                                                    {(selectedVariant?.attributeValues || [])
                                                        .slice(0, showAllAttributes ? undefined : 2)
                                                        .map((av) => {
                                                            const attrName = av?.attribute?.name || "";
                                                            const value = av?.value || "";

                                                            const isColor =
                                                                attrName.trim().toLowerCase() === "màu sắc" ||
                                                                attrName.trim().toLowerCase() === "color";

                                                            const looksLikeHex = /^#([0-9A-F]{3}){1,2}$/i.test(value);
                                                            const looksLikeRgb = /^rgb(a)?\(/i.test(value);
                                                            const looksLikeColorName = /^[a-zA-Z]+$/.test(value);

                                                            const showColorChip =
                                                                isColor && (looksLikeHex || looksLikeRgb || looksLikeColorName);

                                                            return (
                                                                <tr key={av.id}>
                                                                    <td className="p-2 border">{attrName || "—"}</td>
                                                                    <td className="p-2 border">
                                                                        {showColorChip ? (
                                                                            <div className="flex items-center gap-2">
                                                                                <div
                                                                                    className="w-6 h-6 rounded border border-gray-400"
                                                                                    style={{ backgroundColor: value }}
                                                                                    title={value}
                                                                                />
                                                                            </div>
                                                                        ) : (
                                                                            <span>{value || "—"}</span>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}

                                                    {(!selectedVariant?.attributeValues ||
                                                        selectedVariant.attributeValues.length === 0) && (
                                                            <tr>
                                                                <td colSpan={2} className="p-2 text-gray-500 italic">
                                                                    Chưa có thuộc tính cho biến thể này.
                                                                </td>
                                                            </tr>
                                                        )}
                                                </tbody>
                                                {selectedVariant?.attributeValues?.length > 2 && (
                                                    <div className="text-center mt-2">
                                                        <button
                                                            onClick={() => setShowAllAttributes((prev) => !prev)}
                                                            className="text-blue-600 text-sm font-medium"
                                                        >
                                                            {showAllAttributes ? "Ẩn bớt" : "Xem thêm"}
                                                        </button>
                                                    </div>
                                                )}
                                            </table>
                                        </div>

                                        <div className="mt-6 text-sm text-gray-700">
                                            <p>
                                                <strong>Thương hiệu: </strong> {brand}
                                            </p>
                                        </div>

                                        <div className="mt-6 text-sm">
                                            Giá hiện tại:{" "}
                                            <span className="text-red-500 font-bold">{formatVnd(currentPrice)}</span>
                                        </div>

                                        <div className="mt-2 text-sm text-gray-600">
                                            Bước giá: <strong>{formatVnd(bidStep)}</strong>
                                        </div>

                                        <div className="mt-2 text-sm text-gray-600">
                                            Thời gian kết thúc:{" "}
                                            <strong>
                                                {String(activeAuction.end_time).replace("T", " ").substring(0, 19)}
                                            </strong>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div
                                className="prose prose-img:rounded-md transition-all duration-300 overflow-hidden mt-5"
                                dangerouslySetInnerHTML={{
                                    __html: activeAuction?.variant?.product?.description || ""
                                }}
                            />
                        </div>

                        {/* CỘT PHẢI: TRẢ GIÁ + LỊCH SỬ */}
                        <div className="lg:col-span-1">
                            <div className="rounded-2xl bg-slate-900 text-slate-100 p-6 shadow-xl ring-1 ring-slate-800">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-base font-semibold flex items-center gap-2">Giá hiện tại</h2>
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
                                    disabled={!activeAuction}
                                    className="mt-4 w-full h-12 rounded-full font-semibold shadow 
                    bg-blue-200 hover:bg-blue-300 text-blue-900 disabled:opacity-50"
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
                )}
            </div>
        </Layout>
    );
}