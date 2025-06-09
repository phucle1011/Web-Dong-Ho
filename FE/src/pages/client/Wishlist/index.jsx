import BreadcrumbCom from "../BreadcrumbCom";
import EmptyWishlistError from "../EmptyWishlistError";
import PageTitle from "../Helpers/PageTitle";
import Layout from "../Partials/LayoutHomeThree";
import ProductsTable from "./ProductsTable";
import Constants from "../../../Constants";
import { FaTrashAlt } from "react-icons/fa";
import { decodeToken } from "../Helpers/jwtDecode";
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Wishlist({ wishlist = true }) {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  let userId = null;

  if (token) {
    const decoded = decodeToken(token);
    if (decoded && decoded.id) {
      userId = decoded.id;
    }
  }

  const fetchWishlist = async () => {
    if (!userId) {
      console.error("Người dùng chưa xác thực");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(`${Constants.DOMAIN_API}/admin/users/${userId}/wishlist`);
      setWishlistItems(res.data.data || []);
    } catch (error) {
      console.error('Lỗi khi lấy wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleAddAllToCart = () => {
    // Logic thêm toàn bộ sản phẩm vào giỏ hàng
    // Ví dụ: Gọi API `/cart/add-multiple` hoặc loop qua từng sản phẩm
    wishlistItems.forEach(item => {
      // Gọi API thêm từng sản phẩm vào giỏ
    });
  };

  const handleClearWishlist = async () => {
    try {
      await axios.delete(`${Constants.DOMAIN_API}/users/${userId}/wishlist/${productVariantId}`);
      setWishlistItems([]); // Làm trống wishlist local
    } catch (error) {
      alert('Không thể làm trống wishlist');
      console.error('Lỗi khi clear wishlist:', error);
    }
  };

  return (
    <Layout childrenClasses={wishlist ? "pt-0 pb-0" : ""}>
      {wishlist === false ? (
        <div className="wishlist-page-wrapper w-full">
          <div className="container-x mx-auto">
            <BreadcrumbCom
              paths={[
                { name: "home", path: "/" },
                { name: "wishlist", path: "/wishlist" },
              ]}
            />
            <EmptyWishlistError />
          </div>
        </div>
      ) : (
        <div className="wishlist-page-wrapper w-full bg-white pb-[60px]">
          <div className="w-full">
            <PageTitle
              title="Danh sách yêu thích"
              breadcrumb={[
                { name: "Trang chủ", path: "/" },
                { name: "Danh sách yêu thích", path: "/wishlist" },
              ]}
            />
          </div>
          <div className="w-full mt-[23px]">
            <div className="container-x mx-auto">
              <ProductsTable className="mb-[30px]"
                products={wishlistItems}
              />
              <div className="w-full mt-[30px] flex sm:justify-end justify-start">
                <div className="sm:flex sm:space-x-[30px] items-center">
                  <button type="button" onClick={handleClearWishlist}>
                    <div className="p-2 rounded-full bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 transition duration-200">
                      <FaTrashAlt size={18} />
                    </div>
                  </button>
                  <div className="w-[180px] h-[50px]">
                    <button type="button" className="yellow-btn">
                      <div className="w-full text-sm font-semibold">
                        Thêm tất cả vào giỏ hàng
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
