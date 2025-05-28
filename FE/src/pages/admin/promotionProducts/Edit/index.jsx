import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Constants from "../../../../Constants.jsx";
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const PromotionProductEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [productVariants, setProductVariants] = useState([]);
  const [promotions, setPromotions] = useState([]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  // Load danh sách khuyến mãi & biến thể sản phẩm
  useEffect(() => {
    axios.get(`${Constants.DOMAIN_API}/admin/promotions/list`)
      .then(res => setPromotions(res.data.data))
      .catch(err => console.error("Lỗi load promotions:", err));

    axios.get(`${Constants.DOMAIN_API}/admin/product-variants`)
      .then(res => setProductVariants(res.data.data))
      .catch(err => console.error("Lỗi load product variants:", err));
  }, []);

  // Load thông tin chi tiết cần sửa
  useEffect(() => {
    axios.get(`${Constants.DOMAIN_API}/admin/promotion/${id}`)
      .then(res => {
        const data = res.data;
        setValue("promotion_id", data.promotion_id);
        setValue("product_variant_id", data.product_variant_id);
        setValue("status", data.status || "active");
      })
      .catch(err => {
        console.error("Lỗi khi tải chi tiết:", err);
        alert("Không thể tải thông tin!");
      });
  }, [id, setValue]);

  // Xử lý submit
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
            {...register("promotion_id", { required: "Vui lòng chọn khuyến mãi" })}
          >
            <option value="">-- Chọn khuyến mãi --</option>
            {promotions.map(promo => (
              <option key={promo.id} value={promo.id}>
                {promo.name}
              </option>
            ))}
          </select>
          {errors.promotion_id && <small className="text-danger">{errors.promotion_id.message}</small>}
        </div>

        {/* Chọn Biến thể sản phẩm */}
        <div className="mb-3">
          <label className="form-label">Biến thể sản phẩm</label>
          <select
            className="form-select"
            {...register("product_variant_id", { required: "Vui lòng chọn biến thể sản phẩm" })}
          >
            <option value="">-- Chọn biến thể --</option>
            {productVariants.map(variant => (
              <option key={variant.id} value={variant.id}>
                {variant.sku}
              </option>
            ))}
          </select>
          {errors.product_variant_id && <small className="text-danger">{errors.product_variant_id.message}</small>}
        </div>

        {/* Chọn Trạng thái */}
        <div className="mb-3">
          <label className="form-label">Trạng thái</label>
          <select
            className="form-select"
            {...register("status", { required: "Vui lòng chọn trạng thái" })}
          >
            <option value="active">Hiển thị</option>
            <option value="inactive">Ẩn</option>
          </select>
          {errors.status && <small className="text-danger">{errors.status.message}</small>}
        </div>

        <button type="submit" className="btn btn-primary">Cập nhật</button>
      </form>
    </div>
  );
};

export default PromotionProductEdit;
