import { useState, useEffect, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { decodeToken } from "../../Helpers/jwtDecode";
import Constants from "../../../../Constants";
import Compair from "../icons/Compair";
import QuickViewIco from "../icons/QuickViewIco";
import ThinLove from "../icons/ThinLove";
import ReactDOM from "react-dom";
import { FiShoppingCart } from "react-icons/fi";
import StarRating from "../StarRating";
import { notifyCartChanged } from "../cart/cartEvents";

export default function ProductCardStyleOne({ datas, type, onProductClick }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const dialogRef = useRef();
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [variantImages, setVariantImages] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [avgRating, setAvgRating] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Memoize product and variants
 const product = useMemo(() => datas || {}, [datas]);

const representativeVariant = useMemo(() => {
  return productData?.representativeVariant || product?.representativeVariant || {};
}, [productData?.representativeVariant, product?.representativeVariant]);

const variants = useMemo(() => {
  if (productData?.variants?.length) return productData.variants;
  if (product?.variants?.length) return product.variants;
  return [];
}, [productData?.variants, product?.variants]);

useEffect(() => {
  if (variantImages.length > 0) {
    const safeIndex = Math.max(0, Math.min(currentImageIndex, variantImages.length - 1));
    setSelectedImage(variantImages[safeIndex]?.image_url || "/images/no-image.jpg");
  }
}, [currentImageIndex, variantImages]);


  useEffect(() => {
    if (!product.id) return;

async function fetchProduct() {
  try {
    setLoading(true);
    const res = await axios.get(
      `${Constants.DOMAIN_API}/products/${product.id}/variants`
    );
    const { product: fetchedProduct } = res.data;

    // Sắp xếp: Biến thể có promotion lên trước
   const sortedVariants = [...fetchedProduct.variants].sort((a, b) => {
  const aDiscount = a.promotion?.discount_percent || 0;
  const bDiscount = b.promotion?.discount_percent || 0;
  return bDiscount - aDiscount; // giảm giá cao hơn lên đầu
});

    fetchedProduct.variants = sortedVariants;
    setProductData(fetchedProduct);

    setVariantImages(sortedVariants[0]?.images || []);
    setSelectedImage(
      fetchedProduct.thumbnail ||
        sortedVariants[0]?.images[0]?.image_url ||
        "/images/no-image.jpg"
    );
    setAvgRating(parseFloat(fetchedProduct.averageRating) || 0);
    setRatingCount(parseInt(fetchedProduct.ratingCount) || 0);

    if (sortedVariants.length > 0) {
      const validVariants = sortedVariants.filter(
        (variant) =>
          parseInt(variant.stock) > 0 && parseFloat(variant.price) > 0
      );
      const firstValidVariant = validVariants[0] || sortedVariants[0];
      setSelectedVariant(firstValidVariant);
      setVariantImages(firstValidVariant.images || []);
      setSelectedImage(
        firstValidVariant.images[0]?.image_url ||
          fetchedProduct.thumbnail ||
          "/images/no-image.jpg"
      );
      setAvgRating(parseFloat(firstValidVariant.averageRating) || 0);
      setRatingCount(parseInt(firstValidVariant.ratingCount) || 0);
      checkWishlistStatus(firstValidVariant.id);
    }
  } catch (err) {
    setError(err.message || "Không thể tải thông tin sản phẩm");
  } finally {
    setLoading(false);
  }
}


    fetchProduct();
  }, [product.id]);

  useEffect(() => {
    if (selectedVariant) {
      setAvgRating(parseFloat(selectedVariant.averageRating) || 0);
      setRatingCount(parseInt(selectedVariant.ratingCount) || 0);
      setVariantImages(selectedVariant.images || []);
      setSelectedImage(
        selectedVariant.images[0]?.image_url ||
          productData?.thumbnail ||
          "/images/no-image.jpg"
      );
    } else if (productData) {
      setAvgRating(parseFloat(productData.averageRating) || 0);
      setRatingCount(parseInt(productData.ratingCount) || 0);
      setVariantImages([]);
      setSelectedImage(productData.thumbnail || "/images/no-image.jpg");
    }
  }, [selectedVariant, productData]);

  const totalStock = useMemo(
    () =>
      parseInt(productData?.total_stock) ||
      variants.reduce(
        (sum, variant) => sum + (parseInt(variant.stock) || 0),
        0
      ),
    [productData, variants]
  );

  const validVariants = useMemo(
    () =>
      variants.filter(
        (variant) =>
          parseInt(variant.stock) > 0 && parseFloat(variant.price) > 0
      ),
    [variants]
  );

  const priceInfo = useMemo(() => {
    let displayPrice = 0;
    let displayOriginalPrice = 0;
    let hasStock = totalStock > 0;
    let discountPercent = 0;
    let discountAmount = 0;
    let discountType = null;

    const safeParsePrice = (value) => {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    };

    const safeParseDiscount = (value) => {
      const parsed = parseFloat(value);
      return isNaN(parsed) || parsed < 0 || parsed > 100
        ? 0
        : Math.round(parsed);
    };

    if (selectedVariant) {
      displayOriginalPrice = safeParsePrice(selectedVariant.price);
      displayPrice = safeParsePrice(
        selectedVariant.final_price ||
          selectedVariant.promotion?.discounted_price ||
          selectedVariant.price
      );
      discountType = selectedVariant.promotion?.discount_type || null;
      if (
        selectedVariant.promotion?.meets_conditions &&
        displayPrice < displayOriginalPrice
      ) {
        discountAmount = displayOriginalPrice - displayPrice;
        discountPercent = safeParseDiscount(
          selectedVariant.promotion?.discount_percent || 0
        );
        if (discountPercent === 0 && discountType !== "percentage") {
          discountPercent = Math.round(
            ((displayOriginalPrice - displayPrice) / displayOriginalPrice) * 100
          );
        }
      }
    } else if (representativeVariant && representativeVariant.price) {
      displayOriginalPrice = safeParsePrice(representativeVariant.price);
      displayPrice = safeParsePrice(
        representativeVariant.final_price ||
          representativeVariant.promotion?.discounted_price ||
          representativeVariant.price
      );
      discountType = representativeVariant.promotion?.discount_type || null;
      if (
        representativeVariant.promotion?.meets_conditions &&
        displayPrice < displayOriginalPrice
      ) {
        discountAmount = displayOriginalPrice - displayPrice;
        discountPercent = safeParseDiscount(
          representativeVariant.promotion?.discount_percent || 0
        );
        if (discountPercent === 0 && discountType !== "percentage") {
          discountPercent = Math.round(
            ((displayOriginalPrice - displayPrice) / displayOriginalPrice) * 100
          );
        }
      }
    } else if (validVariants.length > 0) {
      const initialVariant = validVariants[0];
      displayOriginalPrice = safeParsePrice(initialVariant.price);
      displayPrice = safeParsePrice(
        initialVariant.final_price ||
          initialVariant.promotion?.discounted_price ||
          initialVariant.price
      );
      discountType = initialVariant.promotion?.discount_type || null;
      if (
        initialVariant.promotion?.meets_conditions &&
        displayPrice < displayOriginalPrice
      ) {
        discountAmount = displayOriginalPrice - displayPrice;
        discountPercent = safeParseDiscount(
          initialVariant.promotion?.discount_percent || 0
        );
        if (discountPercent === 0 && discountType !== "percentage") {
          discountPercent = Math.round(
            ((displayOriginalPrice - displayPrice) / displayOriginalPrice) * 100
          );
        }
      }
    } else {
      hasStock = false;
      displayOriginalPrice = safeParsePrice(productData?.price);
      displayPrice = safeParsePrice(
        productData?.promotion?.discounted_price || productData?.price
      );
      discountType = productData?.promotion?.discount_type || null;
      if (
        productData?.promotion?.meets_conditions &&
        displayPrice < displayOriginalPrice
      ) {
        discountAmount = displayOriginalPrice - displayPrice;
        discountPercent = safeParseDiscount(
          productData?.promotion?.discount_percent || 0
        );
        if (discountPercent === 0 && discountType !== "percentage") {
          discountPercent = Math.round(
            ((displayOriginalPrice - displayPrice) / displayOriginalPrice) * 100
          );
        }
      }
    }

    return {
      displayPrice,
      displayOriginalPrice,
      hasStock,
      discountPercent,
      discountAmount,
      discountType,
    };
  }, [
    productData,
    variants,
    selectedVariant,
    totalStock,
    representativeVariant,
  ]);

  const {
    displayPrice,
    displayOriginalPrice,
    hasStock,
    discountPercent,
    discountAmount,
    discountType,
  } = priceInfo;
  const thumbnail =
    selectedImage || productData?.thumbnail?.trim() || "/images/no-image.jpg";
  const productName =
    productData?.name?.trim() || product.title?.trim() || "Sản phẩm không tên";

  const maxStock = 5;
  const stockPercentage =
    totalStock > 0 ? Math.min((totalStock / maxStock) * 100, 100) : 0;

  const handleAddToCart = async (variantId, quantity) => {
    if (!variantId) {
      toast.error("Bạn chưa chọn biến thể sản phẩm.");
      return;
    }

    const token = localStorage.getItem("token");
    const decoded = decodeToken(token);
    const userId = decoded?.id;

    if (!token || !userId) {
      toast.error("Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng.");
      return;
    }

    try {
      const response = await axios.post(
        `${Constants.DOMAIN_API}/add-to-carts`,
        {
          userId,
          productVariantId: variantId,
          quantity,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      notifyCartChanged(); 

      toast.success("Đã thêm vào giỏ hàng thành công!");
    } catch (error) {
      if (error.response?.status === 400) {
        const message = error.response.data?.message || "";
        if (message.includes("Số lượng vượt quá tồn kho")) {
          const match = message.match(/\((\d+)\)/);
          const stock = match ? parseInt(match[1], 10) : null;
          toast.error(
            stock
              ? `Bạn đã có một số sản phẩm trong giỏ. Hiện chỉ còn ${stock} sản phẩm trong kho.`
              : message
          );
        } else {
          toast.error(message);
        }
      } else {
        toast.error("Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng.");
      }
    }
  };

  const addToCart = () => {
    if (variants.length > 0 && !selectedVariant) {
      toast.error("Vui lòng chọn biến thể trước khi thêm vào giỏ hàng");
      return;
    }
    if (quantity > (selectedVariant?.stock || totalStock)) {
      toast.error(
        `Chỉ còn ${selectedVariant?.stock || totalStock} sản phẩm trong kho`
      );
      return;
    }
    const variantToAdd =
      selectedVariant || (validVariants.length > 0 ? validVariants[0] : null);
    if (variantToAdd) {
      handleAddToCart(variantToAdd.id, quantity);
    } else {
      toast.error("Không có biến thể hợp lệ để thêm vào giỏ hàng.");
    }
  };

  const description = product.description || "Không có mô tả";
  const maxLength = 80;
  const isLongDescription = description.length > maxLength;
  const truncatedDescription =
    isLongDescription && !isExpanded
      ? description.slice(0, maxLength) + "..."
      : description;

  const handleVariantSelect = (variant) => {
    if (!variant || selectedVariant?.id === variant.id || variant.stock <= 0)
      return;

    if (!variant.attributeValues || variant.attributeValues.length === 0) {
      const fullVariant = productData?.variants?.find(
        (v) => v.id === variant.id
      );
      if (fullVariant) {
        variant.attributeValues = fullVariant.attributeValues || [];
        variant.images = fullVariant.images || [];
        variant.averageRating = fullVariant.averageRating;
        variant.ratingCount = fullVariant.ratingCount;
      }
    }

    setSelectedVariant(variant);
    const newImages = variant.images || [];
    setVariantImages(newImages);
    setSelectedImage(
      newImages.length > 0
        ? newImages[0].image_url || productData.thumbnail
        : productData.thumbnail
    );
    setAvgRating(parseFloat(variant.averageRating || 0));
    setRatingCount(parseInt(variant.ratingCount || 0));
    checkWishlistStatus(variant.id);
    setCurrentImageIndex(0);

  };

  const checkWishlistStatus = async (variantId) => {
    const token = localStorage.getItem("token");
    const decoded = decodeToken(token);
    const userId = decoded?.id;

    if (!token || !userId) {
      setIsInWishlist(false);
      return;
    }

    try {
      const response = await axios.get(
        `${Constants.DOMAIN_API}/users/${userId}/wishlist`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const isInWishlist = response.data.data.some(
        (item) => item.product_variant_id === variantId
      );
      setIsInWishlist(isInWishlist);
    } catch (error) {
      setIsInWishlist(false);
      toast.error("Không thể kiểm tra trạng thái danh sách yêu thích.");
    }
  };

  const handleAddToWishlist = async () => {
    if (!selectedVariant) {
      toast.error("Vui lòng chọn biến thể sản phẩm.");
      return;
    }

    const token = localStorage.getItem("token");
    const decoded = decodeToken(token);
    const userId = decoded?.id;

    if (!token || !userId) {
      toast.error(
        "Bạn cần đăng nhập để thêm sản phẩm vào danh sách yêu thích."
      );
      return;
    }

    try {
      const response = await axios.post(`${Constants.DOMAIN_API}/wishlist`, {
        userId,
        productVariantId: selectedVariant.id,
      });
      toast.success(
        response.data.message || "Đã thêm vào danh sách yêu thích!"
      );
      setIsInWishlist(true);
      await checkWishlistStatus(selectedVariant.id);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Lỗi khi thêm vào danh sách yêu thích.";
      toast.error(errorMessage);
    }
  };

  const handleRemoveFromWishlist = async () => {
    if (!selectedVariant) {
      toast.error("Vui lòng chọn biến thể sản phẩm.");
      return;
    }

    const token = localStorage.getItem("token");
    const decoded = decodeToken(token);
    const userId = decoded?.id;

    if (!token || !userId) {
      toast.error(
        "Bạn cần đăng nhập để xóa sản phẩm khỏi danh sách yêu thích."
      );
      return;
    }

    try {
      const response = await axios.delete(
        `${Constants.DOMAIN_API}/users/${userId}/wishlist/${selectedVariant.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.info(response.data.message || "Đã xóa khỏi danh sách yêu thích!");
      setIsInWishlist(false);
      await checkWishlistStatus(selectedVariant.id);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Lỗi khi xóa khỏi danh sách yêu thích.";
      toast.error(errorMessage);
    }
  };

  function decodeHtml(html) {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
  }

  const [expanded, setExpanded] = useState(false);
  const attributes = selectedVariant?.attributeValues || [];

  const QuickViewDialog = () =>
    isQuickViewOpen &&
    ReactDOM.createPortal(
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center min-h-screen z-50"
        onClick={() => setIsQuickViewOpen(false)}
      >
        <div
          ref={dialogRef}
          className="bg-white p-4 rounded-lg max-w-[600px] w-full max-h-[500px] relative grid grid-cols-2 gap-4 shadow-xl border border-gray-200 overflow-y-auto"
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "linear-gradient(135deg, #fff 0%, #f9f9f9 100%)",
            zIndex: 1000,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => setIsQuickViewOpen(false)}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <div className="overflow-hidden mt-5 relative">
       <div className="w-full h-64 relative">
  <img
    src={thumbnail}
    alt={productName}
    className="w-full h-full object-contain rounded-lg shadow-sm transition-transform duration-300"
  />

  {/* Nút chuyển ảnh trái */}
  {variantImages.length > 1 && (
    <button
      onClick={() =>
        setCurrentImageIndex((prev) =>
          prev === 0 ? variantImages.length - 1 : prev - 1
        )
      }
      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/70 hover:bg-white text-gray-800 rounded-full p-1 shadow z-10"
    >
      ◀
    </button>
  )}

  {/* Nút chuyển ảnh phải */}
  {variantImages.length > 1 && (
    <button
      onClick={() =>
        setCurrentImageIndex((prev) =>
          prev === variantImages.length - 1 ? 0 : prev + 1
        )
      }
      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/70 hover:bg-white text-gray-800 rounded-full p-1 shadow z-10"
    >
      ▶
    </button>
  )}
</div>


            {discountPercent > 0 && displayOriginalPrice > displayPrice && (
              <span className="absolute top-2 right-2 text-white text-xs font-semibold bg-qred px-2 py-1 rounded z-10">
                {discountType === "percentage"
                  ? `-${discountPercent}%`
                  : `-${Number(discountAmount).toLocaleString("vi-VN")}₫`}
              </span>
            )}
            <div className="grid grid-cols-4 gap-1.5 mt-5 max-h-28 overflow-y-auto">
              {variantImages.map((img) => (
                <div
                  key={img.id || img.image_url}
                  onClick={() => setSelectedImage(img.image_url)}
                  className={`w-[60px] h-[60px] p-1 border rounded-md cursor-pointer ${
                    selectedImage === img.image_url
                      ? "border-blue-500"
                      : "border-gray-200"
                  } hover:border-blue-400 transition-colors`}
                >
                  <img
                    src={img.image_url}
                    alt=""
                    className="w-full h-full object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col space-y-3">
            <h2 className="text-lg font-semibold text-gray-800 line-clamp-2">
              {productName}
            </h2>
            <div className="flex items-center gap-2 mb-2">
              <StarRating rating={avgRating} readOnly />
              <span className="text-sm text-gray-600"></span>
            </div>
            {variants.length > 0 && (
              <div>
                <span className="block text-xs font-medium text-gray-600 mb-1">
                  Biến thể:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {variants.map((variant) => {
                    const name = variant.name || variant.sku || "Unnamed";
                    const originalPrice = Number(variant.price || 0);
                    const salePrice = Number(
                      variant.final_price ||
                        variant.promotion?.discounted_price ||
                        originalPrice
                    );
                    const variantDiscountPercent = Math.round(
                      Number(
                        variant.promotion?.discount_percent ||
                          (salePrice < originalPrice
                            ? ((originalPrice - salePrice) / originalPrice) *
                              100
                            : 0)
                      )
                    );
                    const variantDiscountAmount = originalPrice - salePrice;
                    const variantDiscountType =
                      variant.promotion?.discount_type || null;
                    const inStock = variant.stock > 0;
                    const isSelected = selectedVariant?.id === variant.id;
                    return (
                      <button
                        key={variant.id}
                        className={`border rounded-md p-2 text-xs text-center transition relative ${
                          inStock
                            ? isSelected
                              ? "border-blue-500 bg-blue-50 text-gray-800"
                              : "border-gray-300 hover:bg-gray-100 text-gray-800"
                            : "border-gray-300 opacity-60 cursor-not-allowed text-gray-500"
                        }`}
                        onClick={() => inStock && handleVariantSelect(variant)}
                        disabled={!inStock}
                      >
                        <p className="font-medium">{name}</p>
                        <p className="text-qred font-semibold">
                          {salePrice.toLocaleString("vi-VN")}₫
                        </p>
                        {variantDiscountPercent > 0 &&
                          salePrice < originalPrice && (
                            <div className="flex items-center justify-center space-x-1">
                              <p className="text-qgray line-through text-[10px]">
                                {originalPrice.toLocaleString("vi-VN")}₫
                              </p>
                              <span className="text-white text-[10px] font-semibold bg-qred px-1 rounded">
                                {variantDiscountType === "percentage"
                                  ? `-${variantDiscountPercent}%`
                                  : `-${variantDiscountAmount.toLocaleString(
                                      "vi-VN"
                                    )}₫`}
                              </span>
                            </div>
                          )}
                        <p className="text-[10px] font-medium">
                          {inStock ? `Còn: ${variant.stock}` : "Hết hàng"}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            {selectedVariant && selectedVariant.attributeValues?.length > 0 && (
              <div className="text-xs mt-2">
                <span className="block font-semibold text-gray-700 mb-1">
                  Thuộc tính:
                </span>
                <div
                  className={`overflow-x-auto transition-all duration-300 border border-gray-300 ${
                    expanded ? "max-h-none" : "max-h-24 overflow-y-hidden"
                  }`}
                >
                  <table className="min-w-[200px] text-xs table-fixed w-full">
                    <tbody>
                      {attributes.map((attr, index) => {
                        const attrName = attr.attribute?.name || "—";
                        const attrValue = attr.value || "—";
                        return (
                          <tr key={index} className="border-t border-gray-200">
                            <td className="w-1/2 border border-gray-300 p-1 text-gray-600 font-medium whitespace-nowrap">
                              <b>{attrName}</b>
                            </td>
                            <td className="w-1/2 border border-gray-300 p-1 text-gray-800 whitespace-nowrap">
                              {attrName.toLowerCase() === "color" ? (
                                <div className="flex items-center gap-1">
                                  <div
                                    className="w-4 h-4 rounded-full border border-gray-400"
                                    style={{ backgroundColor: attrValue }}
                                    title={attrValue}
                                  />
                                  <span>{attrValue}</span>
                                </div>
                              ) : (
                                attrValue
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {attributes.length > 3 && (
                  <button
                    className="mt-1 text-dark-600 hover:underline text-[12px]"
                    onClick={() => setExpanded(!expanded)}
                  >
                    {expanded ? "Thu gọn" : "Xem thêm"}
                  </button>
                )}
              </div>
            )}
            <div className="flex items-center space-x-2">
              {hasStock ? (
                <>
                  <span className="text-qred font-semibold text-xl">
                    {Number(displayPrice).toLocaleString("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    })}
                  </span>

                  {discountPercent > 0 &&
                    displayOriginalPrice > displayPrice && (
                      <div className="flex flex-col">
                        <span className="text-qgray line-through text-xs">
                          {Number(displayOriginalPrice).toLocaleString(
                            "vi-VN",
                            { style: "currency", currency: "VND" }
                          )}
                        </span>
                        <span className="text-qgreen text-xs">
                          Tiết kiệm:{" "}
                          {discountType === "percentage"
                            ? `-${discountPercent}%`
                            : `${Number(discountAmount).toLocaleString(
                                "vi-VN",
                                { style: "currency", currency: "VND" }
                              )}`}
                        </span>
                      </div>
                    )}
                </>
              ) : (
                <span className="text-qred font-semibold text-sm">
                  Sản phẩm hết hàng
                </span>
              )}
            </div>
            {hasStock && (
              <div className="flex items-center space-x-2">
                <button
                  className="px-1.5 py-0.5 bg-gray-200 rounded text-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    const scrollTop = dialogRef.current?.scrollTop;
                    setQuantity((prev) => Math.max(1, prev - 1));
                    setTimeout(() => {
                      if (dialogRef.current)
                        dialogRef.current.scrollTop = scrollTop;
                    }, 0);
                  }}
                  disabled={quantity <= 1 || !hasStock}
                >
                  -
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => {
                    const scrollTop = dialogRef.current?.scrollTop;
                    setQuantity(
                      Math.max(
                        1,
                        Math.min(
                          selectedVariant?.stock || totalStock,
                          Number(e.target.value)
                        )
                      )
                    );
                    setTimeout(() => {
                      if (dialogRef.current)
                        dialogRef.current.scrollTop = scrollTop;
                    }, 0);
                  }}
                  className="w-12 text-center border border-gray-300 rounded text-sm"
                  min="1"
                  max={selectedVariant?.stock || totalStock}
                  disabled={!hasStock}
                  onClick={(e) => e.stopPropagation()}
                />
                <button
                  className="px-1.5 py-0.5 bg-gray-200 rounded text-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    const scrollTop = dialogRef.current?.scrollTop;
                    setQuantity((prev) =>
                      Math.min(selectedVariant?.stock || totalStock, prev + 1)
                    );
                    setTimeout(() => {
                      if (dialogRef.current)
                        dialogRef.current.scrollTop = scrollTop;
                    }, 0);
                  }}
                  disabled={
                    quantity >= (selectedVariant?.stock || totalStock) ||
                    !hasStock
                  }
                >
                  +
                </button>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={addToCart}
                className={`flex-1 py-2 bg-blue-600 text-white text-sm font-medium rounded uppercase tracking-wide hover:bg-blue-700 transition-colors duration-200 ${
                  !hasStock || (variants.length > 0 && !selectedVariant)
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                disabled={
                  !hasStock || (variants.length > 0 && !selectedVariant)
                }
              >
                <FiShoppingCart size={18} className="inline mr-2" />
                Thêm giỏ hàng
              </button>
              <button
                onClick={
                  isInWishlist ? handleRemoveFromWishlist : handleAddToWishlist
                }
                className="px-3 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                <ThinLove
                  className="w-5 h-5 inline"
                  fill={isInWishlist ? "#FF0000" : "none"}
                  stroke={isInWishlist ? "#FF0000" : "#000000"}
                />
              </button>
            </div>
          </div>
        </div>
      </div>,
      document.body
    );

  if (!product.id) {
    console.warn("Skipping render for product with invalid ID:", product);
    return null;
  }

  const handleNavigate = (e) => {
    if (!product.id) {
      e.preventDefault();
      toast.error("Sản phẩm không hợp lệ!");
      return;
    }

    navigate("/product", {
      state: {
        productId: product.id,
      },
    });
  };

  if (loading) return <div>Đang tải sản phẩm...</div>;
  if (error) return <div>Lỗi: {error}</div>;

  return (
    <div
      className="product-card-one w-full h-full bg-white relative group overflow-hidden"
      style={{ boxShadow: "0px 15px 64px 0px rgba(0, 0, 0, 0.05)" }}
    >
      <div className="product-card-img w-full h-[300px] overflow-hidden relative">
        <div className="w-full h-full flex items-center justify-center">
          <img
            src={thumbnail}
            alt={productName}
            className="max-w-full max-h-full object-contain"
          />
        </div>
        {discountPercent > 0 && displayOriginalPrice > displayPrice && (
          <span className="absolute top-2 right-2 text-white text-xs font-semibold bg-qred px-2 py-1 rounded z-10 sm:text-sm sm:px-3 sm:py-1.5">
            {discountType === "percentage"
              ? `-${discountPercent}%`
              : `-${Number(discountAmount).toLocaleString("vi-VN")}₫`}
          </span>
        )}
      </div>
      <div className="product-card-details px-[30px] pb-[30px] relative min-h-[150px]">
        <div className="absolute w-full h-10 px-[30px] left-0 top-40 group-hover:top-[85px] transition-all duration-300 ease-in-out z-10">
          <button
            type="button"
            className={`bg-blue-600 hover:bg-blue-700 text-white w-full h-full flex items-center justify-center gap-2 ${
              !hasStock || (variants.length > 0 && !selectedVariant)
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
            disabled={!hasStock || (variants.length > 0 && !selectedVariant)}
            onClick={addToCart}
          >
            <FiShoppingCart size={18} />
            THÊM GIỎ HÀNG
          </button>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <StarRating rating={avgRating} readOnly />
          <span className="text-sm text-gray-600"></span>
        </div>
        <p
          className="title mb-2 text-[15px] font-600 text-qblack leading-[24px] line-clamp-2 hover:text-blue-600 cursor-pointer"
          onClick={handleNavigate}
        >
          {productName}
        </p>
        {hasStock ? (
          <div className="price-container flex flex-col gap-1 group-hover:hidden">
            <div className="price flex items-center space-x-2">
              <span
                className={`offer-price ${
                  discountPercent > 0 && displayOriginalPrice > displayPrice
                    ? "text-qred"
                    : "text-qblack"
                } font-600 text-[18px]`}
              >
                {Number(displayPrice).toLocaleString("vi-VN", {
                  style: "currency",
                  currency: "VND",
                })}
              </span>
              {discountPercent > 0 && displayOriginalPrice > displayPrice && (
                <div className="flex flex-col">
                  <span className="main-price text-qgray line-through font-600 text-[16px]">
                    {Number(displayOriginalPrice).toLocaleString("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    })}
                  </span>
                  {/* <span className="text-qgreen text-xs">
                    Tiết kiệm: {discountType === "percentage" ? `-${discountPercent}%` : `${Number(discountAmount).toLocaleString("vi-VN", { style: "currency", currency: "VND" })}`}
                  </span> */}
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="price text-qred font-600 text-[16px] group-hover:hidden">
            Sản phẩm hết hàng
          </p>
        )}
      </div>
      <div className="quick-access-btns flex flex-col space-y-2 absolute group-hover:right-4 -right-10 top-20 transition-all duration-300 ease-in-out">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setIsQuickViewOpen(true);
          }}
        >
          <span className="w-10 h-10 flex justify-center items-center bg-primarygray rounded">
            <QuickViewIco className="w-5 h-5" />
          </span>
        </a>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            isInWishlist ? handleRemoveFromWishlist() : handleAddToWishlist();
          }}
        >
          <span className="w-10 h-10 flex justify-center items-center bg-primarygray rounded">
            <ThinLove
              className="w-5 h-5"
              fill={isInWishlist ? "#FF0000" : "none"}
              stroke={isInWishlist ? "#FF0000" : "#000000"}
            />
          </span>
        </a>
        <a
          href="#"
          onClick={async (e) => {
            e.preventDefault();
            try {
              const res = await axios.get(
                `${Constants.DOMAIN_API}/products/${product.id}/variants`
              );
              const fetchedProduct = res.data.product;
              const allVariants = [];
              fetchedProduct.variants.forEach((variant) => {
                allVariants.push({
                  productId: fetchedProduct.id,
                  productName: fetchedProduct.name,
                  productDescription: fetchedProduct.description,
                  productThumbnail: fetchedProduct.thumbnail,
                  brand: fetchedProduct.brand?.name || "-",
                  averageRating: fetchedProduct.averageRating,
                  ratingCount: fetchedProduct.ratingCount,
                  variantId: variant.id,
                  price: variant.price,
                  stock: variant.stock,
                  sku: variant.sku,
                  images: variant.images,
                  attributeValues: variant.attributeValues,
                });
              });
              const clickedVariant = allVariants.find(
                (v) =>
                  v.productId === product.id &&
                  v.variantId ===
                    (selectedVariant?.id || fetchedProduct.variants?.[0]?.id)
              );
              if (!clickedVariant) {
                toast.error("Sản phẩm không có biến thể hợp lệ để so sánh.");
                return;
              }
              const current =
                JSON.parse(localStorage.getItem("compareList")) || [];
              const exists = current.find(
                (item) => item.variantId === clickedVariant.variantId
              );
              if (!exists) {
                const updated = [...current, clickedVariant].slice(0, 4);
                localStorage.setItem("compareList", JSON.stringify(updated));
                toast.success("Đã thêm sản phẩm vào so sánh!");
              } else {
                toast.info("Sản phẩm đã có trong danh sách so sánh!");
              }
              navigate("/products-compaire");
            } catch (error) {
              console.error(error);
              toast.error("Đã xảy ra lỗi khi lấy dữ liệu so sánh.");
            }
          }}
        >
          <span className="w-10 h-10 flex justify-center items-center bg-primarygray rounded">
            <Compair className="w-5 h-5" />
          </span>
        </a>
      </div>
      <QuickViewDialog />
    </div>
  );
}
