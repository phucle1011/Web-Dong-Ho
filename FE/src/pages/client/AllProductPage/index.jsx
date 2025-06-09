import { useState, useEffect } from "react";
import axios from "axios";
import Constants from "../../../Constants";
import BreadcrumbCom from "../BreadcrumbCom";
import ProductCardStyleOne from "../Helpers/Cards/ProductCardStyleOne";
import DataIteration from "../Helpers/DataIteration";
import Layout from "../Partials/LayoutHomeThree";
import ProductsFilter from "./ProductsFilter";

export default function AllProductPage() {
  const [products, setProducts] = useState([]);
  const [filters, setFilter] = useState({
    mobileLaptop: false,
    gaming: false,
    imageVideo: false,
    vehicles: false,
    furnitures: false,
    sport: false,
    foodDrinks: false,
    fashion: false,
    toilet: false,
    makeupCorner: false,
    babyItem: false,
    apple: false,
    samsung: false,
    walton: false,
    oneplus: false,
    vivo: false,
    oppo: false,
    xiomi: false,
    others: false,
    sizeS: false,
    sizeM: false,
    sizeL: false,
    sizeXL: false,
    sizeXXL: false,
    sizeFit: false,
  });

  const checkboxHandler = (e) => {
    const { name } = e.target;
    setFilter((prevState) => ({
      ...prevState,
      [name]: !prevState[name],
    }));
  };
  const [volume, setVolume] = useState({ min: 200, max: 50000000 }); // Điều chỉnh max để phù hợp với giá lớn
  const [storage, setStorage] = useState(null);
  const filterStorage = (value) => {
    setStorage(value);
  };
  const [filterToggle, setToggle] = useState(false);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await axios.get(`${Constants.DOMAIN_API}/products`);
        if (Array.isArray(res.data.data)) {
          setProducts(res.data.data);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách sản phẩm:", error);
        setProducts([]);
      }
    }
    fetchProducts();
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesCategory = Object.keys(filters).some(
      (key) => filters[key] && product.category?.name.toLowerCase().includes(key)
    );
    const matchesPrice =
      product.variants?.[0]?.price
        ? parseFloat(product.variants[0].price) >= volume.min &&
          parseFloat(product.variants[0].price) <= volume.max
        : true; // Nếu không có giá, vẫn hiển thị
    const matchesStorage = storage
      ? product.variants.some((v) =>
          v.attributeValues.some((attr) => attr.value === storage)
        )
      : true;
    const matchesBrand = Object.keys(filters).some(
      (key) => filters[key] && product.brand?.name.toLowerCase().includes(key)
    );
    return (
      (matchesCategory || matchesBrand || !Object.values(filters).some((v) => v)) &&
      matchesPrice &&
      matchesStorage
    );
  });

  return (
    <Layout>
      <div className="products-page-wrapper w-full py-10">
        <div className="container-x mx-auto max-w-7xl">
          <BreadcrumbCom />
          <div className="w-full lg:flex lg:gap-8">
            <div className="lg:w-[270px] mb-8 lg:mb-0">
              <ProductsFilter
                filterToggle={filterToggle}
                filterToggleHandler={() => setToggle(!filterToggle)}
                filters={filters}
                checkboxHandler={checkboxHandler}
                volume={volume}
                volumeHandler={(value) => setVolume(value)}
                storage={storage}
                filterstorage={filterStorage}
                className="mb-8"
              />
              <div className="w-full hidden lg:block h-[295px] overflow-hidden rounded-lg">
                <img
                  src={`${process.env.REACT_APP_PUBLIC_URL}/assets/images/bannera-5.png`}
                  alt="Banner"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="flex-1">
              <div className="products-sorting w-full bg-white h-auto md:h-[70px] flex flex-col md:flex-row md:items-center justify-between p-6 mb-10 rounded-lg shadow-sm">
                <div>
                  <p className="font-medium text-sm text-gray-600">
                    <span>Showing</span> 1–{filteredProducts.length} of {products.length} results
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-medium text-sm text-gray-600">Sort by:</span>
                  <div className="flex items-center gap-2 border-b border-gray-300">
                    <span className="font-medium text-sm text-gray-600">Default</span>
                    <svg
                      width="10"
                      height="6"
                      viewBox="0 0 10 6"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M1 1L5 5L9 1" stroke="#9A9A9A" />
                    </svg>
                  </div>
                </div>
                <button
                  onClick={() => setToggle(!filterToggle)}
                  type="button"
                  className="w-10 h-10 rounded flex justify-center items-center border border-yellow-500 text-yellow-500 lg:hidden"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                    />
                  </svg>
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                <DataIteration datas={filteredProducts} startLength={0} endLength={filteredProducts.length}>
                  {({ datas }) => (
                    <div data-aos="fade-up" key={datas.id}>
                      <ProductCardStyleOne datas={datas} type={3} />
                    </div>
                  )}
                </DataIteration>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}