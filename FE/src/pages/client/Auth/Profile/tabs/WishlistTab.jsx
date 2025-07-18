import React, { useEffect, useState } from "react";
import InputQuantityCom from "../../../Helpers/InputQuantityCom";
import axios from "axios";
import Constants from "../../../../../Constants";
import { decodeToken } from "../../../Helpers/jwtDecode";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { FaTrashAlt } from "react-icons/fa";

export default function WishlistTab({ className }) {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]); // Modified: State để lưu các sản phẩm được chọn
  const token = localStorage.getItem("token");
  let userId = null;

  if (token) {
    const decoded = decodeToken(token);
    if (decoded && decoded.id) {
      userId = decoded.id;
    }
  }

  // Lấy wishlist từ API
  const fetchWishlist = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(`${Constants.DOMAIN_API}/users/${userId}/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWishlistItems(res.data.data || []);
      setSelectedItems([]); // Modified: Reset danh sách chọn khi làm mới wishlist
    } catch (error) {
      console.error("Lỗi khi tải wishlist:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [userId]);

  const handleRemove = async (wishlistItemId, productVariantId) => {
    if (!userId) {
      toast.error("Vui lòng đăng nhập.");
      return;
    }

    const result = await Swal.fire({
      title: "Xác nhận xóa",
      text: "Bạn có chắc muốn xóa sản phẩm này khỏi wishlist?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    });

    if (!result.isConfirmed) return;

    try {
      await axios.delete(`${Constants.DOMAIN_API}/users/${userId}/wishlist/${productVariantId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Đã xóa sản phẩm khỏi wishlist!");
      setSelectedItems((prev) => prev.filter((id) => id !== productVariantId)); // Modified: Xóa sản phẩm khỏi danh sách chọn
      fetchWishlist(); // Làm mới danh sách
    } catch (error) {
      toast.error("Không thể xóa sản phẩm.");
    }
  };

  // Xóa toàn bộ wishlist
  const handleClearWishlist = async () => {
    if (isProcessing || !userId) {
      toast.error("Vui lòng đăng nhập để xóa danh sách yêu thích.");
      setIsProcessing(false);
      return;
    }

    if (wishlistItems.length === 0) {
      toast.info("Danh sách yêu thích trống!");
      setIsProcessing(false);
      return;
    }

    const result = await Swal.fire({
      title: "Xác nhận xóa",
      text: "Bạn có chắc muốn xóa toàn bộ danh sách yêu thích?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    });

    if (!result.isConfirmed) {
      setIsProcessing(false);
      return;
    }

    try {
      await axios.delete(`${Constants.DOMAIN_API}/users/${userId}/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWishlistItems([]);
      setSelectedItems([]); // Modified: Reset danh sách chọn
      toast.success("Đã xóa toàn bộ danh sách yêu thích!");
    } catch (error) {
      toast.error("Không thể xóa danh sách yêu thích.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Thêm tất cả vào giỏ hàng
  const handleAddAllToCart = async () => {
    if (isProcessing || !userId) {
      toast.error("Vui lòng đăng nhập để thêm vào giỏ hàng.");
      setIsProcessing(false);
      return;
    }

    if (wishlistItems.length === 0) {
      toast.info("Danh sách yêu thích trống!");
      setIsProcessing(false);
      return;
    }

    setIsProcessing(true);

    try {
      const payload = wishlistItems.map((item) => ({
        product_variant_id: item.product_variant_id,
        quantity: 1,
      }));

      const response = await axios.post(
        `${Constants.DOMAIN_API}/users/${userId}/wishlist/add-to-cart`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(response.data.message || "Đã thêm tất cả sản phẩm vào giỏ hàng!");
    } catch (error) {
      const errorMessage =
        error.response?.data?.errors?.join(", ") || // Modified: Hiển thị lỗi cụ thể từ backend
        error.response?.data?.message ||
        "Không thể thêm sản phẩm vào giỏ hàng.";
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  // Modified: Thêm các sản phẩm được chọn vào giỏ hàng
  const handleAddSelectedToCart = async () => {
    if (isProcessing || !userId) {
      toast.error("Vui lòng đăng nhập để thêm vào giỏ hàng.");
      setIsProcessing(false);
      return;
    }

    if (selectedItems.length === 0) {
      toast.info("Vui lòng chọn ít nhất một sản phẩm để thêm vào giỏ hàng!");
      setIsProcessing(false);
      return;
    }

    setIsProcessing(true);

    try {
      const payload = selectedItems.map((variantId) => ({
        product_variant_id: variantId,
        quantity: 1,
      }));

      const response = await axios.post(
        `${Constants.DOMAIN_API}/users/${userId}/wishlist/add-to-cart`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(response.data.message || "Đã thêm các sản phẩm được chọn vào giỏ hàng!");
    } catch (error) {
      const errorMessage =
        error.response?.data?.errors?.join(", ") ||
        error.response?.data?.message ||
        "Không thể thêm sản phẩm vào giỏ hàng.";
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return <div>Đang tải dữ liệu...</div>;
  }

  return (
    <>
      <div className={`w-full ${className || ""}`}>
        <div className="relative w-full overflow-x-auto border border-[#EDEDED]">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead>
              <tr className="text-[13px] font-medium text-black bg-[#F6F6F6] uppercase border-b">
                <th className="py-4 pl-4 w-[50px]">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === wishlistItems.length && wishlistItems.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        const allVariantIds = wishlistItems.map((item) => item.product_variant_id);
                        setSelectedItems(allVariantIds);
                      } else {
                        setSelectedItems([]);
                      }
                    }}
                  />
                </th>
                <th className="py-4 pl-10 w-[380px]">Sản phẩm</th>
                <th className="py-4 text-center">Tình trạng</th>
                <th className="py-4 text-center">Giá</th>
                <th className="py-4 text-center">Tổng</th>
                <th className="py-4 text-right pr-10"></th>
              </tr>
            </thead>
            <tbody>
              {wishlistItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-gray-500">
                    Danh sách yêu thích trống!
                  </td>
                </tr>
              ) : (
                wishlistItems.map((item) => {
                  const product = item.variant?.product || {};
                  const price = item.variant?.price
                    ? parseFloat(item.variant.price).toLocaleString("vi-VN") + "₫"
                    : "N/A";
                  const attributes =
                    item.variant?.attributeValues?.map(
                      (av) => `${av.attribute?.name || "Thuộc tính"}: ${av.value}`
                    ).join(", ") || "Chưa có thuộc tính";
                  const imageUrl =
                    item.variant?.images?.[0]?.image_url ||
                    product.thumbnail ||
                    "/default-image.jpg";
                  const inStock = item.variant?.stock > 0;

                  return (
                    <tr key={item.id} className="bg-white border-b hover:bg-gray-50">
                      <td className="py-4 pl-4">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.product_variant_id)}
                          onChange={() => {
                            setSelectedItems((prev) =>
                              prev.includes(item.product_variant_id)
                                ? prev.filter((id) => id !== item.product_variant_id)
                                : [...prev, item.product_variant_id]
                            );
                          }}
                        />
                      </td>
                      <td className="pl-10 py-4 w-[380px]">
                        <div className="flex space-x-6 items-center">
                          <div className="w-[80px] h-[80px] overflow-hidden flex justify-center items-center border border-[#EDEDED]">
                            <img
                              src={imageUrl}
                              alt={product.name || "Sản phẩm"}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="flex-1 flex flex-col">
                            <p className="font-medium text-[15px] text-qblack">
                              {product.name || "Sản phẩm không xác định"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-center">{inStock ? "Còn hàng" : "Hết hàng"}</td>
                      <td className="py-4 text-center">{price}</td>
                      <td className="text-center py-4">{price}</td>
                      <td className="py-4 text-right pr-10">
                        <button
                          onClick={() => handleRemove(item.id, item.product_variant_id)}
                          type="button"
                          className="p-2 rounded-full bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 transition duration-200"
                          title="Xóa khỏi danh sách yêu thích"
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
      </div>

      <div className="w-full mt-[30px] flex sm:justify-end justify-start">
        <div className="sm:flex sm:space-x-[30px] items-center">
          <button
            type="button"
            onClick={handleClearWishlist}
            disabled={isProcessing}
            className={`${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <div className="w-full text-sm font-semibold text-qred mb-5 sm:mb-0">
              {isProcessing ? "Đang xử lý..." : "Xóa toàn bộ"}
            </div>
          </button>
          <div className="w-[180px] h-[50px] mr-2">
            <button
              type="button"
              onClick={handleAddSelectedToCart}
              disabled={isProcessing}
              className={`yellow-btn w-full h-full ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <div className="w-full text-sm font-semibold">
                {isProcessing ? "Đang xử lý..." : "Thêm đã chọn vào giỏ hàng"}
              </div>
            </button>
          </div>
          <div className="w-[180px] h-[50px]">
            <button
              type="button"
              onClick={handleAddAllToCart}
              disabled={isProcessing}
              className={`yellow-btn w-full h-full ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <div className="w-full text-sm font-semibold">
                {isProcessing ? "Đang xử lý..." : "Thêm tất cả vào giỏ hàng"}
              </div>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}