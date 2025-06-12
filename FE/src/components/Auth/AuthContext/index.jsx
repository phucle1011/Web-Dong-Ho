import React, { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const isTokenValid = (token) => {
  if (!token) return false;
  try {
    const decoded = jwtDecode(token);
    if (!decoded || !decoded.exp) return false;
    return Date.now() < decoded.exp * 1000;
  } catch (error) {
    console.error("Token không hợp lệ:", error);
    return false;
  }
};

function AuthProviderWrapper({ children }) {
  const navigate = useNavigate();

  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(() => {
    try {
      const token = localStorage.getItem("token");
      return token && isTokenValid(token) ? jwtDecode(token) : null;
    } catch {
      return null;
    }
  });

  const logout = (silent = false) => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    if (!silent) toast.success("Đã đăng xuất!");
    navigate("/");
  };

  // Kiểm tra token định kỳ mỗi 30 giây
  useEffect(() => {
    const checkTokenValidity = () => {
      const storedToken = localStorage.getItem("token");

      if (!storedToken) return;

      try {
        const decoded = jwtDecode(storedToken);

        if (!decoded || !decoded.exp || Date.now() >= decoded.exp * 1000) {
          console.log("Token hết hạn hoặc không hợp lệ");
          localStorage.removeItem("token");
          setToken(null);
          setUser(null);

          // Gửi sự kiện toàn cục
          window.dispatchEvent(new Event("tokenExpired"));

          // Hiển thị thông báo
          toast.warn("Phiên đăng nhập đã hết hạn.");
        }
      } catch (error) {
        console.error("Token không hợp lệ:", error);
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);

        // Gửi sự kiện toàn cục
        window.dispatchEvent(new Event("tokenExpired"));

        // Hiển thị thông báo
        toast.error("Token không hợp lệ. Vui lòng đăng nhập lại.");
      }
    };

    // Kiểm tra mỗi 30 giây
    const intervalId = setInterval(checkTokenValidity, 30 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export default function AuthProvider({ children }) {
  return <AuthProviderWrapper>{children}</AuthProviderWrapper>;
}

export const useAuth = () => useContext(AuthContext);