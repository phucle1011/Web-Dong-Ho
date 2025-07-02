import React, { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { Bell, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { io } from 'socket.io-client';
import Constants from '../../../../Constants.jsx';
import 'react-toastify/dist/ReactToastify.css';

const typeIcons = {
  info: <Info className="text-blue-500" />,
  success: <CheckCircle className="text-green-500" />,
  warning: <AlertCircle className="text-yellow-500" />,
  danger: <AlertCircle className="text-red-500" />,
};

const NotificationList = ({ userId }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;
  const latestNotificationId = useRef(null);
  const effectiveUserId = userId || localStorage.getItem('userId') || '2'; // Use string to match socket

  const socket = io(Constants.DOMAIN_API, {
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  const fetchNotifications = useCallback(async () => {
    if (!effectiveUserId) {
      setNotifications([]);
      setUnreadCount(0);
      setTotal(0);
      return;
    }

    try {
      setLoading(true);

      const res = await axios.get(`${Constants.DOMAIN_API}/admin/notification`, {
        params: {
          user_id: effectiveUserId,
          page,
          limit,
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const { notifications: notifs, total: totalCount } = res.data || { notifications: [], total: 0 };

      if (!Array.isArray(notifs)) {
        console.warn('Notifications is not an array:', notifs);
        setNotifications([]);
        setUnreadCount(0);
        setTotal(0);
        return;
      }

      const unread = notifs.filter((n) => !n.read_at).length;

      setUnreadCount(unread);
      setNotifications(notifs);
      setTotal(totalCount || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Lỗi khi tải thông báo');
    } finally {
      setLoading(false);
    }
  }, [effectiveUserId, page]);

  const markAsRead = async (id) => {
    try {
      await axios.patch(
        `${Constants.DOMAIN_API}/admin/notification/${id}/read`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      toast.success('Đã đánh dấu thông báo là đã đọc');
      fetchNotifications();
    } catch (error) {
      console.error('Error marking as read:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Lỗi khi đánh dấu thông báo đã đọc');
    }
  };

  const markAllAsRead = async () => {
    try {
      setLoading(true);
      await axios.patch(
        `${Constants.DOMAIN_API}/admin/notification/mark-all-read`,
        { user_id: effectiveUserId },
        { headers: { Authentication: `Bearer ${localStorage.getItem('token')}` } }
      );
      toast.success('Đã đánh dấu tất cả thông báo là đã đọc');
      fetchNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Lỗi khi đánh dấu tất cả thông báo đã đọc');
    } finally {
      setLoading(false);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await axios.delete(`${Constants.DOMAIN_API}/admin/notification/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      toast.success('Đã xóa thông báo');
      fetchNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Lỗi khi xóa thông báo');
    }
  };

  useEffect(() => {
    fetchNotifications();

    if (effectiveUserId) {
      socket.emit('join', effectiveUserId.toString());
    }

    socket.on('createNotification', (notification) => {

      if (notification.user_ids?.includes(effectiveUserId)) {
        toast.info(`Thông báo mới: ${notification.data?.title || 'Thông báo hệ thống'}`);
        fetchNotifications();
      }
    });

    socket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
      toast.error('Không thể kết nối tới server thông báo');
    });

    const interval = setInterval(() => {

      fetchNotifications();
    }, 5000); // 5s for testing, revert to 10000 in production

    return () => {

      socket.disconnect();
      clearInterval(interval);
    };
  }, [effectiveUserId, page, fetchNotifications]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-4 max-w-xl mx-auto bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Bell className="text-blue-500" /> Thông báo ({unreadCount})
        </h2>
        <Link
          to="/admin/notification/create"
          className="inline-block bg-[#073272] text-white px-4 py-2 rounded"
        >
          + Thêm thông báo
        </Link>
      </div>

      <div className="flex items-center justify-between mb-4">
        <button
          className="text-sm text-blue-600 hover:underline disabled:text-gray-400"
          onClick={markAllAsRead}
          disabled={loading}
        >
          {loading ? 'Đang xử lý...' : 'Đánh dấu tất cả đã đọc'}
        </button>
      </div>

      {loading && notifications.length === 0 ? (
        <p className="text-gray-500">Đang tải thông báo...</p>
      ) : notifications.length === 0 ? (
        <p className="text-gray-500">Chưa có thông báo nào.</p>
      ) : (
        notifications.map((n) => (
          <div
            key={n.id}
            className={`flex items-start gap-3 p-3 rounded-md border mb-2 ${
              n.read_at ? 'bg-gray-50 border-gray-200' : 'bg-yellow-50 border-yellow-200'
            }`}
          >
            <div className="mt-1">{typeIcons[n.type] || <Bell className="text-gray-500" />}</div>
            <div className="flex-1">
              <div className="font-medium">{n.data?.title || 'Thông báo hệ thống'}</div>
              <div className="text-sm text-gray-700">{n.data?.message || ''}</div>
              <div className="text-xs text-gray-400">
                {n.created_at ? new Date(n.created_at).toLocaleString() : 'N/A'}
              </div>
              {!n.read_at && (
                <button
                  className="text-xs text-blue-500 hover:underline mt-1"
                  onClick={() => markAsRead(n.id)}
                >
                  ✔ Đánh dấu đã đọc
                </button>
              )}
            </div>
            <div className="flex flex-col items-end">
              <img
                src={n.data?.avatar || 'https://i.pravatar.cc/40'}
                alt="avatar"
                className="w-8 h-8 rounded-full mb-1"
              />
              <button
                className="text-xs text-red-400 hover:text-red-600"
                onClick={() => deleteNotification(n.id)}
              >
                🗑 Xóa
              </button>
            </div>
          </div>
        ))
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          <button
            className="text-sm px-2 py-1 rounded bg-gray-200 hover:bg-gray-300"
            disabled={page === 1 || loading}
            onClick={() => setPage(page - 1)}
          >
            Trang trước
          </button>
          <span className="text-sm">Trang {page} / {totalPages}</span>
          <button
            className="text-sm px-2 py-1 rounded bg-gray-200 hover:bg-gray-300"
            disabled={page === totalPages || loading}
            onClick={() => setPage(page + 1)}
          >
            Trang sau
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationList;