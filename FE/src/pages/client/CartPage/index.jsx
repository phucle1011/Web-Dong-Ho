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

  useEffect(() => {
    const fetchActivePromotions = async () => {
      try {
        const token = sessionStorage.getItem("token");
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
      }
    };
    fetchActivePromotions();
  }, [totalPrice]);

  useEffect(() => {
    if (selectedVoucher) {
      if (selectedVoucher.discount_type === "shipping") {
        setDiscountInfo({ discountAmount: 0, max_price: 0 });
      } else if (selectedVoucher.discount_type === "percentage") {
        const discount = Math.min(
          (totalPrice * selectedVoucher.discount_value) / 100,
          selectedVoucher.max_price || Infinity
        );
        setDiscountInfo({ discountAmount: discount, max_price: selectedVoucher.max_price });
      } else if (selectedVoucher.discount_type === "fixed") {
        const discount = Math.min(selectedVoucher.discount_value, totalPrice);
        setDiscountInfo({ discountAmount: discount, max_price: selectedVoucher.max_price });
      }
      setError("");
      setPromoCode("");
    } else {
      setDiscountInfo(null);
    }
  }, [selectedVoucher, totalPrice]);

  useEffect(() => {
    if (promoCode) {
      setSelectedVoucher(null);
      setDiscountInfo(null);
      setError("");
    }
  }, [promoCode]);

  const handleVoucherSelect = (voucher) => {
    if (selectedVoucher && selectedVoucher.id === voucher.id) {
      setSelectedVoucher(null);
      setError("");
      return;
    }
    if (totalPrice >= voucher.min_price_threshold) {
      setSelectedVoucher(voucher);
      setError("");
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
    try {
      const token = sessionStorage.getItem("token");
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

      setDiscountInfo(data.data);
      setSelectedVoucher(null);
      setError("");
    } catch (err) {
      setDiscountInfo(null);
      setError(err.message);
    }
  };

  const finalTotal = discountInfo ? totalPrice - discountInfo.discountAmount : totalPrice;

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
              />

              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                <div className="w-[150px] h-[50px]">
                  <InputCom
                    type="text"
                    placeholder="Mã giảm giá"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleApplyDiscount}
                  className="w-[120px] h-[50px] black-btn"
                >
                  <span className="text-sm font-semibold">Áp dụng</span>
                </button>
              </div>

              {error && (
                <p className="text-red-500 text-sm mb-4">{error}</p>
              )}

              <div className="voucher-section mb-6 max-w-md">
                <h3 className="text-[16px] font-semibold text-gray-800 mb-3">Chọn Voucher</h3>
                {activePromotions.map((voucher) => {
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
                              (Giảm {voucher.discount_type === 'percentage' && voucher.discount_value}%{voucher.max_price ? `, Tối đa ${voucher.max_price.toLocaleString()}₫` : ''})
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
                })}
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
                        <div className="flex justify-between mb-3">
                          <p className="text-[15px] font-medium text-qblack">Giảm giá</p>
                          <p className="text-[15px] font-medium text-green-600">
                            -{discountInfo.discountAmount.toLocaleString()}₫
                          </p>
                        </div>

                        {discountInfo.max_price && (
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

                  <div className="total mb-6">
                    <div className="flex justify-between">
                      <p className="text-[18px] font-medium text-qblack">Tổng cộng</p>
                      <p className="text-[18px] font-medium text-qred">
                        {finalTotal.toLocaleString()}₫
                      </p>
                    </div>
                  </div>

                  {selectedProductVariants.length > 0 ? (
                    <Link to="/checkout">
                      <div className="w-full h-[50px] black-btn flex justify-center items-center">
                        <span className="text-sm font-semibold">Tiến hành thanh toán</span>
                      </div>
                    </Link>
                  ) : (
                    <div className="w-full h-[50px] bg-gray-300 flex justify-center items-center cursor-not-allowed">
                      <span className="text-sm font-semibold text-gray-500">Tiến hành thanh toán</span>
                    </div>
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