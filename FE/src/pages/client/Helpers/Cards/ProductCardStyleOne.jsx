import { Link } from "react-router-dom";
import Compair from "../icons/Compair";
import QuickViewIco from "../icons/QuickViewIco";
import Star from "../icons/Star";
import ThinLove from "../icons/ThinLove";

export default function ProductCardStyleOne({ datas, type }) {
  const product = datas || {};
  const variants = Array.isArray(product.variants) ? product.variants : [];

  // Initialize prices
  let displayPrice = 0;
  let displayOriginalPrice = 0;
  let hasStock = true;
  let discountPercent = 0;

  // Handle variants if they exist
  if (variants.length > 0) {
    // Filter valid variants (in stock and valid price)
    const validVariants = variants.filter(
      (variant) => parseInt(variant.stock) > 0 && parseFloat(variant.price) > 0
    );

    if (validVariants.length > 0) {
      // Find the variant with the lowest price (prefer discounted price if available)
      const cheapestVariant = validVariants.reduce((prev, current) => {
        const prevPrice = current.promotion?.discounted_price
          ? parseFloat(current.promotion.discounted_price)
          : parseFloat(current.price);
        const currentPrice = current.promotion?.discounted_price
          ? parseFloat(current.promotion.discounted_price)
          : parseFloat(current.price);
        return currentPrice < prevPrice ? current : prev;
      }, validVariants[0]);
console.log("Cheapest Variant Promotion:", cheapestVariant?.promotion);

      displayOriginalPrice = parseFloat(cheapestVariant.price) || 0;
      displayPrice = cheapestVariant.promotion?.discounted_price
        ? parseFloat(cheapestVariant.promotion.discounted_price)
        : parseFloat(cheapestVariant.price) || 0;
      discountPercent = cheapestVariant.promotion?.discount_percent
        ? parseFloat(cheapestVariant.promotion.discount_percent)
        : 0;

      // Ensure discountPercent is reasonable (0-100%)
      if (discountPercent > 100 || discountPercent < 0) {
        discountPercent = 0;
      }
    } else {
      hasStock = false;
      displayPrice = 0;
      displayOriginalPrice = 0;
    }
  } else {
    // Fallback to product price if no variants
    displayPrice = parseFloat(product.price) || 0;
    displayOriginalPrice = parseFloat(product.price) || 0;
    hasStock = parseInt(product.stock) > 0;
  }

  // Fallback for product image
  const thumbnail = product.thumbnail?.trim() || "/images/no-image.jpg";

  // Fallback for product name
  const productName = product.name?.trim() || product.title?.trim() || "Sản phẩm không tên";

  // Calculate campaign progress if applicable
  const available =
    product.campaingn_product &&
    typeof product.cam_product_sale === "number" &&
    typeof product.cam_product_available === "number"
      ? (product.cam_product_sale /
          (product.cam_product_available + product.cam_product_sale)) *
        100
      : 0;

  return (
    <div
      className="product-card-one w-full h-full bg-white relative group overflow-hidden"
      style={{ boxShadow: "0px 15px 64px 0px rgba(0, 0, 0, 0.05)" }}
    >
      {/* Product image */}
      <div
        className="product-card-img w-full h-[300px]"
        style={{
          background: `url(${thumbnail}) no-repeat center`,
          backgroundSize: "cover",
        }}
      >
        {/* Product available progress */}
        {product.campaingn_product && (
          <div className="px-[30px] absolute left-0 top-3 w-full">
            <div className="progress-title flex justify-between">
              <p className="text-xs text-qblack font-400 leading-6">
                Sản phẩm còn lại
              </p>
              <span className="text-sm text-qblack font-600 leading-6">
                {product.cam_product_available || 0}
              </span>
            </div>
            <div className="progress w-full h-[5px] rounded-[22px] bg-primarygray relative overflow-hidden">
              <div
                style={{ width: `${100 - available}%` }}
                className={`h-full absolute left-0 top-0 ${
                  type === 3 ? "bg-qh3-blue" : "bg-qyellow"
                }`}
              ></div>
            </div>
          </div>
        )}
        {/* Product type */}
        {product.product_type && !product.campaingn_product && (
          <div className="product-type absolute right-[14px] top-[17px]">
            <span
              className={`text-[9px] font-700 leading-none py-[6px] px-3 uppercase text-white rounded-full tracking-wider ${
                product.product_type === "popular" ? "bg-[#19CC40]" : "bg-qyellow"
              }`}
            >
              {product.product_type}
            </span>
          </div>
        )}
        {/* Discount badge */}
        {discountPercent > 0 && (
          <div className="discount-badge absolute left-[14px] top-[17px]">
            <span className="text-[9px] font-700 leading-none py-[6px] px-3 uppercase text-white bg-qred rounded-full tracking-wider">
              -{discountPercent.toFixed(0)}%
            </span>
          </div>
        )}
      </div>

      {/* Product details */}
      <div className="product-card-details px-[30px] pb-[30px] relative min-h-[150px]">
        {/* Add to cart button */}
        <div className="absolute w-full h-10 px-[30px] left-0 top-40 group-hover:top-[85px] transition-all duration-300 ease-in-out z-10">
          <button
            type="button"
            className={`w-full py-2.5 rounded-lg text-white font-medium transition-colors duration-200 ${
              type === 3 ? "bg-blue-600 hover:bg-blue-700" : "bg-yellow-500 hover:bg-yellow-600"
            } ${!hasStock ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={!hasStock}
          >
            <div className="flex items-center justify-center space-x-3">
              <span>
                <svg
                  width="14"
                  height="16"
                  viewBox="0 0 14 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="fill-current"
                >
                  <path d="M12.5664 4.14176C12.4665 3.87701 12.2378 3.85413 11.1135 3.85413H10.1792V3.43576C10.1792 2.78532 10.089 2.33099 9.86993 1.86359C9.47367 1.01704 8.81003 0.425438 7.94986 0.150881C7.53106 0.0201398 6.90607 -0.0354253 6.52592 0.0234083C5.47246 0.193372 4.57364 0.876496 4.11617 1.85052C3.89389 2.32772 3.80368 2.78532 3.80368 3.43576V3.8574H2.8662C1.74187 3.8574 1.51313 3.88028 1.41326 4.15483C1.36172 4.32807 0.878481 8.05093 0.6723 9.65578C0.491891 11.0547 0.324369 12.3752 0.201948 13.3688C-0.0106763 15.0815 -0.00423318 15.1077 0.00220999 15.1371V15.1404C0.0312043 15.2515 0.317925 15.5424 0.404908 15.6274L0.781834 16H13.1785L13.4588 15.7483C13.5844 15.6339 14 15.245 14 15.0521C14 14.9214 12.5922 4.21694 12.5664 4.14176ZM12.982 14.8037C12.9788 14.8266 12.953 14.8952 12.9079 14.9443L12.8435 15.0162H1.13943L0.971907 14.8331L1.63233 9.82901C1.86429 8.04766 2.07047 6.4951 2.19289 5.56684C2.24766 5.16154 2.27343 4.95563 2.28631 4.8543C2.72123 4.85103 4.62196 4.84776 6.98661 4.84776H11.6901L11.6966 4.88372C11.7481 5.1452 12.9594 14.5128 12.982 14.8037ZM4.77338 3.8574V3.48479C4.77338 3.23311 4.80559 2.88664 4.84103 2.72649C5.03111 1.90935 5.67864 1.24584 6.48726 1.03339C6.82553 0.948403 7.37964 0.97782 7.71791 1.10202H7.72113C8.0755 1.22296 8.36545 1.41907 8.63284 1.71978C9.06453 2.19698 9.2095 2.62516 9.2095 3.41615V3.8574H4.77338Z" />
                </svg>
              </span>
              <span>Thêm giỏ hàng</span>
            </div>
          </button>
        </div>
        {/* Reviews */}
        <div className="reviews flex space-x-[1px] mb-3">
          {Array.from({ length: product.review || 5 }).map((_, i) => (
            <span key={i}>
              <Star className="w-4 h-4 text-yellow-400" />
            </span>
          ))}
        </div>
        {/* Product name */}
        <Link to={`/product/${product.id || "unknown"}`}>
          <p className="title mb-2 text-[15px] font-600 text-qblack leading-[24px] line-clamp-2 hover:text-blue-600">
            {productName}
          </p>
        </Link>
        {/* Price */}
        {displayPrice > 0 ? (
          <p className="price flex items-center space-x-2">
            <span
              className={`offer-price ${
                discountPercent > 0 ? "text-qred" : "text-qblack"
              } font-600 text-[18px]`}
            >
              {Number(displayPrice).toLocaleString("vi-VN", {
                style: "currency",
                currency: "VND",
              })}
            </span>
            {discountPercent > 0 && displayOriginalPrice > displayPrice && (
              <>
                <span className="main-price text-qgray line-through font-600 text-[16px]">
                  {Number(displayOriginalPrice).toLocaleString("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  })}
                </span>
                <span className="discount-percent text-white text-xs font-semibold bg-qred px-2 py-0.5 rounded">
                  -{discountPercent.toFixed(0)}%
                </span>
              </>
            )}
          </p>
        ) : (
          <p className="price text-qgray font-600 text-[16px]">
            Giá không khả dụng
          </p>
        )}
      </div>

      {/* Quick access buttons */}
      <div className="quick-access-btns flex flex-col space-y-2 absolute group-hover:right-4 -right-10 top-20 transition-all duration-300 ease-in-out">
        <a href="#">
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
    </div>
  );
}