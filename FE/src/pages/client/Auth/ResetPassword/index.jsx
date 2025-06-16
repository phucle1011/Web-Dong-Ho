import React, { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import Layout from "../../Partials/LayoutHomeThree";
import { toast } from "react-toastify";
import axios from "axios";
import Thumbnail from "./Thumbnail";



export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Mật khẩu không khớp!");
      return;
    }
    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự!");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `http://localhost:5000/auth/update-password/${token}`,
        { password }
      );
      if (response.data.success) {
        toast.success("Mật khẩu đã được cập nhật!");
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (error) {
      setError(
        error.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại!"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="login-page-wrapper w-full py-10">
        <div className="container-x mx-auto">
          <div className="lg:flex items-center relative">
            <div className="lg:w-[572px] w-full lg:h-[500px] bg-white flex flex-col justify-center sm:p-10 p-5 border border-[#E0E0E0]">
              <div className="w-full">
                <div className="title-area flex flex-col justify-center items-center relative text-center mb-7">
                  <h1 className="text-[34px] font-bold leading-[74px] text-qblack">
                    Đặt lại mật khẩu
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

                {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

                <form onSubmit={handleSubmit}>
                  {/* Mật khẩu mới */}
                  <div className="mb-4">
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Mật khẩu mới<span className="text-red-500">*</span>
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Xác nhận mật khẩu */}
                  <div className="mb-4">
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Xác nhận mật khẩu<span className="text-red-500">*</span>
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Nút cập nhật mật khẩu */}
                  <div className="signin-area mb-3.5">
                    <div className="flex justify-center">
                      <button
                        type="submit"
                        disabled={loading}
                        className={`black-btn mb-6 text-sm text-white w-full h-[50px] font-semibold flex justify-center bg-purple items-center ${
                          loading ? "opacity-70 cursor-not-allowed" : ""
                        }`}
                      >
                        <span>{loading ? "Đang xử lý..." : "Cập nhật mật khẩu"}</span>
                      </button>
                    </div>
                  </div>
                </form>

                {/* Quay lại đăng nhập */}
                <div className="signup-area flex justify-center mt-4">
                  <p className="text-base text-qgraytwo font-normal">
                    Quay lại{" "}
                    <Link to="/login" className="ml-2 text-qblack">
                      Đăng nhập
                    </Link>
                  </p>
                </div>
              </div>
            </div>

            {/* Hình ảnh bên phải */}
            <div className="flex-1 lg:flex hidden transform scale-60 xl:scale-100 xl:justify-center">
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