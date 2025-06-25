import RangeSlider from "react-range-slider-input";
import Checkbox from "../Helpers/Checkbox";
import { useEffect, useState } from "react";
import axios from "axios";
import Constants from "../../../Constants";

export default function ProductsFilter({
  initialFilters = {},
  volume,
  volumeHandler,
  storage,
  filterstorage,
  className,
  filterToggle,
  filterToggleHandler,
}) {
  const [filters, setFilters] = useState(initialFilters);
  const [categoryList, setCategoryList] = useState([]);
  const [brandList, setBrandList] = useState([]);
  const [brandPagination, setBrandPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    limit: 5, // Hiển thị 5 thương hiệu mỗi trang
  });

  const checkboxHandler = (e) => {
    const { name, checked } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await axios.get(`${Constants.DOMAIN_API}/category/list`);
        if (Array.isArray(res.data.data)) {
          setCategoryList(res.data.data);
        } else {
          setCategoryList([]);
        }
      } catch {
        setCategoryList([]);
      }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    async function fetchBrands() {
      try {
        const res = await axios.get(`${Constants.DOMAIN_API}/brands/active`, {
          params: { page: brandPagination.currentPage, limit: brandPagination.limit },
        });
        if (Array.isArray(res.data.data)) {
          setBrandList(res.data.data);
          setBrandPagination((prev) => ({
            ...prev,
            totalPages: res.data.totalPages || 1,
            currentPage: res.data.currentPage || 1,
          }));
        } else {
          setBrandList([]);
          setBrandPagination((prev) => ({ ...prev, totalPages: 1 }));
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách thương hiệu:", error);
        setBrandList([]);
        setBrandPagination((prev) => ({ ...prev, totalPages: 1 }));
      }
    }
    fetchBrands();
  }, [brandPagination.currentPage, brandPagination.limit]);

  const handleBrandPageChange = (newPage) => {
    if (newPage >= 1 && newPage <= brandPagination.totalPages) {
      setBrandPagination((prev) => ({ ...prev, currentPage: newPage }));
    }
  };

  return (
    <>
      <div
        className={`filter-widget w-full fixed lg:relative left-0 top-0 h-screen z-10 lg:h-auto overflow-y-scroll lg:overflow-y-auto bg-white px-[30px] pt-[40px] ${className || ""} ${filterToggle ? "block" : "hidden lg:block"}`}
      >
        {/* danh mục */}
        <div className="filter-subject-item pb-10 border-b border-qgray-border">
          <div className="subject-title mb-[30px]">
            <h1 className="text-black text-base font-500">
              Product categories
            </h1>
          </div>
          <div className="filter-items">
            <ul>
              {categoryList.map((cat) => (
                <li key={cat.id} className="item flex justify-between items-center mb-5">
                  <div className="flex space-x-[14px] items-center">
                    <div>
                      <Checkbox
                        id={cat.id}
                        name={cat.id}
                        handleChange={(e) => checkboxHandler(e)}
                        checked={!!filters[cat.id]}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor={cat.id}
                        className="text-xs font-black font-400 capitalize"
                      >
                        {cat.name}
                      </label>
                    </div>
                  </div>
                  <div>
                    <span className="cursor-pointer">
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 10 10"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <rect y="4" width="10" height="2" fill="#C4C4C4" />
                        <rect
                          x="6"
                          width="10"
                          height="2"
                          transform="rotate(90 6 0)"
                          fill="#C4C4C4"
                        />
                      </svg>
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="filter-subject-item pb-10 border-b border-qgray-border mt-10">
          <div className="subject-title mb-[30px]">
            <h1 className="text-black text-base font-500">Price Range</h1>
          </div>
          <div className="price-range mb-5">
            <RangeSlider
              value={volume}
              onInput={volumeHandler}
              min={10}
              max={1000}
            />
          </div>
          <p className="text-xs text-qblack font-400">
            Price: ${volume.min} - ${volume.max}
          </p>
        </div>
        <div className="filter-subject-item pb-10 border-b border-qgray-border mt-10">
          <div className="subject-title mb-[30px]">
            <h1 className="text-black text-base font-500">Thương hiệu</h1>
          </div>
          <div className="filter-items">
            <ul>
              {brandList.map((brand) => (
                <li key={brand.id} className="item flex justify-between items-center mb-5">
                  <div className="flex space-x-[14px] items-center">
                    <div>
                      <Checkbox
                        id={brand.id}
                        name={brand.id.toString()}
                        handleChange={(e) => checkboxHandler(e)}
                        checked={!!filters[brand.id.toString()]}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor={brand.id}
                        className="text-xs font-black font-400 capitalize"
                      >
                        {brand.name}
                      </label>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            {brandPagination.totalPages > 1 && (
              <div className="flex justify-center items-center mt-2">
                {brandPagination.currentPage > 1 && (
                  <button
                    onClick={() => handleBrandPageChange(brandPagination.currentPage - 1)}
                    className="px-2 py-1 mx-0.5 bg-gray-300 text-gray-600 text-xs rounded hover:bg-gray-400"
                  >
                    Trước
                  </button>
                )}
                <span className="px-2 py-1 mx-0.5 bg-gray-300 text-gray-600 text-xs rounded">
                  {brandPagination.currentPage} / {brandPagination.totalPages}
                </span>
                {brandPagination.currentPage < brandPagination.totalPages && (
                  <button
                    onClick={() => handleBrandPageChange(brandPagination.currentPage + 1)}
                    className="px-2 py-1 mx-0.5 bg-gray-300 text-gray-600 text-xs rounded hover:bg-gray-400"
                  >
                    Sau
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="filter-subject-item pb-10 border-b border-qgray-border mt-10">
          <div className="subject-title mb-[30px]">
            <h1 className="text-black text-base font-500">Storage</h1>
          </div>
          <div className="filter-items">
            <div className="flex space-x-[5px] flex-wrap">
              <span
                onClick={() => filterstorage("64GB")}
                className={` font-400 border border-qgray-border text-xs px-[14px] py-[6px] cursor-pointer mb-[5px] ${storage === "64GB"
                  ? "bg-qyellow text-qblack border-none"
                  : " text-qgray "
                  }`}
              >
                64GB
              </span>
              <span
                onClick={() => filterstorage("128GB")}
                className={` font-400 border border-qgray-border text-xs px-[14px] py-[6px] cursor-pointer mb-[5px] ${storage === "128GB"
                  ? "bg-qyellow text-qblack border-none"
                  : " text-qgray "
                  }`}
              >
                128GB
              </span>
              <span
                onClick={() => filterstorage("256GB")}
                className={` font-400 border border-qgray-border text-xs px-[14px] py-[6px] cursor-pointer mb-[5px] ${storage === "256GB"
                  ? "bg-qyellow text-qblack border-none"
                  : " text-qgray "
                  }`}
              >
                256GB
              </span>
              <span
                onClick={() => filterstorage("512GB")}
                className={` font-400 border border-qgray-border text-xs px-[14px] py-[6px] cursor-pointer mb-[5px] ${storage === "512GB"
                  ? "bg-qyellow text-qblack border-none"
                  : " text-qgray "
                  }`}
              >
                512GB
              </span>
              <span
                onClick={() => filterstorage("1024GB")}
                className={` font-400 border border-qgray-border text-xs px-[14px] py-[6px] cursor-pointer mb-[5px] ${storage === "1024GB"
                  ? "bg-qyellow text-qblack border-none"
                  : " text-qgray "
                  }`}
              >
                1024GB
              </span>
            </div>
          </div>
        </div>
        <div className="filter-subject-item pb-10 mt-10">
          <div className="subject-title mb-[30px]">
            <h1 className="text-black text-base font-500">Sizes</h1>
          </div>
          <div className="filter-items">
            <ul>
              <li className="item flex justify-between items-center mb-5">
                <div className="flex space-x-[14px] items-center">
                  <div>
                    <Checkbox
                      id="sizeS"
                      name="sizeS"
                      handleChange={(e) => checkboxHandler(e)}
                      checked={filters.sizeS}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="sizeS"
                      className="text-xs font-black font-400 capitalize"
                    >
                      s
                    </label>
                  </div>
                </div>
              </li>
              <li className="item flex justify-between items-center mb-5">
                <div className="flex space-x-[14px] items-center">
                  <div>
                    <Checkbox
                      id="sizeM"
                      name="sizeM"
                      handleChange={(e) => checkboxHandler(e)}
                      checked={filters.sizeM}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="sizeM"
                      className="text-xs font-black font-400 capitalize"
                    >
                      M
                    </label>
                  </div>
                </div>
              </li>
              <li className="item flex justify-between items-center mb-5">
                <div className="flex space-x-[14px] items-center">
                  <div>
                    <Checkbox
                      id="sizeXL"
                      name="sizeXL"
                      handleChange={(e) => checkboxHandler(e)}
                      checked={filters.sizeXL}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="sizeXL"
                      className="text-xs font-black font-400 capitalize"
                    >
                      XL
                    </label>
                  </div>
                </div>
              </li>
              <li className="item flex justify-between items-center mb-5">
                <div className="flex space-x-[14px] items-center">
                  <div>
                    <Checkbox
                      id="sizeXXL"
                      name="sizeXXL"
                      handleChange={(e) => checkboxHandler(e)}
                      checked={filters.sizeXXL}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="sizeXXL"
                      className="text-xs font-black font-400 capitalize"
                    >
                      XXL
                    </label>
                  </div>
                </div>
              </li>
              <li className="item flex justify-between items-center mb-5">
                <div className="flex space-x-[14px] items-center">
                  <div>
                    <Checkbox
                      id="sizeFit"
                      name="sizeFit"
                      handleChange={(e) => checkboxHandler(e)}
                      checked={filters.sizeFit}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="sizeFit"
                      className="text-xs font-black font-400 capitalize"
                    >
                      Sliem Fit
                    </label>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
        <button
          onClick={filterToggleHandler}
          type="button"
          className="w-10 h-10 fixed top-5 right-5 z-50 rounded  lg:hidden flex justify-center items-center border border-qred text-qred"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </>
  );
}