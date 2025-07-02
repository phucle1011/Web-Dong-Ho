import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import setupAxiosInterceptors from "./utils/axiosInterceptor";
import { useAuth } from "./components/Auth/AuthContext/index.jsx";

// Client Layout và Pages
import ClientLayout from "./layouts/ClientLayouts";
import HomeThree from "./pages/client/Home";
import About from "./pages/client/About";
import AllProductPage from "./pages/client/AllProductPage";
import Login from "./pages/client/Auth/Login/index";
import Profile from "./pages/client/Auth/Profile";
import Signup from "./pages/client/Auth/Signup";
import BecomeSaller from "./pages/client/BecomeSaller";
import Blogs from "./pages/client/Blogs";
import Blog from "./pages/client/Blogs/Blog.jsx";
import CardPage from "./pages/client/CartPage";
import CheakoutPage from "./pages/client/CheakoutPage";
import Contact from "./pages/client/Contact";
import Faq from "./pages/client/Faq";
import FlashSale from "./pages/client/FlashSale";
import FourZeroFour from "./pages/client/FourZeroFour";
import PrivacyPolicy from "./pages/client/PrivacyPolicy";
import ProductsCompaire from "./pages/client/ProductsCompaire/index";
import SallerPage from "./pages/client/SallerPage";
import Sallers from "./pages/client/Sellers";
import SingleProductPage from "./pages/client/SingleProductPage";
import TermsCondition from "./pages/client/TermsCondition/index";
import TrackingOrder from "./pages/client/TrackingOrder";
import Wishlist from "./pages/client/Wishlist";
import VerifyEmail from "./pages/client/Auth/VerifyEmail/index.jsx";
import ResetPassword from "./pages/client/Auth/ResetPassword";

// Admin Layout và Pages
import AdminLayout from "./layouts/AdminLayouts";
import Dashboard from "./pages/admin/dashboard";
import LoginAdmin from "./pages/admin/login";
import OrderGetAll from "./pages/admin/order/getAll";
import OrderDetail from "./pages/admin/order/detail";
import UserList from "./pages/admin/user/getAll";
import UserDetail from "./pages/admin/user/detail";
import CommentPage from "./pages/admin/comment/getAll";
import CommentProductDetailPage from "./pages/admin/comment/detail";
import CartPage from "./pages/admin/cart/getAll";
import CartDetailPage from "./pages/admin/cart/detail";
import AddressList from "./pages/admin/address/getAll";
import AddressDetail from "./pages/admin/address/detail";
import CategoryGetAll from "./pages/admin/category/getAll";
import CategoryCreate from "./pages/admin/category/Create";
import CategoryEdit from "./pages/admin/category/Edit";
import BlogList from "./pages/admin/blog/getall";
import BlogDetail from "./pages/admin/blog/detail";
import BlogAdd from "./pages/admin/blog/add";
import EditBlog from "./pages/admin/blog/edit";
import PromotionGetAll from "./pages/admin/promotions/getAll";
import PromotionCreate from "./pages/admin/promotions/Create";
import PromotionEdit from "./pages/admin/promotions/Edit";
import PromotionProductList from "./pages/admin/promotionProducts/getAll";
import PromotionProductForm from "./pages/admin/promotionProducts/Create";
import PromotionProductEdit from "./pages/admin/promotionProducts/Edit";
import ProductList from "./pages/admin/product/getAll";
import ProductAdd from "./pages/admin/product/addProduct";
import AddVariant from "./pages/admin/product/addVariant";
import ProductDetail from "./pages/admin/product/detail";
import EditVariant from "./pages/admin/product/editVariant";
import WishlistList from "./pages/admin/wishlist/getAll";
import WishlistDetail from "./pages/admin/wishlist/detail";
import BrandList from "./pages/admin/brand/getAll";
import BrandDetail from "./pages/admin/brand/detail";
import BrandCreate from "./pages/admin/brand/Create";
import NotificationList from "./pages/admin/notification/getAll";
import NotificationSendAll from "./pages/admin/notification/Create";
import PromotionList from "./pages/admin/promotionUsers/getAll";
import Attribute from "./pages/admin/product/attribute/getAll";
import AttributeEdit from "./pages/admin/product/attribute/detail";
import AttributeCreate from "./pages/admin/product/attribute/create";




// Protected Route
import ProtectedRoute from "./components/Auth/ProtectedRoute/index.jsx";

const AppRoutes = () => {
  const navigate = useNavigate();
  const auth = useAuth(); // Lấy toàn bộ context
  const token = auth ? auth.token : null; // Kiểm tra trước khi destructure
  const user = auth ? auth.user : null;

  // Cấu hình interceptor khi component mount
  useEffect(() => {
    setupAxiosInterceptors(navigate);
  }, [navigate]);

  return (
    <Routes>
      {/*--------------------CLIENT-------------------- */}
      <Route path="/" element={<ClientLayout />}>
        <Route index element={<HomeThree />} />
        <Route path="about" element={<About />} />
        <Route path="/all-products" element={<AllProductPage />} />
        <Route path="/login" element={!token ? <Login /> : <Navigate to="/" />} />
        <Route path="/signup" element={!token ? <Signup /> : <Navigate to="/" />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={["user", "admin"]}>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route path="/become-saller" element={<BecomeSaller />} />
        <Route path="/blogs" element={<Blogs />} />
        <Route path="/blogs/:id" element={<Blog />} />
        <Route path="/cart" element={<CardPage />} />
        <Route path="/checkout" element={<CheakoutPage />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/flash-sale" element={<FlashSale />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/products-compaire" element={<ProductsCompaire />} />
        <Route path="/saller-page" element={<SallerPage />} />
        <Route path="/sallers" element={<Sallers />} />
        <Route path="/product/:id" element={<SingleProductPage />} />
        <Route path="/terms-condition" element={<TermsCondition />} />
        <Route path="/tracking-order" element={<TrackingOrder />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/auth/verify-email" element={<VerifyEmail />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      {/*--------------------ADMIN-------------------- */}
      <Route
        path="/admin"
        element={<Navigate to="/admin/login" replace />}
      />
      <Route
        path="/admin/login"
        element={!token ? <LoginAdmin /> : <Navigate to="/admin/" replace />}
      />
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="orders">
          <Route path="getAll" element={<OrderGetAll />} />
          <Route path="detail/:id" element={<OrderDetail />} />
        </Route>
        <Route path="user">
          <Route path="getAll" element={<UserList />} />
          <Route path="detail/:id" element={<UserDetail />} />
        </Route>
        <Route path="comments">
          <Route path="getAll" element={<CommentPage />} />
          <Route path="detail/:id" element={<CommentProductDetailPage />} />
        </Route>
        <Route path="carts">
          <Route path="getAll" element={<CartPage />} />
          <Route path="detail/:id" element={<CartDetailPage />} />
        </Route>
        <Route path="address">
          <Route path="getAll" element={<AddressList />} />
          <Route path="detail/user/:userId" element={<AddressDetail />} />
        </Route>
        <Route path="categories">
          <Route path="getAll" element={<CategoryGetAll />} />
          <Route path="create" element={<CategoryCreate />} />
          <Route path="edit/:id" element={<CategoryEdit />} />
        </Route>
        <Route path="blog">
          <Route path="getAll" element={<BlogList />} />
          <Route path="detail/:id" element={<BlogDetail />} />
          <Route path="add" element={<BlogAdd />} />
          <Route path="edit/:id" element={<EditBlog />} />
        </Route>
        <Route path="promotions">
          <Route path="getAll" element={<PromotionGetAll />} />
          <Route path="create" element={<PromotionCreate />} />
          <Route path="edit/:id" element={<PromotionEdit />} />
        </Route>
        <Route path="promotion-products">
          <Route path="getAll" element={<PromotionProductList />} />
          <Route path="create" element={<PromotionProductForm />} />
          <Route path="edit/:id" element={<PromotionProductEdit />} />
        </Route>
        <Route path="products">
          <Route path="getAll" element={<ProductList />} />
          <Route path="create" element={<ProductAdd />} />
          <Route path="addVariant/:productId" element={<AddVariant />} />
          <Route path="detail/:id" element={<ProductDetail />} />
          <Route path="editVariant/:id" element={<EditVariant />} />
        </Route>
        <Route path="attribute">
          <Route path="getAll" element={<Attribute />} />
          <Route path="edit/:id" element={<AttributeEdit />} />
          <Route path="create" element={<AttributeCreate />} />

        </Route>
        <Route path="wishlist">
          <Route path="getAll" element={<WishlistList />} />
          <Route path="detail/:id" element={<WishlistDetail />} />
        </Route>
        <Route path="brand">
          <Route path="getAll" element={<BrandList />} />
          <Route path="detail/:id" element={<BrandDetail />} />
          <Route path="create" element={<BrandCreate />} />
        </Route>
        <Route path="notification">
          <Route path="getAll" element={<NotificationList />} />
          <Route path="create" element={<NotificationSendAll />} />
        </Route>
        <Route path="promotionusers">
          <Route path="getAll" element={<PromotionList />} />
        </Route>
      </Route>

      <Route path="/*" element={<FourZeroFour />} />
      {/*--------------------ADMIN-------------------- */}
      {/* <Route
        path="/checkout"
        element={
          <ProtectedRoute restrictedRoles={["admin"]}>
            <CheakoutPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/wishlist"
        element={
          <ProtectedRoute restrictedRoles={["admin"]}>
            <Wishlist />
          </ProtectedRoute>
        }
      />

      <Route
        path="/cart"
        element={
          <ProtectedRoute restrictedRoles={["admin"]}>
            <CardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute allowedRoles={["user", "admin"]} restrictedRoles={["admin"]}>
            <Profile />
          </ProtectedRoute>
        }
      /> */}
    </Routes>
  );
};

export default AppRoutes;