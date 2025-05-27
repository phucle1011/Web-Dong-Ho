import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Constants from "../../../../Constants.jsx";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Select from "react-select";

const PromotionProductForm = ({ onSuccess }) => {
  const navigate = useNavigate();
  const [promotions, setPromotions] = useState([]);
  const [productVariants, setProductVariants] = useState([]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    trigger,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const res = await axios.get(`${Constants.DOMAIN_API}/admin/promotions/ss/all`);
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
    const fetchProductVariants = async () => {
      try {
        const res = await axios.get(`${Constants.DOMAIN_API}/admin/product-variants`);
        setProductVariants(res.data.data);
      } catch (error) {
        console.error("Lỗi khi tải product variants:", error);
      }
    };
    fetchProductVariants();
  }, []);

  const onSubmit = async (data) => {
    const payload = {
      promotion_id: data.promotion_id,
      product_variant_id: data.product_variant_id, // array of variant IDs
    };

    try {
      await axios.post(`${Constants.DOMAIN_API}/admin/promotion-products`, payload);
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
        {/* Chọn Khuyến mãi */}
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

        {/* Chọn nhiều biến thể */}
        <div className="mb-3">
          <label className="form-label">Chọn các biến thể sản phẩm</label>
          <Select
            isMulti
            options={productVariants.map((variant) => ({
              value: variant.id,
              label: `${variant.sku} (${variant.product?.name || "Tên SP không xác định"})`,
            }))}
            className="basic-multi-select"
            classNamePrefix="select"
            onChange={(selectedOptions) => {
              const selectedIds = selectedOptions ? selectedOptions.map((opt) => opt.value) : [];
              setValue("product_variant_id", selectedIds);
              trigger("product_variant_id"); // validate lại
            }}
          />
          {/* Input hidden để react-hook-form biết trường này */}
          <input
            type="hidden"
            {...register("product_variant_id", {
              required: "Vui lòng chọn ít nhất một biến thể sản phẩm",
              validate: (value) =>
                value && value.length > 0 || "Vui lòng chọn ít nhất một biến thể sản phẩm",
            })}
          />
          {errors.product_variant_id && (
            <small className="text-danger">{errors.product_variant_id.message}</small>
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
