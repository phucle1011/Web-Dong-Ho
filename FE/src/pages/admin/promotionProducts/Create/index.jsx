import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Constants from "../../../../Constants.jsx";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PromotionProductForm = ({ onSuccess }) => {
  const navigate = useNavigate();
  const [promotions, setPromotions] = useState([]);
  const [productVariants, setProductVariants] = useState([]);
  const [usedPromotionIds, setUsedPromotionIds] = useState([]);
  const [usedVariantIds, setUsedVariantIds] = useState([]);
  const [selectedPromotionId, setSelectedPromotionId] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    trigger,
    formState: { errors },
  } = useForm();

  const getPromotionStatus = (startDate, endDate) => {
    if (!startDate || !endDate) return "Không xác định";
    const currentDate = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (currentDate < start) return "Sắp bắt đầu";
    if (currentDate <= end) return "Đang hoạt động";
    return "Đã kết thúc";
  };

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const res = await axios.get(
          `${Constants.DOMAIN_API}/admin/promotions/ss/all`
        );
        const { data } = res.data;
        if (Array.isArray(data)) {
          const filteredPromotions = data.filter((promo) => {
            const status = getPromotionStatus(promo.start_date, promo.end_date);
            return status === "Sắp bắt đầu" || status === "Đang hoạt động";
          });
          setPromotions(filteredPromotions);
        } else {
          console.error("API không trả về dữ liệu dạng mảng:", data);
        }
      } catch (error) {
        console.error("Lỗi khi tải danh sách promotion:", error);
      }
    };
    fetchPromotions();
  }, []);

  useEffect(() => {
    const fetchProductVariants = async () => {
      try {
        const res = await axios.get(
          `${Constants.DOMAIN_API}/admin/product-variants`
        );
        setProductVariants(res.data.data || []);
      } catch (error) {
        console.error("Lỗi khi tải danh sách biến thể sản phẩm:", error);
      }
    };
    fetchProductVariants();
  }, []);

  useEffect(() => {
    const fetchUsedVariants = async () => {
      if (!selectedPromotionId) {
        setUsedVariantIds([]);
        return;
      }
      try {
        const res = await axios.get(`${Constants.DOMAIN_API}/admin/promotion-products`);
        const promotionProducts = res.data.data || [];
        // Filter for the selected promotion and flatten product_variant_id arrays
        const usedIds = [...new Set(
          promotionProducts
            .filter((item) => item.promotion_id === parseInt(selectedPromotionId))
            .flatMap((item) => item.product_variant_id || [])
        )];
        setUsedVariantIds(usedIds);
      } catch (error) {
        console.error("Lỗi khi tải danh sách biến thể đã sử dụng:", error);
      }
    };
    fetchUsedVariants();
  }, [selectedPromotionId]);

  const onSubmit = async (data) => {
    const payload = {
      promotion_id: data.promotion_id,
      product_variant_id: data.product_variant_id, // array of variant IDs
    };

    try {
      console.log("Submitting payload:", payload); // Debug log
      await axios.post(
        `${Constants.DOMAIN_API}/admin/promotion-products`,
        payload
      );
      toast.success("Thêm promotion_product thành công!", {
        onOpen: () => console.log("Success toast triggered"), // Debug log
      });
      reset();
      setUsedPromotionIds((prev) => [...new Set([...prev, data.promotion_id])]);
      setUsedVariantIds((prev) => [...new Set([...prev, ...data.product_variant_id])]);
      if (onSuccess) onSuccess();
      setTimeout(() => {
        navigate("/admin/promotion-products/getAll");
      }, 1000);
    } catch (err) {
      console.error("Submission error:", err); // Debug log
      toast.error("Lỗi khi thêm promotion_product: Biến thể đã được sử dụng!");
    }
  };

  const availablePromotions = promotions.filter(
    (promo) => !usedPromotionIds.includes(promo.id)
  );

  const availableVariants = productVariants.filter(
    (variant) => !usedVariantIds.includes(variant.id)
  );

  return (
    <div className="card p-4">
      <h4>Thêm mới Promotion Product</h4>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-3">
          <label className="form-label">Khuyến mãi</label>
          <select
            className="form-select"
            {...register("promotion_id", {
              required: "Vui lòng chọn Promotion",
            })}
            onChange={(e) => {
              setSelectedPromotionId(e.target.value);
              setValue("promotion_id", e.target.value);
              trigger("promotion_id");
            }}
          >
            <option value="">--Chọn khuyến mãi --</option>
            {availablePromotions.map((promo) => (
              <option key={promo.id} value={promo.id}>
                {promo.name} (
                {getPromotionStatus(promo.start_date, promo.end_date)})
              </option>
            ))}
          </select>
          {errors.promotion_id && (
            <small className="text-danger">{errors.promotion_id.message}</small>
          )}
        </div>

        <div className="mb-3">
          <label className="form-label">Chọn các biến thể sản phẩm</label>
          <Select
            isMulti
            options={availableVariants.map((variant) => ({
              value: variant.id,
              label: `${variant.sku} (${
                variant.product?.name || "Tên SP không xác định"
              })`,
            }))}
            className="basic-multi-select"
            classNamePrefix="select"
            onChange={(selectedOptions) => {
              const selectedIds = selectedOptions
                ? selectedOptions.map((opt) => opt.value)
                : [];
              setValue("product_variant_id", selectedIds);
              trigger("product_variant_id");
            }}
            isDisabled={!selectedPromotionId} // Disable until promotion is selected
          />
          <input
            type="hidden"
            {...register("product_variant_id", {
              required: "Vui lòng chọn ít nhất một biến thể sản phẩm",
              validate: (value) =>
                (value && value.length > 0) ||
                "Vui lòng chọn ít nhất một biến thể sản phẩm",
            })}
          />
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
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default PromotionProductForm;