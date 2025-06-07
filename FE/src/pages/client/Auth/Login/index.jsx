import React, { useState } from "react";
import Layout from "../../Partials/LayoutHomeThree";
import Thumbnail from "./Thumbnail";
import { Link, useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';

export default function Login() {
  const [checked, setValue] = useState(!!localStorage.getItem("token"));
  const rememberMe = () => {
    setValue(!checked);
  };
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!formData.email.trim()) {
      newErrors.email = "Email không được để trống!";
      isValid = false;
    } else if (
      !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)
    ) {
      newErrors.email = "Email không hợp lệ!";
      isValid = false;
    }

    if (!formData.password.trim()) {
      newErrors.password = "Mật khẩu không được để trống!";
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự!";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          rememberMe: checked
        })
      });

      const result = await response.json();

      if (!result.data.user.email_verified_at) {
        toast.info("Vui lòng xác thực email trước khi sử dụng!");
      }
      if (result.success) {
        const { token } = result.data;

        localStorage.setItem("token", token);

        toast.success("Đăng nhập thành công!");
        navigate("/");
      } else {
        toast.success(result.message || "Đăng nhập thất bại!");
      }
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại sau!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout childrenClasses="pt-0 pb-0">
      <div className="login-page-wrapper w-full py-10">
        <div className="container-x mx-auto">
          <div className="lg:flex items-center relative">
            <div className="lg:w-[572px] w-full lg:h-[500px] bg-white flex flex-col justify-center sm:p-10 p-5 border border-[#E0E0E0]">
              <div className="w-full">
                <div className="title-area flex flex-col justify-center items-center relative text-center mb-7">
                  <h1 className="text-[34px] font-bold leading-[74px] text-qblack">Đăng nhập</h1>
                  <div className="shape -mt-6">
                    <svg width="354" height="30" viewBox="0 0 354 30" fill="none"
                      xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 28.8027C17.6508 20.3626 63.9476 8.17089 113.509 17.8802C166.729 28.3062 341.329 42.704 353 1"
                        stroke="#FFBB38" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
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
                    placeholder="example@gmail.com"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border ${errors.email ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:border-indigo-500`}
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                {/* Mật khẩu */}
                <div className="mb-4">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Mật khẩu<span className="text-red-500">*</span>
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="● ● ● ● ● ●"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border ${errors.password ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:border-indigo-500`}
                  />
                  {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                </div>

                {/* Ghi nhớ mật khẩu + Quên mật khẩu */}
                <div className="forgot-password-area flex justify-between items-center mb-7">
                  <div className="remember-checkbox flex items-center space-x-2.5">
                    <button
                      onClick={rememberMe}
                      type="button"
                      className="w-5 h-5 text-qblack flex justify-center items-center border border-light-gray"
                    >
                      {checked && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </button>
                    <span
                      onClick={rememberMe}
                      className="text-base text-black"
                    >
                      Ghi nhớ tôi
                    </span>
                  </div>
                  <Link to="/forgot-password" className="text-base text-qyellow">
                    Quên mật khẩu
                  </Link>
                </div>

                {/* Nút đăng nhập */}
                <div className="signin-area mb-3.5">
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={loading}
                      className={`black-btn mb-6 text-sm text-white w-full h-[50px] font-semibold flex justify-center bg-purple items-center ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
                    >
                      <span>{loading ? "Đang xử lý..." : "Đăng nhập"}</span>
                    </button>
                  </div>
                </div>

                {/* Đăng ký mới */}
                <div className="signup-area flex justify-center mt-4">
                  <p className="text-base text-qgraytwo font-normal">
                    Chưa có tài khoản?
                    <Link to="/signup" className="ml-2 text-qblack">Đăng ký ngay</Link>
                  </p>
                </div>
              </div>
            </div>

            {/* Hình ảnh bên phải */}
            <div className="flex-1 lg:flex hidden transform scale-60 xl:scale-100   xl:justify-center">
              <div
                className="absolute xl:-right-20 -right-[138px]"
                style={{ top: "calc(50% - 258px)" }}
              >
                <Thumbnail />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}