import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import ProductCardStyleOne from "../Helpers/Cards/ProductCardStyleOne";
import useCountDown from "../Helpers/CountDown";
import axios from "axios";
import Constants from "../../../Constants";
import Layout from "../Partials/LayoutHomeThree";
import { FaGavel, FaStar, FaBookOpen } from "react-icons/fa";

function AuctionProductDetail() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

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
  {/* Hướng dẫn */}
  <div className="bg-white rounded-2xl p-6 text-center shadow-xl hover:shadow-2xl transition transform hover:-translate-y-1 cursor-pointer ring-1 ring-white/10">
    <FaBookOpen className="text-blue-600 text-4xl mx-auto mb-3" />
    <h3 className="text-lg font-bold text-gray-800 mb-1">HƯỚNG DẪN ĐẤU GIÁ</h3>
    <p className="text-gray-500 text-sm">Xem cách tham gia đấu giá</p>
  </div>

  {/* Phòng đấu giá */}
  <div className="bg-white rounded-2xl p-6 text-center shadow-xl hover:shadow-2xl transition transform hover:-translate-y-1 cursor-pointer ring-1 ring-white/10">
    <FaGavel className="text-pink-600 text-4xl mx-auto mb-3" />
    <h3 className="text-lg font-bold text-gray-800 mb-1">VÀO PHÒNG ĐẤU GIÁ</h3>
    <p className="text-gray-500 text-sm">Tham gia và bắt đầu đấu giá</p>
  </div>
</div>
                    </div>

                </div>
                <div className="container-x mx-auto">
                    <div className="w-full">

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 my-10">
                            {[1, 2, 3].map((item, index) => (
                                <div
                                    key={index}
                                    className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 transition hover:shadow-2xl"
                                >
                                    {/* Hình ảnh */}
                                    <div className="relative">
                                        <img
                                            src="https://cdn.jdpower.com/JDPA_2018%20Hyundai%20Sonata%20Front%20Silver.jpg"
                                            alt="Car"
                                            className="w-full h-48 object-contain bg-gray-100 p-3"
                                        />

                                        <button className="absolute top-2 right-2 bg-white p-2 rounded-full shadow text-yellow-400">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="w-5 h-5"
                                                fill="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path d="M12 .587l3.668 7.431L24 9.587l-6 5.847 1.416 8.27L12 18.897l-7.416 4.807L6 15.434 0 9.587l8.332-1.569z" />
                                            </svg>
                                        </button>

                                        <button className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow text-pink-500">
                                            <FaGavel className="w-5 h-5" />
                                        </button>

                                    </div>

                                    <div className="p-4">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                            2018 Hyundai Sonata
                                        </h3>

                                        <div className="flex justify-between text-sm font-medium mb-2">
                                            <div className="flex items-center text-green-600">
                                                <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M4 2a1 1 0 011 1v1h10V3a1 1 0 112 0v1a2 2 0 01-2 2H5a2 2 0 01-2-2V3a1 1 0 011-1zM3 9a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm1 4a1 1 0 000 2h12a1 1 0 100-2H4z" /></svg>
                                                <span>Current Bid: <strong>$876.00</strong></span>
                                            </div>
                                            <div className="text-red-500">
                                                Buy Now: <strong>$5,000.00</strong>
                                            </div>
                                        </div>

                                        <div className="flex justify-between text-sm mb-4">
                                            <div className="text-pink-600">0d : 2h : 13m : 34s</div>
                                            <div className="text-green-600">30 Bids</div>
                                        </div>

                                        <button className="w-full py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-semibold shadow hover:from-blue-600 hover:to-indigo-700 transition">
                                            Xem chi tiết
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
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
            </div>
        </Layout>
    );
}

export default AuctionProductDetail;
