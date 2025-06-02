import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// ------------ADMIN-------------
import Dashboard from "./pages/admin/dashboard";
import AdminLayout from "./layouts/AdminLayouts";
import OrderGetAll from "./pages/admin/order/getAll";
import AddressList from "./pages/admin/address/getAll";
import AddressDetail from "./pages/admin/address/detail";
import CategoryGetAll from "./pages/admin/category/getAll";
import CategoryCreate from "./pages/admin/category/Create";
import CategoryEdit from "./pages/admin/category/Edit";
import UserDetail from "./pages/admin/user/detail";
import UserList from "./pages/admin/user/getAll";
import OrderDetail from "./pages/admin/order/detail";
import PromotionProductList from "./pages/admin/promotionProducts/getAll";
import PromotionProductForm from "./pages/admin/promotionProducts/Create";
import PromotionProductEdit from "./pages/admin/promotionProducts/Edit";
import WishlistList from "./pages/admin/wishlist/getAll";
import PromotionGetAll from "./pages/admin/promotions/getAll";
import PromotionEdit from "./pages/admin/promotions/Edit";
import PromotionCreate from "./pages/admin/promotions/Create";
import CommentPage from "./pages/admin/comment/getAll";
import CommentProductDetailPage from "./pages/admin/comment/detail";
import CartPage from "./pages/admin/cart/getAll";
import CartDetailPage from "./pages/admin/cart/detail";
import ProductList from "./pages/admin/product/getAll";
import ProductAdd from "./pages/admin/product/addProduct";
import AddVariant from "./pages/admin/product/addVariant";
import ProductDetail from "./pages/admin/product/detail";
import EditVariant from "./pages/admin/product/editVariant";
import BrandList from "./pages/admin/brand/getAll";
import BrandDetail from "./pages/admin/brand/detail";
import BrandCreate from "./pages/admin/brand/Create";
import BlogList from "./pages/admin/blog/getall";
import BlogDetail from "./pages/admin/blog/detail";
import BlogAdd from "./pages/admin/blog/add";
import EditBlog from "./pages/admin/blog/edit";
import WishlistDetail from "./pages/admin/wishlist/detail";
import PromotionList from "./pages/admin/promotionUsers/getAll";

const router = createBrowserRouter([
<Route path="/admin" element={<AdminLayout />}>
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

        <Route path="wishlist">
          <Route path="getAll" element={<WishlistList />} />
          <Route path="detail/:id" element={<WishlistDetail />} />
        </Route>

        <Route path="brand">
          <Route path="getAll" element={<BrandList />} />
          <Route path="detail/:id" element={<BrandDetail />} />
          <Route path="create" element={<BrandCreate />} />
        </Route>

        <Route path="promotionusers">
          <Route path="getAll" element={<PromotionList />} />
        </Route>
      </Route>
]);
function Routers() {
  return <RouterProvider router={router} />;
}

export default Routers;