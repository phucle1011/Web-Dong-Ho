import { useEffect, useState } from "react";
import axios from "axios";
import Constants from "../../../Constants";
import { FaTrashAlt } from "react-icons/fa";
import FormDelete from "../../../components/formDelete";
import { toast } from "react-toastify";

const ProductsTable = ({ className, onTotalChange }) => {
  const userId = 1;
  const [cartItems, setCartItems] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);
  const [deleteMessage, setDeleteMessage] = useState("");
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  useEffect(() => {
    const total = calculateTotal();
    if (onTotalChange) {
      onTotalChange(total);
    }
  }, [cartItems, onTotalChange]);

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = parseFloat(item.variant?.price || 0);
      const quantity = item.quantity;
      return total + price * quantity;
    }, 0);
  };

  const fetchCart = async () => {
    try {
      const res = await axios.get(`${Constants.DOMAIN_API}/carts`, {
        params: { userId },
      });
      setCartItems(res.data.data);
    } catch (error) {
      console.error("Lỗi khi lấy giỏ hàng:", error);
    }
  };

  const handleConfirmDelete = (productVariantId) => {
    const item = cartItems.find((c) => c.product_variant_id === productVariantId);
    const sku = item?.variant?.sku || "sản phẩm";
    setDeleteItemId(productVariantId);
    setDeleteMessage(`Bạn có chắc chắn muốn xóa sản phẩm ${sku} này khỏi giỏ hàng?`);
    setShowConfirm(true);
  };

  const handleDelete = async ({ id }) => {
    try {
      await axios.delete(`${Constants.DOMAIN_API}/delete-to-carts/${userId}/${id}`);
      toast.success("Xóa sản phẩm khỏi giỏ hàng thành công");
      fetchCart();
    } catch (error) {
      const message = error.response?.data?.message || "";
      if (message === "Không tìm thấy sản phẩm trong giỏ hàng để xóa") {
        toast.warning("Sản phẩm không tồn tại trong giỏ hàng");
      } else {
        toast.error("Xóa sản phẩm thất bại");
      }
    } finally {
      setShowConfirm(false);
      setDeleteItemId(null);
      setDeleteMessage("");
    }
  };

  const handleClearCart = async () => {
    try {
      await axios.delete(`${Constants.DOMAIN_API}/clear-cart/${userId}`);
      toast.success("Đã xóa toàn bộ giỏ hàng");
      fetchCart();
    } catch (error) {
      toast.error("Không thể xóa toàn bộ giỏ hàng");
    } finally {
      setShowConfirmClear(false);
    }
  };

  const handleQuantityChange = async (productVariantId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      await axios.put(`${Constants.DOMAIN_API}/update-to-carts/${userId}/${productVariantId}`, {
        quantity: newQuantity,
      });
      toast.success("Cập nhật số lượng thành công");
      fetchCart();
    } catch (error) {
      toast.error("Cập nhật số lượng thất bại");
    }
  };

  const QuantityInput = ({ quantity, onChange }) => {
    const handleDecrease = () => {
      if (quantity > 1) onChange(quantity - 1);
    };

    const handleIncrease = () => {
      onChange(quantity + 1);
    };

    return (
      <div className="inline-flex items-center border rounded-md overflow-hidden w-[120px] h-9 align-middle">
        <button
          onClick={handleDecrease}
          className="w-9 h-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-xl"
          type="button"
        >
          -
        </button>
        <input
          type="number"
          min="1"
          step="1"
          value={quantity}
          onChange={(e) => {
            const val = Number(e.target.value);
            if (val >= 1) onChange(val);
          }}
          className="w-full text-center outline-none border-l border-r h-full"
        />
        <button
          onClick={handleIncrease}
          className="w-9 h-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-xl"
          type="button"
        >
          +
        </button>
      </div>
    );
  };

  useEffect(() => {
    fetchCart();
  }, []);

  return (
    <div className={`w-full ${className || ""}`}>
      <div className="flex justify-end items-center mb-4 pr-2">
        <button
          onClick={() => setShowConfirmClear(true)}
          className="p-2 rounded-full bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 transition duration-200"
          title="Xóa toàn bộ giỏ hàng"
        >
          <FaTrashAlt size={18} />
        </button>
      </div>
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
            {cartItems.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-6 text-gray-500">
                  Giỏ hàng trống.
                </td>
              </tr>
            ) : (
              cartItems.map((item) => {
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
                      {attributes.map((attr) => {
                        const attrName = attr.attribute?.name || "";
                        const attrValue = attr.value;
                        const isColor = attrName.toLowerCase() === "color";

                        return (
                          <div key={attr.id} className="flex items-center justify-center gap-2">
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
                    </td>
                    <td className="text-center py-4">
                      {price.toLocaleString()}₫
                    </td>
                    <td className="py-4 flex items-center justify-center mt-5">
                      <QuantityInput
                        quantity={quantity}
                        onChange={(newQuantity) =>
                          handleQuantityChange(item.product_variant_id, newQuantity)
                        }
                      />
                    </td>
                    <td className="text-center py-4">
                      {total.toLocaleString()}₫
                    </td>
                    <td className="text-right py-4">
                      <button
                        onClick={() => handleConfirmDelete(item.product_variant_id)}
                        className="p-2 rounded-full bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 transition duration-200"
                        title="Xóa sản phẩm"
                      >
                        <FaTrashAlt size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <FormDelete
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
        message={deleteMessage}
        Id={deleteItemId}
      />

      <FormDelete
        isOpen={showConfirmClear}
        onClose={() => setShowConfirmClear(false)}
        onConfirm={handleClearCart}
        message="Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng không?"
      />
    </div>
  );
};

export default ProductsTable;