import { useEffect, useState } from "react";
import axios from "axios";
import Constants from "../../../Constants";
import FormDelete from "../../../components/formDelete";
import { toast } from "react-toastify";
import { notifyCartChanged } from "../Helpers/cart/cartEvents";
import { FaTrashAlt, FaTrophy } from "react-icons/fa";
import { decodeToken } from "../Helpers/jwtDecode";

const ProductsTable = ({ className, onTotalChange, onSelectedItemsChange, onCartItemsChange }) => {
  const [cartItems, setCartItems] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);
  const [deleteMessage, setDeleteMessage] = useState("");
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showAllMap, setShowAllMap] = useState({});

  const meId = (() => {
    try {
      const token = localStorage.getItem("token");
      const payload = decodeToken(token);
      return Number(payload?.id || payload?.user_id || 0);
    } catch {
      return 0;
    }
  })();

  const getTopBid = (bids = []) => {
    if (!Array.isArray(bids) || bids.length === 0) return null;
    const sorted = [...bids].sort((a, b) => {
      const diff = Number(b.bidAmount) - Number(a.bidAmount);
      if (diff !== 0) return diff;
      const atA = new Date(a.bidTime || a.created_at || a.updated_at || 0);
      const atB = new Date(b.bidTime || b.created_at || b.updated_at || 0);
      return atA - atB;
    });
    return sorted[0];
  };

  const getAuctionInfo = (variant, userId) => {
    const auctions = variant?.auctions || [];
    for (const au of auctions) {

      if (au?.status !== "ended") continue;

      const top = getTopBid(au?.bids || []);
      if (top && Number(top.user_id) === Number(userId)) {

        const endedAt = au?.end_time || au?.ended_at || null;
        const wonAt = endedAt || top?.bidTime || top?.created_at || null;
        const deadline = addDays(wonAt, 1);

        return {
          isAuction: true,
          bidAmount: Number(top.bidAmount) || 0,
          wonAt,
          deadline,
          endedAt
        };
      }
    }
    return { isAuction: false, bidAmount: 0, wonAt: null, deadline: null, endedAt: null };
  };

  const toggleShowAll = (id) => {
    setShowAllMap(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const [showNameMap, setShowNameMap] = useState({});
  const toggleShowName = (id) => {
    setShowNameMap(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const addDays = (d, days) => {
    if (!d) return null;
    const x = new Date(d);
    x.setDate(x.getDate() + days);
    return x;
  };

  const formatDateLocal = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);

    // Lấy giờ UTC để tránh cộng +7 giờ
    const year = d.getUTCFullYear();
    const month = `${d.getUTCMonth() + 1}`.padStart(2, "0");
    const day = `${d.getUTCDate()}`.padStart(2, "0");
    const hours = `${d.getUTCHours()}`.padStart(2, "0");
    const minutes = `${d.getUTCMinutes()}`.padStart(2, "0");
    const seconds = `${d.getUTCSeconds()}`.padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };


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
             notifyCartChanged(); 

    } catch (error) {
      console.error("Lỗi khi lấy giỏ hàng:", error);
      // toast.error("Không thể tải giỏ hàng. Vui lòng thử lại.");
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const auctionInfo = getAuctionInfo(item.variant, meId);
      const price = parseFloat(item.variant?.promotion?.discounted_price || item.variant?.price || 0);
      const quantity = parseInt(item.quantity || 0);
      return total + price * quantity;
    }, 0);
  };

  const calculateSelectedTotal = () => {
    return cartItems.reduce((total, item) => {
      if (selectedItems.includes(item.product_variant_id)) {
        const auctionInfo = getAuctionInfo(item.variant, meId);
        const price = parseFloat(item.variant?.promotion?.discounted_price || item.variant?.price || 0);
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
       notifyCartChanged(); 
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
       notifyCartChanged(); 
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
          <FaTrashAlt size={20} className="font-bold" />
        </button>
      </div>
      <div className="max-h-96 overflow-y-auto w-full">
        <table className="w-full table-fixed text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="sticky top-0 bg-[#F6F6F6] z-10">
            <tr className="text-[13px] font-medium text-black uppercase">
              <th className="py-4 text-center w-[50px]">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={selectedItems.length === cartItems.length && cartItems.length > 0}
                />
              </th>
              <th className="py-4 pl-10 w-[320px]">Sản phẩm</th>
              <th className="py-4 text-center w-[180px]">Thuộc tính</th>
              <th className="py-4 text-center w-[120px]">Giá tiền</th>
              <th className="py-4 text-center w-[120px]">Số lượng</th>
              <th className="py-4 text-center w-[120px]">Tổng tiền</th>
              <th className="py-4 text-right w-[80px]"></th>
            </tr>
          </thead>
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
                const originalPrice = parseFloat(variant.price || 0);
                // const price = parseFloat(variant.promotion?.discounted_price || variant.price || 0);
                const discountPercent = parseFloat(variant.promotion?.discount_percent || 0);
                const quantity = item.quantity;
                const stock = variant.stock;

                const name = variant.product.name;
                const attributes = item.variant.attributeValues || [];
                const showAll = !!showAllMap[item.id];
                const displayedAttrs = showAll ? attributes : attributes.slice(0, 2);
                const showFullName = !!showNameMap[item.id];

                const auctionInfo = getAuctionInfo(variant, meId);
                const isAuction = auctionInfo.isAuction;
                const price = isAuction
                  ? auctionInfo.bidAmount
                  : parseFloat(variant.promotion?.discounted_price || variant.price || 0);
                const total = price * quantity;

                return (
                  <tr
                    key={item.id}
                    className={`bg-white border-b hover:bg-gray-50 ${stock === 0 ? "opacity-50" : ""
                      } ${isAuction ? "bg-white border-b hover:bg-gray-50" : ""}`}
                  >
                    <td className="text-center">
                      {stock === 0 ? (
                        <span title="Sản phẩm hết hàng, không thể chọn" className="cursor-help text-red-500">
                          Hết hàng
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
                        <div className="w-[80px] h-[80px] ...">
                          <img src={image} alt="product" className="w-full h-full object-contain" />
                        </div>

                        <div className="flex-1">
                          <p
                            className="font-medium text-[15px] text-qblack"
                            style={
                              !showFullName
                                ? {
                                  display: "-webkit-box",
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: "vertical",
                                  overflow: "hidden",
                                }
                                : {}
                            }
                          >
                            {name} ({variant.sku})
                          </p>

                          {name.length > 40 && (
                            <button
                              onClick={() => toggleShowName(item.id)}
                              className="mt-1 text-blue-600 hover:text-blue-800 text-sm"
                            >
                              {showFullName ? "Ẩn bớt" : "Xem thêm"}
                            </button>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-2 w-[180px] align-top">
                      <div className="flex flex-col gap-1">
                        {displayedAttrs.map((attr) => {
                          const name = attr.attribute?.name;
                          const val = attr.value;
                          const isColor = name?.toLowerCase() === "color";
                          return (
                            <div key={attr.id} className="flex flex-wrap items-center gap-x-1">
                              <span className="font-semibold">{name}</span>
                              {isColor
                                ? <span className="w-4 h-4 rounded-full border" style={{ backgroundColor: val }} title={val} />
                                : <span>{val}</span>}
                            </div>
                          );
                        })}

                        {attributes.length > 2 && (
                          <button
                            onClick={() => toggleShowAll(item.id)}
                            className="mt-1 text-blue-600 hover:text-blue-800 text-sm self-start no-underline"
                          >
                            {showAll
                              ? "Ẩn bớt"
                              : `Xem thêm (${attributes.length - 2}) thuộc tính`}
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="text-center py-4">
                      <div className="flex flex-col items-center gap-1">
                        <span className={`font-semibold ${discountPercent > 0 ? "text-red-500" : "text-black"}`}>
                          {Number(price).toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
                          {isAuction && (
                            <>
                              <div className="mt-1 text-red-700">
                                Hạn thanh toán đến:
                                <span className="ml-1 font-semibold text-red-700">
                                  {formatDateLocal(auctionInfo.deadline)}
                                </span>
                              </div>
                            </>
                          )}
                        </span>
                        {discountPercent > 0 && price < originalPrice && (
                          <span className="text-black-400 line-through text-xs">
                            {Number(originalPrice).toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 text-center align-middle">
                      {stock === 0 ? (
                        <span className="text-sm text-red-500">Hết hàng</span>
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-2">

                          {isAuction ? (
                            <span className="text-sm text-gray-700"><span className="ml-2 text-xs bg-purple-200 text-purple-700 px-2 py-1 rounded">
                              <FaTrophy className="inline mr-1" />
                              Đấu giá
                            </span></span>
                          ) : (
                            <>
                              <QuantityInput
                                quantity={quantity}
                                stock={stock}
                                onChange={(newQuantity) => handleQuantityChange(item.product_variant_id, newQuantity)}
                              />
                              <span className="text-sm text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                                Còn lại: {stock}
                              </span>
                            </>
                          )}

                        </div>
                      )}
                    </td>
                    <td className="text-center py-4">
                      {Number(total).toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
                    </td>
                    <td className="text-right py-4">
                      <button
                        onClick={() => !isAuction && handleConfirmDelete(item.product_variant_id)}
                        disabled={isAuction}
                        className={`p-2 rounded-full ${isAuction
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-red-50 text-red-500 hover:bg-red-100"
                          }`}
                        title={isAuction ? "Không thể xóa sản phẩm đấu giá" : "Xóa sản phẩm"}
                      >
                        <FaTrashAlt size={20} className="font-bold" />
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