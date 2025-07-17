import { useState, useEffect } from "react";
import axios from "axios";
import Constants from "../../../../Constants";

export default function SearchBox({ className, type, onSearch }) {
  const [keyword, setKeyword] = useState("");
  const [brands, setBrands] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [isBrandDropdownOpen, setIsBrandDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await axios.get(`${Constants.DOMAIN_API}/brands/active`, {
          params: { page: 1, limit: 100 },
        });
        if (response.data.status === 200) {
          setBrands(response.data.data);
        }
      } catch (error) {
        console.error('SearchBox - Lỗi khi lấy danh sách thương hiệu:', error);
      }
    };

    fetchBrands();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedKeyword = keyword.trim();
    const isSizeSearch = /^\d+mm$/.test(trimmedKeyword); // Kiểm tra kích thước
    const searchParams = {
      keyword: isSizeSearch ? '' : trimmedKeyword, // Nếu là kích thước, không dùng keyword
      brandIds: selectedBrands.length > 0 ? selectedBrands : null,
      attributeValues: trimmedKeyword ? [trimmedKeyword] : [], // Luôn gửi attributeValues cho mọi giá trị
      attributeIds: isSizeSearch ? [17] : [], // Chỉ gửi attributeIds=17 cho kích thước
    };
    console.log('Search params sent:', searchParams); // Debug
    onSearch(searchParams);
  };

  const toggleBrand = (brandId) => {
    setSelectedBrands((prev) =>
      prev.includes(brandId) ? prev.filter((id) => id !== brandId) : [...prev, brandId]
    );
  };

  const toggleAllBrands = () => {
    setSelectedBrands((prev) =>
      prev.length === brands.length ? [] : brands.map((brand) => brand.id)
    );
  };

  return (
    <div
      className={`w-full h-full flex items-center border border-qgray-border bg-white ${className || ""}`}
    >
      <div className="flex-1 h-full">
        <form onSubmit={handleSubmit} className="h-full">
          <input
            type="text"
            className="search-input w-full h-full px-4 py-2 text-sm focus:outline-none"
            placeholder="Tìm sản phẩm, kích thước (39mm), chất liệu (Vàng Trắng 18k), bộ máy (Rolex Calibre 7140)..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </form>
      </div>
      <div className="w-[1px] h-[22px] bg-qgray-border"></div>
      <div className="relative flex-1 flex items-center px-4">
        <button
          type="button"
          onClick={() => setIsBrandDropdownOpen(!isBrandDropdownOpen)}
          className="w-full text-xs font-500 text-qgray flex justify-between items-center"
        >
          <span>Tất cả thương hiệu</span>
          <span>
            <svg
              width="10"
              height="5"
              viewBox="0 0 10 5"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="9.18359"
                y="0.90918"
                width="5.78538"
                height="1.28564"
                transform="rotate(135 9.18359 0.90918)"
                fill="#8E8E8E"
              />
              <rect
                x="5.08984"
                y="5"
                width="5.78538"
                height="1.28564"
                transform="rotate(-135 5.08984 5)"
                fill="#8E8E8E"
              />
            </svg>
          </span>
        </button>
        {isBrandDropdownOpen && (
          <div className="absolute left-0 top-full w-[200px] bg-white border border-gray-200 shadow-lg rounded z-50 max-h-[300px] overflow-y-auto">
            <ul className="p-2">
              <li className="py-1">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedBrands.length === brands.length}
                    onChange={toggleAllBrands}
                    className="form-checkbox"
                  />
                  <span className="text-sm text-gray-600">Tất cả</span>
                </label>
              </li>
              {brands.map((brand) => (
                <li key={brand.id} className="py-1">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(brand.id)}
                      onChange={() => toggleBrand(brand.id)}
                      className="form-checkbox"
                    />
                    <span className="text-sm text-gray-600">{brand.name}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <button
        onClick={handleSubmit}
        className={`w-[93px] h-full text-sm font-600 ${type === 3 ? "bg-qh3-blue text-white" : "bg-gray-200 text-qblack"}`}
        type="button"
      >
        Tìm kiếm
      </button>
    </div>
  );
}