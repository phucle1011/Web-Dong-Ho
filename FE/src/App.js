//--------------------CLIENT--------------------
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminLayout from "./layouts/AdminLayouts";
import ClientLayout from "./layouts/ClientLayouts";
import Dashboard from "./pages/admin/dashboard";
import Home from "./pages/client/Home";
import Bus from "./pages/client/Bus";
import AboutUs from "./pages/client/About-us";
import Blog from "./pages/client/Blog";
import Contact from "./pages/client/Contact";
import BookingHistory from "./pages/client/BookingHistory";
import Profile from "./pages/client/Profile";
import Login from "./pages/authenticator/Login";
import Register from "./pages/authenticator/Register";
import BookingTickets from "./pages/client/BookingTickets";

//------------ADMIN-------------
import OrderGetAll from "./pages/admin/order/getAll";
import CategoryGetAll from "./pages/admin/category/getAll";
import CategoryCreate from "./pages/admin/category/Create";
import CategoryEdit from "./pages/admin/category/Edit";





import UserList from './pages/admin/user/getAll';
import UserDetail from './pages/admin/user/detail';
import CommentPage from "./pages/admin/comment/getAll";
import CommentDetailPage from "./pages/admin/comment/detail";
import CartPage from "./pages/admin/cart/getAll";
import CartDetailPage from "./pages/admin/cart/detail";
import OrderDetail from "./pages/admin/order/detail";
import OrderHistoryGetAll from "./pages/admin/orderHistory/getAll";
import OrderHistoryDetail from "./pages/admin/orderHistory/detail";


const AppRoutes = () => {
  return (
    <Routes>

      {/*--------------------CLIENT-------------------- */}
      <Route path="/" element={<ClientLayout />}>
        <Route index element={<Home />} />
        <Route path="bus" element={<Bus />} />
        <Route path="about" element={<AboutUs />} />
        <Route path="blog" element={<Blog />} />
        <Route path="contact" element={<Contact />} />

        {/* Các route cần bảo vệ được bọc riêng lẻ bằng <PrivateRoute> */}
        <Route
          path="bookingHistory"
          element={
            <BookingHistory />
          }
        />
        <Route
          path="profile"
          element={
            <Profile />
          }
        />
        <Route
          path="bookingTickets/:tripId"
          element={
            <BookingTickets />
          }
        />
      </Route>

      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />
      {/* <Route path="resetForm" element={<ResetForm />} />
      <Route path="resetPassword/:token" element={<ResetPassword />} /> */}


      {/*--------------------ADMIN-------------------- */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="orders">
          <Route path="getAll" element={<OrderGetAll />} />
          <Route path="detail/:id" element={<OrderDetail />} />
        </Route>
        <Route path="order_history">
          <Route path="getAll" element={<OrderHistoryGetAll />} />
          <Route path="detail/:id" element={<OrderHistoryDetail />} />
        </Route>
        <Route path="user">
          <Route path="getAll" element={<UserList />} />
          <Route path="detail/:id" element={<UserDetail />} />
        </Route>
        <Route path="comments">
          <Route path="getAll" element={<CommentPage />} />
          <Route path="detail/:id" element={<CommentDetailPage />} />
        </Route>
        <Route path="carts">
          <Route path="getAll" element={<CartPage />} />
          <Route path="detail/:id" element={<CartDetailPage />} />
        </Route>

        <Route path="categories">
          <Route path="getAll" element={<CategoryGetAll />} />
          <Route path="create" element={<CategoryCreate />} />
          <Route path="edit/:id" element={<CategoryEdit />} />
        </Route>

      </Route>
    </Routes>
  );
};

export default AppRoutes;