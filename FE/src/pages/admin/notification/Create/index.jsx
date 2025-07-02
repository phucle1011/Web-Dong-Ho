import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Constants from "../../../../Constants.jsx";
import Select from "react-select";
import { io } from "socket.io-client";

const CreateNotification = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    user_ids: [],
    discount_id: "",
    type: "info",
    data: {
      title: "",
      message: "",
    },
  });
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const userId = localStorage.getItem("userId");

  // Initialize socket with reconnection options
  const socket = io(Constants.DOMAIN_API, {
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  // Fetch users & discounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, discountRes] = await Promise.all([
          axios.get(`${Constants.DOMAIN_API}/admin/user/list`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }),
          axios.get(`${Constants.DOMAIN_API}/admin/promotion`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }),
        ]);

        const usersData = Array.isArray(userRes.data)
          ? userRes.data
          : userRes.data?.data || [];
        const discountsData = Array.isArray(discountRes.data)
          ? discountRes.data
          : discountRes.data?.data || [];

        setUsers(usersData);
        setDiscounts(discountsData);
      } catch (error) {
        console.error("Error fetching users/discounts:", error.response?.data || error.message);
        toast.error(error.response?.data?.message || "Lỗi khi tải người dùng hoặc mã giảm giá");
      }
    };
    fetchData();

    // Join socket room for admin user
    if (userId) {
      socket.emit("join", userId.toString());
    }

    // Handle socket connection errors
    socket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
      toast.error('Không thể kết nối tới server thông báo');
    });

    // Cleanup socket on unmount
    return () => {
      socket.disconnect();
    };
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("data.")) {
      const key = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        data: { ...prev.data, [key]: value },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleUserIdsChange = (selectedOptions) => {
    setFormData((prev) => ({
      ...prev,
      user_ids: selectedOptions.map((opt) => String(opt.value)), // Ensure strings
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await axios.post(`${Constants.DOMAIN_API}/admin/notification`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      toast.success("Tạo thông báo thành công");

      // Emit socket event for new notification
      const eventData = {
        user_ids: formData.user_ids, // Already strings
        discount_id: formData.discount_id,
        type: formData.type,
        data: formData.data,
        created_at: new Date().toISOString(),
      };
      socket.emit("createNotification", eventData);

      navigate("/admin/notification/getAll");
    } catch (error) {
      console.error("Error creating notification:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Lỗi khi tạo thông báo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto bg-white rounded-lg shadow">
      <h2 className="text-lg font-bold mb-4">Tạo Thông Báo Mới</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium">Người nhận</label>
          <Select
            isMulti
            options={users.map((user) => ({
              value: user.id,
              label: user.name || `User ${user.id}`,
            }))}
            onChange={handleUserIdsChange}
            placeholder="Chọn người nhận"
            className="basic-multi-select"
            classNamePrefix="select"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium">Mã giảm giá (nếu có)</label>
          <select
            name="discount_id"
            value={formData.discount_id}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="">-- Không áp dụng --</option>
            {discounts.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name || `Giảm giá ${d.id}`}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium">Loại thông báo</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="info">Thông tin</option>
            <option value="success">Thành công</option>
            <option value="warning">Cảnh báo</option>
            <option value="danger">Nguy hiểm</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium">Tiêu đề</label>
          <input
            type="text"
            name="data.title"
            value={formData.data.title}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Nhập tiêu đề"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium">Nội dung</label>
          <textarea
            name="data.message"
            value={formData.data.message}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Nhập nội dung thông báo"
            required
          />
        </div>

        <button
          type="submit"
          className="bg-[#073272] text-white px-4 py-2 rounded disabled:bg-gray-400"
          disabled={loading}
        >
          {loading ? "Đang tạo..." : "Tạo Thông Báo"}
        </button>
      </form>
    </div>
  );
};

export default CreateNotification;