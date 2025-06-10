import { useEffect, useState } from "react";
import axios from "axios";
import Constants from "../../../Constants";
import { FaTrashAlt } from "react-icons/fa";
import FormDelete from "../../../components/formDelete";
import { toast } from "react-toastify";

const ProductsTable = ({ className, onTotalChange, onSelectedItemsChange, onCartItemsChange }) => {
  const [cartItems, setCartItems] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);
  const [deleteMessage, setDeleteMessage] = useState("");
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    const selectedTotal = calculateSelectedTotal();
    if (onTotalChange) {
      onTotalChange(selectedTotal);
    }
  }, [selectedItems, cartItems, onTotalChange]);

  useEffect(() => {
    fetchCart();
  }, []);

  useEffect(() => {
    if (onSelectedItemsChange) {
      onSelectedItemsChange(selectedItems);
    }
  }, [selectedItems, onSelectedItemsChange]);

  useEffect(() => {
    if (onCartItemsChange) {
      onCartItemsChange(cartItems);
    }
  }, [cartItems, onCartItemsChange]);

  const fetchCart = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(`${Constants.DOMAIN_API}/carts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCartItems(res.data.data);
    } catch (error) {
      console.error("Lỗi khi lấy giỏ hàng:", error);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = parseFloat(item.variant?.price || 0);
      const quantity = item.quantity;
      return total + price * quantity;
    }, 0);
  };

  const calculateSelectedTotal = () => {
    return cartItems.reduce((total, item) => {
      if (selectedItems.includes(item.product_variant_id)) {
        const price = parseFloat(item.variant?.price || 0);
        const quantity = parseInt(item.quantity || 0);
        return total + price * quantity;
      }
      return total;
    }, 0);
  };

  const handleSelect = (variantId) => {
    setSelectedItems((prev) =>
      prev.includes(variantId)
        ? prev.filter((id) => id !== variantId)
        : [...prev, variantId]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === cartItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartItems.map((item) => item.product_variant_id));
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
    const token = localStorage.getItem("token");

    try {
      await axios.delete(`${Constants.DOMAIN_API}/delete-to-carts/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCartItems((prevItems) =>
        prevItems.filter((item) => item.product_variant_id !== id)
      );

      toast.success("Xóa sản phẩm khỏi giỏ hàng thành công");
      await fetchCart();
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
    const token = localStorage.getItem("token");

    try {
      await axios.delete(`${Constants.DOMAIN_API}/clear-cart/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCartItems([]);
      toast.success("Đã xóa toàn bộ giỏ hàng");
      await fetchCart();
    } catch (error) {
      toast.error("Không thể xóa toàn bộ giỏ hàng");
    } finally {
      setShowConfirmClear(false);
    }
  };

  const handleQuantityChange = async (productVariantId, newQuantity) => {
    const token = localStorage.getItem("token");
    if (newQuantity < 1) return;

    try {
      await axios.put(
        `${Constants.DOMAIN_API}/update-to-carts/${productVariantId}`,
        { quantity: newQuantity },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }
      );
      setCartItems([]);
      toast.success("Cập nhật số lượng thành công");
      await fetchCart();
    } catch (error) {
      toast.error("Cập nhật số lượng thất bại");
    }
  };

  const QuantityInput = ({ quantity, onChange, stock }) => {
    const handleDecrease = () => {
      if (quantity > 1) {
        onChange(quantity - 1);
      }
    };

    const handleIncrease = () => {
      if (quantity < stock) {
        onChange(quantity + 1);
      } else {
        toast.info("Không thể tăng thêm vì đã đạt số lượng tối đa trong kho");
      }
    };

    return (
      <div className="inline-flex items-center border rounded-md overflow-hidden w-[120px] h-9">
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
          max={stock}
          step="1"
          value={quantity}
          onChange={(e) => {
            const val = parseInt(e.target.value, 10);
            if (val >= 1 && val <= stock) {
              onChange(val);
            }
          }}
          className="w-16 h-full text-center outline-none"
          readOnly
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
      <div className="max-h-96 overflow-y-auto w-full">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead>
            <tr className="text-[13px] font-medium text-black bg-[#F6F6F6] uppercase">
              <th className="py-4 text-center w-[50px]">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={selectedItems.length === cartItems.length && cartItems.length > 0}
                />
              </th>
              <th className="py-4 pl-10 min-w-[300px]">Sản phẩm</th>
              <th className="py-4 text-center">Thuộc tính</th>
              <th className="py-4 text-center">Giá tiền</th>
              <th className="py-4 text-center">Số lượng</th>
              <th className="py-4 text-center">Tổng tiền</th>
              <th className="py-4 text-right w-[114px]"></th>
            </tr>
          </thead>
        </table>

        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <tbody>
            {cartItems.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-6 text-gray-500">
                  Giỏ hàng trống.
                </td>
              </tr>
            ) : (
              cartItems.map((item) => {
                const variant = item.variant;
                const image = variant?.images?.[0]?.image_url || "";
                const attributes = variant.attributeValues || [];
                const price = parseFloat(variant.price);
                const quantity = item.quantity;
                const stock = variant.stock;
                const total = price * quantity;

                return (
                  <tr
                    key={item.id}
                    className={`bg-white border-b hover:bg-gray-50 ${stock === 0 ? "opacity-50" : ""}`}
                  >
                    <td className="text-center">
                      {stock === 0 ? (
                        <span title="Sản phẩm hết hàng, không thể chọn" className="cursor-help text-red-500">
                        </span>
                      ) : (
                        <input
                          type="checkbox"
                          disabled={stock === 0}
                          checked={selectedItems.includes(item.product_variant_id)}
                          onChange={() => stock !== 0 && handleSelect(item.product_variant_id)}
                        />
                      )}
                    </td>
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
                        const attrName = attr.attribute?.name;
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
                      {Number(price).toLocaleString("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      })}
                    </td>
                    <td className="py-4 flex flex-col items-center justify-center mt-5">
                      {stock === 0 ? (
                        <span className="text-sm text-red-500">Hết hàng</span>
                      ) : (
                        <>
                          <QuantityInput
                            quantity={quantity}
                            stock={stock}
                            onChange={(newQuantity) => handleQuantityChange(item.product_variant_id, newQuantity)}
                          />
                          <span className="mt-2 text-sm text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                            Còn lại: {stock}
                          </span>
                        </>
                      )}
                    </td>
                    <td className="text-center py-4">
                      {total.toLocaleString("vi-VN")}₫
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