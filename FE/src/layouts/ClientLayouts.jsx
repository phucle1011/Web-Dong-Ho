import { Outlet, useLocation } from "react-router-dom";
import React, { useEffect } from "react";
import Header from "../components/client/Header";
import Footer from "../components/client/Footer";
import "../styles/client/css/index.css";
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'intersection-observer';
import { useState } from "react";
import { HashLoader } from "react-spinners";

import {
  initCommentSlider,
  initSwiper,
  initPageVisibility,
  initMenu,
  initBusAnimation
} from "../styles/client/js/main.js";


const ClientLayout = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const loaderContainerStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    backgroundColor: "#f0f4f8",
  };

    useEffect(() => {
      if (!loading) {
        const menuCleanup = initMenu();
        initCommentSlider();
        initSwiper();
        initPageVisibility();
        initBusAnimation();
        return () => {
          menuCleanup?.();
        };
      }
    }, [location.pathname, loading]);
    
    useEffect(() => {
      const timeout = setTimeout(() => {
        setLoading(false);
      }, 300);
    
      return () => clearTimeout(timeout);
    }, []);
    
  return (
    <>
      {loading ? (
        <div style={loaderContainerStyle}>
          <HashLoader
            color="#0F3079"
            loading={loading}
            size={80}
          />
        </div>
      ) : (
        <div
          className="page-wrapper"
          id="main-wrapper"
          data-layout="vertical"
          data-navbarbg="skin6"
          data-sidebartype="full"
          data-sidebar-position="fixed"
          data-header-position="fixed"
        >
          <Header />
          <Outlet />
          <Footer />
        </div>
      )}
    </>
  );
};

export default ClientLayout;