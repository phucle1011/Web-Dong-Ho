import { useState, useEffect } from "react";
import Selectbox from "../Helpers/Selectbox";
import axios from "axios";
import { useParams } from "react-router-dom";
import { Star, StarHalf, Star as StarOutline } from "lucide-react";
import { decodeToken } from "../Helpers/jwtDecode";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import Constants from "../../../Constants";

export default function ProductView({ className, reportHandler }) {
  const [productData, setProductData] = useState(null);
  const [variants, setVariants] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [variantImages, setVariantImages] = useState([]);
  const [allVariants, setAllVariants] = useState([]);
  const [filteredVariants, setFilteredVariants] = useState([]);
  const [selectedImage, setSelectedImage] = useState("");
  const [isInWishlist, setIsInWishlist] = useState(false);
  const { id: productId } = useParams();

  useEffect(() => {
    window.scrollTo(0, 0);
    async function fetchProduct() {
      try {
        setLoading(true);
        const res = await axios.get(
          `${Constants.DOMAIN_API}/products/${productId}/variants`
        );
        const { product } = res.data;
        setProductData(product);
        setVariants(product.variants);
        setImages(product.variantImages);
        setAllVariants(product.variants);
        if (product.variants.length > 0) {
          const firstVariant = product.variants[0];
          setSelectedVariant(firstVariant);
          setFilteredVariants([firstVariant]);
          const firstImages = firstVariant.images || [];
          setVariantImages(firstImages);
          if (firstImages.length > 0) {
            setSelectedImage(firstImages[0].image_url);
          } else if (product.thumbnail) {
            setSelectedImage(product.thumbnail);
          }
          await checkWishlistStatus(firstVariant.id);
        }
        const firstImage = product.thumbnail;
        if (firstImage) setSelectedImage(firstImage);
      } catch (err) {
        setError(err.message || "Không thể tải thông tin sản phẩm");
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [productId]);

  useEffect(() => {
    if (selectedVariant) {
      checkWishlistStatus(selectedVariant.id);
    }
  }, [selectedVariant]);

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
      console.error("Lỗi khi kiểm tra trạng thái wishlist:", error);
      toast.error("Không thể kiểm tra trạng thái danh sách yêu thích.");
    }
  };

  const getAttrValue = (variant, attrName) => {
    const attr = variant.attributeValues.find(
      (a) => a.attribute.name === attrName
    );
    return attr ? attr.value : null;
  };

  const increment = () => setQuantity((q) => q + 1);
  const decrement = () => setQuantity((q) => Math.max(1, q - 1));

  const handleAddToWishlist = async () => {
    if (!selectedVariant) {
      toast.error("Vui lòng chọn biến thể sản phẩm.");
      return;
    }

    const token = localStorage.getItem("token");
    const decoded = decodeToken(token);
    const userId = decoded?.id;

    if (!token || !userId) {
      toast.error("Bạn cần đăng nhập để thêm sản phẩm vào danh sách yêu thích.");
      return;
    }

    try {
      const response = await axios.post(`${Constants.DOMAIN_API}/wishlist`, {
        userId,
        productVariantId: selectedVariant.id,
      });
      toast.success(response.data.message || "Đã thêm vào danh sách yêu thích!");
      setIsInWishlist(true); // Cập nhật ngay lập tức
      await checkWishlistStatus(selectedVariant.id); // Xác nhận lại từ API
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Lỗi khi thêm vào danh sách yêu thích.";
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
      toast.error("Bạn cần đăng nhập để xóa sản phẩm khỏi danh sách yêu thích.");
      return;
    }

    // Hiển thị dialog xác nhận với SweetAlert2
    const result = await Swal.fire({
      title: "Xác nhận xóa",
      text: "Bạn có chắc muốn xóa sản phẩm này khỏi danh sách yêu thích?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      const response = await axios.delete(
        `${Constants.DOMAIN_API}/users/${userId}/wishlist/${selectedVariant.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success(response.data.message || "Đã xóa khỏi danh sách yêu thích!");
      setIsInWishlist(false); // Cập nhật ngay lập tức
      await checkWishlistStatus(selectedVariant.id); // Xác nhận lại từ API
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Lỗi khi xóa khỏi danh sách yêu thích.";
      toast.error(errorMessage);
    }
  };

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
      toast.success("Đã thêm vào giỏ hàng thành công!");
    } catch (error) {
      toast.error("Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng.");
    }
  };

  if (loading) return <div>Đang tải sản phẩm...</div>;
  if (error) return <div>Lỗi: {error}</div>;
  if (!productData) return null;

  const changeImgHandler = (url) => {
    setSelectedImage(url);
  };

  const handleVariantSelect = (variant) => {
    if (!variant || selectedVariant?.id === variant.id) {
      return;
    }
    const newFiltered = variants.filter((v) => v.id === variant.id);
    setFilteredVariants(newFiltered);
    const newImages = newFiltered.flatMap((v) => v.images || []);
    setVariantImages(newImages);
    if (newImages.length > 0) {
      setSelectedImage(newImages[0].image_url);
    }
    setSelectedVariant(variant);
  };

  const avgRating = productData?.averageRating || 0;
  const ratingCount = productData?.ratingCount || 0;

  const renderStars = (avgRating) => {
    const fullStars = Math.floor(avgRating);
    const hasHalfStar = avgRating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    return (
      <>
        {Array(fullStars)
          .fill()
          .map((_, i) => (
            <Star key={`full-${i}`} className="text-yellow-400 w-4 h-4" />
          ))}
        {hasHalfStar && <StarHalf className="text-yellow-400 w-4 h-4" />}
        {Array(emptyStars)
          .fill()
          .map((_, i) => (
            <StarOutline key={`empty-${i}`} className="text-gray-300 w-4 h-4" />
          ))}
      </>
    );
  };

  return (
    <div
      className={`product-view w-full lg:flex justify-between ${
        className || ""
      }`}
    >
      <div data-aos="fade-right" className="lg:w-1/2 xl:mr-[70px] lg:mr-[50px]">
        <div className="w-full">
          <div className="w-full h-[600px] border border-qgray-border flex justify-center items-center overflow-hidden relative mb-3">
            <img src={selectedImage} alt="" className="object-contain" />
            {allVariants.some(
              (variant) =>
                variant.promotionProducts &&
                variant.promotionProducts.length > 0
            ) && (
              <div className="w-[80px] h-[80px] rounded-full bg-qyellow text-qblack flex justify-center items-center text-xl font-medium absolute left-[30px] top-[30px]">
                <span>sale</span>
              </div>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            {(selectedVariant ? variantImages : images).map((img) => (
              <div
                onClick={() => changeImgHandler(img.image_url)}
                key={img.id}
                className="w-[110px] h-[110px] p-[15px] border border-qgray-border cursor-pointer"
              >
                <img
                  src={img.image_url}
                  alt=""
                  className={`w-full h-full object-contain ${
                    selectedImage !== img.image_url ? "opacity-50" : ""
                  }`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex-1">
        <div className="product-details w-full mt-10 lg:mt-0">
          <span
            data-aos="fade-up"
            className="text-qgray text-xs font-normal uppercase tracking-wider mb-2 inline-block"
          >
            Điện thoại
          </span>
          <p
            data-aos="fade-up"
            className="text-xl font-medium text-qblack mb-4"
          >
            {productData.name}
          </p>
          <div
            data-aos="fade-up"
            className="flex space-x-[10px] items-center mb-6"
          >
            <div className="flex">{renderStars(avgRating)}</div>
            <span className="text-[13px] font-normal text-qblack">
              {ratingCount} Đánh giá
            </span>
          </div>
          <p
            data-aos="fade-up"
            className="text-qgray text-sm text-normal mb-[30px] leading-7"
          >
            {productData.description}
          </p>
          <span className="block text-sm font-semibold uppercase text-gray-600 mb-4 mt-8">
            Biến thể
          </span>
          <div
            className="flex flex-wrap gap-4"
            style={{
              transform: "translate3d(0px, 0px, 0px)",
              transition: "all",
              width: "100%",
            }}
          >
            {variants.map((variant) => {
              const name = variant.name || variant.sku || "Không tên";
              const originalPrice = Number(variant.price || 0);
              const salePrice = Number(variant.final_price || 0);
              const inStock = variant.stock > 0;
              const isSelected = selectedVariant?.id === variant.id;
              return (
                <div
                  key={variant.id}
                  className={`border rounded-xl px-4 py-2 min-w-[150px] text-center transition
                    ${
                      inStock
                        ? "cursor-pointer hover:shadow"
                        : "opacity-50 cursor-not-allowed"
                    }
                    ${isSelected ? "border-blue-600 ring-2 ring-blue-300" : ""}`}
                  onClick={() => {
                    if (inStock) {
                      handleVariantSelect(variant);
                      changeImgHandler(variant.images?.[0]?.image_url || "");
                    }
                  }}
                >
                  <p className="font-semibold uppercase">{name}</p>
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
                  <p>{inStock ? `Còn lại: ${variant.stock}` : "Hết hàng"}</p>
                </div>
              );
            })}
          </div>
          {selectedVariant && (
            <div className="mt-4">
              <h4 className="font-semibold mb-2">Thuộc tính của biến thể:</h4>
              <table className="w-full text-left border border-gray-300 rounded overflow-hidden text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 border border-gray-300">
                      Tên thuộc tính
                    </th>
                    <th className="p-2 border border-gray-300 w-1/2">
                      Giá trị
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {selectedVariant.attributeValues.map((attr, index) => (
                    <tr key={index}>
                      <td className="p-2 border border-gray-300">
                        {attr.attribute?.name || "Không xác định"}
                      </td>
                      <td className="p-2 border border-gray-300">
                        {attr.attribute?.name.toLowerCase() === "color" ? (
                          <div className="flex items-center gap-2">
                            <div
                              className="w-6 h-6 rounded border border-gray-400"
                              style={{ backgroundColor: attr.value }}
                              title={attr.value}
                            ></div>
                          </div>
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
          <div data-aos="fade-up" className="product-size mb-[30px]"></div>
          <div
            data-aos="fade-up"
            className="quantity-card-wrapper w-full flex items-center h-[50px] space-x-[10px] mb-[30px]"
          >
            <div className="w-[120px] h-full px-[26px] flex items-center border border-qgray-border">
              <div className="flex justify-between items-center w-full">
                <button
                  onClick={decrement}
                  type="button"
                  className="text-base text-qgray"
                >
                  -
                </button>
                <span className="text-qblack">{quantity}</span>
                <button
                  onClick={increment}
                  type="button"
                  className="text-base text-qgray"
                >
                  +
                </button>
              </div>
            </div>
            <div className="w-[60px] h-full flex justify-center items-center border border-qgray-border">
              <button
                type="button"
                onClick={isInWishlist ? handleRemoveFromWishlist : handleAddToWishlist}
                title={isInWishlist ? "Xóa khỏi danh sách yêu thích" : "Thêm vào danh sách yêu thích"}
              >
                <span>
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill={isInWishlist ? "#FF0000" : "none"}
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M17 1C14.9 1 13.1 2.1 12 3.7C10.9 2.1 9.1 1 7 1C3.7 1 1 3.7 1 7C1 13 12 22 12 22C12 22 23 13 23 7C23 3.7 20.3 1 17 1Z"
                      stroke={isInWishlist ? "#FF0000" : "#D5D5D5"}
                      strokeWidth="2"
                      strokeMiterlimit="10"
                      strokeLinecap="square"
                    />
                  </svg>
                </span>
              </button>
            </div>
            <div className="flex-1 h-full">
              <button
                type="button"
                onClick={() => {
                  if (!selectedVariant) {
                    toast.error(
                      "Vui lòng chọn biến thể trước khi thêm vào giỏ hàng"
                    );
                    return;
                  }
                  if (quantity > selectedVariant.stock) {
                    toast.error(
                      `Chỉ còn ${selectedVariant.stock} sản phẩm trong kho`
                    );
                    return;
                  }
                  handleAddToCart(selectedVariant.id, quantity);
                }}
                className="black-btn text-sm font-semibold w-full h-full"
              >
                THÊM GIỎ HÀNG
              </button>
            </div>
          </div>
          <div data-aos="fade-up" className="mb-[20px]">
            <p className="text-[13px] text-qgray leading-7">
              <span className="text-qblack">Danh mục :</span>{" "}
              {productData.category}
            </p>
            <p className="text-[13px] text-qgray leading-7">
              <span className="text-qblack">Thương hiệu :</span> {productData.brand}
            </p>
          </div>
          <div
            data-aos="fade-up"
            className="flex space-x-2 items-center mb-[20px]"
          >
            <span>
              <svg
                width="12"
                height="13"
                viewBox="0 0 12 13"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M0 0C0.247634 0 0.475436 0 0.729172 0C0.738324 0.160174 0.747477 0.316279 0.757647 0.493233C1.05816 0.392044 1.33885 0.282211 1.62818 0.203395C3.11296 -0.201361 4.51385 0.0366111 5.84202 0.779512C6.47661 1.13494 7.14171 1.39071 7.86987 1.47207C8.88125 1.58496 9.82093 1.35817 10.7098 0.88426C10.9335 0.765274 11.1522 0.636627 11.411 0.491199C11.4161 0.606117 11.4237 0.693577 11.4237 0.780529C11.4242 3.18822 11.4222 5.5954 11.4288 8.00309C11.4293 8.1892 11.3718 8.29089 11.2096 8.38039C9.31956 9.42279 7.4285 9.43499 5.54557 8.37734C4.06231 7.54443 2.55363 7.43307 0.992568 8.13835C0.804428 8.22327 0.737816 8.33005 0.739341 8.53904C0.749003 9.9206 0.744426 11.3027 0.744426 12.6842C0.744426 12.7849 0.744426 12.8851 0.744426 13C0.48764 13 0.254244 13 0 13C0 8.67582 0 4.34961 0 0Z"
                  fill="#EB5757"
                />
              </svg>
            </span>
            <button
              type="button"
              onClick={reportHandler}
              className="text-qred font-semibold text-[13px]"
            >
              Báo cáo sản phẩm này
            </button>
          </div>
          <div
            data-aos="fade-up"
            className="social-share flex items-center w-full"
          >
            <span className="text-qblack text-[13px] mr-[17px] inline-block">
              Chia sẻ
            </span>
            <div className="flex space-x-5 items-center">
              <span>
                <svg
                  width="10"
                  height="16"
                  viewBox="0 0 10 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3 16V9H0V6H3V4C3 1.3 4.7 0 7.1 0C8.3 0 9.2 0.1 9.5 0.1V2.9H7.8C6.5 2.9 6.2 3.5 6.2 4.4V6H10L9 9H6.3V16H3Z"
                    fill="#3E75B2"
                  />
                </svg>
              </span>
              <span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8 0C3.6 0 0 3.6 0 8C0 11.4 2.1 14.3 5.1 15.4C5 14.8 5 13.8 5.1 13.1C5.2 12.5 6 9.1 6 9.1C6 9.1 5.8 8.7 5.8 8C5.8 6.9 6.5 6 7.3 6C8 6 8.3 6.5 8.3 7.1C8.3 7.8 7.9 8.8 7.6 9.8C7.4 10.6 8 11.2 8.8 11.2C10.2 11.2 11.3 9.7 11.3 7.5C11.3 5.6 9.9 4.2 8 4.2C5.7 4.2 4.4 5.9 4.4 7.7C4.4 8.4 4.7 9.1 5 9.5C5 9.7 5 9.8 5 9.9C4.9 10.2 4.8 10.7 4.8 10.8C4.8 10.9 4.7 11 4.5 10.9C3.5 10.4 2.9 9 2.9 7.8C2.9 5.3 4.7 3 8.2 3C11 3 13.1 5 13.1 7.6C13.1 10.4 11.4 12.6 8.9 12.6C8.1 12.6 7.3 12.2 7.1 11.7C7.1 11.7 6.7 13.2 6.6 13.6C6.4 14.3 5.9 15.2 5.6 15.7C6.4 15.9 7.2 16 8 16C12.4 16 16 12.4 16 8C16 3.6 12.4 0 8 0Z"
                    fill="#E12828"
                  />
                </svg>
              </span>
              <span>
                <svg
                  width="18"
                  height="14"
                  viewBox="0 0 18 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M17.0722 1.60052C16.432 1.88505 15.7562 2.06289 15.0448 2.16959C15.7562 1.74278 16.3253 1.06701 16.5742 0.248969C15.8985 0.640206 15.1515 0.924742 14.3335 1.10258C13.6933 0.426804 12.7686 0 11.7727 0C9.85206 0 8.28711 1.56495 8.28711 3.48557C8.28711 3.7701 8.32268 4.01907 8.39382 4.26804C5.51289 4.12577 2.9165 2.73866 1.17371 0.604639C0.889175 1.13814 0.71134 1.70722 0.71134 2.34742C0.71134 3.5567 1.31598 4.62371 2.27629 5.26392C1.70722 5.22835 1.17371 5.08608 0.675773 4.83711V4.87268C0.675773 6.5799 1.88505 8.00258 3.48557 8.32268C3.20103 8.39382 2.88093 8.42938 2.56082 8.42938C2.34742 8.42938 2.09845 8.39382 1.88505 8.35825C2.34742 9.74536 3.62784 10.7768 5.15722 10.7768C3.94794 11.7015 2.45412 12.2706 0.818041 12.2706C0.533505 12.2706 0.248969 12.2706 0 12.2351C1.56495 13.2309 3.37887 13.8 5.37062 13.8C11.8082 13.8 15.3294 8.46495 15.3294 3.84124C15.3294 3.69897 15.3294 3.52113 15.3294 3.37887C16.0052 2.9165 16.6098 2.31186 17.0722 1.60052Z"
                    fill="#3FD1FF"
                  />
                </svg>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}