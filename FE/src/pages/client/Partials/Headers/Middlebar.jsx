import Cart from "../../Cart";
import Compair from "../../Helpers/icons/Compair";
import ThinBag from "../../Helpers/icons/ThinBag";
import ThinLove from "../../Helpers/icons/ThinLove";
import ThinPeople from "../../Helpers/icons/ThinPeople";
import SearchBox from "../../Helpers/SearchBox";
import ProductCardStyleOne from "../../Helpers/Cards/ProductCardStyleOne";
import { Link } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Constants from "../../../../Constants";
import { toast } from "react-toastify";
import ReactDOM from "react-dom";
import Wishlist from "../../Helpers/Wishlist";
import { decodeToken } from "../../Helpers/jwtDecode";

export default function Middlebar({ className, type }) {
  const [count, setCount] = useState(0);
  const [compareCount, setCompareCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchCount = async () => {
      try {
        const res = await axios.get(`${Constants.DOMAIN_API}/carts`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCount(res.data?.count ?? 0);
      } catch (err) {
        // toast.error("Không thể lấy số lượng giỏ hàng.");
      }
    };

    const fetchWishlistCount = async () => {
      const decoded = decodeToken(token);
      const userId = decoded?.id;
      if (!userId) {
        // toast.error("Không thể xác định ID người dùng từ token.");
        return;
      }

      try {
        const response = await axios.get(`${Constants.DOMAIN_API}/users/${userId}/wishlist`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { userId },
        });
        setWishlistCount(response.data.data.length || 0);
      } catch (err) {
        // toast.error("Không thể lấy số lượng danh sách yêu thích.");
      }
    };

    fetchCount();
    fetchWishlistCount();
  }, []);

  useEffect(() => {
    const updateCompareCount = () => {
      const list = JSON.parse(localStorage.getItem("compareVariants") || "[]");
      setCompareCount(list.filter(Boolean).length);
    };

    updateCompareCount();
    window.addEventListener("storage", updateCompareCount);
    return () => window.removeEventListener("storage", updateCompareCount);
  }, []);

  const handleSearch = useCallback(async ({ keyword, brandIds, attributeValues, attributeIds }) => {
    if (!brandIds && !keyword && !attributeValues?.length) {
      toast.warn('Vui lòng chọn ít nhất một thương hiệu, nhập từ khóa hoặc kích thước.');
      return;
    }
    try {
      setIsLoading(true);
      console.log('Search params received:', { keyword, brandIds, attributeValues, attributeIds });
      const brandIdsParam = brandIds || 'all';
      const params = {
        brandIds: brandIdsParam,
        page: 1,
        limit: 10,
      };
      // Gửi keyword nếu không có attributeValues, hoặc attributeValues nếu có
      if (keyword && !attributeValues?.length) {
        params.keyword = keyword;
      } else if (attributeValues?.length > 0) {
        params.attribute_values = attributeValues; // Gửi attributeValues làm từ khóa thuộc tính
        if (attributeIds?.length > 0) {
          params.attribute_ids = attributeIds;
        }
      } else if (keyword) {
        params.attribute_values = [keyword]; // Xử lý keyword như attributeValues nếu không có giá trị cụ thể
      }
      const response = await axios.get(`${Constants.DOMAIN_API}/products/search`, {
        params,
      });
      console.log('API response (full):', response);
      if (response.data.status === 200) {
        console.log('API data:', response.data.data);
        setProducts(response.data.data || []);
        setIsSearchDialogOpen(true);
      } else {
        toast.error(`Lỗi từ server: ${response.data.message || 'Không thể tải danh sách sản phẩm.'}`);
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products (details):', error.response || error);
      toast.error('Có lỗi xảy ra khi tải danh sách sản phẩm. Vui lòng thử lại.');
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleProductClick = () => {
    setIsSearchDialogOpen(false);
  };

  const SearchResultsDialog = () =>
    isSearchDialogOpen &&
    ReactDOM.createPortal(
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center min-h-screen z-50"
        onClick={() => setIsSearchDialogOpen(false)}
      >
        <div
          className="bg-white p-6 rounded-lg max-w-6xl w-full max-h-[80vh] overflow-y-auto relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => setIsSearchDialogOpen(false)}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
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
          <h2 className="text-xl font-semibold mb-4">Kết quả tìm kiếm</h2>
          {isLoading ? (
            <p className="text-center text-gray-600">Đang tải sản phẩm...</p>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCardStyleOne
                  key={product.id}
                  datas={product}
                  type={type}
                  onProductClick={handleProductClick}
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600">Không tìm thấy sản phẩm nào.</p>
          )}
        </div>
      </div>,
      document.body
    );

  return (
    <div className={`w-full h-[86px] bg-white ${className}`}>
      <div className="container-x mx-auto h-full">
        <div className="relative h-full">
          <div className="flex justify-between items-center h-full">
            <div>
              {type === 3 ? (
                <Link to="/">
                  <img
                    width="152"
                    height="36"
                    src={`${process.env.REACT_APP_PUBLIC_URL}/assets/images/logos/logo.png`}
                    alt="logo"
                  />
                </Link>
              ) : type === 4 ? (
                <Link to="/">
                  <img
                    width="152"
                    height="36"
                    src={`${process.env.REACT_APP_PUBLIC_URL}/assets/images/logo-4.svg`}
                    alt="logo"
                  />
                </Link>
              ) : (
                <Link to="/">
                  <img
                    width="152"
                    height="36"
                    src={`${process.env.REACT_APP_PUBLIC_URL}/assets/images/logo.svg`}
                    alt="logo"
                  />
                </Link>
                
              )}
            </div>
            <div className="w-[517px] h-[44px]">
              <SearchBox type={type} className="search-com" onSearch={handleSearch} />
            </div>
            <div className="flex space-x-6 items-center">
              <div className="compaire relative">
                <Link to="/products-compaire">
                  <span>
                    <Compair />
                  </span>
                </Link>
                {compareCount > 0 && (
                  <span
                    className={`w-[18px] h-[18px] rounded-full absolute -top-2.5 -right-2.5 flex justify-center items-center text-[9px] ${type === 3 ? "bg-qh3-blue text-white" : "bg-qyellow"}`}
                  >
                    {compareCount}
                  </span>
                )}
              </div>

  <div className="compaire relative">
                <Link to="/notification">
                  <span>
                    <Compair />
                  </span>
                </Link>
                {compareCount > 0 && (
                  <span
                    className={`w-[18px] h-[18px] rounded-full absolute -top-2.5 -right-2.5 flex justify-center items-center text-[9px] ${type === 3 ? "bg-qh3-blue text-white" : "bg-qyellow"
                      }`}
                  >
                    {compareCount}
                  </span>
                )}
              </div>
              
              <div className="cart-wrapper group relative py-4">
                <div className="cart relative cursor-pointer">
                  <Link to="/wishlist">
                    <span>
                      <ThinLove />
                    </span>
                  </Link>
                  <span
                    className={`w-[18px] h-[18px] rounded-full absolute -top-2.5 -right-2.5 flex justify-center items-center text-[9px] ${type === 3 ? "bg-qh3-blue text-white" : "bg-qyellow"}`}
                  >
                    {wishlistCount}
                  </span>
                </div>
                <Wishlist
                  type={type}
                  className="absolute -right-[45px] top-11 z-50 hidden group-hover:block"
                />
              </div>
              <div className="cart-wrapper group relative py-4">
                <div className="cart relative cursor-pointer">
                  <Link to="/cart">
                    <span>
                      <ThinBag />
                    </span>
                  </Link>
                  <span
                    className={`w-[18px] h-[18px] rounded-full absolute -top-2.5 -right-2.5 flex justify-center items-center text-[9px] ${type === 3 ? "bg-qh3-blue text-white" : "bg-qyellow"}`}
                  >
                    {count}
                  </span>
                </div>
                <Cart
                  type={type}
                  className="absolute -right-[45px] top-11 z-50 hidden group-hover:block"
                />
              </div>
              <div>
                <Link to="/profile">
                  <span>
                    <ThinPeople />
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <SearchResultsDialog />
    </div>
  );
}