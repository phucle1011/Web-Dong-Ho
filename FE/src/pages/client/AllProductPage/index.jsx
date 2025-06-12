import { useState, useEffect } from "react";
import axios from "axios";
import Constants from "../../../Constants";
import BreadcrumbCom from "../BreadcrumbCom";
import ProductCardStyleOne from "../Helpers/Cards/ProductCardStyleOne";
import DataIteration from "../Helpers/DataIteration";
import Layout from "../Partials/LayoutHomeThree";
import ProductsFilter from "./ProductsFilter";

export default function AllProductPage() {
  // State declarations
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
  const [volume, setVolume] = useState({ min: 200, max: 50000000 });
  const [storage, setStorage] = useState(null);
  const [filterToggle, setToggle] = useState(false);

  // Checkbox handler
  const checkboxHandler = (e) => {
    const { name } = e.target;
    setFilter((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  // Fetch products
  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await axios.get(`${Constants.DOMAIN_API}/products`);
        console.log("API Response:", res.data);
        setProducts(Array.isArray(res.data.data) ? res.data.data : []);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách sản phẩm:", error);
        setProducts([]);
      }
    }
    fetchProducts();
  }, []);

  // Define filteredProducts after all dependencies are declared
  const filteredProducts = products.filter((product) => {
    const selectedFilters = Object.keys(filters).filter((key) => filters[key]);

    const matchesCategory = selectedFilters.some((key) =>
      product.category?.name?.toLowerCase()?.includes(key.toLowerCase())
    );

    const matchesBrand = selectedFilters.some((key) =>
      product.brand?.name?.toLowerCase()?.includes(key.toLowerCase())
    );

    const matchesPrice = product.variants?.length
      ? product.variants.some((variant) => {
          const price = variant.promotion?.discounted_price
            ? parseFloat(variant.promotion.discounted_price)
            : parseFloat(variant.price) || 0;
          return (
            price >= volume.min &&
            price <= volume.max &&
            parseInt(variant.stock || 0) > 0
          );
        })
      : true;

    const matchesStorage = storage
      ? product.variants?.some((v) =>
          v.attributeValues?.some((attr) => attr.value === storage)
        )
      : true;

    const noFilterSelected = selectedFilters.length === 0;

    return (
      (matchesCategory || matchesBrand || noFilterSelected) &&
      matchesPrice &&
      matchesStorage
    );
  });

  console.log("Filtered Products:", filteredProducts);

  return (
    <Layout>
      <div className="products-page-wrapper w-full py-10">
        <div className="container-x mx-auto max-w-7xl">
          <BreadcrumbCom />
          <div className="w-full lg:flex lg:gap-8">
            {/* Filter */}
            <div className="lg:w-[270px] mb-8 lg:mb-0">
              <ProductsFilter
                filterToggle={filterToggle}
                filterToggleHandler={() => setToggle(!filterToggle)}
                filters={filters}
                checkboxHandler={checkboxHandler}
                volume={volume}
                volumeHandler={setVolume}
                storage={storage}
                filterstorage={setStorage}
              />
              <div className="w-full hidden lg:block h-[295px] overflow-hidden rounded-lg">
                <img
                  src={`${process.env.REACT_APP_PUBLIC_URL}/assets/images/bannera-5.png`}
                  alt="Banner"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Product List */}
            <div className="flex-1">
              <div className="products-sorting w-full bg-white h-auto md:h-[70px] flex flex-col md:flex-row md:items-center justify-between p-6 mb-10 rounded-lg shadow-sm">
                <div>
                  <p className="font-medium text-sm text-gray-600">
                    Showing 1–{filteredProducts.length} of {products.length}{" "}
                    results
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-medium text-sm text-gray-600">
                    Sort by:
                  </span>
                  <div className="flex items-center gap-2 border-b border-gray-300">
                    <span className="font-medium text-sm text-gray-600">
                      Default
                    </span>
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
                {filteredProducts.length > 0 ? (
                  <DataIteration
                    datas={filteredProducts}
                    startLength={0}
                    endLength={filteredProducts.length}
                  >
                    {({ datas }) => (
                      <div data-aos="fade-up" key={datas.id}>
                        <ProductCardStyleOne datas={datas} type={3} />
                      </div>
                    )}
                  </DataIteration>
                ) : (
                  <p>Không có sản phẩm nào để hiển thị.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}