import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Constants from "../../../../Constants.jsx";
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const PromotionProductEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [productVariants, setProductVariants] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  // Load data cho dropdown
  useEffect(() => {
    axios.get(`${Constants.DOMAIN_API}/admin/promotions/ss/all`)
      .then(res => setPromotions(res.data.data))
      .catch(err => console.error("Lỗi load promotions:", err));

    axios.get(`${Constants.DOMAIN_API}/admin/products`)
      .then(res => setProducts(res.data.data))
      .catch(err => console.error("Lỗi load products:", err));

    axios.get(`${Constants.DOMAIN_API}/admin/product-variants`)
      .then(res => setProductVariants(res.data.data))
      .catch(err => console.error("Lỗi load product variants:", err));
  }, []);

  // Load dữ liệu cần sửa
  useEffect(() => {
    axios.get(`${Constants.DOMAIN_API}/admin/promotion/${id}`)
      .then(res => {
        const data = res.data;
        const variant = data.variant;
        setValue("promotion_id", data.promotion_id);
        setValue("product_variant_id", data.product_variant_id);

        // Gán selectedProductId để lọc biến thể
        setSelectedProductId(variant?.product_id || "");
      })
      .catch(err => {
        console.error("Lỗi khi tải chi tiết:", err);
        alert("Không thể tải thông tin!");
      });
  }, [id, setValue]);

  const onSubmit = async (formData) => {
    try {
      await axios.put(`${Constants.DOMAIN_API}/admin/promotion/${id}`, formData);
      alert("Cập nhật thành công!");
      navigate("/admin/promotion-products/getAll");
    } catch (err) {
      console.error(err);
      alert("Lỗi khi cập nhật!");
    }
  };

  return (
    <div className="card p-4">
      <h4>Cập nhật Promotion Product</h4>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Chọn Promotion */}
        <div className="mb-3">
          <label className="form-label">Khuyến mãi</label>
          <select
            className="form-select"
            {...register("promotion_id", { required: "Vui lòng chọn Promotion" })}
          >
            <option value="">-- Chọn khuyến mãi --</option>
            {promotions.map((promo) => (
              <option key={promo.id} value={promo.id}>
                {promo.name}
              </option>
            ))}
          </select>
          {errors.promotion_id && <small className="text-danger">{errors.promotion_id.message}</small>}
        </div>

        {/* Chọn Product */}
        <div className="mb-3">
          <label className="form-label">Sản phẩm</label>
          <select
            className="form-select"
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
          >
            <option value="">-- Chọn sản phẩm --</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
        </div>

        {/* Chọn Product Variant */}
        <div className="mb-3">
          <label className="form-label">Biến thể sản phẩm</label>
          <select
            className="form-select"
            {...register("product_variant_id", {
              required: "Vui lòng chọn product variant",
            })}
            disabled={!selectedProductId}
          >
            <option value="">-- Chọn biến thể --</option>
            {productVariants
              .filter(variant => String(variant.product_id) === String(selectedProductId))
              .map(variant => (
                <option key={variant.id} value={variant.id}>
                  {variant.sku}
                </option>
              ))}
          </select>
          {errors.product_variant_id && <small className="text-danger">{errors.product_variant_id.message}</small>}
        </div>

        <button type="submit" className="btn btn-primary">Cập nhật</button>
      </form>
    </div>
  );
};

export default PromotionProductEdit;
