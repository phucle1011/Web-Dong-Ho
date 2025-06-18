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
  const [pagination, setPagination] = useState({
    currentPage: 1,
    limit: 12, // 12 sản phẩm mỗi trang
    totalProducts: 0,
  });
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Checkbox handler
  const checkboxHandler = (e) => {
    const { name } = e.target;
    setFilter((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
    setPagination((prev) => ({ ...prev, currentPage: 1 })); // Reset về trang 1 khi thay đổi bộ lọc
  };

  // Volume handler
  const volumeHandler = (newVolume) => {
    setVolume(newVolume);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  // Storage handler
  const storageHandler = (newStorage) => {
    setStorage(newStorage);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  // Fetch products
  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        // Chuẩn bị tham số API
        const selectedFilters = Object.keys(filters).filter(
          (key) => filters[key]
        );
        const categoryFilters = selectedFilters.filter((key) =>
          [
            "mobileLaptop",
            "gaming",
            "imageVideo",
            "vehicles",
            "furnitures",
            "sport",
            "foodDrinks",
            "fashion",
            "toilet",
            "makeupCorner",
            "babyItem",
          ].includes(key)
        );
        const brandFilters = selectedFilters.filter((key) =>
          [
            "apple",
            "samsung",
            "walton",
            "oneplus",
            "vivo",
            "oppo",
            "xiomi",
            "others",
          ].includes(key)
        );
        const sizeFilters = selectedFilters.filter((key) =>
          ["sizeS", "sizeM", "sizeL", "sizeXL", "sizeXXL", "sizeFit"].includes(
            key
          )
        );

        const params = {
          page: pagination.currentPage,
          limit: pagination.limit,
          min_price: volume.min,
          max_price: volume.max,
        };

        if (categoryFilters.length > 0) {
          params.category_id = categoryFilters.join(",");
        }
        if (brandFilters.length > 0) {
          params.brand_id = brandFilters.join(",");
        }
        if (sizeFilters.length > 0) {
          params.size = sizeFilters
            .map((size) => size.replace("size", "").toLowerCase())
            .join(",");
        }
        if (storage) {
          params.storage = storage;
        }

        const res = await axios.get(`${Constants.DOMAIN_API}/products`, {
          params,
        });
        const { data, pagination: paginationData } = res.data;
        setProducts(Array.isArray(data) ? data : []);
        setPagination((prev) => ({
          ...prev,
          totalProducts: paginationData.totalProducts,
        }));
        setError(null);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách sản phẩm:", error);
        setProducts([]);
        setError("Không thể tải danh sách sản phẩm");
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [
    pagination.currentPage,
    pagination.limit,
    filters,
    volume,
    storage,
  ]);

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1) {
      setPagination((prev) => ({ ...prev, currentPage: newPage }));
    }
  };

  // Render pagination
  const renderPagination = () => {
    const { currentPage, limit } = pagination;
    const showNextPage = products.length === limit; // Chỉ hiển thị "Trang tiếp theo" nếu trang hiện tại có đủ 12 sản phẩm

    return (
      <div className="flex justify-center items-center mt-8">
        {currentPage > 1 && (
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            className="px-4 py-2 mx-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Trước
          </button>
        )}
        <span className="px-4 py-2 mx-1 bg-blue-600 text-white rounded-md">
          {currentPage}
        </span>
        {showNextPage && (
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            className="px-4 py-2 mx-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Sau
          </button>
        )}
      </div>
    );
  };

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
                volumeHandler={volumeHandler}
                storage={storage}
                filterstorage={storageHandler}
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
                    Hiển thị{" "}
                    {products.length > 0
                      ? `${(pagination.currentPage - 1) * pagination.limit + 1}–${Math.min(
                          pagination.currentPage * pagination.limit,
                          pagination.totalProducts
                        )}`
                      : "0"}{" "}
                    và {pagination.totalProducts} kết quả
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-medium text-sm text-gray-600">
                   Sắp xếp theo:
                  </span>
                  <div className="flex items-center gap-2 border-b border-gray-300">
                    <span className="font-medium text-sm text-gray-600">
                     Mặc định
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
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293.707L3.293 7.293A1 1 0 013 6.586V4z"
                    />
                  </svg>
                </button>
              </div>

              {loading && <p className="text-center">Đang tải...</p>}
              {error && <p className="text-center text-red-500">{error}</p>}
              {!loading && products.length === 0 && !error && (
                <p className="text-center">Không có sản phẩm nào để hiển thị.</p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                {products.length > 0 && (
                  <DataIteration
                    datas={products}
                    startLength={0}
                    endLength={products.length}
                  >
                    {({ datas }) => (
                      <div data-aos="fade-up" key={datas.id}>
                        <ProductCardStyleOne datas={datas} type={3} />
                      </div>
                    )}
                  </DataIteration>
                )}
              </div>
              {(products.length > 0 || pagination.currentPage > 1) && renderPagination()}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}