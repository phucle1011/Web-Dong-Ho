import { Link } from "react-router-dom";
import Compair from "../icons/Compair";
import QuickViewIco from "../icons/QuickViewIco";
import Star from "../icons/Star";
import ThinLove from "../icons/ThinLove";

export default function ProductCardStyleOne({ datas, type }) {
  // Sử dụng dữ liệu từ props.datas
  const product = datas || {};
  const variants = Array.isArray(product.variants) ? product.variants : [];

  // Xử lý giá: Lấy giá thấp nhất từ các variant còn hàng
  let mainPrice = 0; // Giá dạng số, fallback là 0
  let hasStock = false; // Kiểm tra xem có variant nào còn hàng không
  if (variants.length > 0) {
    const validVariants = variants.filter(
      (variant) =>
        variant.price &&
        !isNaN(parseFloat(variant.price)) &&
        variant.stock > 0
    );
    if (validVariants.length > 0) {
      mainPrice = Math.min(
        ...validVariants.map((variant) => parseFloat(variant.price))
      );
      hasStock = true;
    }
  }

  // Ảnh sản phẩm fallback
  const thumbnail =
    product.thumbnail && product.thumbnail.trim() !== ""
      ? product.thumbnail
      : "/images/no-image.jpg";

  // Tên sản phẩm fallback
  const productName =
    product.name && product.name.trim() !== ""
      ? product.name
      : "Sản phẩm không tên";

  return (
    <div
      className="product-card-one bg-white relative group overflow-hidden rounded-lg transition-transform duration-300 hover:scale-105"
      style={{ boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.1)" }}
    >
      {/* Hình ảnh sản phẩm */}
      <div className="product-card-img w-full h-[200px] sm:h-[250px] overflow-hidden">
        <img
          src={thumbnail}
          alt={productName}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
      </div>

      {/* Nội dung sản phẩm */}
      <div className="product-card-details p-5 relative">
        {/* Đánh giá */}
        <div className="reviews flex space-x-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <span key={i}>
              <Star className="w-4 h-4 text-yellow-400" />
            </span>
          ))}
        </div>

        {/* Tên sản phẩm */}
        <Link to={`/product/${product.id || "unknown"}`}>
          <p
            className="title mb-2 text-[16px] font-semibold text-gray-800 leading-6 line-clamp-2 hover:text-blue-600"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {productName}
          </p>
        </Link>

        {/* Giá */}
        <p className="price">
          <span className="main-price text-lg font-bold text-gray-900">
            {Number(mainPrice).toLocaleString("vi-VN", {
              style: "currency",
              currency: "VND",
            })}
          </span>
        </p>

        {/* Nút Thêm giỏ hàng */}
        <div className="absolute w-full px-2 left-0 bottom-[-20px] group-hover:bottom-2 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out z-10">
          <button
            type="button"
            className={`w-full py-2 rounded-lg text-white font-medium ${
              type === 3 ? "bg-yellow-600 hover:bg-yellow-700" : "bg-yellow-500 hover:bg-yellow-600"
            } transition-colors duration-200`}
            disabled={!hasStock} // Vô hiệu hóa nếu không có variant hoặc hết hàng
          >
            <div className="flex items-center justify-center space-x-2">
              <svg
                width="14"
                height="16"
                viewBox="0 0 14 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="fill-current"
              >
                <path d="M12.5664 4.14176C12.4665 ...Z" />
              </svg>
              <span>Thêm giỏ hàng</span>
            </div>
          </button>
        </div>
      </div>

      {/* Các nút truy cập nhanh */}
      <div className="quick-access-btns flex flex-col space-y-2 absolute group-hover:right-2 -right-12 top-4 transition-all duration-300 ease-in-out">
        <button
          className="w-10 h-10 flex justify-center items-center bg-gray-100 rounded-full hover:bg-gray-200 transition-colors duration-200"
          aria-label="Quick View"
        >
          <QuickViewIco className="w-5 h-5" />
        </button>
        <button
          className="w-10 h-10 flex justify-center items-center bg-gray-100 rounded-full hover:bg-gray-200 transition-colors duration-200"
          aria-label="Add to Wishlist"
        >
          <ThinLove className="w-5 h-5" />
        </button>
        <button
          className="w-10 h-10 flex justify-center items-center bg-gray-100 rounded-full hover:bg-gray-200 transition-colors duration-200"
          aria-label="Compare"
        >
          <Compair className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}