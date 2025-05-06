import { FaTachometerAlt, FaUser, FaMoneyBillWave, FaMapMarkerAlt, FaTag, FaPercent, FaCogs, FaTags, FaBoxOpen, FaBox, FaShoppingCart, FaHeart, FaHistory, FaCommentDots, FaBell } from "react-icons/fa";
import { MdDirectionsBus, MdFeedback } from "react-icons/md";
import { Link, useLocation } from "react-router-dom";

function Aside() {
  const location = useLocation(); 

  return (
    <aside className="left-sidebar">
      <div>
        <div className="brand-logo d-flex align-items-center justify-content-between">
          <Link to="/admin" className="text-nowrap logo-img">
            <img src="/assets/images/logos/logo.png" width="180" alt="Logo" />
          </Link>
          <div className="close-btn d-xl-none d-block sidebartoggler cursor-pointer" id="sidebarCollapse">
            <i className="ti ti-x fs-8"></i>
          </div>
        </div>

        <nav className="sidebar-nav scroll-sidebar" data-simplebar="">
          <ul id="sidebarnav">
            <li className="nav-small-cap">
              <span className="hide-menu">Home</span>
            </li>
            <li className={`sidebar-item ${location.pathname === "/admin" ? "active" : ""}`}>
              <Link className="sidebar-link" to="/admin">
                <FaTachometerAlt />
                <span className="hide-menu">Bảng điều khiển</span>
              </Link>
            </li>

            <li className="nav-small-cap">
              <span className="hide-menu">Quản lý sản phẩm</span>
            </li>
            <li className={`sidebar-item ${location.pathname === "/admin/categories/getAll" ? "active" : ""}`}>
              <Link className="sidebar-link" to="/admin/categories/getAll">
                <FaCogs />
                <span className="hide-menu">Quản lý loại sản phẩm</span>
              </Link>
            </li>
            <li className={`sidebar-item ${location.pathname === "/admin/products/getAll" ? "active" : ""}`}>
              <Link className="sidebar-link" to="/admin/products/getAll">
                <FaBoxOpen />
                <span className="hide-menu">Quản lý sản phẩm</span>
              </Link>
            </li>
            <li className={`sidebar-item ${location.pathname === "/admin/brands/getAll" ? "active" : ""}`}>
              <Link className="sidebar-link" to="/admin/brands/getAll">
                <FaTag />
                <span className="hide-menu">Quản lý thương hiệu</span>
              </Link>
            </li>
            <li className={`sidebar-item ${location.pathname === "/admin/product_combos/getAll" ? "active" : ""}`}>
              <Link className="sidebar-link" to="/admin/product_combos/getAll">
                <FaBox />
                <span className="hide-menu">Quản lý sản phẩm combo</span>
              </Link>
            </li>

            <li className="nav-small-cap">
              <span className="hide-menu">Quản lý giảm giá</span>
            </li>
            <li className={`sidebar-item ${location.pathname === "/admin/coupons/getAll" ? "active" : ""}`}>
              <Link className="sidebar-link" to="/admin/coupons/getAll">
                <FaMoneyBillWave />
                <span className="hide-menu">Quản lý phiếu giảm giá </span>
              </Link>
            </li>
            <li className={`sidebar-item ${location.pathname === "/admin/promotions/getAll" ? "active" : ""}`}>
              <Link className="sidebar-link" to="/admin/promotions/getAll">
                <FaTags />
                <span className="hide-menu">Quản lý khuyến mãi</span>
              </Link>
            </li>
            <li className={`sidebar-item ${location.pathname === "/admin/promotion-products/getAll" ? "active" : ""}`}>
              <Link className="sidebar-link d-flex align-items-center" to="/admin/promotion-products/getAll" title="Quản lý sản phẩm khuyến mãi">
                <FaTag className="me-2" />
                <span className="hide-menu text-truncate" style={{ maxWidth: '150px' }}>
                  Quản lý sản phẩm khuyến mãi
                </span>
              </Link>
            </li>
            <li className={`sidebar-item ${location.pathname === "/admin/discounts/getAll" ? "active" : ""}`}>
              <Link className="sidebar-link" to="/admin/discountsType/getAll">
                <FaPercent />
                <span className="hide-menu">Quản lý giảm giá</span>
              </Link>
            </li>

            <li className="nav-small-cap">
              <span className="hide-menu">Quản lý đơn hàng</span>
            </li>
            <li className={`sidebar-item ${location.pathname === "/admin/carts/getAll" ? "active" : ""}`}>
              <Link className="sidebar-link" to="/admin/carts/getAll">
                <FaShoppingCart />
                <span className="hide-menu">Quản lý giỏ hàng</span>
              </Link>
            </li>
            <li className={`sidebar-item ${location.pathname === "/admin/orders/getAll" ? "active" : ""}`}>
              <Link className="sidebar-link" to="/admin/orders/getAll">
                <FaBox />
                <span className="hide-menu">Quản lý đơn hàng</span>
              </Link>
            </li>
            <li className={`sidebar-item ${location.pathname === "/admin/order_history/getAll" ? "active" : ""}`}>
              <Link className="sidebar-link" to="/admin/order_history/getAll">
                <FaHistory />
                <span className="hide-menu">Quản lý lịch sử đơn hàng </span>
              </Link>
            </li>

            <li className="nav-small-cap">
              <span className="hide-menu">Quản lý người dùng</span>
            </li>
            <li className={`sidebar-item ${location.pathname === "/admin/users/getAll" ? "active" : ""}`}>
              <Link className="sidebar-link" to="/admin/users/getAll">
                <FaUser />
                <span className="hide-menu">Quản lý người dùng</span>
              </Link>
            </li>
            <li className={`sidebar-item ${location.pathname === "/admin/address/getAll" ? "active" : ""}`}>
              <Link className="sidebar-link" to="/admin/address/getAll">
                <FaMapMarkerAlt />
                <span className="hide-menu">Quản lý địa chỉ</span>
              </Link>
            </li>
            <li className={`sidebar-item ${location.pathname === "/admin/wishlists/getAll" ? "active" : ""}`}>
              <Link className="sidebar-link d-flex align-items-center" to="/admin/wishlists/getAll" title="Quản lý sản phẩm yêu thích">
                <FaHeart className="me-2" />
                <span className="hide-menu text-truncate" style={{ maxWidth: "160px", display: "inline-block", whiteSpace: "nowrap", overflow: "hidden" }}>
                  Quản lý sản phẩm yêu thích
                </span>
              </Link>
            </li>
            <li className={`sidebar-item ${location.pathname === "/admin/comments/getAll" ? "active" : ""}`}>
              <Link className="sidebar-link" to="/admin/comments/getAll">
                <FaCommentDots />
                <span className="hide-menu">Quản lý bình luận </span>
              </Link>
            </li>
            <li className={`sidebar-item ${location.pathname === "/admin/notifications/getAll" ? "active" : ""}`}>
              <Link className="sidebar-link" to="/admin/notifications/getAll">
                <FaBell />
                <span className="hide-menu">Quản lý thông báo </span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </aside>
  );
}

export default Aside;
