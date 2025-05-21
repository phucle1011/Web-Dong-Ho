import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Constants from "../../../../Constants.jsx";
import { toast } from "react-toastify";
import FormDelete from "../../../../components/formDelete";
import {
  FaChevronLeft,
  FaChevronRight,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
} from "react-icons/fa";

function PromotionGetAll() {
  const [promotions, setPromotions] = useState([]);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const perPage = 10;

  useEffect(() => {
    getPromotions(currentPage, searchTerm);
  }, [currentPage]);

  const getPromotions = async (page = 1, search = "") => {
    try {
      const res = await axios.get(
        `${Constants.DOMAIN_API}/admin/promotions/list`,
        {
          params: { page, limit: perPage, searchTerm: search },
        }
      );
      setPromotions(res.data.data || []);
      setTotalPages(res.data.pagination?.totalPages || 1);
      if (search && (res.data.data || []).length === 0) {
        toast.info("Không tìm thấy khuyến mãi nào.");
      }
    } catch (error) {
      console.error("Lỗi khi tải khuyến mãi:", error);
      toast.error("Không thể tải danh sách khuyến mãi.");
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const deletePromotion = async () => {
    if (!selectedPromotion) return;

    try {
      await axios.delete(
        `${Constants.DOMAIN_API}/admin/promotion/${selectedPromotion.id}`
      );
      toast.success("Xóa khuyến mãi thành công");
      getPromotions(currentPage, searchTerm);
    } catch (error) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Xóa thất bại. Vui lòng thử lại.");
      }
    } finally {
      setSelectedPromotion(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  return (
    <div className="container mx-auto p-4 bg-white shadow rounded">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Danh sách khuyến mãi</h2>
        <Link
          to="/admin/promotions/create"
          className="bg-[#073272] text-white px-4 py-2 rounded"
        >
          + Thêm khuyến mãi
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap gap-2 items-stretch">
        <input
          type="text"
          className="shadow border rounded w-full sm:w-auto flex-grow py-2 px-3 text-sm"
          placeholder="Nhập tên khuyến mãi cần tìm..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setCurrentPage(1);
              getPromotions(1, searchTerm);
            }
          }}
        />
        <button
          onClick={() => {
            setCurrentPage(1);
            getPromotions(1, searchTerm);
          }}
          className="bg-[#073272] text-white px-4 py-2 text-sm rounded"
        >
          <i className="fa fa-search"></i>
        </button>

        {searchTerm.trim() !== "" && (
          <button
            onClick={() => {
              setSearchTerm("");
              setCurrentPage(1);
              getPromotions(1, "");
            }}
            className="bg-[#073272] text-white px-4 py-2 text-sm rounded whitespace-nowrap"
          >
            Xem tất cả mã giảm giá
          </button>
        )}
      </div>

      <table className="w-full table-auto border border-collapse border-gray-300 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">#</th>
            <th className="border p-2">Tên</th>
            <th className="border p-2">% Giảm giá</th>
            <th className="border p-2">Lượt còn lại</th>
            <th className="border p-2">Bắt đầu</th>
            <th className="border p-2">Kết thúc</th>
            <th className="border p-2">Trạng thái</th>
            <th className="border p-2">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {promotions.map((promo, index) => (
            <tr key={promo.id} className="hover:bg-gray-50">
              <td className="border p-2 text-center">
                {(currentPage - 1) * perPage + index + 1}
              </td>
              <td className="border p-2">{promo.name}</td>
              <td className="border p-2 text-center">
                {promo.discount_type === "percentage"
                  ? `${promo.discount_value}%`
                  : `${promo.discount_value.toLocaleString()}đ`}
              </td>
              <td className="border p-2 text-center">
                {promo.quantity > 0 ? promo.quantity : "Hết lượt"}
              </td>
              <td className="border p-2 text-center">
                {formatDate(promo.start_date)}
              </td>
              <td className="border p-2 text-center">
                {formatDate(promo.end_date)}
              </td>
              <td className="border p-2 text-center">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    promo.status === "expired"
                      ? "bg-red-100 text-red-800"
                      : promo.status === "inactive"
                      ? "bg-gray-200 text-gray-800"
                      : promo.status === "upcoming"
                      ? "bg-blue-100 text-blue-800"
                      : promo.status === "exhausted"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {
                    {
                      active: "Đang diễn ra",
                      upcoming: "Sắp diễn ra",
                      expired: "Đã hết hạn",
                      inactive: "Vô hiệu hóa",
                      exhausted: "Hết lượt sử dụng",
                    }[promo.status]
                  }
                </span>
              </td>
              <td className="border p-2 text-center space-x-2">
                <Link
                  to={`/admin/promotions/edit/${promo.id}`}
                  className="bg-yellow-500 text-white py-1 px-3 rounded"
                >
                  <i className="fa-solid fa-pen-to-square"></i>
                </Link>
                <button
                  onClick={() => setSelectedPromotion(promo)}
                  className="bg-red-500 text-white py-1 px-3 rounded"
                >
                  <i className="fa-solid fa-trash"></i>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-center mt-4 items-center">
        <div className="flex items-center space-x-1">
          <button
            disabled={currentPage === 1}
            onClick={() => handlePageChange(1)}
            className="px-2 py-1 border rounded disabled:opacity-50"
          >
            <FaAngleDoubleLeft />
          </button>

          <button
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
            className="px-2 py-1 border rounded disabled:opacity-50"
          >
            <FaChevronLeft />
          </button>

          {currentPage > 2 && (
            <>
              <button
                onClick={() => handlePageChange(1)}
                className="px-3 py-1 border rounded"
              >
                1
              </button>
              {currentPage > 3 && <span className="px-2">...</span>}
            </>
          )}

          {[...Array(totalPages)].map((_, i) => {
            const page = i + 1;
            if (page >= currentPage - 1 && page <= currentPage + 1) {
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 border rounded ${
                    currentPage === page
                      ? "bg-blue-500 text-white"
                      : "bg-blue-100 text-black hover:bg-blue-200"
                  }`}
                >
                  {page}
                </button>
              );
            }
            return null;
          })}

          {currentPage < totalPages - 1 && (
            <>
              {currentPage < totalPages - 2 && (
                <span className="px-2">...</span>
              )}
              <button
                onClick={() => handlePageChange(totalPages)}
                className="px-3 py-1 border rounded"
              >
                {totalPages}
              </button>
            </>
          )}

          <button
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            className="px-2 py-1 border rounded disabled:opacity-50"
          >
            <FaChevronRight />
          </button>

          <button
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(totalPages)}
            className="px-2 py-1 border rounded disabled:opacity-50"
          >
            <FaAngleDoubleRight />
          </button>
        </div>
      </div>

      {selectedPromotion && (
        <FormDelete
          isOpen={true}
          onClose={() => setSelectedPromotion(null)}
          onConfirm={deletePromotion}
          message={`Bạn có chắc chắn muốn xóa khuyến mãi "${selectedPromotion.name}" không?`}
        />
      )}
    </div>
  );
}

export default PromotionGetAll;
