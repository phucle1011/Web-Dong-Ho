import datas from "../../../data/products.json";
import SectionStyleFour from "../Helpers/SectionStyleFour";
import SectionStyleThree from "../Helpers/SectionStyleThree";
import SectionStyleTwo from "../Helpers/SectionStyleTwo";
import ViewMoreTitle from "../Helpers/ViewMoreTitle";
import Banner from "./Banner";
import BrandSection from "./BrandSection";
import CampaignCountDown from "./CampaignCountDown";
import ProductsAds from "./ProductsAds";
import LayoutHomeThree from "../Partials/LayoutHomeThree";
import SectionStyleOneHmThree from "../Helpers/SectionStyleOneHmThree";
import axios from "axios";
import React, { useEffect, useState } from "react";

export default function HomeThree() {
  const { products } = datas;
  const brands = [];
  products.forEach((product) => {
    brands.push(product.brand);
  });
  const [productNew, setProductnew] = useState([]);
    const [productSold, setProductTopsold] = useState([]);
        const [productDiscounted, setProductTopDiscounted] = useState([]);


  const [loading, setLoading] = useState(true);

  // Tạo danh sách thương hiệu từ products

 useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    try {
      const [newRes, topSoldRes,topDiscounted] = await Promise.all([
        axios.get("http://localhost:5000/products/getallnew"),
        axios.get("http://localhost:5000/top-sold-products"),
         axios.get("http://localhost:5000/top-discounted-products"),

      ]);

      setProductnew(newRes.data.data || []);
      setProductTopsold(topSoldRes.data || []);
      setProductTopDiscounted(topDiscounted.data.data || [])

    } catch (error) {
      console.error("Lỗi khi gọi API:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);

  if (loading) return <div className="p-10 text-center">Đang tải dữ liệu...</div>;

  return (
    <>
      <LayoutHomeThree type={3} childrenClasses="pt-0">
        <Banner className="banner-wrapper mb-[60px]" />
        <BrandSection
          type={3}
          sectionTitle="Shop by Brand"
          className="brand-section-wrapper mb-[60px]"
        />
        <SectionStyleThree
          type={3}
          products={productNew}
          sectionTitle="SANR PHAAMR MỚI "
          seeMoreUrl="/all-products"
          className="new-products mb-[60px]"
          startLength={0}
         endLength={productNew.length}
        />
        <ProductsAds
          ads={[`${process.env.REACT_APP_PUBLIC_URL}/assets/images/bannera-3.png`]}
          className="products-ads-section mb-[60px]"
        />

        <SectionStyleOneHmThree
          type={3}
          products={productSold}
          brands={brands}
          categoryTitle="Mobile & Tablet"
          sectionTitle="SẢN PHẨM BÁN CHẠY"
          seeMoreUrl="/all-products"
          className="category-products mb-[60px]"
        />

        <ViewMoreTitle
          className="top-selling-product mb-[60px]"
          seeMoreUrl="/al  l-products"
          categoryTitle="Top Selling Products"
        >
          <SectionStyleTwo
            type={3}
            products={productNew.slice(3, productNew.length)}
          />
        </ViewMoreTitle>

        <ProductsAds
          ads={[
            `${process.env.REACT_APP_PUBLIC_URL}/assets/images/bannera-1.png`,
            `${process.env.REACT_APP_PUBLIC_URL}/assets/images/bannera-2.png`,
          ]}
          sectionHeight="sm:h-[295px] h-full"
          className="products-ads-section mb-[60px]"
        />
        <SectionStyleOneHmThree
          type={3}
          // categoryBackground={`${process.env.REACT_APP_PUBLIC_URL}/assets/images/section-category-2.jpg`}
          products={productSold.slice(4, productSold.length)}
          brands={brands}
          categoryTitle="Electronics"
          sectionTitle="SẢN PHẨM GIẢM GIÁ"
          seeMoreUrl="/all-productss"
          className="category-products mb-[60px]"
        />
        <CampaignCountDown
          className="mb-[60px]"
          lastDate="2025-10-04 4:00:00"
        />
        <SectionStyleFour
          products={productSold} 
          sectionTitle="Popular Sales"
          seeMoreUrl="/all-products"
          className="category-products mb-[60px]"
        />
      </LayoutHomeThree>
    </>
  );
}
