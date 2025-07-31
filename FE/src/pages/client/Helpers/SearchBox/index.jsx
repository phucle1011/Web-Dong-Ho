import { useState, useEffect } from "react";
import axios from "axios";
import Constants from "../../../../Constants";
import { BlockPicker } from "react-color";

export default function SearchBox({ className, onSearch }) {
  const [keyword, setKeyword] = useState("");
  const [colors, setColors] = useState([]);
  const [isColorOpen, setIsColorOpen] = useState(false);
  const [colorError, setColorError] = useState(null);

  useEffect(() => {
    // Fetch colors
    axios
      .get(`${Constants.DOMAIN_API}/attribute-values`, {
        params: { attribute_id: 35, page: 1, limit: 100 },
      })
      .then(res => {
        if (res.data.status === 200) {
          const valid = res.data.data.filter(v =>
            /^#([0-9A-Fa-f]{6})$/.test(v.value)
          );
          setColors(valid);
          if (!valid.length) {
            setColorError("Không tìm thấy mã màu hợp lệ.");
          }
        } else {
          setColorError(`Lỗi API: ${res.data.message}`);
        }
      })
      .catch(err => {
        setColorError(`Lỗi lấy màu: ${err.message}`);
      });
  }, []);

  const handleSubmit = e => {
    e.preventDefault();
    const t = keyword.trim();
    const isSize = /^\d+mm$/i.test(t);
    const isColor = /^#([0-9A-Fa-f]{6})$/.test(t);

    const params = { page: 1, limit: 10, keyword: "", attribute_values: [], attribute_ids: [] };

    if (isSize) {
      params.attribute_ids = [17];
    } else if (isColor) {
      params.attribute_values = [t.toLowerCase()];
      params.attribute_ids = [35];
    } else {
      params.keyword = t;
    }

    onSearch(params);
  };

  const pickColor = c => {
    setKeyword(c.hex);
    setIsColorOpen(false);
  };

  const showCircle = /^#([0-9A-Fa-f]{6})$/.test(keyword.trim());

  return (
    <div className={`w-full flex items-center border bg-white ${className || ""}`}>
      {/* Color picker */}
      <div className="relative px-2">
        <button
          type="button"
          onClick={() => setIsColorOpen(o => !o)}
          className="w-6 h-6 rounded-full border"
          style={{ backgroundColor: showCircle ? keyword : "transparent" }}
        />
        {isColorOpen && (
          <div className="absolute left-0 mt-1 p-2 bg-white border rounded shadow z-50">
            {colors.length > 0 ? (
              <BlockPicker
                colors={colors.map(c => c.value)}
                triangle="hide"
                onChangeComplete={pickColor}
              />
            ) : (
              <p className="text-sm text-red-600">{colorError}</p>
            )}
          </div>
        )}
      </div>

      <div className="w-px h-6 bg-gray-300 mx-2" />

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex-1 relative">
        {showCircle && (
          <div
            className="absolute left-2 top-1/2 transform -translate-y-1/2 w-5 h-5 rounded-full border"
            style={{ backgroundColor: keyword }}
          />
        )}
        <input
          type="text"
          className="w-full px-4 py-2 text-sm focus:outline-none"
          placeholder="Tìm sản phẩm, màu, size..."
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          style={{ paddingLeft: showCircle ? 36 : undefined }}
        />
      </form>

      <div className="w-px h-6 bg-gray-300 mx-2" />

      {/* Submit */}
      <button
        onClick={handleSubmit}
        className="ml-2 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
      >
        Tìm kiếm
      </button>
    </div>
  );
}
