import axios from "axios";
import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import Constants from "../../../Constants";

const URL = Constants.DOMAIN_API;
const ENDPOINT = "admin/routes"
function Home() {
    const [startPointOptions, setStartPointOptions] = useState([]);
    const [endPointOptions, setEndPointOptions] = useState([]);
    const [selectedStartPoint, setSelectedStartPoint] = useState(null);
    const [selectedEndPoint, setSelectedEndPoint] = useState(null);
    const navigator = useNavigate();



    const handleSearch = async (props) => {
        try {
            const response = await axios.post('http://localhost:3000/bus/search', {
                startPoint: props.startPoint,
                endPoint: props.endPoint,
            });
    
            if (response.data.success) {
                console.log('Kết quả:', response.data.data);
                navigator('/bus', {
                    state: { tripsData: response.data.data }
                });
            } else {
                console.error('Lỗi từ server:', response.data.message);
            }
        } catch (err) {
            console.error('Lỗi khi tìm kiếm:', err.response?.data || err.message);
        }
    };
    
    return (
        <main class="home mx-auto w-full md:w-[80%] mb-5 px-4" id="home">
            <div
                class="bg-white p-2 rounded-lg shadow mt-4 text-center mx-auto">
                <h2 class="text-xl md:text-2xl font-bold text-[#003b95]">TẠI SAO LẠI LỰA CHỌN CHÚNG TÔI?</h2>
                <p class="mb-4">Chúng tôi cam kết mang đến dịch vụ tốt nhất cho
                    khách hàng</p>
                <div
                    class="flex flex-col md:flex-row gap-6 justify-center items-start p-4">
                    <div
                        class="flex items-start text-left rounded-lg shadow-md w-full md:w-1/3">
                        <img src="./assets/images/main/icon1.webp"
                            alt class="w-20 h-20 mb-2" />
                        <p class="max-w-xs"><strong>Đáp ứng mọi nhu cầu của
                            bạn</strong><br />Từ đặt vé xe, bạn có thể tin
                            chọn sản phẩm hoàn chỉnh của chúng tôi.</p>
                    </div>
                    <div
                        class="flex items-start text-left rounded-lg shadow-md w-full md:w-1/3">
                        <img src="/assets/images/main/icon2.webp"
                            alt class="w-20 h-20 mb-2" />
                        <p class="max-w-xs"><strong>Tùy chọn đặt chỗ linh
                            hoạt</strong><br />Kế hoạch thay đổi bất ngờ? Đừng
                            lo!Đổi lịch hoặc Hoàn tiền dễ dàng.</p>
                    </div>
                    <div
                        class="flex items-start text-left rounded-lg shadow-md w-full md:w-1/3">
                        <img src="./assets/images/main/icon3.webp"
                            alt class="w-20 h-20 mb-2" />
                        <p class="max-w-xs"><strong>Thanh toán an toàn và thuận
                            tiện</strong><br />Tận hưởng nhiều cách thanh
                            toán an toàn thuận tiện nhất cho bạn</p>
                    </div>
                </div>
            </div>

            <div
                class="bg-white p-4 rounded-lg shadow mt-4 text-center mx-auto">
                <h2 class="text-xl md:text-2xl font-bold text-[#003b95]">TUYẾN
                    PHỔ BIẾN</h2>
                <p class="mb-2">Được khách hàng tin tưởng và lựa chọn</p>
                <div
                    class="flex flex-nowrap gap-4 p-2 justify-center overflow-x-auto md:overflow-visible">

                    <div class="max-w-sm mx-auto p-3 rounded-xl shadow-md w-full md:w-1/3">
                        <div class="relative rounded-xl overflow-hidden">
                            <img
                                src="/assets/images/main/Rectangle 23 (2).png"
                                class="w-full" />
                            <div
                                class="absolute inset-0 bg-black/40 text-left flex items-end p-4">
                                <p class="text-white text-lg font-semibold">Tuyến xe từ <br /> <span class="text-2xl">Tp Hồ
                                        Chí Minh</span></p>
                            </div>
                        </div>
                        <div class="mt-4 space-y-3">
                            <div class="flex justify-between border-b pb-2">
                                <button class="hover:text-sky-700" 
                                  onClick={() => handleSearch({
                                    startPoint:'Hồ Chí Minh',
                                    endPoint:'Thành phố Đà Lạt'
                                  })}>
                                    <p class="font-bold text-lg text-left">Đà
                                        Lạt</p>
                                    <p class="text-gray-500 text-sm">160km - 4.23 giờ</p>
                                </button>
                                <p
                                    class="text-lg font-semibold text-gray-700">200.000đ</p>
                            </div>
                            <div class="flex justify-between border-b pb-2">
                                <button  class="text-left hover:text-sky-700"
                                 onClick={() => handleSearch({
                                    startPoint:'Hồ Chí Minh',
                                    endPoint:'Cần Thơ'
                                  })}>
                                    <p class="font-bold text-lg ">Cần
                                        Thơ</p>
                                    <p class="text-gray-500 text-sm">189km - 2.71 giờ</p>
                                </button>
                                <p
                                    class="text-lg font-semibold text-gray-700">165.000đ</p>
                            </div>
                            <div class="flex justify-between">
                                <button class="text-left hover:text-sky-700"  onClick={() => handleSearch({
                                    startPoint:'Hồ Chí Minh',
                                    endPoint:'Long Xuyên'
                                  })}>
                                    <p class="font-bold text-lg ">Long 
                                        Xuyên</p>
                                    <p class="text-gray-500 text-sm">184.26km - 3.48giờ</p>
                                </button>
                                <p
                                    class="text-lg font-semibold text-gray-700">190.000đ</p>
                            </div>
                        </div>
                    </div>

                    <div
                        class="max-w-sm mx-auto p-3 rounded-xl shadow-md w-full md:w-1/3">
                        <div class="relative rounded-xl overflow-hidden">
                            <img
                                src="/assets/images/main/Rectangle 23 (3).png"
                                alt="Đà Lạt" class="w-full" />
                            <div
                                class="absolute inset-0 text-left bg-black/40 flex items-end p-4">
                                <p
                                    class="text-white text-lg font-semibold">Tuyến
                                    xe từ <br /> <span class="text-2xl">Đà
                                        Lạt</span></p>
                            </div>
                        </div>
                        <div class="mt-4 space-y-3">
                            <div class="flex justify-between border-b pb-2">
                                <button  class="hover:text-sky-700" 
                                 onClick={() => handleSearch({
                                    startPoint:'Đà Lạt',
                                    endPoint:'Hồ Chí Minh'
                                  })}
                                  >
                                    <p class="font-bold text-lg text-left">TP.
                                        Hồ Chí Minh</p>
                                    <p class="text-gray-500 text-sm">310km - 8
                                        giờ - 13/03/2025</p>
                                </button>
                                <p
                                    class="text-lg font-semibold text-gray-700">290.000đ</p>
                            </div>
                            <div class="flex justify-between border-b pb-2">
                                <button  class="hover:text-sky-700"
                                onClick={() => handleSearch({
                                    startPoint:'Đà Lạt',
                                    endPoint:'Đà Nắng'
                                  })}>
                                    <p class="font-bold text-lg text-left">Đà
                                        Nẵng</p>
                                    <p class="text-gray-500 text-sm">757km - 17
                                        giờ - 13/03/2025</p>
                                </button>
                                <p
                                    class="text-lg font-semibold text-gray-700">410.000đ</p>
                            </div>
                            <div class="flex justify-between">
                                <button  class="hover:text-sky-700"
                                  onClick={() => handleSearch({
                                    startPoint:'Đà Lạt',
                                    endPoint:'Cần Thơ'
                                  })}>
                                    <p class="font-bold text-lg text-left">Cần
                                        Thơ</p>
                                    <p class="text-gray-500 text-sm">457km - 11
                                        giờ - 13/03/2025</p>
                                </button>
                                <p
                                    class="text-lg font-semibold text-gray-700">435.000đ</p>
                            </div>
                        </div>
                    </div>

                    <div
                        class="max-w-sm mx-auto p-3 rounded-xl shadow-md w-full md:w-1/3">
                        <div class="relative rounded-xl overflow-hidden">
                            <img
                                src="/assets/images/main/Rectangle 23 (4).png"
                                alt="Đà Nẵng" class="w-full" />
                            <div
                                class="absolute inset-0 bg-black/40 flex items-end p-4">
                                <p
                                    class="text-white text-lg font-semibold">Tuyến
                                    xe từ <br /> <span class="text-2xl">Đà
                                        Nẵng</span></p>
                            </div>
                        </div>
                        <div class="mt-4 space-y-3">
                            <div class="flex justify-between border-b pb-2">
                                <button class="hover:text-sky-700" 
                                onClick={() => handleSearch({
                                    startPoint:'Đà Nẵng',
                                    endPoint:'Đà Lạt'
                                  })}>
                                    <p class="font-bold text-lg text-left">Đà
                                        Lạt</p>
                                    <p class="text-gray-500 text-sm">666km - 17
                                        giờ - 13/03/2025</p>
                                </button>
                                <p
                                    class="text-lg font-semibold text-gray-700">410.000đ</p>
                            </div>
                            <div class="flex justify-between border-b pb-2">
                                <button class="hover:text-sky-700" 
                                onClick={() => handleSearch({
                                    startPoint:'Đà Nẵng',
                                    endPoint:'Hà Nội'
                                  })}>
                                    <p class="font-bold text-lg text-left">Hà Nội</p>
                                    <p class="text-gray-500 text-sm">966km - 20
                                        giờ - 13/03/2025</p>
                                </button>
                                <p
                                    class="text-lg font-semibold text-gray-700">470.000đ</p>
                            </div>
                            <div class="flex justify-between">
                                <button class="hover:text-sky-700"
                                  onClick={() => handleSearch({
                                    startPoint:'Đà Nẵng',
                                    endPoint:'Nha Trang'
                                  })}>
                                    <p class="font-bold text-lg text-left">Nha
                                        Trang</p>
                                    <p class="text-gray-500 text-sm">528km - 9
                                        giờ 25 phút - 13/03/2025</p>
                                </button>
                                <p
                                    class="text-lg font-semibold text-gray-700">370.000đ</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <div
                class="bg-white p-4 rounded-lg shadow mt-4 text-center mx-auto">
                <h2 class="text-xl md:text-2xl font-bold text-[#003b95]">TIN
                    TỨC</h2>
                <p class="mb-4">Được khách hàng tin tưởng và lựa chọn</p>
                <div class="swiper mySwiper overflow-hidden">
                    <div class="swiper-wrapper flex mx-auto gap-3 p-2">
                        <a href="#"
                            class="swiper-slide bg-white text-left shadow-md rounded-lg p-2 block">
                            <img src="/assets/images/main/blog1.png"
                                alt="Khám phá vẻ đẹp của Đà Lạt"
                                class="rounded-lg mb-2 w-full" />
                            <h3 class="text-lg font-bold truncate-title">Khám
                                phá vẻ đẹp của Đà Lạt: Thành phố mộng mơ...
                            </h3>
                            <p class="text-gray-500 text-sm truncate-content">Đà
                                Lạt nổi tiếng với khí hậu ôn hòa, rừng
                                thông xanh bạt ngàn, hồ nước yên tĩnh và những
                                cánh đồng hoa rực rỡ sắc màu. Đây là điểm đến
                                lý tưởng để nghỉ dưỡng...</p>
                        </a>
                        <a href="#"
                            class="swiper-slide bg-white text-left shadow-md rounded-lg p-2 block">
                            <img src="/assets/images/main/blog2.jpg"
                                alt="Những món ăn đặc sản"
                                class="rounded-lg mb-2 w-full" />
                            <h3 class="text-lg font-bold truncate-title">Những
                                món ăn đặc sản không thể bỏ qua khi du lịch
                                Việt Nam...</h3>
                            <p class="text-gray-500 text-sm truncate-content">Ẩm
                                thực Việt Nam vô cùng phong phú với phở Hà
                                Nội, bún bò Huế, bánh mì Sài Gòn hay cơm tấm.
                                Mỗi vùng miền đều có những món ăn đặc trưng
                                mang đậm bản sắc văn hóa...</p>
                        </a>
                        <a href="#"
                            class="swiper-slide text-left bg-white shadow-md rounded-lg p-2 block">
                            <img src="/assets/images/main/blog3.png"
                                alt="Kinh nghiệm du lịch"
                                class="w-full rounded-lg mb-2" />
                            <h3 class="text-lg font-bold truncate-title">Kinh
                                nghiệm du lịch tiết kiệm chi phí mà vẫn trọn
                                vẹn...</h3>
                            <p class="text-gray-500 text-sm truncate-content">Du
                                lịch không nhất thiết phải tốn kém. Hãy lựa
                                chọn phương tiện di chuyển phù hợp, săn vé máy
                                bay giá rẻ, đặt phòng khách sạn sớm và trải
                                nghiệm ẩm thực đường phố...</p>
                        </a>
                        <a href="#"
                            class="swiper-slide text-left bg-white shadow-md rounded-lg p-2 block">
                            <img src="/assets/images/main/blog4.png"
                                alt="Top 10 địa điểm du lịch"
                                class="w-full rounded-lg mb-2" />
                            <h3 class="text-lg font-bold truncate-title">Top 10
                                địa điểm du lịch đẹp nhất Việt Nam không thể
                                bỏ lỡ...</h3>
                            <p
                                class="text-gray-500 text-sm truncate-content">Việt
                                Nam sở hữu những danh thắng tuyệt đẹp như
                                vịnh Hạ Long, phố cổ Hội An, Mộc Châu mùa hoa
                                cải, Sapa sương mù và Phú Quốc với những bãi
                                biển trong xanh...</p>
                        </a>
                        <a href="#"
                            class="swiper-slide text-left bg-white shadow-md rounded-lg p-2 block">
                            <img src="/assets/images/main/blog5.png"
                                alt="Lễ hội truyền thống"
                                class="w-full rounded-lg mb-2" />
                            <h3 class="text-lg font-bold truncate-title">Những
                                lễ hội truyền thống đặc sắc của người Việt...
                            </h3>
                            <p
                                class="text-gray-500 text-sm truncate-content">Việt
                                Nam có nhiều lễ hội đặc trưng như Tết
                                Nguyên Đán, lễ hội chọi trâu Đồ Sơn, lễ hội đua
                                ghe Ngo của người Khmer hay lễ hội Gióng
                                mang ý nghĩa lịch sử to lớn...</p>
                        </a>
                        <a href="#"
                            class="swiper-slide text-left bg-white shadow-md rounded-lg p-2 block">
                            <img src="/assets/images/main/blog6.png"
                                alt="Bí quyết săn vé máy bay"
                                class="w-full rounded-lg mb-2" />
                            <h3 class="text-lg font-bold truncate-title">Bí
                                quyết săn vé máy bay giá rẻ cho chuyến du lịch
                                tiết kiệm...</h3>
                            <p class="text-gray-500 text-sm truncate-content">Để
                                mua vé máy bay giá rẻ, hãy đặt vé sớm, chọn
                                thời điểm khuyến mãi, đăng ký nhận thông báo
                                giảm giá từ các hãng hàng không và sử dụng các
                                ứng dụng đặt vé thông minh...</p>
                        </a>
                        <a href="#"
                            class="swiper-slide text-left bg-white shadow-md rounded-lg p-2 block">
                            <img src="/assets/images/main/blog7.png"
                                alt="Khám phá văn hóa"
                                class="w-full rounded-lg mb-2" />
                            <h3 class="text-lg font-bold truncate-title">Khám
                                phá những nét văn hóa độc đáo của dân tộc Việt
                                Nam...</h3>
                            <p
                                class="text-gray-500 text-sm truncate-content">Việt
                                Nam là một đất nước đa dạng văn hóa với
                                54 dân tộc anh em. Từ phong tục tập quán, trang
                                phục truyền thống đến những làn điệu dân ca,
                                tất cả đều thể hiện nét đặc trưng riêng...</p>
                        </a>
                    </div>
                </div>
            </div>

            <div
                class="bg-white p-4 rounded-lg shadow mt-4 text-center mx-auto">
                <h2 class="text-xl md:text-2xl font-bold text-[#003b95]">CHẤT
                    LƯỢNG LÀ DANH DỰ</h2>
                <p class="mb-4">Chúng tôi cam kết mang đến dịch vụ tốt nhất cho
                    khách hàng</p>
                <div class="content relative">
                    <div
                        class="flex flex-col md:flex-row justify-between items-start gap-4">
                        <div
                            class="bg-gray-100/10 p-4 rounded-lg text-center mt-[8%] w-full md:w-1/4">
                            <h3
                                class="text-xl font-bold text-orange-600 mb-2">Số
                                lượng vé đã đặt</h3>
                            <h1
                                class="text-4xl font-semibold text-gray-700">1,234+</h1>
                        </div>
                        <div
                            class="bg-gray-100/10 p-4 rounded-lg text-center mt-[8%] w-full md:w-1/4">
                            <h3
                                class="text-xl font-bold text-orange-600 mb-2">Bình
                                luận</h3>
                            <p
                                class="text-4xl font-semibold text-gray-700">567+</p>
                        </div>
                        <div
                            class="bg-gray-100/10 p-4 rounded-lg text-center mt-[8%] w-full md:w-1/4">
                            <h3
                                class="text-xl font-bold text-orange-600 mb-2">Số
                                chuyến</h3>
                            <p
                                class="text-4xl font-semibold text-gray-700">89+</p>
                        </div>
                        <div
                            class="bg-gray-100/10 p-4 rounded-lg text-center mt-[8%] w-full md:w-1/4">
                            <h3
                                class="text-xl font-bold text-orange-600 mb-2">Số
                                lượng khách hàng</h3>
                            <p
                                class="text-4xl font-semibold text-gray-700">456+</p>
                        </div>
                        <img id="bus"
                            src="/assets/images/main/bus.png"
                            alt="Bus" width="350"
                            class="absolute bottom-0 left-[100%]  transition-all duration-1000 md:left-auto md:right-0" />
                    </div>
                </div>
            </div>
        </main>
    )
}

export default Home;