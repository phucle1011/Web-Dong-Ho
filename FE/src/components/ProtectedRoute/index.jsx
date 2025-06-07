import React, { useEffect, useMemo } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

// Hàm decodeToken
export const decodeToken = (token) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/'); // <-- sửa dấu
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error("Không thể decode token", error);
        return null;
    }
};

const ProtectedRoute = ({ allowedRoles = [], children }) => {
    const token = localStorage.getItem('token');

    // Hoặc localStorage.getItem('token')
    const location = useLocation();
    const navigate = useNavigate();

    const decoded = useMemo(() => token ? decodeToken(token) : null, [token]);

    useEffect(() => {
        if (!token) {
            toast.warning("Bạn cần đăng nhập để xem trang này!", {
                toastId: 'warning-not-login',
                autoClose: 2000
            });
            setTimeout(() => {
                navigate('/login', { state: { from: location }, replace: true });
            }, 1000);
        } else if (!decoded) {
            toast.error("Token không hợp lệ. Vui lòng đăng nhập lại!", {
                toastId: 'invalid-token',
                autoClose: 2000
            });
            setTimeout(() => {
                navigate('/login', { state: { from: location }, replace: true });
            }, 1000);
        } else if (allowedRoles.length && !allowedRoles.includes(decoded.role)) {
            toast.error("Bạn không có quyền truy cập!", {
                toastId: 'error-no-permission',
                autoClose: 2000
            });
            setTimeout(() => {
                navigate('/', { replace: true });
            }, 2000);
        }
    }, [token, decoded, allowedRoles, location, navigate]);

    if (token && decoded && (!allowedRoles.length || allowedRoles.includes(decoded.role))) {
        return children;
    }

    return null;
};

export default ProtectedRoute;
