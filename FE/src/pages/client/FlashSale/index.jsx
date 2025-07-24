import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import ProductCardStyleOne from "../Helpers/Cards/ProductCardStyleOne";
import useCountDown from "../Helpers/CountDown";
import Layout from "../Partials/LayoutHomeThree";
import axios from "axios";
import Constants from "../../../Constants";

export default function FlashSale() {
  const location = useLocation();
  const flashSales = location.state?.flashSales || [];

  // Lấy promotion_id từ flashSales
  const promotion_id = flashSales[0]?.promotion?.id;

  const [products, setProducts] = useState([]);
  const [promotionInfo, setPromotionInfo] = useState(null);
  const [loading, setLoading] = useState(false);
const [visibleCount, setVisibleCount] = useState(4); // Hiển thị mặc định 12 sản phẩm

// Khi nhấn Xem thêm, tăng lên 12 sản phẩm nữa
const handleShowMore = () => {
  setVisibleCount((prev) => prev + 12);
};

  useEffect(() => {
    async function fetchProducts() {
      if (!promotion_id) return;
      setLoading(true);
      try {
        const res = await axios.get(`${Constants.DOMAIN_API}/client/flashSale/list/${promotion_id}`);
        setProducts(res.data || []);
        
        // Lấy info promotion đầu tiên cho countdown
        if (res.data.length > 0) {
          setPromotionInfo(res.data[0].variants[0]?.promotion || null);
        }
      } catch (err) {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [promotion_id]);
const firstPromotion = flashSales[0]?.promotion;
  const endDate = firstPromotion?.end_date || "2025-12-31T23:59:59"; 
  // Đếm ngược đến hết flash sale
  const { showDate, showHour, showMinute, showSecound } = useCountDown(endDate);

  return (
    <Layout>
      <div className="flashsale-wrapper w-full">
        <div className="container-x mx-auto">
          <div className="w-full">
            <div
              style={{
                background: `url(${process.env.REACT_APP_PUBLIC_URL}/assets/images/flash-sale-ads.png) no-repeat`,
                backgroundSize: "cover",
              }}
              data-aos="fade-right"
              className="flash-ad w-full h-[400px] flex sm:justify-end justify-center items-center mb-10"
            >
              <div className="sm:mr-[75px]">
                <div className="countdown-wrapper w-full flex sm:space-x-6 space-x-3 sm:justify-between justify-evenly">
                  <CountCircle label="Days" value={showDate} color="#EB5757" />
                  <CountCircle label="Hours" value={showHour} color="#2F80ED" />
                  <CountCircle label="Minutes" value={showMinute} color="#219653" />
                  <CountCircle label="Seconds" value={showSecound} color="#EF5DA8" />
                </div>
              </div>
            </div>

           <div className="products grid xl:grid-cols-4 lg:grid-cols-3 sm:grid-cols-2 grid-cols-1 xl:gap-[30px] gap-5">
  {loading ? (
    <p className="text-center col-span-4 text-gray-500 italic">Đang tải khuyến mãi...</p>
  ) : products.length > 0 ? (
    products.slice(0, visibleCount).map((product) => (
      <div key={product.id} className="item" data-aos="fade-up">
        <ProductCardStyleOne datas={product} />
      </div>
    ))
  ) : (
    <p className="text-center col-span-4 text-gray-500 italic">Không có sản phẩm khuyến mãi</p>
  )}
</div>

{/* Nút Xem thêm nên nằm ngoài grid để nằm giữa và không bị lẫn với item sản phẩm */}
{!loading && products.length > visibleCount && (
  <div className="w-full flex justify-center mt-8">
    <button
      onClick={handleShowMore}
      className="px-6 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 font-semibold shadow transition"
    >
      Xem thêm
    </button>
  </div>
)}



          </div>
        </div>
      </div>
    </Layout>
  );
}

function CountCircle({ value, label, color }) {
  return (
    <div className="countdown-item">
      <div className="countdown-number sm:w-[100px] sm:h-[100px] w-[50px] h-[50px] rounded-full bg-white flex justify-center items-center">
        <span className={`font-700 sm:text-[30px] text-base`} style={{ color }}>
          {value}
        </span>
      </div>
      <p className="sm:text-[18px] text-xs font-500 text-center leading-8 text-white">{label}</p>
    </div>
  );
}
