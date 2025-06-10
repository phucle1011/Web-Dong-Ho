import InputCom from "../Helpers/InputCom";
import PageTitle from "../Helpers/PageTitle";
import Layout from "../Partials/LayoutHomeThree";
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { decodeToken } from "../Helpers/jwtDecode";

export default function CheakoutPage() {

  const location = useLocation();
  const [checkoutItems, setCheckoutItems] = useState([]);
  const navigate = useNavigate();
  const [voucherDiscount, setVoucherDiscount] = useState(0);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [finalData, setFinalData] = useState(null);
  const token = localStorage.getItem("token");
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!location.state && !localStorage.getItem("checkoutData")) {
      console.warn("Không có dữ liệu giỏ hàng");
      navigate("/cart");
    }
  }, []);

  useEffect(() => {
    let items = [];

    if (location.state?.cartItems && location.state.cartItems.length > 0) {
      items = location.state.cartItems;
    } else {
      const savedData = localStorage.getItem("checkoutData");
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          items = parsedData.cartItems || [];
        } catch (error) {
          console.error("Lỗi parse dữ liệu từ localStorage:", error);
        }
      }
    }

    setCheckoutItems(items);
  }, [location.state]);

  useEffect(() => {
    const savedVoucher = localStorage.getItem("selectedVoucher");
    if (savedVoucher) {
      try {
        const voucher = JSON.parse(savedVoucher);
        setSelectedVoucher(voucher);

        if (voucher.discount_type === "fixed") {
          const total = items.reduce(
            (sum, item) => sum + parseFloat(item.variant.price || 0) * item.quantity,
            0
          );
          const discount = Math.min(voucher.discount_value, total);
          setVoucherDiscount(discount);
        } else if (voucher.discount_type === "percentage") {
          const total = items.reduce(
            (sum, item) => sum + parseFloat(item.variant.price || 0) * item.quantity,
            0
          );
          const maxPrice = voucher.max_price || Infinity;
          const discount = Math.min((total * voucher.discount_value) / 100, maxPrice);
          setVoucherDiscount(discount);
        } else if (voucher.discount_type === "shipping") {
          setVoucherDiscount(0);
        }
      } catch (e) {
        console.error("Lỗi parse voucher từ localStorage:", e);
      }
    }
  }, [checkoutItems]);

  useEffect(() => {
    const savedData = localStorage.getItem("finalTotal");
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFinalData(parsed);
      } catch (e) {
        console.error("Không thể parse finalTotal từ localStorage", e);
      }
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      console.log("Token retrieved from localStorage:", token);

      const decoded = decodeToken(token);
      console.log("Decoded user data:", decoded);

      if (decoded) {
        setUser(decoded);
      } else {
        console.warn("Failed to decode token. User data is null.");
      }

    } else {
      console.warn("No token found in localStorage.");
    }
  }, []);

  return (
    <Layout childrenClasses="pt-0 pb-0">
      <div className="checkout-page-wrapper w-full bg-white pb-[60px]">
        <div className="w-full mb-5">
          <PageTitle
            title="Thanh toán"
            breadcrumb={[
              { name: "trang chủ", path: "/" },
              { name: "thanh toán", path: "/checkout" },
            ]}
          />
        </div>
        <div className="checkout-main-content w-full">
          <div className="container-x mx-auto">
            <div className="w-full lg:flex lg:space-x-[30px]">
              <div className="lg:w-1/2 w-full">
                <h1 className="sm:text-2xl text-xl text-qblack font-medium mb-5">
                  Chi tiết đơn hàng
                </h1>
                <div className="form-area">
                  <form className="w-full px-10 py-[30px] border border-[#EDEDED]">

                    <div className="mb-5">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên*</label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Nguyễn Văn A"
                          value={user?.name || ""}
                          onChange={(e) => setUser({ ...user, name: e.target.value })}
                          className="w-full h-[44px] px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                          required
                        />
                        {user?.name && (
                          <span
                            onClick={() => setUser({ ...user, name: "" })}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer text-sm"
                          >
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email*</label>
                        <input
                          type="email"
                          placeholder="example@example.com"
                          value={user?.email || ""}
                          onChange={(e) => setUser({ ...user, email: e.target.value })}
                          className="w-full h-[44px] px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại*</label>
                        <input
                          type="tel"
                          placeholder="0909xxxxxx"
                          value={user?.phone || ""}
                          onChange={(e) => setUser({ ...user, phone: e.target.value })}
                          className="w-full h-[44px] px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                          required
                        />
                      </div>
                    </div>

                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ*</label>
                      <div class="max-w-md mx-auto p-4">
                        <div class="flex items-start space-x-2">
                          <i class="fas fa-map-marker-alt text-black text-lg mt-1"></i>
                          <div class="flex-1">
                            <p class="font-sans font-semibold text-black text-base leading-5 truncate max-w-full">
                              Lê Nguyễn Hoàng Phúc (+84)03*****...
                            </p>
                            <p class="font-sans text-gray-600 text-sm leading-5">
                              Kv. Phú Mỹ,nhà trọ Thịnh Phát
                            </p>
                            <p class="font-sans text-gray-600 text-sm leading-5">
                              Thường Thạnh, Cái Răng, Cần Thơ, Việt Nam
                            </p>
                          </div>
                          <i class="fas fa-chevron-right text-gray-400 text-base mt-2"></i>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
              <div className="flex-1">
                <h1 className="sm:text-2xl text-xl text-qblack font-medium mb-5">
                  Tóm tắt đơn hàng
                </h1>

                <div className="w-full px-10 py-[30px] border border-[#EDEDED]">
                  <ul className="flex flex-col space-y-5">
                    {checkoutItems.length > 0 ? (
                      <ul className="space-y-4">
                        {checkoutItems.map((item) => {
                          const variant = item.variant;
                          const price = parseFloat(variant.price || 0);
                          const quantity = item.quantity;
                          const total = price * quantity;
                          const attributes = variant.attributeValues;
                          const image = variant?.images?.[0]?.image_url || "";

                          return (
                            <li key={item.id} className=" pb-4">
                              <div className="flex justify-between items-start gap-4">
                                <div className="w-[80px] h-[80px] flex justify-center items-center border border-[#EDEDED] overflow-hidden">
                                  <img
                                    src={image}
                                    alt="product"
                                    className="w-full h-full object-contain"
                                  />
                                </div>

                                <div className="flex-1 space-y-1">
                                  <p className="font-medium text-[15px] text-qblack">{variant.sku}</p>

                                  <div className="space-y-1">
                                    {attributes.map((attr) => {
                                      const attrName = attr.attribute?.name;
                                      const attrValue = attr.value;
                                      const isColor = attrName.toLowerCase() === "color";

                                      return (
                                        <div key={attr.id} className="flex items-center gap-2 text-sm text-gray-500">
                                          <span>{attrName}:</span>
                                          {isColor ? (
                                            <span
                                              className="inline-block w-4 h-4 rounded-full border border-gray-300"
                                              style={{ backgroundColor: attrValue }}
                                            ></span>
                                          ) : (
                                            <span>{attrValue}</span>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>

                                  <p className="text-sm text-gray-700">
                                    Số lượng: <strong>{quantity}</strong>
                                  </p>
                                </div>

                                <div className="text-right min-w-[100px]">
                                  <span className="text-lg font-bold text-qred block">
                                    {total.toLocaleString("vi-VN")}₫
                                  </span>
                                </div>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <p className="text-red-500">Không có sản phẩm nào được chọn.</p>
                    )}
                  </ul>

                  {selectedVoucher && (
                    <div className="flex items-center justify-between p-3 border border-green-500 bg-green-50 rounded-lg mb-2 cursor-pointer bg-white shadow-sm transition-all duration-200">
                      <div className="flex items-center flex-1 min-w-0">
                        {selectedVoucher.discount_type === "shipping" && (
                          <span className="bg-teal-500 text-white text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap mr-3">FREE SHIP</span>
                        )}
                        {selectedVoucher.discount_type !== "shipping" && (
                          <span className="bg-green-500 text-white text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap mr-3">VOUCHER</span>
                        )}
                        <span className="text-sm flex-1 text-gray-700 flex-wrap">
                          {selectedVoucher.name}{" "}
                          {selectedVoucher.discount_type === 'percentage' && (
                            <span className="text-gray-500">
                              (Giảm {selectedVoucher.discount_value}%{selectedVoucher.max_price ? `, Tối đa ${Number(selectedVoucher.max_price).toLocaleString("vi-VN", {
                                style: "currency",
                                currency: "VND",
                              })}` : ''})
                            </span>
                          )}
                          {selectedVoucher.discount_type === 'fixed' && (
                            <span className="text-gray-500">
                              (Giảm {Number(selectedVoucher.discount_value).toLocaleString("vi-VN", {
                                style: "currency",
                                currency: "VND",
                              })})
                            </span>
                          )}
                          <span className="text-gray-500"> (Đơn tối thiểu {Number(selectedVoucher.min_price_threshold).toLocaleString("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          })}) </span>
                        </span>
                      </div>
                    </div>
                  )}

                  {checkoutItems.length > 0 && (
                    <div className="mt-6 pt-4 border-t flex justify-between items-center">
                      <span className="text-xl font-bold">Tổng cộng:</span>
                      <span className="text-xl font-bold text-qred">
                        <p className="text-[18px] font-bold text-qred">
                          {finalData.formattedAmount}₫
                        </p>
                      </span>
                    </div>
                  )}

                  <div className="shipping mt-[30px]">
                    <ul className="flex flex-col space-y-1">
                      <li>
                        <div className="flex space-x-2.5 items-center mb-5">
                          <div className="input-radio">
                            <input
                              type="radio"
                              name="price"
                              className="accent-pink-500"
                              id="delivery"
                            />
                          </div>
                          <label
                            htmlFor="delivery"
                            className="text-[18px] text-normal text-qblack"
                          >
                            MoMo
                          </label>
                        </div>
                      </li>
                      <li>
                        <div className="flex space-x-2.5 items-center mb-5">
                          <div className="input-radio">
                            <input
                              type="radio"
                              name="price"
                              className="accent-pink-500"
                              id="bank"
                            />
                          </div>
                          <label
                            htmlFor="bank"
                            className="text-[18px] text-normal text-qblack"
                          >
                            VNPay
                          </label>
                        </div>
                      </li>
                    </ul>
                  </div>
                  <a href="#">
                    <div className="w-full h-[50px] black-btn flex justify-center items-center">
                      <span className="text-sm font-semibold">
                        Đặt hàng ngay
                      </span>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
