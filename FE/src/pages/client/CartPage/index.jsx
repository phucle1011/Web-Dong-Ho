import { useState } from "react";
import { Link } from "react-router-dom";
import BreadcrumbCom from "../BreadcrumbCom";
import EmptyCardError from "../EmptyCardError";
import InputCom from "../Helpers/InputCom";
import PageTitle from "../Helpers/PageTitle";
import Layout from "../Partials/LayoutHomeThree";
import ProductsTable from "./ProductsTable";
import Constants from "../../../Constants";

export default function CardPage({ cart = true }) {
  const [totalPrice, setTotalPrice] = useState(0);
  const [promoCode, setPromoCode] = useState("");
  const [discountInfo, setDiscountInfo] = useState(null);
  const [error, setError] = useState("");

  const handleApplyDiscount = async () => {
    setError("");
    try {
      const token = sessionStorage.getItem("token");
      const res = await fetch(`${Constants.DOMAIN_API}/promotions/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code: promoCode,
          orderTotal: totalPrice,
        },),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Có lỗi xảy ra khi áp dụng mã.");
      }

      setDiscountInfo(data.data);
    } catch (err) {
      setDiscountInfo(null);
      setError(err.message);
    }
  };

  const finalTotal = discountInfo
    ? totalPrice - discountInfo.discountAmount
    : totalPrice;

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
              <ProductsTable className="mb-[30px]" onTotalChange={setTotalPrice} />
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                <div className="flex-3 w-[150px] h-[50px]">
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

                  <Link to="/checkout">
                    <div className="w-full h-[50px] black-btn flex justify-center items-center">
                      <span className="text-sm font-semibold">Tiến hành thanh toán</span>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
