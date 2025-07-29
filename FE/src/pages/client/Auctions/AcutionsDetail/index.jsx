import { useEffect, useState } from "react";
import { Star, StarHalf, Star as StarOutline } from "lucide-react";
import Layout from "../../Partials/LayoutHomeThree";
import { FaGavel, FaBookOpen } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function AuctionsDetail() {
    const [selectedImage, setSelectedImage] = useState("https://cdn.jdpower.com/JDPA_2018%20Hyundai%20Sonata%20Front%20Silver.jpg");
    const [showFullShortDesc, setShowFullShortDesc] = useState(false);

    const images = [
        "https://cdn.jdpower.com/JDPA_2018%20Hyundai%20Sonata%20Front%20Silver.jpg",
        "https://cdn.motor1.com/images/mgl/0ANZz/s1/2021-hyundai-sonata-n-line.jpg"
    ];

    const shortDescription = "Đây là mẫu xe hiện đại, thiết kế sang trọng, hiệu suất cao.";

    const renderStars = (avgRating) => {
        const fullStars = Math.floor(avgRating);
        const hasHalfStar = avgRating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        return (
            <>
                {Array(fullStars).fill().map((_, i) => (
                    <Star key={`full-${i}`} className="text-yellow-400 w-4 h-4" />
                ))}
                {hasHalfStar && <StarHalf className="text-yellow-400 w-4 h-4" />}
                {Array(emptyStars).fill().map((_, i) => (
                    <StarOutline key={`empty-${i}`} className="text-gray-300 w-4 h-4" />
                ))}
            </>
        );
    };

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <Layout>
            {/* Banner Đấu Giá + 2 Nút */}
            <div className="relative bg-cover bg-center rounded-b-[80px] pb-24 pt-12 text-white overflow-hidden"
                style={{ backgroundImage: `url("https://res.cloudinary.com/disgf4yl7/image/upload/v1753806364/ayx4l3umypbc3cwswdza.avif")` }}
            >
                <div className="container-x mx-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 px-4 max-w-4xl mx-auto -mt-16 z-10 relative">
                        <div className="bg-white rounded-2xl p-6 text-center shadow-xl hover:shadow-2xl transition transform hover:-translate-y-1 cursor-pointer ring-1 ring-white/10">
                            <FaBookOpen className="text-blue-600 text-4xl mx-auto mb-3" />
                            <h3 className="text-lg font-bold text-gray-800 mb-1">HƯỚNG DẪN ĐẤU GIÁ</h3>
                            <p className="text-gray-500 text-sm">Xem cách tham gia đấu giá</p>
                        </div>
                        <Link
                            to="/room"
                            className="bg-white rounded-2xl p-6 text-center shadow-xl hover:shadow-2xl transition transform hover:-translate-y-1 cursor-pointer ring-1 ring-white/10 block"
                        >
                            <FaGavel className="text-pink-600 text-4xl mx-auto mb-3" />
                            <h3 className="text-lg font-bold text-gray-800 mb-1">VÀO PHÒNG ĐẤU GIÁ</h3>
                            <p className="text-gray-500 text-sm">Tham gia và bắt đầu đấu giá</p>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Chi tiết sản phẩm */}
            <div className="container-x mx-auto py-10">
                <div className="product-view w-full lg:flex justify-between">
                    <div className="lg:w-1/2 xl:mr-[70px] lg:mr-[50px]">
                        <div className="w-full">
                            <div className="w-full h-[600px] border border-gray-300 flex justify-center items-center overflow-hidden relative mb-3">
                                <img src={selectedImage} alt="Selected" className="object-contain" />
                            </div>
                            <div className="overflow-x-auto">
                                <div className="flex gap-2 flex-nowrap">
                                    {images.map((img, index) => (
                                        <div
                                            key={index}
                                            onClick={() => setSelectedImage(img)}
                                            className="w-[110px] h-[110px] p-[15px] border border-gray-300 cursor-pointer flex-shrink-0"
                                        >
                                            <img
                                                src={img}
                                                alt="thumb"
                                                className={`w-full h-full object-contain ${selectedImage !== img ? "opacity-50" : ""}`}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1">
                        <div className="product-details w-full mt-10 lg:mt-0">
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
                                                    <div className="w-6 h-6 rounded border border-gray-400" style={{ backgroundColor: "#d32f2f" }} title="Đỏ"></div>
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
                                <p><strong>Danh mục:</strong> Phương tiện</p>
                                <p><strong>Thương hiệu:</strong> Hyundai</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Các bước tham gia đấu giá */}
            <div className="bg-[#f5f7ff] py-12 px-4 sm:px-10 rounded-2xl shadow-md my-10">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-gray-800">Các Bước Tham Gia Đấu Giá</h2>
                    <p className="text-gray-500 mt-2">3 bước đơn giản</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
                    <div className="flex flex-col items-center">
                        <img src="https://res.cloudinary.com/disgf4yl7/image/upload/v1753802825/sdsl1yjzz8lkbamzuhpj.png" alt="Đăng ký" className="w-24 h-24 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-800">Đăng ký tài khoản</h3>
                        <p className="text-gray-500 mt-1">Tài khoản đăng ký</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <img src="https://res.cloudinary.com/disgf4yl7/image/upload/v1753802875/hol0im8itaz2ui8yxxg4.png" alt="Đăng ký tài sản" className="w-24 h-24 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-800">Đăng ký tài sản</h3>
                        <p className="text-gray-500 mt-1">Lựa chọn tài sản mong muốn đăng ký đấu giá</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <img src="https://res.cloudinary.com/disgf4yl7/image/upload/v1753802913/he80cgvjuqoorjakl7gq.png" alt="Đấu giá" className="w-24 h-24 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-800">Đấu giá</h3>
                        <p className="text-gray-500 mt-1">Đặt giá và chiến thắng</p>
                    </div>
                </div>
            </div>

        </Layout>
    );
}
