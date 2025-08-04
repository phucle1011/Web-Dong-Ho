import { useState, useEffect } from "react";
import axios from "axios";
import Constants from "../../../../Constants";
import { BlockPicker } from "react-color";

export default function SearchBox({ className, onSearch }) {
  const [keyword, setKeyword] = useState("");

  // Mỗi mảng chứa các giá trị (đã lowercase) của attribute
  const [sizes, setSizes]         = useState([]);
  const [origins, setOrigins]     = useState([]);
  const [materials, setMaterials] = useState([]);
  const [waters, setWaters]       = useState([]);
  const [colors, setColors]       = useState([]);

  const [loadingAttrs, setLoadingAttrs] = useState(true);
  const [attrError, setAttrError]       = useState(null);

  const [isColorOpen, setIsColorOpen] = useState(false);

  // 1. Fetch đồng thời tất cả các attribute-values cần
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [
          sizeRes,
          originRes,
          materialRes,
          waterRes,
          colorRes
        ] = await Promise.all([
          axios.get(`${Constants.DOMAIN_API}/attribute-values`, {
            params: { attribute_id: 31, page:1, limit:100 }  // Kích thước
          }),
          axios.get(`${Constants.DOMAIN_API}/attribute-values`, {
            params: { attribute_id: 26, page:1, limit:100 }  // Xuất xứ
          }),
          axios.get(`${Constants.DOMAIN_API}/attribute-values`, {
            params: { attribute_id: 32, page:1, limit:100 }  // Chất liệu
          }),
          axios.get(`${Constants.DOMAIN_API}/attribute-values`, {
            params: { attribute_id: 33, page:1, limit:100 }  // Kháng nước
          }),
          axios.get(`${Constants.DOMAIN_API}/attribute-values`, {
            params: { attribute_id: 35, page:1, limit:100 }  // Màu sắc
          })
        ]);

        setSizes(
          sizeRes.data.data.map(v => v.value.toLowerCase())
        );
        setOrigins(
          originRes.data.data.map(v => v.value.toLowerCase())
        );
        setMaterials(
          materialRes.data.data.map(v => v.value.toLowerCase())
        );
        setWaters(
          waterRes.data.data.map(v => v.value.toLowerCase())
        );
        // lọc chỉ mã màu hợp lệ
        setColors(
          colorRes.data.data
            .filter(v => /^#([0-9A-Fa-f]{6})$/.test(v.value))
            .map(v => v.value.toLowerCase())
        );
      } catch(err) {
        console.error("Error fetching attribute-values", err);
        setAttrError("Không lấy được danh sách giá trị thuộc tính.");
      } finally {
        setLoadingAttrs(false);
      }
    };
    fetchAll();
  }, []);

  const handleSubmit = e => {
    e.preventDefault();
    const t = keyword.trim().toLowerCase();
    if (!t) return;

    // mặc định fallback keyword toàn cục
    const params = {
      keyword:         "",
      attributeValues: [],
      attributeIds:    []
    };

    // 2. check size
    if (sizes.includes(t)) {
      params.attributeIds    = [31];
      params.attributeValues = [t];
    }
    // 3. check color
    else if (colors.includes(t)) {
      params.attributeIds    = [35];
      params.attributeValues = [t];
    }
    // 4. check origin
    else if (origins.includes(t)) {
      params.attributeIds    = [26];
      params.attributeValues = [t];
    }
    // 5. check material
    else if (materials.includes(t)) {
      params.attributeIds    = [32];
      params.attributeValues = [t];
    }
    // 6. check water resistance
    else if (waters.includes(t)) {
      params.attributeIds    = [33];
      params.attributeValues = [t];
    }
    // 7. fallback: keyword toàn cục
    else {
      params.keyword = t;
    }

    onSearch({
      keyword:         params.keyword,
      attributeValues: params.attributeValues,
      attributeIds:    params.attributeIds
    });
  };

  const pickColor = c => {
    setKeyword(c.hex);
    setIsColorOpen(false);
  };

  const showCircle = /^#([0-9A-Fa-f]{6})$/.test(keyword.trim());

  return (
    <div className={`w-full flex items-center border bg-white ${className||""}`}>
      {/* Color picker */}
      <div className="relative px-2">
        <button
          type="button"
          onClick={() => setIsColorOpen(o => !o)}
          className="w-6 h-6 rounded-full border"
          style={{ backgroundColor: showCircle?keyword:"transparent" }}
        />
        {isColorOpen && (
          <div className="absolute left-0 mt-1 p-2 bg-white border rounded shadow z-50">
            {colors.length > 0 ? (
              <BlockPicker
                colors={colors}
                triangle="hide"
                onChangeComplete={pickColor}
              />
            ) : (
              <p className="text-sm text-red-600">{attrError||"Đang tải màu..."}</p>
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
          placeholder="Tìm size, màu, xuất xứ, chất liệu, kháng nước…"
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          style={{ paddingLeft: showCircle?36:undefined }}
        />
      </form>

      <div className="w-px h-6 bg-gray-300 mx-2" />

      {/* Submit */}
      <button
        onClick={handleSubmit}
        className="ml-2 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
        disabled={loadingAttrs}
      >
        Tìm kiếm
      </button>
    </div>
  );
}
