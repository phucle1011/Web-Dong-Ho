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
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

export default function Wishlist({ wishlist = true }) {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

  const fetchWishlist = async () => {
    if (!userId) {
      setError("Vui lòng đăng nhập để xem danh sách yêu thích.");
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
      console.error('Lỗi khi lấy wishlist:', error);
      setError("Không thể tải danh sách yêu thích. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [userId]);

  const handleAddAllToCart = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    if (!userId) {
      toast.error("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.");
      setIsProcessing(false);
      return;
    }

    if (wishlistItems.length === 0) {
      toast.info("Danh sách yêu thích trống!");
      setIsProcessing(false);
      return;
    }

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
        error.response?.data?.message || "Lỗi khi thêm sản phẩm vào giỏ hàng.";
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  // Modified: Hàm để thêm các sản phẩm được chọn vào giỏ hàng
  const handleAddSelectedToCart = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    if (!userId) {
      toast.error("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.");
      setIsProcessing(false);
      return;
    }

    if (selectedItems.length === 0) {
      toast.info("Vui lòng chọn ít nhất một sản phẩm để thêm vào giỏ hàng!");
      setIsProcessing(false);
      return;
    }

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
        error.response?.data?.errors?.join(", ") || // Modified: Hiển thị lỗi cụ thể từ backend
        error.response?.data?.message ||
        "Lỗi khi thêm sản phẩm vào giỏ hàng.";
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearWishlist = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    if (!userId) {
      toast.error("Vui lòng đăng nhập để xóa danh sách yêu thích.");
      setIsProcessing(false);
      return;
    }

    if (wishlistItems.length === 0) {
      toast.info("Danh sách yêu thích đã trống!");
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
      const response = await axios.delete(
        `${Constants.DOMAIN_API}/users/${userId}/wishlist`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setWishlistItems([]);
      setSelectedItems([]); // Modified: Reset danh sách chọn sau khi xóa wishlist
      toast.success(response.data.message || "Đã xóa toàn bộ danh sách yêu thích!");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Lỗi khi xóa danh sách yêu thích.";
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <Layout childrenClasses="pt-0 pb-0">
        <div className="w-full text-center py-10">
          <p>Đang tải danh sách yêu thích...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout childrenClasses="pt-0 pb-0">
        <div className="w-full text-center py-10 text-red-500">
          <p>{error}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout childrenClasses={wishlist ? "pt-0 pb-0" : ""}>
      {wishlistItems.length === 0 ? (
        <div className="wishlist-page-wrapper w-full">
          <div className="container-x mx-auto">
            <BreadcrumbCom
              paths={[
                { name: "Trang chủ", path: "/" },
                { name: "Danh sách yêu thích", path: "/wishlist" },
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
              <ProductsTable
                className="mb-[30px]"
                products={wishlistItems}
                onWishlistChange={fetchWishlist}
                onSelectItems={setSelectedItems} // Modified: Truyền hàm cập nhật danh sách chọn
              />
              <div className="w-full mt-[30px] flex sm:justify-end justify-start">
                <div className="sm:flex sm:space-x-[30px] items-center">
                  <button
                    type="button"
                    onClick={handleClearWishlist}
                    title="Xóa toàn bộ danh sách yêu thích"
                    disabled={isProcessing}
                  >
                    <div className={`p-2 rounded-full bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 transition duration-200 ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      <FaTrashAlt size={18} />
                    </div>
                  </button>
                  <div className="w-[180px] h-[50px] mr-2">
                    <button
                      type="button"
                      onClick={handleAddSelectedToCart} // Modified: Nút cho thêm sản phẩm được chọn
                      className={`yellow-btn text-sm font-semibold w-full h-full ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={isProcessing}
                    >
                      <div className="w-full text-sm font-semibold">
                        {isProcessing ? 'Đang xử lý...' : 'Thêm đã chọn vào giỏ hàng'}
                      </div>
                    </button>
                  </div>
                  <div className="w-[180px] h-[50px]">
                    <button
                      type="button"
                      onClick={handleAddAllToCart}
                      className={`yellow-btn text-sm font-semibold w-full h-full ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={isProcessing}
                    >
                      <div className="w-full text-sm font-semibold">
                        {isProcessing ? 'Đang xử lý...' : 'Thêm tất cả vào giỏ hàng'}
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