import { useEffect, useState } from "react";
import axios from "axios";
import Constants from "../../../Constants";

export default function ProductsTable({ className }) {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    axios.get(`${Constants.DOMAIN_API}/carts`)
      .then((res) => setCartItems(res.data.data))
      .catch((err) => console.error("Lỗi khi lấy giỏ hàng:", err));
  }, []);

  return (
    <div className={`w-full ${className || ""}`}>
      <div className="relative w-full overflow-x-auto border border-[#EDEDED]">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead>
            <tr className="text-[13px] font-medium text-black bg-[#F6F6F6] uppercase">
              <th className="py-4 pl-10 min-w-[300px]">Sản phẩm</th>
              <th className="py-4 text-center">Thuộc tính</th>
              <th className="py-4 text-center">Giá tiền</th>
              <th className="py-4 text-center">Số lượng</th>
              <th className="py-4 text-center">Tổng tiền</th>
              <th className="py-4 text-right w-[114px]"></th>
            </tr>
          </thead>
          <tbody>
            {cartItems.map((item) => {
              const variant = item.variant;
              const image = variant?.images?.[0]?.image_url || "";
              const attributes = variant?.attributeValues || [];
              const price = parseFloat(variant.price);
              const quantity = item.quantity;
              const total = price * quantity;

              return (
                <tr key={item.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="pl-10 py-4">
                    <div className="flex space-x-6 items-center">
                      <div className="w-[80px] h-[80px] overflow-hidden border border-[#EDEDED] flex justify-center items-center">
                        <img
                          src={image}
                          alt="product"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-[15px] text-qblack">{variant.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="text-center py-4">
                    {attributes.map((attr) => (
                      <div key={attr.id}>
                        {attr.attribute?.name}: {attr.value}
                      </div>
                    ))}
                  </td>
                  <td className="text-center py-4">
                    {price.toLocaleString()}₫
                  </td>
                  <td className="text-center py-4">
                    <input
                      type="number"
                      id="quantity"
                      name="quantity"
                      min="1"
                      step="1"
                      value={quantity}
                      className="w-20 text-center border rounded px-2 py-1"
                    />
                  </td>
                  <td className="text-center py-4">
                    {total.toLocaleString()}₫
                  </td>
                  <td className="text-right py-4">
                    <button className="text-red-500 hover:text-red-700">
                      Xoá
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}