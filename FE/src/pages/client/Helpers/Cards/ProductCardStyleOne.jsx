import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Compair from "../icons/Compair";
import QuickViewIco from "../icons/QuickViewIco";
import Star from "../icons/Star";
import ThinLove from "../icons/ThinLove";
import ReactDOM from "react-dom";

export default function ProductCardStyleOne({ datas, type }) {
  console.log("Product data:", datas); // Kiểm tra dữ liệu đầu vào
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false); // Trạng thái modal
  const [quantity, setQuantity] = useState(1); // Số lượng
  const [selectedVariant, setSelectedVariant] = useState(null); // Biến thể được chọn
  const [selectedImage, setSelectedImage] = useState(""); // Ảnh được chọn
  const [variantImages, setVariantImages] = useState([]); // Ảnh của các biến thể
  const [isExpanded, setIsExpanded] = useState(false); // Trạng thái mở rộng mô tả
  const product = datas || {};
  console.log("Processed product:", product); // Kiểm tra sau khi xử lý

  const variants = Array.isArray(product.variants) ? product.variants : [];

  // Trích xuất ảnh biến thể và thiết lập biến thể mặc định
  useEffect(() => {
    // Ảnh mặc định (iCloud URL hoặc fallback)
    const firstImage = product.thumbnail || "/images/no-image.jpg";
    setSelectedImage(firstImage);
    setVariantImages(variants.flatMap((v) => v.images || []));

    // Chọn biến thể đầu tiên có stock làm mặc định
    const validVariants = variants.filter(
      (variant) => parseInt(variant.stock) > 0 && parseFloat(variant.price) > 0
    );
    if (validVariants.length > 0 && !selectedVariant) {
      setSelectedVariant(validVariants[0]);
      const firstVariantImages = validVariants[0].images || [];
      setVariantImages(firstVariantImages);
      if (firstVariantImages.length > 0) {
        setSelectedImage(firstVariantImages[0].image_url || firstImage);
      }
    }
  }, [product.thumbnail, variants, selectedVariant]);

  // Tính tổng stock từ variants
  const totalStock =
    product.total_stock ||
    variants.reduce((sum, variant) => sum + (parseInt(variant.stock) || 0), 0);
  const availablePercent = product.cam_product_available
    ? (product.cam_product_available /
        (product.cam_product_available + (product.cam_product_sale || 0))) *
      100
    : 0;

  // Initialize prices
  let displayPrice = 0;
  let displayOriginalPrice = 0;
  let hasStock = true;
  let discountPercent = 0;

  // Handle variants if they exist
  if (variants.length > 0) {
    const validVariants = variants.filter(
      (variant) => parseInt(variant.stock) > 0 && parseFloat(variant.price) > 0
    );

    if (validVariants.length > 0) {
      const initialVariant = selectedVariant || validVariants[0];
      displayOriginalPrice = parseFloat(initialVariant.price) || 0;
      displayPrice = initialVariant.promotion?.discounted_price
        ? parseFloat(initialVariant.promotion.discounted_price)
        : parseFloat(initialVariant.price) || 0;

      // Tính phần trăm khuyến mãi
      if (initialVariant.promotion?.discount_percent) {
        discountPercent = parseFloat(initialVariant.promotion.discount_percent);
      } else if (displayOriginalPrice > displayPrice && displayOriginalPrice > 0) {
        discountPercent = ((displayOriginalPrice - displayPrice) / displayOriginalPrice) * 100;
      }

      if (isNaN(discountPercent) || discountPercent < 0 || discountPercent > 100) {
        discountPercent = 0;
      } else {
        discountPercent = Math.round(discountPercent);
      }
    } else {
      hasStock = false;
      displayPrice = 0;
      displayOriginalPrice = 0;
      discountPercent = 0;
    }
  } else {
    displayPrice = parseFloat(product.price) || 0;
    displayOriginalPrice = parseFloat(product.price) || 0;
    hasStock = parseInt(product.stock) > 0;
    if (product.promotion?.discounted_price) {
      displayPrice = parseFloat(product.promotion.discounted_price);
      if (displayOriginalPrice > displayPrice && displayOriginalPrice > 0) {
        discountPercent = ((displayOriginalPrice - displayPrice) / displayOriginalPrice) * 100;
        discountPercent = Math.round(discountPercent);
        if (isNaN(discountPercent) || discountPercent < 0 || discountPercent > 100) {
          discountPercent = 0;
        }
      }
    }
  }

  // Fallback for product image
  const thumbnail = selectedImage || product.thumbnail?.trim() || "/images/no-image.jpg";

  // Fallback for product name
  const productName =
    product.name?.trim() || product.title?.trim() || "Sản phẩm không tên";

  // Hàm thêm vào giỏ hàng
  const addToCart = () => {
    if (isQuickViewOpen && variants.length > 0 && !selectedVariant) {
      alert("Vui lòng chọn biến thể trước khi thêm vào giỏ hàng");
      return;
    }
    if (quantity > (selectedVariant?.stock || totalStock)) {
      alert(`Chỉ còn ${selectedVariant?.stock || totalStock} sản phẩm trong kho`);
      return;
    }
    const variantToAdd = selectedVariant || (variants.length > 0 ? variants.find(v => parseInt(v.stock) > 0) : null);
    console.log("Thêm vào giỏ hàng:", {
      productId: product.id,
      name: productName,
      price: displayPrice,
      quantity,
      variant: variantToAdd,
    });
    alert("Đã thêm sản phẩm vào giỏ hàng!");
  };

  // Xử lý mô tả
  const description = product.description?.trim() || "Không có mô tả";
  const maxLength = 100;
  const isLongDescription = description.length > maxLength;
  const truncatedDescription = isLongDescription && !isExpanded
    ? description.slice(0, maxLength) + "..."
    : description;

  // Hàm chọn biến thể
  const handleVariantSelect = (variant) => {
    if (!variant || selectedVariant?.id === variant.id || variant.stock <= 0) {
      return;
    }
    setSelectedVariant(variant);
    const newImages = variant.images || [];
    setVariantImages(newImages);
    if (newImages.length > 0) {
      setSelectedImage(newImages[0].image_url || thumbnail);
    } else {
      setSelectedImage(thumbnail);
    }
  };

  // Dialog component using Portal
  const QuickViewDialog = () =>
    isQuickViewOpen &&
    ReactDOM.createPortal(
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center min-h-screen z-50"
        onClick={() => setIsQuickViewOpen(false)}
      >
        <div
          className="bg-white p-6 rounded-lg max-w-[600px] w-full max-h-[500px] h-auto relative flex shadow-2xl border border-gray-200 overflow-y-auto"
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
              className="h-6 w-6"
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
          <div className="w-1/2 h-full overflow-hidden">
            <img
              src={thumbnail}
              alt={productName}
              className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
            />
            {/* Thumbnail images */}
            <div className="flex gap-2 flex-wrap mt-2">
              {(variantImages.length > 0 ? variantImages : product.variantImages || []).map((img) => (
                <div
                  key={img.id || img.image_url}
                  onClick={() => setSelectedImage(img.image_url)}
                  className="w-[60px] h-[60px] p-1 border border-gray-200 cursor-pointer"
                >
                  <img
                    src={img.image_url}
                    alt=""
                    className={`w-full h-full object-contain ${
                      selectedImage === img.image_url ? "" : "opacity-50"
                    }`}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="w-1/2 p-4 flex flex-col">
            <h2 className="text-xl font-bold mb-2">{productName}</h2>
            <p className="text-gray-600 text-sm mb-4">
              <b>description</b>: {truncatedDescription}
              {isLongDescription && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-blue-600 hover:underline ml-1 text-sm"
                >
                  {isExpanded ? "Thu gọn" : "Xem thêm"}
                </button>
              )}
            </p>

            {/* Variant Cards */}
            {variants.length > 0 && (
              <div className="mb-4">
                <span className="block text-sm font-semibold uppercase text-gray-600 mb-2">
                  Biến thể
                </span>
                <div className="flex flex-wrap gap-4 overflow-x-auto pb-2">
                  {variants.map((variant) => {
                    const name = variant.name || variant.sku || "Unnamed";
                    const originalPrice = Number(variant.price || 0);
                    const salePrice = Number(variant.final_price || variant.promotion?.discounted_price || originalPrice);
                    const inStock = variant.stock > 0;
                    const isSelected = selectedVariant?.id === variant.id;

                    return (
                      <div
                        key={variant.id}
                        className={`border rounded-xl px-4 py-2 min-w-[150px] text-center transition ${
                          inStock
                            ? "cursor-pointer hover:shadow"
                            : "opacity-50 cursor-not-allowed"
                        } ${isSelected ? "border-blue-600 ring-2 ring-blue-300" : ""}`}
                        onClick={() => {
                          if (inStock) {
                            handleVariantSelect(variant);
                          }
                        }}
                      >
                        <p className="font-semibold uppercase text-sm">{name}</p>
                        {salePrice > 0 && salePrice < originalPrice ? (
                          <div className="text-red-600 font-bold text-lg">
                            <span>{salePrice.toLocaleString("vi-VN")}₫</span>
                            <span className="text-gray-500 line-through ml-2 text-sm font-normal">
                              {originalPrice.toLocaleString("vi-VN")}₫
                            </span>
                          </div>
                        ) : (
                          <p className="text-red-600 font-bold text-lg">
                            {originalPrice.toLocaleString("vi-VN")}₫
                          </p>
                        )}
                        <p className="text-sm">
                          {inStock ? `Còn lại: ${variant.stock}` : "Hết hàng"}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Variant Attributes Table */}
            {selectedVariant && selectedVariant.attributeValues?.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold mb-2 text-sm">Thuộc tính của biến thể:</h4>
                <table className="w-full text-left border border-gray-300 rounded overflow-hidden text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-2 border border-gray-300">Tên thuộc tính</th>
                      <th className="p-2 border border-gray-300 w-1/2">Giá trị</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedVariant.attributeValues.map((attr, index) => (
                      <tr key={index}>
                        <td className="p-2 border border-gray-300">
                          {attr.attribute?.name || "N/A"}
                        </td>
                        <td className="p-2 border border-gray-300">
                          {attr.attribute?.name.toLowerCase() === "color" ? (
                            <div
                              className="w-6 h-6 rounded border border-gray-400"
                              style={{ backgroundColor: attr.value }}
                              title={attr.value}
                            />
                          ) : (
                            attr.value || "N/A"
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex items-center space-x-2 mb-4">
              <span className="text-gray-700">Giá:</span>
              <span className="text-qred font-semibold">
                {Number(displayPrice).toLocaleString("vi-VN", {
                  style: "currency",
                  currency: "VND",
                })}
              </span>
              {discountPercent > 0 && displayOriginalPrice > displayPrice && (
                <>
                  <span className="text-qgray line-through ml-2">
                    {Number(displayOriginalPrice).toLocaleString("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    })}
                  </span>
                  <span className="text-white text-xs font-semibold bg-qred px-2 py-0.5 rounded ml-2">
                    -{discountPercent.toFixed(0)}%
                  </span>
                </>
              )}
            </div>
            <div className="flex items-center space-x-2 mb-4">
              <button
                className="px-2 py-1 bg-gray-200 rounded"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                -
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.max(1, Math.min(totalStock, Number(e.target.value))))
                }
                className="w-16 text-center border border-gray-300 rounded"
                min="1"
                max={totalStock}
              />
              <button
                className="px-2 py-1 bg-gray-200 rounded"
                onClick={() => setQuantity(Math.min(totalStock, quantity + 1))}
                disabled={quantity >= totalStock}
              >
                +
              </button>
            </div>
            <button
              type="button"
              className="w-full py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition-colors duration-200"
              onClick={addToCart}
              disabled={!hasStock || (variants.length > 0 && !selectedVariant)}
            >
              Thêm vào giỏ hàng
            </button>
          </div>
        </div>
      </div>,
      document.body
    );

  return (
    <div
      className="product-card-one w-full h-full bg-white relative group overflow-hidden"
      style={{ boxShadow: "0px 15px 64px 0px rgba(0, 0, 0, 0.05)" }}
    >
      {/* Product image */}
      <div className="product-card-img w-full h-[300px] overflow-hidden">
        <img
          src={thumbnail}
          alt={productName}
          className="w-full h-full object-contain"
        />
      </div>

      {/* Product details */}
      <div className="product-card-details px-[30px] pb-[30px] relative min-h-[150px]">
        {/* Add to cart button */}
        <div className="absolute w-full h-10 px-[30px] left-0 top-40 group-hover:top-[85px] transition-all duration-300 ease-in-out z-10">
          <button
            type="button"
            className={`w-full py-2.5 rounded-none text-white font-medium transition-colors duration-200 ${
              type === 3
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-yellow-500 hover:bg-yellow-600"
            } ${!hasStock ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={!hasStock}
            onClick={addToCart}
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
        <div className="reviews flex space-x-[1px] mb-3 mt-[10px]">
          {Array.from({ length: product.review || 5 }).map((_, i) => (
            <span key={i}>
              <Star className="w-4 h-4 text-yellow-400" />
            </span>
          ))}
        </div>
        <div className="mt-2 text-[11px] text-qblack flex justify-between">
          <span>
            Tổng Số Lượng Sản Phẩm :{" "}
            <strong>
              {Array.isArray(datas.variants)
                ? datas.variants.reduce(
                    (total, v) => total + (parseInt(v.stock) || 0),
                    0
                  )
                : 0}
            </strong>
          </span>
        </div>
        {/* Product name */}
        <Link to={`/product/${product.id || "unknown"}`}>
          <p className="title mb-2 text-[15px] font-600 text-qblack leading-[24px] line-clamp-2 hover:text-blue-600">
            {productName}
          </p>
        </Link>
        {/* Price */}
        {displayPrice > 0 ? (
          <div className="price-container group-hover:hidden">
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
                  <span className="main-price text-qgray line-through font-600 text-[16px] ml-2">
                    {Number(displayOriginalPrice).toLocaleString("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    })}
                  </span>
                  <span className="discount-percent text-white text-xs font-semibold bg-qred px-2 py-0.5 rounded ml-2">
                    -{discountPercent.toFixed(0)}%
                  </span>
                </>
              )}
            </p>
          </div>
        ) : (
          <p className="price text-qgray font-600 text-[16px] group-hover:hidden">
            Giá không khả dụng
          </p>
        )}
      </div>

      {/* Quick access buttons */}
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

      {/* Render QuickViewDialog */}
      <QuickViewDialog />
    </div>
  );
}