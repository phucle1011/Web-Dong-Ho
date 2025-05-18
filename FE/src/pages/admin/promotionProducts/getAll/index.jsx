import React, { useEffect, useState } from "react";
import axios from "axios";
import Constants from "../../../../Constants.jsx";
import { Link } from "react-router-dom";

const PromotionProductList = () => {
  const [promotionProducts, setPromotionProducts] = useState([]);
  const [selectedPromotionProduct, setSelectedPromotionProduct] = useState(null);

  useEffect(() => {
    axios.get(`${Constants.DOMAIN_API}/admin/promotion`)
      .then((response) => {
        setPromotionProducts(response.data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa?")) {
      try {
        await axios.delete(`${Constants.DOMAIN_API}/admin/promotion/${id}`);
        alert("Xóa thành công!");
        // Sau khi xóa, cập nhật lại danh sách:
        setPromotionProducts((prev) => prev.filter(item => item.id !== id));
      } catch (err) {
        console.error(err);
        alert("Xóa thất bại!");
      }
    }
  };




  return (
    <div className="container mx-auto p-4 bg-white shadow rounded">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Danh sách khuyến mãi</h2>
        <Link
          to="/admin/promotion/add"
          className="inline-block bg-[#073272] text-white px-4 py-2 rounded"
        >
          + Thêm khuyến mãi
        </Link>
      </div>

      <table className="table table-bordered table-striped w-full">
        <thead>
          <tr>
            <th>ID</th>
            <th>Promotion ID</th>
            <th>Product Variant ID</th>
            <th>Discount Value (%)</th>
            <th>Created At</th>
            <th>Updated At</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {promotionProducts.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.Promotion?.name || item.promotion_id}</td>
              <td>{item.ProductVariant?.name || item.product_variant_id}</td>
              <td>{item.discount_value}%</td>
              <td>{new Date(item.created_at).toLocaleString("vi-VN", { hour12: false })}</td>
              <td>{new Date(item.updated_at).toLocaleString("vi-VN", { hour12: false })}</td>
              <td className="text-center space-x-2">
                <Link
                  to={`/admin/promotion/edit/${item.id}`}
                  className="bg-yellow-500 text-white py-1 px-3 rounded"
                >
                  <i className="fa-solid fa-pen-to-square"></i>
                </Link>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="bg-red-500 text-white py-1 px-3 rounded"
                >
                  <i className="fa-solid fa-trash"></i>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>


    </div>


  );
};

export default PromotionProductList;
