import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const AdminProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  const fetchProduct = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/admin/products/${id}`);
      setProduct(res.data.data);
    } catch (error) {
      console.error('Lỗi khi lấy chi tiết sản phẩm:', error);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  if (!product) return <div>Đang tải...</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white shadow rounded-md p-4">
        <h2 className="text-2xl font-semibold mb-4">{product.name}</h2>

        <div className="flex gap-6 mb-4">
          <img
            src={product.thumbnail || "https://via.placeholder.com/150"}
            alt={product.name}
            className="w-40 h-40 object-cover rounded"
          />
          <div className="flex flex-col gap-2">
            <p><strong>Mô tả:</strong> {product.description}</p>
            <p><strong>Giá:</strong> {Number(product.price).toLocaleString()} đ</p>
            <p><strong>Giá KM:</strong> {Number(product.discount_price).toLocaleString()} đ</p>
            <p><strong>Trạng thái:</strong> {product.status}</p>
            <p><strong>Danh mục:</strong> {product.category?.name || 'Không có'}</p>
          </div>
        </div>

        {product.variants?.length > 0 && (
  <div className="mt-6">
    <h3 className="text-lg font-semibold mb-2">Biến thể sản phẩm:</h3>
   <table className="w-full border-collapse border border-gray-300">
  <thead>
    <tr className="bg-gray-200">
      <th className="p-2 border">SKU</th>
      <th className="p-2 border">Giá</th>
      <th className="p-2 border">Thuộc tính</th>  {/* Cột mới */}
      <th className="p-2 border">Ảnh</th>
    </tr>
  </thead>
  <tbody>
    {product.variants.map((variant) => (
      <tr key={variant.id} className="border-b">
        <td className="p-2 border">{variant.sku}</td>
        <td className="p-2 border">{Number(variant.price).toLocaleString()} đ</td>
        <td className="p-2 border">
          {variant.attributeValues?.map(av => (
            <div key={av.id}>
              <strong>{av.attribute?.name}:</strong> {av.value}
            </div>
          ))}
        </td>
        <td className="p-2 border">
          <div className="flex gap-2">
            {variant.images?.map((img) => (
              <img
                key={img.id}
                src={img.url}
                alt="variant"
                className="w-16 h-16 object-cover rounded"
              />
            ))}
          </div>
        </td>
      </tr>
    ))}
  </tbody>
</table>

  </div>
)}


        <div className="mt-6">
          <Link
            to="/admin/products"
            className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
          >
            Quay lại
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminProductDetail;
