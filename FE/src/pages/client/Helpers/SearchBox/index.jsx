import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { debounce } from "lodash";
import Constants from "../../../../Constants";
import { toast } from "react-toastify";

export default function SearchBox({ className, type }) {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const debouncedSearch = debounce(async (query) => {
    if (!query.trim()) return;

    try {
      const response = await axios.get(`${Constants.DOMAIN_API}/products`, {
        params: { query },
      });
      navigate("/all-products", {
        state: {
          products: response.data.data,
          pagination: response.data.pagination,
          totalVariants: response.data.totalVariants,
          searchQuery: query,
        },
      });
    } catch (error) {
      console.error("Error searching products:", error);
      toast.error("Có lỗi xảy ra khi tìm kiếm sản phẩm.");
    }
  }, 500);

  const handleSearch = (e) => {
    e.preventDefault();
    debouncedSearch(searchQuery);
  };

  useEffect(() => {
    return () => debouncedSearch.cancel();
  }, [debouncedSearch]);

  return (
    <div
      className={`w-full h-full flex items-center border border-qgray-border bg-white ${
        className || ""
      }`}
    >
      <div className="flex-1 h-full">
        <form onSubmit={handleSearch} className="h-full">
          <input
            type="text"
            className="search-input w-full h-full px-4 text-sm"
            placeholder="Tìm kiếm sản phẩm..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              debouncedSearch(e.target.value);
            }}
          />
        </form>
      </div>
      <div className="w-[1px] h-[22px] bg-qgray-border"></div>
      <button
        className={`w-[93px] h-full text-sm font-600 ${
          type === 3 ? "bg-qh3-blue text-white" : "search-btn"
        }`}
        type="submit"
        onClick={handleSearch}
      >
        Tìm kiếm
      </button>
    </div>
  );
}