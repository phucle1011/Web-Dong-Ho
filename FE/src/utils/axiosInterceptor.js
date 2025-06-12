import axios from "axios";
import { toast } from "react-toastify";

const setupAxiosInterceptors = (navigate) => {
  axios.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error?.response?.status;
      const message = error?.response?.data?.message;

      if (status === 401 && message?.includes("jwt expired")) {
        localStorage.removeItem("token");
        toast.info("Phiên đăng nhập đã hết hạn.");
        navigate("/");
      }

      return Promise.reject(error);
    }
  );
};

export default setupAxiosInterceptors;