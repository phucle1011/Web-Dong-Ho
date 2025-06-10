import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import BreadcrumbCom from "../BreadcrumbCom";
import EmptyCardError from "../EmptyCardError";
import InputCom from "../Helpers/InputCom";
import PageTitle from "../Helpers/PageTitle";
import Layout from "../Partials/LayoutHomeThree";
import ProductsTable from "./ProductsTable";
import Constants from "../../../Constants";
import axios from "axios";

export default function CardPage({ cart = true }) {
  const [totalPrice, setTotalPrice] = useState(0);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [discountInfo, setDiscountInfo] = useState(null);
  const [promoCode, setPromoCode] = useState("");
  const [error, setError] = useState("");
  const [activePromotions, setActivePromotions] = useState([]);
  const [selectedProductVariants, setSelectedProductVariants] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const fetchActivePromotions = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Vui lòng đăng nhập để xem mã giảm giá.");
          setActivePromotions([]);
          return;
        }
        const response = await axios.get(`${Constants.DOMAIN_API}/promotions/active`, {
          params: { orderTotal: totalPrice },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setActivePromotions(response.data.data || []);
        setError("");
      } catch (err) {
        console.error('Error fetching active promotions:', err);
        setActivePromotions([]);
        if (err.response && err.response.status === 401) {
          setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        } else {
          setError("Không thể tải danh sách mã giảm giá.");
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchActivePromotions();
  }, [totalPrice]);

  useEffect(() => {
    let voucherDiscount = 0;
    if (selectedVoucher) {
      if (totalPrice < selectedVoucher.min_price_threshold) {
        setSelectedVoucher(null);
        setError(`Đơn hàng phải tối thiểu ${selectedVoucher.min_price_threshold.toLocaleString()}₫ để sử dụng voucher này.`);
        return;
      }
      if (selectedVoucher.discount_type === "shipping") {
        voucherDiscount = 0;
      } else if (selectedVoucher.discount_type === "percentage") {
        voucherDiscount = Math.min(
          (totalPrice * selectedVoucher.discount_value) / 100,
          selectedVoucher.max_price || Infinity
        );
      } else if (selectedVoucher.discount_type === "fixed") {
        voucherDiscount = Math.min(selectedVoucher.discount_value, totalPrice);
      }
    }

    setDiscountInfo((prev) => {
      const promoDiscount = prev?.promoDiscount || 0;
      const totalDiscount = Math.min(voucherDiscount + promoDiscount, totalPrice);
      return {
        ...prev,
        voucherDiscount,
        promoDiscount,
        discountAmount: totalDiscount,
        max_price: selectedVoucher?.max_price || prev?.max_price || 0,
      };
    });
  }, [selectedVoucher, totalPrice]);

  useEffect(() => {
    if (!promoCode) {
      setDiscountInfo((prev) => ({
        ...prev,
        promoDiscount: 0,
        discountAmount: prev?.voucherDiscount || 0,
        max_price: prev?.max_price || 0,
      }));
      setError("");
    }
  }, [promoCode]);

  const handleVoucherSelect = (voucher) => {
    if (selectedVoucher && selectedVoucher.id === voucher.id) {
      setSelectedVoucher(null);
      setError("");
    } else if (totalPrice >= voucher.min_price_threshold) {
      setSelectedVoucher(voucher);
      setError("");
      localStorage.setItem("selectedVoucher", JSON.stringify(voucher));
    } else {
      setSelectedVoucher(null);
      setError(`Đơn hàng phải tối thiểu ${voucher.min_price_threshold.toLocaleString()}₫ để sử dụng voucher này.`);
    }
  };

  const handleApplyDiscount = async () => {
    setError("");
    if (!promoCode.trim()) {
      setError("Vui lòng nhập mã giảm giá.");
      return;
    }
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Vui lòng đăng nhập để áp dụng mã giảm giá.");
        return;
      }
      const res = await fetch(`${Constants.DOMAIN_API}/promotions/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code: promoCode.trim(),
          orderTotal: totalPrice,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Có lỗi xảy ra khi áp dụng mã.");
      }
      if (!data.data) {
        throw new Error("Dữ liệu giảm giá không hợp lệ.");
      }

      const promoDiscount = data.data.discountAmount;
      const voucherDiscount = discountInfo?.voucherDiscount || 0;
      const totalDiscount = Math.min(voucherDiscount + promoDiscount, totalPrice);

      setDiscountInfo((prev) => ({
        ...data.data,
        promoDiscount,
        voucherDiscount,
        discountAmount: totalDiscount,
        max_price: selectedVoucher?.max_price || data.data.max_price || 0,
      }));
      setError("");
    } catch (err) {
      setDiscountInfo((prev) => ({
        ...prev,
        promoDiscount: 0,
        discountAmount: prev?.voucherDiscount || 0,
      }));
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearPromoCode = () => {
    setPromoCode("");
    setError("");
  };

  const finalTotal = discountInfo ? totalPrice - discountInfo.discountAmount : totalPrice;

  useEffect(() => {

  }, [selectedProductVariants, cartItems]);

  useEffect(() => {
    const savedVoucher = localStorage.getItem("selectedVoucher");
    if (savedVoucher) {
      const parsed = JSON.parse(savedVoucher);
      setSelectedVoucher(parsed);
    }
  }, []);

  const saveFinalTotalToLocalStorage = () => {
  const finalData = {
    label: discountInfo ? "" : "",
    amount: discountInfo
      ? totalPrice - discountInfo.discountAmount
      : totalPrice,
    formattedAmount: discountInfo
      ? (totalPrice - discountInfo.discountAmount).toLocaleString("vi-VN")
      : totalPrice.toLocaleString("vi-VN"),
    hasDiscount: !!discountInfo,
    discountAmount: discountInfo?.discountAmount || 0,
  };

  localStorage.setItem("finalTotal", JSON.stringify(finalData));
};

useEffect(() => {
  saveFinalTotalToLocalStorage();
}, [totalPrice, discountInfo]);

  return (
    <Layout childrenClasses={cart ? "pt-0 pb-0" : ""}>
      {cart === false ? (
        <div className="cart-page-wrapper w-full">
          <div className="container-x mx-auto">
            <BreadcrumbCom
              paths={[
                { name: "Trang chủ", path: "/" },
                { name: "Giỏ hàng", path: "/cart" },
              ]}
            />
            <EmptyCardError />
          </div>
        </div>
      ) : (
        <div className="cart-page-wrapper w-full bg-white pb-[60px]">
          <div className="w-full">
            <PageTitle
              title="Giỏ hàng của bạn"
              breadcrumb={[
                { name: "Trang chủ", path: "/" },
                { name: "Giỏ hàng", path: "/cart" },
              ]}
            />
          </div>
          <div className="w-full mt-[23px]">
            <div className="container-x mx-auto">
              <ProductsTable
                className="mb-[30px]"
                onTotalChange={setTotalPrice}
                onSelectedItemsChange={setSelectedProductVariants}
                onCartItemsChange={setCartItems}
              />

              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                <div className="relative w-[150px] h-[50px]">
                  <InputCom
                    type="text"
                    placeholder="Mã giảm giá"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                  />
                  {promoCode && (
                    <button
                      type="button"
                      onClick={handleClearPromoCode}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      aria-label="Xóa mã giảm giá"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleApplyDiscount}
                  className="w-[120px] h-[50px] black-btn"
                  disabled={isLoading}
                >
                  <span className="text-sm font-semibold">{isLoading ? "Đang xử lý..." : "Áp dụng"}</span>
                </button>
              </div>

              {error && (
                <p className="text-red-500 text-sm mb-4">{error}</p>
              )}

              <div className="voucher-section mb-6 max-w-md">
                <h3 className="text-[16px] font-semibold text-gray-800 mb-3">Chọn Voucher</h3>
                {isLoading ? (
                  <p className="text-gray-500">Đang tải danh sách voucher...</p>
                ) : activePromotions.length === 0 ? (
                  <p className="text-gray-500">Không có voucher khả dụng.</p>
                ) : (
                  activePromotions.map((voucher) => {
                    const disabled = totalPrice < voucher.min_price_threshold;
                    const isSelected = selectedVoucher && selectedVoucher.id === voucher.id;
                    return (
                      <div
                        key={voucher.id}
                        className={`flex items-center justify-between p-3 border rounded-lg mb-2 cursor-pointer bg-white shadow-sm transition-all duration-200
                          ${isSelected ? "border-green-500 bg-green-50" : "border-gray-200 hover:bg-gray-50"} 
                          ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
                        onClick={() => !disabled && handleVoucherSelect(voucher)}
                        style={{ maxWidth: '400px' }}
                        role="button"
                        tabIndex={0}
                        aria-label={`Chọn voucher ${voucher.name}${disabled ? ", không khả dụng" : ""}`}
                        aria-selected={isSelected}
                        onKeyDown={(e) => {
                          if ((e.key === "Enter" || e.key === " ") && !disabled) {
                            handleVoucherSelect(voucher);
                          }
                        }}
                      >
                        <div className="flex items-center flex-1 min-w-0">
                          {voucher.discount_type === "shipping" && (
                            <span className="bg-teal-500 text-white text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap mr-3">FREE SHIP</span>
                          )}
                          {voucher.discount_type !== "shipping" && (
                            <span className="bg-green-500 text-white text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap mr-3">VOUCHER</span>
                          )}
                          <span className="text-sm flex-1 text-gray-700 flex-wrap">
                            {voucher.name}{" "}
                            {voucher.discount_type === 'percentage' && (
                              <span className="text-gray-500">
                                (Giảm {voucher.discount_value}%{voucher.max_price ? `, Tối đa ${voucher.max_price.toLocaleString()}₫` : ''})
                              </span>
                            )}
                            {voucher.discount_type === 'fixed' && (
                              <span className="text-gray-500">
                                (Giảm {voucher.discount_value.toLocaleString()}₫)
                              </span>
                            )}
                            <span className="text-gray-500"> (Đơn tối thiểu {voucher.min_price_threshold.toLocaleString()}₫)</span>
                          </span>
                        </div>
                        {isSelected && (
                          <span className="text-green-500 font-bold text-xl ml-3 flex-shrink-0">✓</span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              <div className="w-full mt-[30px] flex sm:justify-end">
                <div className="sm:w-[370px] w-full border border-[#EDEDED] px-[30px] py-[26px]">
                  <div className="sub-total mb-6">
                    <div className="flex justify-between mb-3">
                      <p className="text-[15px] font-medium text-qblack">Tổng tiền</p>
                      <p className="text-[15px] font-medium text-qred">
                        {totalPrice.toLocaleString()}₫
                      </p>
                    </div>
                    {discountInfo && (
                      <>
                        {discountInfo.promoDiscount > 0 && (
                          <div className="flex justify-between mb-3">
                            <p className="text-[15px] font-medium text-qblack">Giảm giá (Mã đặc biệt)</p>
                            <p className="text-[15px] font-medium text-green-600">
                              -{discountInfo.promoDiscount.toLocaleString()}₫
                            </p>
                          </div>
                        )}
                        {discountInfo.voucherDiscount > 0 && (
                          <div className="flex justify-between mb-3">
                            <p className="text-[15px] font-medium text-qblack">Giảm giá (Voucher)</p>
                            <p className="text-[15px] font-medium text-green-600">
                              -{discountInfo.voucherDiscount.toLocaleString()}₫
                            </p>
                          </div>
                        )}
                        {discountInfo.max_price && (discountInfo.voucherDiscount > 0 || discountInfo.promoDiscount > 0) && (
                          <div className="flex justify-between mb-3">
                            <p className="text-[13px] text-qgraytwo italic">Giảm tối đa</p>
                            <p className="text-[13px] text-qgraytwo italic">
                              {discountInfo.max_price.toLocaleString()}₫
                            </p>
                          </div>
                        )}
                        <div className="flex justify-between mb-3">
                          <p className="text-[15px] font-medium text-qblack">Tổng sau giảm</p>
                          <p className="text-[15px] font-medium text-qred">
                            {(totalPrice - discountInfo.discountAmount).toLocaleString()}₫
                          </p>
                        </div>
                      </>
                    )}
                    <div className="w-full h-[1px] bg-[#EDEDED]"></div>
                  </div>

                  <div className="shipping mb-6">
                    <span className="text-[15px] font-medium text-qblack mb-[18px] block">
                      Vận chuyển
                    </span>
                    <ul className="flex flex-col space-y-1">
                      {["Miễn phí vận chuyển", "Tỷ lệ cố định", "Giao hàng tận nơi"].map((text, i) => (
                        <li key={i}>
                          <div className="flex justify-between items-center">
                            <div className="flex space-x-2.5 items-center">
                              <input
                                type="radio"
                                name="price"
                                className="accent-pink-500"
                              />
                              <span className="text-[13px] text-qgraytwo">{text}</span>
                            </div>
                            <span className="text-[13px] text-qgraytwo">+0₫</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="shipping-calculation w-full mb-3">
                    <div className="title mb-[17px]">
                      <h1 className="text-[15px] font-medium">Tính toán vận chuyển</h1>
                    </div>
                    <div className="w-full h-[50px] border border-[#EDEDED] px-5 flex justify-between items-center mb-2">
                      <span className="text-[13px] text-qgraytwo">Chọn quốc gia</span>
                      <svg width="11" height="7" viewBox="0 0 11 7" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5.4 6.8L0 1.4L1.4 0L5.4 4L9.4 0L10.8 1.4L5.4 6.8Z" fill="#222222" />
                      </svg>
                    </div>
                    <InputCom
                      inputClasses="w-full h-[50px]"
                      type="text"
                      placeholder="Mã bưu chính / ZIP"
                    />
                  </div>

                  <button type="button" className="w-full mb-10">
                    <div className="w-full h-[50px] bg-[#F6F6F6] flex justify-center items-center">
                      <span className="text-sm font-semibold">Cập nhật giỏ hàng</span>
                    </div>
                  </button>

                  <div className="flex justify-between mb-3">
                    <p className="text-[18px] font-medium text-qblack">
                      {discountInfo ? "Tổng sau giảm" : "Tổng cộng"}
                    </p>
                    <p className="text-[18px] font-medium text-qred">
                      {discountInfo
                        ? (totalPrice - discountInfo.discountAmount).toLocaleString("vi-VN")
                        : totalPrice.toLocaleString("vi-VN")}
                      ₫
                    </p>
                  </div>

                  {selectedProductVariants.length > 0 ? (
                    <Link
                      to={{
                        pathname: "/checkout",
                        state: {
                          selectedProductVariants,
                          cartItems: cartItems.filter((item) =>
                            selectedProductVariants.includes(item.product_variant_id)
                          ),
                        },
                      }}
                      onClick={() => {
                        localStorage.setItem(
                          "checkoutData",
                          JSON.stringify({
                            selectedProductVariants,
                            cartItems: cartItems.filter((item) =>
                              selectedProductVariants.includes(item.product_variant_id)
                            ),
                          })
                        );
                      }}
                    >
                      <div className="w-full h-[50px] black-btn flex justify-center items-center">
                        <span className="text-sm font-semibold">Tiến hành thanh toán</span>
                      </div>
                    </Link>
                  ) : (
                    <div className="w-full h-[50px] bg-gray-300 flex justify-center items-center cursor-not-allowed">
                      <span className="text-sm font-semibold text-gray-500">Tiến hành thanh toán</span>
                    </div>
                  )}
                  {selectedProductVariants.length === 0 && (
                    <p className="text-red-500 text-sm mt-2">Vui lòng chọn ít nhất một sản phẩm để thanh toán.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}