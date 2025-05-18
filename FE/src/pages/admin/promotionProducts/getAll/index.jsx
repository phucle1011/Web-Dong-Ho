import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Constants from "../../../../Constants.jsx";

const PromotionProductList = () => {
  const [promotionProducts, setPromotionProducts] = useState([]);

  useEffect(() => {
    axios
      .get(`${Constants.DOMAIN_API}/admin/promotion`)
      .then((response) => {
        setPromotionProducts(response.data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  return (
    <div className="container">
      <h2>Danh sách Promotion Products</h2>
      <Link
        to="/admin/promotion/add"
        className="inline-block bg-[#073272] text-white px-4 py-2 rounded mb-3"
      >
        + Thêm Khuyến Mãi
      </Link>
      <table className="table table-bordered table-striped">
        <thead>
          <tr>
            <th>ID</th>
            <th>Promotion ID</th>
            <th>Product Variant ID</th>
            <th>Created At</th>
            <th>Updated At</th>
          </tr>
        </thead>
        <tbody>
          {promotionProducts.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.Promotion?.name || item.promotion_id}</td>
              <td>{item.ProductVariant?.name || item.product_variant_id}</td>
              <td>{new Date(item.created_at).toLocaleString()}</td>
              <td>{new Date(item.updated_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PromotionProductList; // ✅ export default
