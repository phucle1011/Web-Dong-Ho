import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { decodeToken } from "../../Helpers/jwtDecode";
import Constants from "../../../../Constants";
import Compair from "../icons/Compair";
import QuickViewIco from "../icons/QuickViewIco";
import Star from "../icons/Star";
import ThinLove from "../icons/ThinLove";
import ReactDOM from "react-dom";

export default function ProductCardStyleOne({ datas, type }) {
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [variantImages, setVariantImages] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  // Memoize product and variants
  const product = useMemo(() => datas || {}, [datas]);
  const variants = useMemo(() => Array.isArray(product.variants) ? product.variants : [], [product.variants]);

  // // Log for debugging
  // useEffect(() => {
  //   console.log("ProductCardStyleOne mounted with product.id:", product.id, "variants length:", variants.length);
  //   return () => console.log("ProductCardStyleOne unmounted for product.id:", product.id);
  // }, [product.id]);

  // Initialize state only once
  useEffect(() => {
    if (!product.id) return; // Skip if invalid product

    const firstImage = product.thumbnail || "/images/no-image.jpg";
    const validVariants = variants.filter(
      (variant) => parseInt(variant.stock) > 0 && parseFloat(variant.price) > 0
    );

    // Initialize states only if not set
    setSelectedImage((prev) => prev || firstImage);
    setVariantImages((prev) => prev.length === 0 ? variants.flatMap((v) => v.images || []) : prev);
    
    if (validVariants.length > 0 && !selectedVariant) {
      const firstValid = validVariants[0];
      setSelectedVariant(firstValid);
      const firstVariantImages = firstValid.images || [];
      if (firstVariantImages.length > 0) {
        setSelectedImage(firstVariantImages[0].image_url || firstValid.thumbnail || firstImage);
      }
    }
  }, [product.id, product.thumbnail, variants]); // Minimal dependencies

  // Memoize calculations
  const totalStock = useMemo(() =>
    product.total_stock || variants.reduce((sum, variant) => sum + (parseInt(variant.stock) || 0), 0),
    [product.total_stock, variants]
  );

  const validVariants = useMemo(() =>
    variants.filter((variant) => parseInt(variant.stock) > 0 && parseFloat(variant.price) > 0),
    [variants]
  );

  const priceInfo = useMemo(() => {
    let displayPrice = 0;
    let displayOriginalPrice = 0;
    let hasStock = true;
    let discountPercent = 0;

    if (variants.length > 0) {
      if (validVariants.length > 0) {
        const initialVariant = selectedVariant || validVariants[0];
        displayOriginalPrice = parseFloat(initialVariant.price) || 0;
        displayPrice = parseFloat(initialVariant.price) || 0;

        if (
          initialVariant.promotion &&
          initialVariant.promotion.discounted_price > 0 &&
          initialVariant.promotion.discount_percent > 0
        ) {
          displayPrice = parseFloat(initialVariant.promotion.discounted_price);
          discountPercent = parseFloat(initialVariant.promotion.discount_percent) || 0;
          // console.log(
          //   `Price calculation for product ${product.id} variant ${initialVariant.id}: discountPercent=${discountPercent}, discountedPrice=${displayPrice}`
          // );
        }

        discountPercent = Math.round(discountPercent);
        if (isNaN(discountPercent) || discountPercent < 0 || discountPercent > 100) {
          discountPercent = 0;
        }
      } else {
        hasStock = false;
      }
    } else {
      displayOriginalPrice = parseFloat(product.price) || 0;
      displayPrice = parseFloat(product.price) || 0;
      hasStock = parseInt(product.stock) > 0;
      if (
        product.promotion &&
        product.promotion.discounted_price > 0 &&
        product.promotion.discount_percent > 0
      ) {
        displayPrice = parseFloat(product.promotion.discounted_price);
        discountPercent = parseFloat(product.promotion.discount_percent) || 0;
        // console.log(
        //   `Price calculation for product ${product.id}: discountPercent=${discountPercent}, discountedPrice=${displayPrice}`
        // );
      }

      discountPercent = Math.round(discountPercent);
      if (isNaN(discountPercent) || discountPercent < 0 || discountPercent > 100) {
        discountPercent = 0;
      }
    }

    return { displayPrice, displayOriginalPrice, hasStock, discountPercent };
  }, [product, variants, selectedVariant]);

  const { displayPrice, displayOriginalPrice, hasStock, discountPercent } = priceInfo;
  const thumbnail = selectedImage || product.thumbnail?.trim() || "/images/no-image.jpg";
  const productName = product.name?.trim() || product.title?.trim() || "Sản phẩm không tên";

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
      await axios.post(
        `${Constants.DOMAIN_API}/add-to-carts`,
        { userId, productVariantId: variantId, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Đã thêm vào giỏ hàng thành công!");
    } catch (error) {
      console.error("Add to cart error:", error);
      toast.error("Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng.");
    }
  };

  const addToCart = () => {
    if (variants.length > 0 && !selectedVariant) {
      toast.error("Vui lòng chọn biến thể trước khi thêm vào giỏ hàng");
      return;
    }
    if (quantity > (selectedVariant?.stock || totalStock)) {
      toast.error(`Chỉ còn ${selectedVariant?.stock || totalStock} sản phẩm trong kho`);
      return;
    }
    const variantToAdd = selectedVariant || (validVariants.length > 0 ? validVariants[0] : null);
    if (variantToAdd) {
      handleAddToCart(variantToAdd.id, quantity);
    } else {
      toast.error("Không có biến thể hợp lệ để thêm vào giỏ hàng.");
    }
  };

  const description = product.description?.trim() || "Không có mô tả";
  const maxLength = 80;
  const isLongDescription = description.length > maxLength;
  const truncatedDescription = isLongDescription && !isExpanded
    ? description.slice(0, maxLength) + "..."
    : description;

  const handleVariantSelect = (variant) => {
    if (!variant || selectedVariant?.id === variant.id || variant.stock <= 0) {
      return;
    }
    setSelectedVariant(variant);
    const newImages = variant.images || [];
    setVariantImages(newImages);
    setSelectedImage(newImages.length > 0 ? newImages[0].image_url || thumbnail : thumbnail);
  };

  const QuickViewDialog = () =>
    isQuickViewOpen &&
    ReactDOM.createPortal(
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center min-h-screen z-50"
        onClick={() => setIsQuickViewOpen(false)}
      >
        <div
          className="bg-white p-4 rounded-lg max-w-[550px] w-full max-h-[450px] relative grid grid-cols-2 gap-4 shadow-xl border border-gray-200 overflow-y-auto"
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
          <div className="overflow-hidden mt-5">
            <img
              src={thumbnail}
              alt={productName}
              className="w-full max-h-56 aspect-square object-contain rounded-lg shadow-sm hover:scale-105 transition-transform duration-300"
            />
            <div className="grid grid-cols-4 gap-1.5 mt-5 max-h-28 overflow-y-auto">
              {(variantImages.length > 0 ? variantImages : product.variantImages || []).map((img) => (
                <div
                  key={img.id || img.image_url}
                  onClick={() => setSelectedImage(img.image_url)}
                  className={`w-[55px] h-[55px] p-1 border rounded-md cursor-pointer ${
                    selectedImage === img.image_url ? "border-blue-500" : "border-gray-200"
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
            <h2 className="text-lg font-semibold text-gray-800 line-clamp-2">{productName}</h2>
            <p className="text-gray-600 text-xs">
              <span className="font-medium">Mô tả:</span> {truncatedDescription}
              {isLongDescription && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-blue-600 hover:underline ml-1 text-xs"
                >
                  {isExpanded ? "Thu gọn" : "Xem thêm"}
                </button>
              )}
            </p>
            {variants.length > 0 && (
              <div>
                <span className="block text-xs font-medium text-gray-600 mb-1">Biến thể:</span>
                <div className="grid grid-cols-2 gap-2">
                  {variants.map((variant) => {
                    const name = variant.name || variant.sku || "Unnamed";
                    const originalPrice = Number(variant.price || 0);
                    const salePrice = Number(variant.promotion?.discounted_price || originalPrice);
                    const variantDiscountPercent = Math.round(Number(variant.promotion?.discount_percent || 0));
                    const inStock = variant.stock > 0;
                    const isSelected = selectedVariant?.id === variant.id;
                    return (
                      <button
                        key={variant.id}
                        className={`border rounded-md p-2 text-xs text-center transition ${
                          inStock ? "cursor-pointer hover:bg-gray-100" : "opacity-50 cursor-not-allowed"
                        } ${isSelected ? "border-blue-500 bg-blue-50" : "border-gray-300"}`}
                        onClick={() => inStock && handleVariantSelect(variant)}
                        disabled={!inStock}
                      >
                        <p className="font-medium">{name}</p>
                        <p className="text-red-500 font-semibold">
                          {salePrice.toLocaleString("vi-VN")}₫
                        </p>
                        {variantDiscountPercent > 0 && salePrice < originalPrice && (
                          <div className="flex items-center justify-center space-x-1">
                            <p className="text-gray-400 line-through text-[10px]">
                              {originalPrice.toLocaleString("vi-VN")}₫
                            </p>
                            <span className="text-white text-[10px] font-semibold bg-red-500 px-1 rounded">
                              -{variantDiscountPercent}%
                            </span>
                          </div>
                        )}
                        <p className="text-[10px]">{inStock ? `Còn: ${variant.stock}` : "Hết hàng"}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            {selectedVariant && selectedVariant.attributeValues?.length > 0 && (
              <div>
                <span className="block text-xs font-medium text-gray-600 mb-1">Thuộc tính:</span>
                <ul className="text-xs space-y-1">
                  {selectedVariant.attributeValues.map((attr, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <span className="text-gray-600">{attr.attribute?.name || "N/A"}:</span>
                      {attr.attribute?.name.toLowerCase() === "color" ? (
                        <div
                          className="w-4 h-4 rounded border border-gray-300"
                          style={{ backgroundColor: attr.value }}
                          title={attr.value}
                        />
                      ) : (
                        <span className="text-gray-800">{attr.value || "N/A"}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <span className="text-red-600 font-semibold text-sm">
                {Number(displayPrice).toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
              </span>
              {discountPercent > 0 && displayOriginalPrice > displayPrice && (
                <div className="flex items-center space-x-1">
                  <span className="text-gray-400 line-through text-xs">
                    {Number(displayOriginalPrice).toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
                  </span>
                  <span className="text-white text-[10px] font-semibold bg-red-500 px-1 rounded">
                    -{discountPercent}%
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <button
                className="px-1.5 py-0.5 bg-gray-200 rounded text-sm"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                -
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Math.min(totalStock, Number(e.target.value))))}
                className="w-12 text-center border border-gray-300 rounded text-sm"
                min="1"
                max={totalStock}
              />
              <button
                className="px-1.5 py-0.5 bg-gray-200 rounded text-sm"
                onClick={() => setQuantity(Math.min(totalStock, quantity + 1))}
                disabled={quantity >= totalStock}
              >
                +
              </button>
            </div>
            <button
              type="button"
              onClick={addToCart}
              className={`w-full py-2 bg-blue-600 text-white text-sm font-medium rounded uppercase tracking-wide hover:bg-blue-700 transition-colors duration-200 ${
                !hasStock || (variants.length > 0 && !selectedVariant) ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={!hasStock || (variants.length > 0 && !selectedVariant)}
            >
              Thêm giỏ hàng
            </button>
          </div>
        </div>
      </div>,
      document.body
    );

  // Skip render if product is invalid
  if (!product.id) {
    console.warn("Skipping render for product with invalid ID:", product);
    return null;
  }

  // Handle navigation
  const handleNavigate = (e) => {
    if (!product.id || product.id === "unknown") {
      e.preventDefault();
      // console.warn("Invalid product ID, preventing navigation:", product.id);
      toast.error("Sản phẩm không hợp lệ!");
      return;
    }
    // console.log("Navigating to product:", `/product/${product.id}`);
    navigate(`/product/${product.id}`);
  };

  return (
    <div
      className="product-card-one w-full h-full bg-white relative group overflow-hidden"
      style={{ boxShadow: "0px 15px 64px 0px rgba(0, 0, 0, 0.05)" }}
    >
      <div className="product-card-img w-full h-[300px] overflow-hidden">
        <img
          src={thumbnail}
          alt={productName}
          className="w-full h-full object-contain"
        />
      </div>
      <div className="product-card-details px-[30px] pb-[30px] relative min-h-[150px]">
        <div className="absolute w-full h-10 px-[30px] left-0 top-40 group-hover:top-[85px] transition-all duration-300 ease-in-out z-10">
          <button
            type="button"
            className={`bg-blue-600 hover:bg-blue-700 text-white w-full h-full ${
              !hasStock || (variants.length > 0 && !selectedVariant) ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={!hasStock || (variants.length > 0 && !selectedVariant)}
            onClick={addToCart}
          >
            THÊM GIỎ HÀNG
          </button>
        </div>
        <div className="reviews flex space-x-[1px] mb-3 mt-[10px]">
          {Array.from({ length: product.review || 5 }).map((_, i) => (
            <span key={i}>
              <Star className="w-4 h-4 text-yellow-400" />
            </span>
          ))}
        </div>
        <div className="mt-2 text-[11px] text-qblack flex justify-between">
          <span>
            Tổng Lượng Sản Phẩm: <strong>{totalStock}</strong>
          </span>
        </div>
        <Link to={`/product/${product.id || "unknown"}`} onClick={handleNavigate}>
          <p className="title mb-2 text-[15px] font-600 text-qblack leading-[24px] line-clamp-2 hover:text-blue-600">
            {productName}
          </p>
        </Link>
        {displayPrice > 0 ? (
          <div className="price-container group-hover:hidden">
            <p className="price flex items-center space-x-2">
              <span
                className={`offer-price ${
                  discountPercent > 0 ? "text-qred" : "text-qblack"
                } font-600 text-[18px]`}
              >
                {Number(displayPrice).toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
              </span>
              {discountPercent > 0 && displayOriginalPrice > displayPrice && (
                <div className="flex items-center space-x-1">
                  <span className="main-price text-qgray line-through font-600 text-[16px]">
                    {Number(displayOriginalPrice).toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
                  </span>
                  <span className="discount-percent text-white text-xs font-semibold bg-qred px-2 py-0.5 rounded">
                    -{discountPercent}%
                  </span>
                </div>
              )}
            </p>
          </div>
        ) : (
          <p className="price text-qgray font-600 text-[16px] group-hover:hidden">
            Giá không khả dụng
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
        <a href="#">
          <span className="w-10 h-10 flex justify-center items-center bg-primarygray rounded">
            <ThinLove className="w-5 h-5" />
          </span>
        </a>
        <a href="#">
          <span className="w-10 h-10 flex justify-center items-center bg-primarygray rounded">
            <Compair className="w-5 h-5" />
          </span>
        </a>
      </div>
      <QuickViewDialog />
    </div>
  );
}