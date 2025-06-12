import React, { useEffect, useMemo } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export const decodeToken = (token) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
                .join('')
        );
        const decoded = JSON.parse(jsonPayload);

        if (decoded.exp && Date.now() >= decoded.exp * 1000) {
            return null;
        }

        return decoded;
    } catch (error) {
        console.error("Không thể decode token", error);
        return null;
    }
};

const ProtectedRoute = ({ allowedRoles = [], children }) => {
    const token = localStorage.getItem('token');
    const location = useLocation();
    const navigate = useNavigate();

    const decoded = useMemo(() => token ? decodeToken(token) : null, [token]);

    useEffect(() => {
        const handleTokenExpired = () => {
            toast.error("Phiên đăng nhập đã hết hạn hoặc token không hợp lệ!", {
                autoClose: 2000,
            });
        };

        window.addEventListener("tokenExpired", handleTokenExpired);

        return () => {
            window.removeEventListener("tokenExpired", handleTokenExpired);
        };
    }, []);

    useEffect(() => {
        const checkTokenValidity = () => {
            const storedToken = localStorage.getItem("token");

            if (!storedToken) return;

            try {
                const decoded = jwtDecode(storedToken);

                if (!decoded || !decoded.exp || Date.now() >= decoded.exp * 1000) {
                    console.log("Token hết hạn hoặc không hợp lệ");
                    localStorage.removeItem("token");

                    // Gửi sự kiện toàn cục
                    window.dispatchEvent(new Event("tokenExpired"));

                    toast.warn("Phiên đăng nhập đã hết hạn.");
                }
            } catch (error) {
                console.error("Token không hợp lệ:", error);
                localStorage.removeItem("token");
                window.dispatchEvent(new Event("tokenExpired"));
            }
        };

        const intervalId = setInterval(checkTokenValidity, 30 * 1000);

        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        if (!token) {
            toast.warning("Bạn cần đăng nhập để xem trang này!", { toastId: 'warning-not-login', autoClose: 1000 });
            setTimeout(() => navigate('/login', { state: { from: location }, replace: true }), 1000);
        } else if (!decoded) {
            toast.error("Phiên đăng nhập đã hết hạn hoặc token không hợp lệ!", { toastId: 'invalid-token', autoClose: 2000 });
            setTimeout(() => {
                localStorage.removeItem("token");
                navigate('/login', { state: { from: location }, replace: true });
            }, 1000);
        } else if (allowedRoles.length && !allowedRoles.includes(decoded.role)) {
            toast.error("Bạn không có quyền truy cập!", { toastId: 'error-no-permission', autoClose: 1000 });
            setTimeout(() => navigate('/', { replace: true }), 2000);
        }
    }, [token, decoded, allowedRoles, location, navigate]);

    if (!token || !decoded || (allowedRoles.length && !allowedRoles.includes(decoded.role))) {
        return null;
    }

    return (
        <>
            {children ? children : <div>Đang tải giao diện admin...</div>}
        </>
    );
};

const ProtectedRouteClient = ({ children }) => {
    const token = localStorage.getItem('token');
    const location = useLocation();
    const navigate = useNavigate();

    const decoded = useMemo(() => token ? decodeToken(token) : null, [token]);

    useEffect(() => {
        if (!token) {
            toast.warning("Bạn cần đăng nhập để xem trang này!", {
                toastId: 'warning-not-login',
                autoClose: 1000
            });
            setTimeout(() => navigate('/login', { state: { from: location }, replace: true }), 1000);
        } else if (!decoded) {
            toast.error("Phiên đăng nhập đã hết hạn hoặc token không hợp lệ!", {
                toastId: 'invalid-token',
                autoClose: 2000
            });
            setTimeout(() => {
                localStorage.removeItem("token");
                navigate('/login', { state: { from: location }, replace: true });
            }, 1000);
        }
    }, [token, decoded, location, navigate]);

    if (!token || !decoded) {
        return null;
    }

    return children;
};

export default ProtectedRoute;