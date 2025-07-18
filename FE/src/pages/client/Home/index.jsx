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
import Constants from "../../../Constants";

export default function HomeThree() {
  const { products } = datas;
  const brands = [];
  products.forEach((product) => {
    brands.push(product.brand);
  });
  const [productNew, setProductnew] = useState([]);
  const [productSold, setProductTopsold] = useState([]);
  const [productDiscounted, setProductTopDiscounted] = useState([]);
  const [topBrands, setTopBrands] = useState([]);

  const [loading, setLoading] = useState(true);

  // Tạo danh sách thương hiệu từ products

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [newRes, topSoldRes, topDiscounted, topBrandsRes] =
          await Promise.all([
            axios.get(`${Constants.DOMAIN_API}/products/getallnew`),
            axios.get(`${Constants.DOMAIN_API}/top-sold-products`),
            axios.get(`${Constants.DOMAIN_API}/top-discounted-products`),
            axios.get(`${Constants.DOMAIN_API}/brands/top`), // 👈 gọi thêm API brand
          ]);

        setProductnew(newRes.data.data || []);
        setProductTopsold(topSoldRes.data || []);
        setProductTopDiscounted(topDiscounted.data || []);
        setTopBrands(topBrandsRes.data.data || []); // 👈 nhớ tạo thêm state `topBrands`
        
      } catch (error) {
        console.error("Lỗi khi gọi API:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading)
    return <div className="p-10 text-center">Đang tải dữ liệu...</div>;

  return (
    <>
      <LayoutHomeThree type={3} childrenClasses="pt-0">
        <Banner className="banner-wrapper mb-[60px]" />
        <BrandSection
          type={3}
          sectionTitle="Shop by Brand"
          className="brand-section-wrapper mb-[60px]"
          brands={topBrands} // 👈 truyền data brand vào props
        />

        <SectionStyleThree
          type={3}
          products={productNew}
          sectionTitle="SẢN PHẨM MỚI "
          seeMoreUrl="/all-products"
          className="new-products mb-[60px]"
          startLength={0}
          endLength={productNew.length}
        />
        <ProductsAds
          ads={[
            `https://img.pikbest.com/origin/06/43/50/946pIkbEsTIUu.jpg!bwr800`,
          ]}
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

        {/* <ViewMoreTitle
          className="top-selling-product mb-[60px]"
          seeMoreUrl="/al  l-products"
          categoryTitle="Top Selling Products"
        >
          <SectionStyleTwo
            type={3}
            products={productNew.slice(3, productNew.length)}
          />
        </ViewMoreTitle> */}

        <ProductsAds
          ads={[
            `https://img.pikbest.com/origin/06/42/90/276pIkbEsTF5w.jpg!bwr800`,
            `https://img.pikbest.com/origin/06/39/82/38epIkbEsTCR7.jpg!bwr800`,
          ]}
          sectionHeight="sm:h-[295px] h-full"
          className="products-ads-section mb-[60px]"
        />
        <SectionStyleOneHmThree
          type={3}
          // categoryBackground={`${process.env.REACT_APP_PUBLIC_URL}/assets/images/section-category-2.jpg`}
          products={productDiscounted}
          brands={brands}
          categoryTitle="Electronics"
          sectionTitle="SẢN PHẨM GIẢM GIÁ"
          seeMoreUrl="/all-products"
          className="category-products mb-[60px]"
        />
        <CampaignCountDown
          className="mb-[60px]"
          lastDate="2025-10-04 4:00:00"
        />
        {/* <SectionStyleFour
          products={productSold} 
          sectionTitle="Popular Sales"
          seeMoreUrl="/all-products"
          className="category-products mb-[60px]"
        /> */}
      </LayoutHomeThree>
    </>
  );
}
