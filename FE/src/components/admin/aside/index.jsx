import { FaTachometerAlt, FaCarSide, FaBus, FaRoute, FaUserCog, FaUserTie, FaFileInvoice, FaCommentDots, FaPhone } from "react-icons/fa";
import { MdDirectionsBus, MdFeedback } from "react-icons/md";
import { Link, useLocation } from "react-router-dom";

function Aside() {
  const location = useLocation(); // Lấy đường dẫn hiện tại

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
              <span className="hide-menu">Quản lý chuyến</span>
            </li>
            <li className={`sidebar-item ${location.pathname === "/admin/routes/getAll" ? "active" : ""}`}>
              <Link className="sidebar-link" to="/admin/routes/getAll">
                <FaRoute />
                <span className="hide-menu">Quản lý tuyến đường</span>
              </Link>
            </li>
            <li className={`sidebar-item ${location.pathname === "/admin/busRoutes/getAll" ? "active" : ""}`}>
              <Link className="sidebar-link" to="/admin/busRoutes/getAll">
                <MdDirectionsBus />
                <span className="hide-menu">Quản lý tuyến xe</span>
              </Link>
            </li>
            <li className={`sidebar-item ${location.pathname === "/admin/bus/getAll" ? "active" : ""}`}>
              <Link className="sidebar-link" to="/admin/bus/getAll">
                <FaBus />
                <span className="hide-menu">Quản lý xe</span>
              </Link>
            </li>
            <li className={`sidebar-item ${location.pathname === "/admin/bus/getAll" ? "active" : ""}`}>
              <Link className="sidebar-link" to="/admin/busType/getAll">
                <FaCarSide/>
                <span className="hide-menu">Quản lý loại xe</span>
              </Link>
            </li>

            <li className="nav-small-cap">
              <span className="hide-menu">Quản lý tài khoản</span>
            </li>
            <li className={`sidebar-item ${location.pathname === "/admin/user/getAll" ? "active" : ""}`}>
              <Link className="sidebar-link" to="/admin/user/getAll">
                <FaUserCog />
                <span className="hide-menu">Quản lý người dùng</span>
              </Link>
            </li>
            <li className={`sidebar-item ${location.pathname === "/admin/driver/getAll" ? "active" : ""}`}>
              <Link className="sidebar-link" to="/admin/driver/getAll">
                <FaUserTie />
                <span className="hide-menu">Quản lý tài xế</span>
              </Link>
            </li>

            <li className="nav-small-cap">
              <span className="hide-menu">Quản lý chung</span>
            </li>
            <li className={`sidebar-item ${location.pathname === "/admin/blog/getAll" ? "active" : ""}`}>
              <Link className="sidebar-link" to="/admin/blog/getAll">
                <MdFeedback />
                <span className="hide-menu">Quản lý Blog</span>
              </Link>
            </li>
            <li className={`sidebar-item ${location.pathname === "/admin/historyBill/getAll" ? "active" : ""}`}>
              <Link className="sidebar-link" to="/admin/historyBill/getAll">
                <FaFileInvoice />
                <span className="hide-menu">Quản lý Hóa đơn</span>
              </Link>
            </li>
            <li className={`sidebar-item ${location.pathname === "/admin/review/getAll" ? "active" : ""}`}>
              <Link className="sidebar-link" to="/admin/review/getAll">
                <FaCommentDots />
                <span className="hide-menu">Quản lý Đánh Giá</span>
              </Link>
            </li>
            <li className={`sidebar-item ${location.pathname === "/admin/contact/getAll" ? "active" : ""}`}>
              <Link className="sidebar-link" to="/admin/contact/getAll">
                <FaPhone />
                <span className="hide-menu">Quản lý Liên hệ</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </aside>
  );
}

export default Aside;
