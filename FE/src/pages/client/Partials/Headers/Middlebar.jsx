import Cart from "../../Cart";
import Compair from "../../Helpers/icons/Compair";
import ThinBag from "../../Helpers/icons/ThinBag";
import ThinLove from "../../Helpers/icons/ThinLove";
import ThinPeople from "../../Helpers/icons/ThinPeople";
import SearchBox from "../../Helpers/SearchBox";
import ProductCardStyleOne from "../../Helpers/Cards/ProductCardStyleOne";
import { Link, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();


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
      }
    };

    const fetchWishlistCount = async () => {
      const decoded = decodeToken(token);
      const userId = decoded?.id;
      if (!userId) {
        return;
      }

      try {
        const response = await axios.get(`${Constants.DOMAIN_API}/users/${userId}/wishlist`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { userId },
        });
        setWishlistCount(response.data.data.length || 0);
      } catch (err) {
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

  const handleSearch = ({ keyword, brandIds, attributeValues, attributeIds }) => {
    const params = new URLSearchParams();
    if (keyword?.trim()) {
      params.append("keyword", keyword.trim());
    }
    if (brandIds && brandIds.length > 0) {
      params.append("brand_ids", brandIds.join(","));
    }
    if (attributeValues && attributeValues.length > 0) {
      params.append("attribute_values", attributeValues.join(","));
    }
    if (attributeIds && attributeIds.length > 0) {
      params.append("attribute_ids", attributeIds.join(","));
    }
    // Điều hướng về trang all-products với query string
    navigate(`/all-products?${params.toString()}`);
  };



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
    </div>
  );
}