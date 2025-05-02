import { useState } from "react";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { useCookies } from "react-cookie";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
function Header() {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [cookies] = useCookies(["token"]);
  const [user, setUser] = useState(null);

  const toggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen);
  };

  useEffect(() => {
    const token = cookies.token;
    if (token) {
      try {
        const decode = jwtDecode(token);
        setUser(decode);
      } catch (err) {
        console.error("Lỗi giải mã token:", err);
      }
    }
  }, []);
  const logout = () => {
    setUser(null);
    navigator("/login");
    Cookies.remove("token", { path: "/" });
  };
  return (
    <header className="app-header">
      <nav className="navbar navbar-expand-lg navbar-light">
        <ul className="navbar-nav">
          <li className="nav-item d-block d-xl-none">

          </li>
          <li className="nav-item">

          </li>
        </ul>
        <div className="navbar-collapse justify-content-end px-0" id="navbarNav">
          <ul className="navbar-nav flex-row ms-auto align-items-center justify-content-end">
            {user && (
              <li className="nav-item dropdown relative">
                <div
                  className="nav-link flex items-center gap-2 cursor-pointer hover:bg-gray-100 px-3 py-2 rounded transition-all"
                  id="drop2"
                  onClick={toggleDropdown}
                >
                  <img
                    src="/assets/images/profile/user-1.jpg"
                    alt="Ảnh đại diện"
                    width="35"
                    height="35"
                    className="rounded-full border"
                  />
                  <span className="font-semibold text-sm text-gray-800">{user.fullName}</span>
                  <i className="fa fa-chevron-down ml-1 text-xs text-gray-500"></i>
                </div>

                <div
                  className={`dropdown-menu absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50 transition-all duration-300 ${isDropdownOpen ? "block" : "hidden"
                    }`}
                  aria-labelledby="drop2"
                >
                  <div className="py-2 px-4 border-b">
                    <p className="text-sm text-gray-600">Xin chào,</p>
                    <p className="text-base font-semibold text-gray-800">{user.fullName}</p>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={logout}
                      className="block w-full text-left text-sm text-red-600 hover:bg-red-50 hover:text-red-800 px-4 py-2 rounded transition"
                    >
                      <i className="fa fa-sign-out-alt mr-2"></i>
                      Đăng xuất
                    </button>
                  </div>
                </div>
              </li>
            )}

          </ul>

        </div>
      </nav>
    </header>
  );
}

export default Header;
