function Blog () {
    return(
<main className="home mx-auto w-full md:w-[80%] mb-5 px-4 mt-[11%]">
        <div className="bg-white rounded-lg p-3 mb-3">
            <div className="flex flex-col md:flex-row">
                <aside className="w-full md:w-1/4 p-4 bg-gray-100 mr-5 mt-2">
                    <h4 className="text-xl font-bold text-orange-500 border-b-4 border-orange-500 inline-block pb-1 mb-3">
                        Tin Tức Mới Nhất
                    </h4>
                    <ul className="space-y-3">
                        <li className="flex items-center">
                            <a href="#" className="flex items-center text-gray-800 hover:text-blue-600">
                                <img src="/assets/images/main/tintuc4.jpeg" alt="Bài viết 1"
                                    className="w-12 h-12 object-cover rounded mr-3" width="40"/>
                                <span className="ml-2 line-clamp-2">Siêu ưu đãi đặt vé xe khách trên VNPAY</span>
                            </a>
                        </li>
                        <li className="flex items-center">
                            <a href="#" className="flex items-center text-gray-800 hover:text-blue-600">
                                <img src="/assets/images/main/tintuc3.jpeg" alt="Bài viết 2"
                                    className="w-12 h-12 object-cover rounded mr-3" width="40"/>
                                <span className="ml-2 line-clamp-2">Những sự kiện khuyến mãi không thể bỏ lỡ</span>
                            </a>
                        </li>
                        <li className="flex items-center">
                            <a href="#" className="flex items-center text-gray-800 hover:text-blue-600">
                                <img src="/assets/images/main/tintuc5.jpeg" alt="Bài viết 3"
                                    className="w-12 h-12 object-cover rounded mr-3" width="40"/>
                                <span className="ml-2 line-clamp-2">Thuê xe du lịch: ghế ngồi, giường nằm</span>
                            </a>
                        </li>
                    </ul>                    

                    <h5
                        className="text-xl font-bold text-orange-500 border-b-4 border-orange-500 inline-block pb-1 mb-1 mt-3">
                        Danh Mục Tin Tức</h5>
                        <ul className="space-y-3">
                            <li className="flex items-center">
                                <a href="#" className="flex items-center text-gray-800 hover:text-blue-600">
                                    <img src="/assets/images/main/tintuc6.webp" alt="Sách Mới"
                                        className="w-12 h-12 object-cover rounded mr-3" width="50"/>
                                    <span className="ml-2 line-clamp-2">Tuyển dụng tài xế lái xe</span>
                                </a>
                            </li>
                            <li className="flex items-center">
                                <a href="#" className="flex items-center text-gray-800 hover:text-blue-600">
                                    <img src="/assets/images/main/tintuc7.webp" alt="Sách Mới"
                                        className="w-12 h-12 object-cover rounded mr-3" width="50"/>
                                    <span className="ml-2 line-clamp-2">Các chương trình khuyến mãi</span>
                                </a>
                            </li>
                            <li className="flex items-center">
                                <a href="#" className="flex items-center text-gray-800 hover:text-blue-600">
                                    <img src="/assets/images/main/tintuc8.webp" alt="Tác Giả"
                                        className="w-12 h-12 object-cover rounded mr-3" width="50"/>
                                    <span className="ml-2 line-clamp-2">Tuyến TP. Hồ Chí Minh - TP. Cần Thơ</span>
                                </a>
                            </li>
                        </ul>                        
                </aside>

                <section className="w-full md:w-3/4 p-4">
                    <h2 className="text-3xl font-bold text-orange-500 border-b-4 border-orange-500 inline-block pb-1 mb-3">
                        Tất cả tin Tức
                    </h2>
                    <div className="grid grid-cols-1 gap-6">
                        <div className="flex items-center space-x-4 ">
                            <a href="#">
                                <img src="/assets/images/main/tintuc2.jpg" alt="Sách Bán Chạy"
                                    className="w-80 h-32 object-cover rounded" width="350" />
                            </a>
                            <div>
                                <h3 className="text-base font-semibold line-clamp-3 ">
                                    SIÊU ƯU ĐÃI ĐẶT VÉ XE KHÁCH TRÊN VÍ VNPAY - MUA NHIỀU TẶNG NHIỀU!
                                </h3>
                                <p className="text-gray-600 line-clamp-3">
                                    Từ nay đến 31/04/2025, ví VNPAY triển khai chương trình ưu đãi đặc biệt: mua 3 vé tặng 1 vé, mua 6 vé tặng 2 vé. Ưu đãi áp dụng trong khung giờ từ 11h đến 12h mỗi ngày và số lượng có hạn. Nhanh tay đặt vé để không bỏ lỡ cơ hội tiết kiệm chi phí di chuyển!
                                </p>
                                <span className="text-sm text-gray-500">Ngày đăng: 01/01/2025</span>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                            <a href="#">
                                <img src="/assets/images/main/tintuc2.jpg" alt="Sách Bán Chạy"
                                    className="w-80 h-32 object-cover rounded" width="350" />
                            </a>
                            <div>
                                <h3 className="text-base font-semibold line-clamp-3">
                                    SIÊU ƯU ĐÃI ĐẶT VÉ XE KHÁCH TRÊN VÍ VNPAY - MUA NHIỀU TẶNG NHIỀU!
                                </h3>
                                <p className="text-gray-600 line-clamp-3">
                                    Từ nay đến 31/04/2025, ví VNPAY triển khai chương trình ưu đãi đặc biệt: mua 3 vé tặng 1 vé, mua 6 vé tặng 2 vé. Ưu đãi áp dụng trong khung giờ từ 11h đến 12h mỗi ngày và số lượng có hạn. Nhanh tay đặt vé để không bỏ lỡ cơ hội tiết kiệm chi phí di chuyển!
                                </p>
                                <span className="text-sm text-gray-500">Ngày đăng: 01/01/2025</span>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <a href="#">
                                <img src="/assets/images/main/tintuc2.jpg" alt="Sách Bán Chạy"
                                    className="w-80 h-32 object-cover rounded" width="350" />
                            </a>
                            <div>
                                <h3 className="text-base font-semibold line-clamp-3">
                                    SIÊU ƯU ĐÃI ĐẶT VÉ XE KHÁCH TRÊN VÍ VNPAY - MUA NHIỀU TẶNG NHIỀU!
                                </h3>
                                <p className="text-gray-600 line-clamp-3">
                                    Từ nay đến 31/04/2025, ví VNPAY triển khai chương trình ưu đãi đặc biệt: mua 3 vé tặng 1 vé, mua 6 vé tặng 2 vé. Ưu đãi áp dụng trong khung giờ từ 11h đến 12h mỗi ngày và số lượng có hạn. Nhanh tay đặt vé để không bỏ lỡ cơ hội tiết kiệm chi phí di chuyển!
                                </p>
                                <span className="text-sm text-gray-500">Ngày đăng: 01/01/2025</span>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <a href="#">
                                <img src="/assets/images/main/tintuc2.jpg" alt="Sách Bán Chạy"
                                    className="w-80 h-32 object-cover rounded" width="350" />
                            </a>
                            <div>
                                <h3 className="text-base font-semibold line-clamp-3">
                                    SIÊU ƯU ĐÃI ĐẶT VÉ XE KHÁCH TRÊN VÍ VNPAY - MUA NHIỀU TẶNG NHIỀU!
                                </h3>
                                <p className="text-gray-600 line-clamp-3">
                                    Từ nay đến 31/04/2025, ví VNPAY triển khai chương trình ưu đãi đặc biệt: mua 3 vé tặng 1 vé, mua 6 vé tặng 2 vé. Ưu đãi áp dụng trong khung giờ từ 11h đến 12h mỗi ngày và số lượng có hạn. Nhanh tay đặt vé để không bỏ lỡ cơ hội tiết kiệm chi phí di chuyển!
                                </p>
                                <span className="text-sm text-gray-500">Ngày đăng: 01/01/2025</span>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <a href="#">
                                <img src="/assets/images/main/tintuc2.jpg" alt="Sách Bán Chạy"
                                    className="w-80 h-32 object-cover rounded" width="350" />
                            </a>
                            <div>
                                <h3 className="text-base font-semibold line-clamp-3">
                                    SIÊU ƯU ĐÃI ĐẶT VÉ XE KHÁCH TRÊN VÍ VNPAY - MUA NHIỀU TẶNG NHIỀU!
                                </h3>
                                <p className="text-gray-600 line-clamp-3">
                                    Từ nay đến 31/04/2025, ví VNPAY triển khai chương trình ưu đãi đặc biệt: mua 3 vé tặng 1 vé, mua 6 vé tặng 2 vé. Ưu đãi áp dụng trong khung giờ từ 11h đến 12h mỗi ngày và số lượng có hạn. Nhanh tay đặt vé để không bỏ lỡ cơ hội tiết kiệm chi phí di chuyển!
                                </p>
                                <span className="text-sm text-gray-500">Ngày đăng: 01/01/2025</span>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <a href="#">
                                <img src="/assets/images/main/tintuc2.jpg" alt="Sách Bán Chạy"
                                    className="w-80 h-32 object-cover rounded" width="350" />
                            </a>
                            <div>
                                <h3 className="text-base font-semibold line-clamp-3">
                                    SIÊU ƯU ĐÃI ĐẶT VÉ XE KHÁCH TRÊN VÍ VNPAY - MUA NHIỀU TẶNG NHIỀU!
                                </h3>
                                <p className="text-gray-600 line-clamp-3">
                                    Từ nay đến 31/04/2025, ví VNPAY triển khai chương trình ưu đãi đặc biệt: mua 3 vé tặng 1 vé, mua 6 vé tặng 2 vé. Ưu đãi áp dụng trong khung giờ từ 11h đến 12h mỗi ngày và số lượng có hạn. Nhanh tay đặt vé để không bỏ lỡ cơ hội tiết kiệm chi phí di chuyển!
                                </p>
                                <span className="text-sm text-gray-500">Ngày đăng: 01/01/2025</span>
                            </div>
                        </div>
                    </div>
                    
                </section>
            </div>
        </div>
    </main>
    )
}

export default Blog;