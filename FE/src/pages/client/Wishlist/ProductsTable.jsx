import React from "react";
import InputQuantityCom from "../Helpers/InputQuantityCom";
import { FaTrashAlt } from "react-icons/fa";

export default function ProductsTable({ products = [], onRemove }) {
  return (

    <div className={`w-full ${products.length === 0 ? "text-center" : ""}`}>
      {products.length === 0 ? (
        <p className="py-10 text-gray-500">Không có sản phẩm nào trong wishlist.</p>
      ) : (
        <div className="relative w-full overflow-x-auto border border-[#EDEDED]">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead>
              <tr className="text-[13px] font-medium text-black bg-[#F6F6F6] uppercase border-b">
                <th className="py-4 pl-10 w-[380px]">Sản phẩm</th>
                <th className="py-4 text-center">Thuộc tính</th>
                <th className="py-4 text-center">Giá</th>
                <th className="py-4 text-center">Số lượng</th>
                <th className="py-4 text-center">Tổng</th>
                <th className="py-4 text-right pr-10">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {products.map((item) => {

                const product = item.variant.product;
                const price = parseFloat(item.variant.price).toLocaleString("vi-VN") + " ₫";
                const attributes = item.variant.attributeValues?.map(
                  (av) => `${av.attribute.name}: ${av.value}`
                ).join(", ") || "Chưa có thuộc tính";
                const imageUrl = item.variant.images?.[0]?.image_url || product.thumbnail || "/default-image.jpg";

                console.log("Ảnh sản phẩm:", product.thumbnail, product.image, product.imageUrl);

                return (
                  <tr key={item.id} className="bg-white border-b hover:bg-gray-50">
                    <td className="pl-10 py-4 w-[380px]">
                      <div className="flex space-x-6 items-center">
                        <div className="w-[80px] h-[80px] overflow-hidden flex justify-center items-center border border-[#EDEDED]">
                          <img
                            src={imageUrl}
                            alt={product.name}
                            className="w-full h-full object-contain"
                          />
                        </div>

                        <div className="flex-1 flex flex-col">
                          <p className="font-medium text-[15px] text-qblack">{product.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-center">{attributes}</td>
                    <td className="py-4 text-center">{price}</td>
                    <td className="py-4">
                      <div className="flex justify-center items-center">
                        <InputQuantityCom />
                      </div>
                    </td>
                    <td className="text-right py-4">
                      <div className="flex space-x-1 items-center justify-center">
                        <span className="text-[15px] font-normal">{price}</span>
                      </div>
                    </td>
                    <td className="py-4 text-right pr-10">
                      <button
                        onClick={() => onRemove && onRemove(item.id)}
                        type="button"
                        className="p-2 rounded-full bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 transition duration-200"
                      >
                        <FaTrashAlt size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}