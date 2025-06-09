import React, { useEffect, useState } from "react";
import axios from "axios";
import Constants from "../../../Constants";
import { toast } from "react-toastify";

export default function Cart({ className, type }) {
  const token = localStorage.getItem("token");

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    if (!token) {
      console.warn("Chưa đăng nhập, không thể tải giỏ hàng");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get(`${Constants.DOMAIN_API}/carts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCartItems(res.data.data);
    } catch (error) {
      console.error("Lỗi gọi API:", error.response?.data || error.message);
      toast.error("Không thể tải giỏ hàng");
    } finally {
      setLoading(false);
    }
  };

  const newestItems = cartItems.slice(-3);

  const subtotal = newestItems.reduce((total, item) => {
    const price = parseFloat(item.variant?.price || 0);
    const quantity = item.quantity;
    return total + price * quantity;
  }, 0);

  return (
    <div
      style={{ boxShadow: "0px 15px 50px 0px rgba(0, 0, 0, 0.14)" }}
      className={`w-[300px] bg-white border-t-[3px] ${type === 3 ? "border-qh3-blue" : "cart-wrapper"
        } ${className || ""}`}
    >
      <div className="w-full h-full">
        <div className="product-items h-[310px] overflow-y-scroll">
          <ul>
            {loading ? (
              <li className="text-center">Đang tải...</li>
            ) : newestItems.length === 0 ? (
              <li className="text-center">Giỏ hàng trống.</li>
            ) : (
              newestItems.map((item) => {
                const variant = item.variant;
                const image = variant?.images?.[0]?.image_url || "";
                const price = parseFloat(variant.price || 0);
                const quantity = item.quantity;

                return (
                  <li key={item.id} className="w-full h-full flex">
                    <div className="flex space-x-[6px] justify-center items-center px-4 my-[20px]">
                      <div className="w-[65px] h-full">
                        <img
                          src={image}
                          alt={variant.sku}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex-1 h-full flex flex-col justify-center">
                        <p className="title mb-2 text-[13px] font-600 text-qblack leading-4 line-clamp-2 hover:text-blue-600">
                          {variant.sku}
                        </p>
                        <p className="price">
                          <span className="offer-price text-qred font-600 text-[15px] ml-2">
                            {price.toLocaleString("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            })}
                          </span>
                        </p>
                      </div>
                    </div>
                    <span className="mt-[20px] mr-[15px] inline-flex cursor-pointer">
                      <svg
                        width="8"
                        height="8"
                        viewBox="0 0 8 8"
                        fill="none"
                        className="inline fill-current text-[#AAAAAA] hover:text-qred"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M7.76 0.24C7.44 -0.08 6.96 -0.08 6.64 0.24L4 2.88L1.36 0.24C1.04 -0.08 0.56 -0.08 0.24 0.24C-0.08 0.56 -0.08 1.04 0.24 1.36L2.88 4L0.24 6.64C-0.08 6.96 -0.08 7.44 0.24 7.76C0.56 8.08 1.04 8.08 1.36 7.76L4 5.12L6.64 7.76C6.96 8.08 7.44 8.08 7.76 7.76C8.08 7.44 8.08 6.96 7.76 6.64L5.12 4L7.76 1.36C8.08 1.04 8.08 0.56 7.76 0.24Z" />
                      </svg>
                    </span>
                  </li>
                );
              })
            )}
          </ul>
        </div>
        <div className="w-full px-4 mt-[20px] mb-[12px]">
          <div className="h-[1px] bg-[#F0F1F3]"></div>
        </div>
        <div className="product-actions px-4 mb-[30px]">
          <div className="total-equation flex justify-between items-center mb-[28px]">
            <span className="text-[15px] font-500 text-qblack">Tổng cộng</span>
            <span className="text-[15px] font-500 text-qred ">
              {subtotal.toLocaleString("vi-VN", {
                style: "currency",
                currency: "VND",
              })}
            </span>
          </div>
          <div className="product-action-btn">
            <a href="/cart">
              <div className="gray-btn w-full h-[50px] mb-[10px] ">
                <span>Xem giỏ hàng</span>
              </div>
            </a>
          </div>
        </div>
        <div className="w-full px-4 mt-[20px]">
          <div className="h-[1px] bg-[#F0F1F3]"></div>
        </div>
        <div className="flex justify-center py-[15px]">
          <p className="text-[13px] font-500 text-qgray">
            Nhận trả lại trong vòng <span className="text-qblack">30 ngày</span>
          </p>
        </div>
      </div>
    </div>
  );
}