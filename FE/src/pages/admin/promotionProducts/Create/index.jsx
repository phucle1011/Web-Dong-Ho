import React from 'react';
import { useForm } from 'react-hook-form';
import Constants from "../../../../Constants.jsx";
import { useNavigate } from 'react-router-dom';

import axios from 'axios';

const PromotionProductForm = ({ onSuccess }) => {
    const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    
    formState: { errors }
  } = useForm();

  const onSubmit = async (data) => {
    try {
await axios.post(`${Constants.DOMAIN_API}/admin/promotion-products`, data); // sửa URL nếu khác
      alert('Thêm promotion_product thành công!');
    
      reset();
      if (onSuccess) onSuccess(); // callback để reload danh sách nếu cần
       navigate('/admin/promotion/getAll'); // chuyển trang
    } catch (err) {
      console.error(err);
      alert('Lỗi khi thêm promotion_product');
    }
  };

  return (
    <div className="card p-4">
      <h4>Thêm mới Promotion Product</h4>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-3">
          <label className="form-label">Promotion ID</label>
          <input
            type="number"
            className="form-control"
            {...register('promotion_id', { required: 'Vui lòng nhập promotion_id' })}
          />
          {errors.promotion_id && <small className="text-danger">{errors.promotion_id.message}</small>}
        </div>

        <div className="mb-3">
          <label className="form-label">Product Variant ID</label>
          <input
            type="number"
            className="form-control"
            {...register('product_variant_id', { required: 'Vui lòng nhập product_variant_id' })}
          />
          {errors.product_variant_id && <small className="text-danger">{errors.product_variant_id.message}</small>}
        </div>
<div className="mb-3">
  <label className="form-label">Discount Value (%)</label>
  <input
    type="number"
    step="0.01"
    className="form-control"
    {...register('discount_value', { required: 'Vui lòng nhập discount_value' })}
  />
  {errors.discount_value && <small className="text-danger">{errors.discount_value.message}</small>}
</div>
        <button type="submit" className="btn btn-primary">Thêm mới</button>
      </form>
    </div>
  );
};

export default PromotionProductForm;
