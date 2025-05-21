import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Constants from "../../../../Constants.jsx";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const PromotionProductForm = ({ onSuccess }) => {
  const navigate = useNavigate();
  const [promotions, setPromotions] = useState([]);
  const [products, setProducts] = useState([]); // Thêm products
  const [productVariants, setProductVariants] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const res = await axios.get(
          `${Constants.DOMAIN_API}/admin/promotions/ss/all`
        );
        console.log("Fetch promotions res.data:", res.data);
        const { data } = res.data;
        if (Array.isArray(data)) {
          setPromotions(data);
        } else {
          console.error("API không trả về mảng:", res.data.data);
        }
      } catch (error) {
        console.error("Lỗi khi tải promotions:", error);
      }
    };
    fetchPromotions();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${Constants.DOMAIN_API}/admin/products`);
        setProducts(res.data.data);
      } catch (error) {
        console.error("Lỗi khi tải products:", error);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchProductVariants = async () => {
      try {
        const res = await axios.get(
          `${Constants.DOMAIN_API}/admin/product-variants`
        );
        setProductVariants(res.data.data);
      } catch (error) {
        console.error("Lỗi khi tải product variants:", error);
      }
    };
    fetchProductVariants();
  }, []);

  const onSubmit = async (data) => {
    console.log("Dữ liệu gửi lên:", data);

    try {
      console.log("Dữ liệu gửi đi:", data); // <-- LỖI: Data không tồn tại, phải là data
      await axios.post(
        `${Constants.DOMAIN_API}/admin/promotion-products`,
        data
      );
      alert("Thêm promotion_product thành công!");
      reset();
      if (onSuccess) onSuccess();
      navigate("/admin/promotion-products/getAll");
    } catch (err) {
      console.error(err);
      alert("Lỗi khi thêm promotion_product");
    }
  };

  return (
    <div className="card p-4">
      <h4>Thêm mới Promotion Product</h4>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Select Promotion ID */}
        <div className="mb-3">
          <label className="form-label">Khuyến mãi</label>
          <select
            className="form-select"
            {...register("promotion_id", {
              required: "Vui lòng chọn Promotion",
            })}
          >
            <option value="">--Chọn khuyến mãi --</option>
            {promotions.map((promo) => (
              <option key={promo.id} value={promo.id}>
                {promo.name}
              </option>
            ))}
          </select>
          {errors.promotion_id && (
            <small className="text-danger">{errors.promotion_id.message}</small>
          )}
        </div>

        {/* Select Product */}
        <div className="mb-3">
          <label className="form-label">Sản phẩm</label>
          <select
            className="form-select"
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
          >
            <option value="">-- Chọn Sản phẩm --</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
        </div>

        {/* Select Product Variant */}
        <div className="mb-3">
          <label className="form-label">Biến thể sản phẩm</label>
          <select
            className="form-select"
            {...register("product_variant_id", {
              required: "Vui lòng chọn product variant",
            })}
            disabled={!selectedProductId}
          >
            <option value="">-- Chọn Biến thể sản phẩm --</option>
            {productVariants
              .filter(
                (variant) =>
                  String(variant.product_id) === String(selectedProductId)
              )
              .map((variant) => (
                <option key={variant.id} value={variant.id}>
                  {variant.sku}
                </option>
              ))}
          </select>
          {errors.product_variant_id && (
            <small className="text-danger">
              {errors.product_variant_id.message}
            </small>
          )}
        </div>

        <button type="submit" className="btn btn-primary">
          Thêm mới
        </button>
      </form>
    </div>
  );
};

export default PromotionProductForm;
