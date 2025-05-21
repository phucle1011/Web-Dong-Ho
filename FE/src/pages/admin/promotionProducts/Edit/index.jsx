import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Constants from "../../../../Constants.jsx";
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const PromotionProductEdit = () => {
  const { id } = useParams(); // Lấy ID từ URL
  const navigate = useNavigate();
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();

  useEffect(() => {
    axios.get(`${Constants.DOMAIN_API}/admin/promotion/${id}`)
      .then(res => {
        const data = res.data;
        console.log('Data from API:', data); // Kiểm tra dữ liệu
        setValue('promotion_id', data.promotion_id);
        setValue('product_variant_id', data.product_variant_id);
        // Đã bỏ setValue cho discount_value
      })
      .catch(err => {
        console.error(err);
        alert('Không thể tải thông tin!');
      });
  }, [id, setValue]);

  const onSubmit = async (formData) => {
    try {
      await axios.put(`${Constants.DOMAIN_API}/promotion/${id}`, {
        promotion_id: formData.promotion_id,
        product_variant_id: formData.product_variant_id,
        // Không gửi discount_value
      });
      alert('Cập nhật thành công!');
      navigate('/admin/promotion/getAll');
    } catch (err) {
      console.error(err);
      alert('Lỗi khi cập nhật!');
    }
  };

  return (
    <div className="card p-4">
      <h4>Cập nhật Promotion Product</h4>
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

        {/* Đã bỏ trường discount_value */}

        <button type="submit" className="btn btn-primary">Cập nhật</button>
      </form>
    </div>
  );
};

export default PromotionProductEdit;
