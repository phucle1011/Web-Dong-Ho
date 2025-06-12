import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import "./index.css";
import "react-range-slider-input/dist/style.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import App from "./App";
import { registerSW } from "virtual:pwa-register";
import setupAxiosInterceptors from "./utils/axiosInterceptor";
import AuthProvider from "./components/Auth/AuthContext";

function AppWrapper() {
  const navigate = useNavigate();

  React.useEffect(() => {
    setupAxiosInterceptors(navigate);
  }, [navigate]);

  return <App />;
}

if (import.meta.env.MODE === "production") {
  registerSW();
}

AOS.init();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AppWrapper />
        <ToastContainer />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
