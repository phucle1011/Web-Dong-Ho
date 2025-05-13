import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Constants from "../../../../Constants.jsx";
import { toast } from "react-toastify";
import FormDelete from "../../../../components/formDelete";

function CategoryGetAll() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    getCategories();
  }, []);

  const getCategories = async () => {
    try {
      const res = await axios.get(`${Constants.DOMAIN_API}/admin/category/list`);
      setCategories(res.data.data || []);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách danh mục:", error);
      toast.error("Không thể tải danh mục.");
    }
  };

  const deleteCategory = async () => {
    if (!selectedCategory) return;

    try {
      await axios.delete(`${Constants.DOMAIN_API}/admin/category/${selectedCategory.id}`);
      toast.success("Xóa danh mục thành công");
      getCategories();
    } catch (error) {
      console.error("Lỗi khi xóa danh mục:", error);

      if (error.response?.data?.error?.includes("foreign key constraint fails")) {
        toast.error("Không thể xóa vì có sản phẩm đang sử dụng danh mục này.");
      } else {
        toast.error("Xóa thất bại. Vui lòng thử lại.");
      }
    } finally {
      setSelectedCategory(null);
    }
  };

  return (
    <div className="container mx-auto p-4 bg-white shadow rounded">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Danh sách danh mục</h2>
        <Link
          to="/admin/categories/create"
          className="inline-block bg-[#073272] text-white px-4 py-2 rounded"
        >
          + Thêm danh mục
        </Link>
      </div>

      <table className="w-full table-auto border border-collapse border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">#</th>
            <th className="border p-2">Tên</th>
            <th className="border p-2">Mô tả</th>
            <th className="border p-2">Trạng thái</th>
            <th className="border p-2">Ngày tạo</th>
            <th className="border p-2">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat, index) => (
            <tr key={cat.id} className="hover:bg-gray-50">
              <td className="border p-2 text-center">{index + 1}</td>
              <td className="border p-2">{cat.name}</td>
              <td className="border p-2">{cat.description || "-"}</td>
              <td className="border p-2 text-center">
                <span
                  className={`px-2 py-1 rounded-full text-xs ${cat.status === "active"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                    }`}
                >
                  {cat.status === "active" ? "Hiển thị" : "Ẩn"}
                </span>
              </td>
              <td className="border p-2 text-center">
                {new Date(cat.created_at).toLocaleDateString()}
              </td>
              <td className="border p-2 text-center space-x-2">
                <Link
                  to={`/admin/categories/edit/${cat.id}`}
                  className="bg-yellow-500 text-white py-1 px-3 rounded"
                >
                  <i className="fa-solid fa-pen-to-square"></i>
                </Link>
                <button
                  onClick={() => setSelectedCategory(cat)}
                  className="bg-red-500 text-white py-1 px-3 rounded"
                >
                  <i className="fa-solid fa-trash"></i>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedCategory && (
        <FormDelete
          isOpen={true}
          onClose={() => setSelectedCategory(null)}
          onConfirm={deleteCategory}
          message={`Bạn có chắc chắn muốn xóa danh mục "${selectedCategory.name}" không?`}
        />
      )}
    </div>
  );
}

export default CategoryGetAll;
