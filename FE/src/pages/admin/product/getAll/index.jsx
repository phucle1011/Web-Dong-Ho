import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const AdminProductList = () => {
  const [products, setProducts] = useState([]);

  const fetchProducts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/admin/products');
      setProducts(res.data.data);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách sản phẩm:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="container mx-auto p-2">
      <div className="bg-white p-4 shadow rounded-md">
        <h2 className="text-xl font-semibold mb-4">Danh sách sản phẩm</h2>
        <table className="w-full border-collapse border border-gray-300 mt-3">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">#</th>
              <th className="p-2 border">Tên</th>
              <th className="p-2 border">Ảnh</th>
              <th className="p-2 border">Trạng thái</th>
              <th className="p-2 border">Danh mục</th>
              <th className="p-2 border">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <tr key={product.id} className="border-b">
                <td className="p-2 border">{index + 1}</td>
                <td className="p-2 border">{product.name}</td>
                <td className="p-2 border">
                  <img
                    src={product.thumbnail || "https://via.placeholder.com/60"}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                </td>
                <td className="p-2 border capitalize">{product.status}</td>
                <td className="p-2 border">{product.category?.name || 'Không có'}</td>
                <td className="p-2 border flex gap-2">
                  <Link
                    to={`/admin/product/edit/${product.id}`}
                    className="bg-blue-500 text-white py-1 px-3 rounded"
                  >
                    Sửa
                  </Link>
                  <Link
                    to={`/admin/product/detail/${product.id}`}
                    className="bg-green-500 text-white py-1 px-3 rounded"
                  >
                    Xem
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminProductList;
