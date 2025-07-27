import { useState, useEffect } from "react";
import axios from "axios";
import Constants from "../../../../Constants";

export default function SearchBox({ className, type, onSearch }) {
  const [keyword, setKeyword] = useState("");
  const [brands, setBrands] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [isBrandDropdownOpen, setIsBrandDropdownOpen] = useState(false);

  useEffect(() => {
    axios
      .get(`${Constants.DOMAIN_API}/brands/active`, { params: { page: 1, limit: 100 } })
      .then(res => {
        if (res.data.status === 200) {
          setBrands(res.data.data);
        }
      })
      .catch(err => console.error("SearchBox fetch brands:", err));
  }, []);

  const handleSubmit = e => {
    e.preventDefault();
    const t = keyword.trim();
    const isSize  = /^\d+mm$/i.test(t);
    const isColor = /^#([0-9A-Fa-f]{6})$/.test(t);

    const params = { page: 1, limit: 10 };
    if (selectedBrands.length) {
      params.brand_ids = selectedBrands;
    }

    if (isSize) {
      params.keyword = "";
      params.attributeValues = [];
      params.attributeIds = [17]; // ví dụ id thuộc tính size
    } else if (isColor) {
      params.keyword = "";
      params.attributeValues = [t.toLowerCase()];
      params.attributeIds = [];
    } else {
      params.keyword = t;
      params.attributeValues = [];
      params.attributeIds = [];
    }

    onSearch(params);
  };

  const toggleBrand = id =>
    setSelectedBrands(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  const toggleAll  = () =>
    setSelectedBrands(prev =>
      prev.length === brands.length ? [] : brands.map(b => b.id)
    );

  const showColorSquare = /^#([0-9A-Fa-f]{6})$/.test(keyword.trim());

  return (
    <div className={`w-full h-full flex items-center border bg-white ${className || ""}`}>
      <form onSubmit={handleSubmit} className="flex-1 h-full relative">
        {showColorSquare && (
          <div
            style={{
              width: 20,
              height: 20,
              backgroundColor: keyword.trim(),
              border: "1px solid #ccc",
              borderRadius: 4,
              position: "absolute",
              left: 8,
              top: "50%",
              transform: "translateY(-50%)",
            }}
          />
        )}
        <input
          type="text"
          className="w-full h-full px-4 py-2 text-sm focus:outline-none"
          placeholder="Tìm sản phẩm, màu (#a75716), size (39mm)..."
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          style={{ paddingLeft: showColorSquare ? 36 : undefined }}
        />
      </form>

      <div className="w-px h-6 bg-gray-300 mx-2"></div>

      <div className="relative px-2">
        <button
          type="button"
          onClick={() => setIsBrandDropdownOpen(o => !o)}
          className="text-xs text-gray-600 flex items-center"
        >
          Tất cả thương hiệu
          <svg width="10" height="5" className="ml-1">
            <path d="M0 0 L5 5 L10 0" stroke="#888" fill="none" />
          </svg>
        </button>
        {isBrandDropdownOpen && (
          <div className="absolute left-0 top-full bg-white border shadow-lg rounded mt-1 z-50 w-48 max-h-60 overflow-y-auto">
            <ul className="p-2">
              <li className="py-1">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedBrands.length === brands.length}
                    onChange={toggleAll}
                    className="form-checkbox"
                  />
                  <span className="text-sm text-gray-600">Tất cả</span>
                </label>
              </li>
              {brands.map(b => (
                <li key={b.id} className="py-1">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(b.id)}
                      onChange={() => toggleBrand(b.id)}
                      className="form-checkbox"
                    />
                    <span className="text-sm text-gray-600">{b.name}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <button
        onClick={handleSubmit}
        className={`ml-2 px-4 py-2 text-sm ${
          type === 3 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"
        }`}
      >
        Tìm kiếm
      </button>
    </div>
  );
}
