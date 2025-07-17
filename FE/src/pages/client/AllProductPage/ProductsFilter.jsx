import Checkbox from '../Helpers/Checkbox';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Constants from '../../../Constants';
import { useLocation } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight, FaAngleDoubleLeft, FaAngleDoubleRight } from 'react-icons/fa';

export default function ProductsFilter({
  initialFilters = {},
  volume,
  volumeHandler,
  className,
  filterToggle,
  filterToggleHandler,
  onApplyFilters = () => { },
}) {
  const location = useLocation();
  const categoryIdFromNav = location.state?.categoryId;
  const [filters, setFilters] = useState(initialFilters);
  const [tempVolume, setTempVolume] = useState(volume || [0, 1000000000]);

  const [categoryList, setCategoryList] = useState([]);
  const [categoryPagination, setCategoryPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    limit: 5,
  });

  const [brandList, setBrandList] = useState([]);
  const [brandPagination, setBrandPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    limit: 5,
  });

  const formatVND = (vnd) =>
    vnd.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

  const priceRanges = [
    { label: 'Dưới 5 triệu', min: 0, max: 5000000 },
    { label: '5 - 10 triệu', min: 5000000, max: 10000000 },
    { label: '10 - 20 triệu', min: 10000000, max: 20000000 },
    { label: '20 - 30 triệu', min: 20000000, max: 30000000 },
    { label: 'Trên 30 triệu', min: 30000000, max: 1000000000 },
  ];

  useEffect(() => {
    if (categoryIdFromNav) {
      setFilters((prev) => ({
        ...prev,
        [categoryIdFromNav]: true,
      }));
    }
  }, [categoryIdFromNav]);

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
        const res = await axios.get(`${Constants.DOMAIN_API}/category/list`, {
          params: {
            page: categoryPagination.currentPage,
            limit: categoryPagination.limit,
          },
        });
        if (Array.isArray(res.data.data)) {
          setCategoryList(res.data.data);
          setCategoryPagination((prev) => ({
            ...prev,
            totalPages: res.data.pagination?.totalPages || 1,
            currentPage: res.data.pagination?.currentPage || 1,
          }));
        } else {
          setCategoryList([]);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategoryList([]);
      }
    }
    fetchCategories();
  }, [categoryPagination.currentPage, categoryPagination.limit]);

  useEffect(() => {
    async function fetchBrands() {
      try {
        const res = await axios.get(`${Constants.DOMAIN_API}/brand/list`, {
          params: { page: brandPagination.currentPage, limit: brandPagination.limit },
        });

        if (Array.isArray(res.data.data)) {
          setBrandList(res.data.data);
          setBrandPagination((prev) => ({
            ...prev,
            totalPages: res.data.pagination?.totalPages || 1,
            currentPage: res.data.pagination?.currentPage || 1,
          }));
        } else {
          setBrandList([]);
        }
      } catch (error) {
        console.error('Error fetching brands:', error);
        setBrandList([]);
      }
    }

    fetchBrands();
  }, [brandPagination.currentPage, brandPagination.limit]);

  useEffect(() => {
    async function fetchPriceRange() {
      try {
        const res = await axios.get(`${Constants.DOMAIN_API}/products/price-range`);
        const minPrice = parseFloat(res.data.data.minPrice) || 0;
        const maxPrice = parseFloat(res.data.data.maxPrice) || 1000000000;
        setTempVolume([minPrice, maxPrice]);
      } catch (error) {
        console.error('Error fetching price range:', error);
        setTempVolume([0, 1000000000]);
      }
    }
    fetchPriceRange();
  }, []);

  const handlePriceRangeSelect = (min, max) => {
    setTempVolume([min, max]);
  };

  const handleApply = () => {
    volumeHandler(tempVolume);
    onApplyFilters({ filters, volume: tempVolume });
  };

  useEffect(() => {
    onApplyFilters({ filters, volume: tempVolume });
  }, [filters]);

  const handleClearFilters = () => {
    setFilters({});
    setTempVolume([0, 1000000000]);
    volumeHandler([0, 1000000000]);
    onApplyFilters({ filters: {}, volume: [0, 1000000000] });
  };

  const handleBrandPageChange = (newPage) => {
    if (newPage >= 1 && newPage <= brandPagination.totalPages) {
      setBrandPagination((prev) => ({ ...prev, currentPage: newPage }));
    }
  };

  const handleCategoryPageChange = (newPage) => {
    if (newPage >= 1 && newPage <= categoryPagination.totalPages) {
      setCategoryPagination((prev) => ({ ...prev, currentPage: newPage }));
    }
  };

  return (
    <div
      className={`filter-widget w-full fixed lg:relative left-0 top-0 h-screen z-10 lg:h-auto overflow-y-scroll lg:overflow-y-auto bg-white px-[30px] pt-[40px] ${className || ''} ${filterToggle ? 'block' : 'hidden lg:block'}`}
    >
      <div className="filter-subject-item pb-10 border-b border-qgray-border">
        <div className="subject-title mb-[30px]">
          <h1 className="text-black text-base font-500">Danh mục sản phẩm</h1>
        </div>
        <div className="filter-items">
          <ul>
            {categoryList.map((cat) => (
              <li key={cat.id} className="item flex justify-between items-center mb-5">
                <div className="flex space-x-[14px] items-center">
                  <Checkbox
                    id={cat.id}
                    name={cat.id.toString()}
                    handleChange={checkboxHandler}
                    checked={!!filters[cat.id]}
                  />
                  <label htmlFor={cat.id} className="text-xs font-black font-400 capitalize">
                    {cat.name}
                  </label>
                </div>
              </li>
            ))}
          </ul>

          {categoryPagination.totalPages > 1 && (
            <div className="flex justify-center mt-4 space-x-2">
              <button
                onClick={() => handleCategoryPageChange(categoryPagination.currentPage - 1)}
                disabled={categoryPagination.currentPage === 1}
                className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-full text-gray-500 hover:bg-gray-100 disabled:opacity-40"
                title="Trang trước"
              >
                <FaChevronLeft size={12} />
              </button>

              <button
                onClick={() => handleCategoryPageChange(categoryPagination.currentPage + 1)}
                disabled={categoryPagination.currentPage === categoryPagination.totalPages}
                className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-full text-gray-500 hover:bg-gray-100 disabled:opacity-40"
                title="Trang sau"
              >
                <FaChevronRight size={12} />
              </button>
            </div>
          )}

        </div>
      </div>

      <div className="filter-subject-item pb-10 border-b border-qgray-border mt-10">
        <div className="subject-title mb-[30px]">
          <h1 className="text-black text-base font-500">Khoảng giá</h1>
        </div>
        <div className="filter-items">
          <ul>
            {priceRanges.map((range, index) => (
              <li key={index} className="item flex justify-between items-center mb-5">
                <div className="flex space-x-[14px] items-center">
                  <input
                    type="radio"
                    id={`priceRange${index}`}
                    name="priceRange"
                    checked={tempVolume[0] === range.min && tempVolume[1] === range.max}
                    onChange={() => handlePriceRangeSelect(range.min, range.max)}
                  />
                  <label htmlFor={`priceRange${index}`} className="text-xs font-black font-400 capitalize">
                    {range.label}
                  </label>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-qblack font-400">
          Giá: {formatVND(tempVolume[0])} - {formatVND(tempVolume[1])}
        </p>
      </div>

      <div className="filter-subject-item pb-10 border-b border-qgray-border mt-10">
        <div className="subject-title mb-[30px]">
          <h1 className="text-black text-base font-500">Thương hiệu</h1>
        </div>
        <div className="filter-items">
          <ul>
            {brandList.length > 0 ? (
              brandList.map((brand) => (
                <li key={brand.id} className="item flex justify-between items-center mb-5">
                  <div className="flex space-x-[14px] items-center">
                    <Checkbox
                      id={brand.id}
                      name={brand.id.toString()}
                      handleChange={checkboxHandler}
                      checked={!!filters[brand.id.toString()]}
                    />
                    <label htmlFor={brand.id} className="text-xs font-black font-400 capitalize">
                      {brand.name}
                    </label>
                  </div>
                </li>
              ))
            ) : (
              <li className="text-xs text-qblack font-400">Không có thương hiệu nào</li>
            )}
          </ul>
          {brandPagination.totalPages > 1 && (
            <div className="flex justify-center mt-4 space-x-2">
              <button
                onClick={() => handleBrandPageChange(brandPagination.currentPage - 1)}
                disabled={brandPagination.currentPage === 1}
                className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-full text-gray-500 hover:bg-gray-100 disabled:opacity-40"
                title="Trang trước"
              >
                <FaChevronLeft size={12} />
              </button>

              <button
                onClick={() => handleBrandPageChange(brandPagination.currentPage + 1)}
                disabled={brandPagination.currentPage === brandPagination.totalPages}
                className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-full text-gray-500 hover:bg-gray-100 disabled:opacity-40"
                title="Trang sau"
              >
                <FaChevronRight size={12} />
              </button>
            </div>
          )}

        </div>
      </div>

      <div className="mt-10">
        <button onClick={handleApply} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-500">
          Áp dụng
        </button>
        <button onClick={handleClearFilters} className="w-full bg-gray-300 text-qblack py-2 rounded hover:bg-gray-400 mt-5">
          Xóa bộ lọc
        </button>
      </div>

      <button
        onClick={filterToggleHandler}
        type="button"
        className="w-10 h-10 fixed top-5 right-5 z-50 rounded lg:hidden flex justify-center items-center border border-qred text-qred"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
}
