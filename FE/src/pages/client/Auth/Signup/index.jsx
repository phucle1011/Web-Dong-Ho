import React, { useState, useEffect } from "react";
import InputCom from "../../Helpers/InputCom";
import Layout from "../../Partials/LayoutHomeThree";
import Thumbnail from "./Thumbnail";
import { Link, useNavigate } from "react-router-dom";
import { uploadToCloudinary } from "../../../../Upload/uploadToCloudinary";
import { toast } from 'react-toastify';

export default function Signup() {
  // const [checked, setValue] = useState(false);
  // const rememberMe = () => {
  //   setValue(!checked);
  // };



  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  const [avatar, setAvatar] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    // Validate tên
    if (!formData.name.trim()) {
      newErrors.name = "Tên người dùng không được để trống!";
      isValid = false;
    } else if (formData.name.length > 30) {
      newErrors.name = "Tên không được vượt quá 30 ký tự!";
      isValid = false;
    } else if (/\s{2,}/.test(formData.name)) {
      newErrors.name = "Tên không được chứa nhiều khoảng trắng liên tiếp!";
      isValid = false;
    }

    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = "Email không được để trống!";
      isValid = false;
    } else if (
      !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)
    ) {
      newErrors.email = "Email không hợp lệ!";
      isValid = false;
    }

    // Validate mật khẩu
    if (!formData.password.trim()) {
      newErrors.password = "Mật khẩu không được để trống!";
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự!";
      isValid = false;
    }

    // Validate xác nhận mật khẩu
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu!";
      isValid = false;
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = "Mật khẩu không khớp!";
      isValid = false;
    }

    // Validate số điện thoại
    if (!formData.phone.trim()) {
      newErrors.phone = "Số điện thoại không được để trống!";
      isValid = false;
    } else if (!/^0\d{9}$/.test(formData.phone)) {
      newErrors.phone = "Số điện thoại phải là 10 số bắt đầu bằng 0!";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      let avatarUrl = "default-avatar.png";

      // Nếu người dùng chọn ảnh thì upload lên cloudinary trước
      if (avatar) {
        const uploaded = await uploadToCloudinary(avatar);
        avatarUrl = uploaded.url;
      }

      const response = await fetch("http://localhost:5000/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          avatar: avatarUrl,
          confirmPassword: undefined,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Đăng ký thành công! Vui lòng kiểm tra email để xác thực.");
        navigate("/login");
      } else {
        toast.error(result.message || "Đăng ký thất bại!");
      }
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi xảy ra khi đăng ký. Vui lòng thử lại sau!");
    } finally {
      setLoading(false);
    }
  }

  

  return (
    <Layout childrenClasses="pt-0 pb-0">
      <div className="login-page-wrapper w-full py-10">
        <div className="container-x mx-auto">
          <div className="lg:flex items-center relative">
            <div className="lg:w-[572px] w-full lg:h-[690px] bg-white flex flex-col justify-center sm:p-10 p-5 border border-[#E0E0E0]">
              <div className="w-full">
                <div className="title-area flex flex-col justify-center items-center relative text-center mb-7">
                  <h1 className="text-[34px] font-bold leading-[74px] text-qblack">
                    Tạo tài khoản
                  </h1>
                  <div className="shape -mt-6">
                    <svg
                      width="354"
                      height="30"
                      viewBox="0 0 354 30"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M1 28.8027C17.6508 20.3626 63.9476 8.17089 113.509 17.8802C166.729 28.3062 341.329 42.704 353 1"
                        stroke="#FFBB38"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </div>
                {/* <div className="input-area"> */}
                {/* Họ tên */}
                <div className="mb-4">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Tên Người Dùng<span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Tên người dùng"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border ${errors.name ? "border-red-500" : "border-gray-300"
                      } rounded-md focus:outline-none focus:border-indigo-500`}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                {/* Email */}
                <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email<span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Demo@gmail.com"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border ${errors.email ? "border-red-500" : "border-gray-300"
                      } rounded-md focus:outline-none focus:border-indigo-500`}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Số điện thoại */}
                <div className="mb-4">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Số Điện Thoại<span className="text-red-500">*</span>
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="text"
                    placeholder="0913 *********"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border ${errors.phone ? "border-red-500" : "border-gray-300"
                      } rounded-md focus:outline-none focus:border-indigo-500`}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>

                {/* Mật khẩu */}
                <div className="mb-4">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Mật Khẩu<span className="text-red-500">*</span>
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Mật khẩu"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border ${errors.password ? "border-red-500" : "border-gray-300"
                      } rounded-md focus:outline-none focus:border-indigo-500`}
                  />
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                  )}
                </div>

                <div className="mb-4">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Xác nhận mật khẩu<span className="text-red-500">*</span>
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Nhập lại mật khẩu"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border ${errors.confirmPassword ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:border-indigo-500`}
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                  )}
                </div>

                {/* Ảnh đại diện */}
                <div className="mb-4">
                  <label htmlFor="fileInput" className="block text-sm font-medium text-gray-700">
                    Ảnh đại diện*
                  </label>
                  <div className="flex items-center space-x-4">
                    <label
                      htmlFor="fileInput"
                      className="cursor-pointer flex items-center px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-400 transition duration-300 ease-in-out"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        className="bi bi-file-earmark mr-2"
                        viewBox="0 0 16 16"
                      >
                        <path d="M14 4H2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zM9.5 6l-2.5 3-2.5-3-2.5 3M12 10H4a2 2 0 0 1-2-2v-3.5A1.5 1.5 0 0 1 5.5 5h9A1.5 1.5 0 0 1 16 6.5v3.5a2 2 0 0 1-2 2z" />
                      </svg>
                      Chọn ảnh
                    </label>
                    <input
                      id="fileInput"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <span className="text-sm text-gray-500">
                      {avatar ? avatar.name : "Chưa chọn ảnh"}
                    </span>
                  </div>
                </div>

                {/* Nút submit */}
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="w-full px-4 py-2 bg-black text-white font-semibold rounded-md hover:bg-gray-800 transition duration-300"
                  disabled={loading}
                >
                  {loading ? "Đang xử lý..." : "Tạo tài khoản"}
                </button>

                {/* Liên kết đăng nhập */}
                <p className="mt-4 text-sm text-gray-500">
                  Đã có tài khoản?{" "}
                  <Link to="/login" className="text-qblack font-medium">
                    Đăng nhập
                  </Link>
                </p>
              </div>
              {/* </div> */}
            </div>
          </div>
          <div className="flex-1 lg:flex hidden transform scale-60 xl:scale-100   xl:justify-center">
            <div
              className="absolute xl:-right-20 -right-[138px]"
              style={{ top: "calc(50% - 580px)" }}
            >
              <Thumbnail />
            </div>
          </div>
        </div>
      </div>
    </Layout >
  );
}
