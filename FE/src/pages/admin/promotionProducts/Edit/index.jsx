import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Constants from "../../../../Constants.jsx";
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Select from 'react-select';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PromotionProductEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [productVariants, setProductVariants] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [usedVariantIds, setUsedVariantIds] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [customFormState, setCustomFormState] = useState({});
  const [variantStatus, setVariantStatus] = useState({});

  const {
    register,
    handleSubmit,
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
    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (!id || isNaN(id)) {
          throw new Error("ID khuyến mãi không hợp lệ!");
        }

        const promoRes = await axios.get(`${Constants.DOMAIN_API}/admin/promotions/ss/all`);
        const promoData = promoRes.data.data || [];
        if (!Array.isArray(promoData)) {
          throw new Error("Dữ liệu khuyến mãi không hợp lệ");
        }
        const filteredPromotions = promoData.filter((promo) => {
          const status = getPromotionStatus(promo.start_date, promo.end_date);
          return status === "Sắp bắt đầu" || status === "Đang hoạt động";
        });
        setPromotions(filteredPromotions);

        const variantRes = await axios.get(`${Constants.DOMAIN_API}/admin/product-variants`);
        const variantData = variantRes.data.data || [];
        if (!Array.isArray(variantData)) {
          throw new Error("Dữ liệu biến thể sản phẩm không hợp lệ");
        }
        console.log("All product variants:", variantData);
        setProductVariants(variantData);

        const promotionProductsRes = await axios.get(`${Constants.DOMAIN_API}/admin/promotion`);
        const promotionProducts = promotionProductsRes.data.data || [];
        console.log("All promotion products:", promotionProducts);
        const otherProducts = promotionProducts.filter((item) => item.promotion_id !== parseInt(id));
        const usedIds = [...new Set(
          otherProducts
            .filter((item) => item.product_variant_id && !isNaN(item.product_variant_id))
            .map((item) => item.product_variant_id)
        )];
        console.log("Used variant IDs (excluding current promotion):", usedIds);
        setUsedVariantIds(usedIds);

        // Tạo trạng thái cho các biến thể
        const status = {};
        promotionProducts.forEach((item) => {
          if (item.product_variant_id) {
            if (item.promotion_id === parseInt(id)) {
              status[item.product_variant_id] = "Đang được sử dụng trong khuyến mãi này";
            } else {
              status[item.product_variant_id] = `Đang được sử dụng trong khuyến mãi ${item.promotion?.name || 'khác'}`;
            }
          }
        });
        variantData.forEach((variant) => {
          if (!status[variant.id]) {
            status[variant.id] = "Chưa được sử dụng";
          }
        });
        setVariantStatus(status);
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu ban đầu:", err);
        setError(err.message || "Không thể tải dữ liệu ban đầu! Vui lòng thử lại.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    if (productVariants.length === 0 || !id || isNaN(id)) return;

    const fetchDetail = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get(`${Constants.DOMAIN_API}/admin/promotion?promotion_id=${id}`);
        const data = res.data.data || [];
        if (!Array.isArray(data)) {
          throw new Error("Dữ liệu khuyến mãi không hợp lệ");
        }

        console.log(`API response for promotion_id ${id}:`, data);
        const expectedVariantCount = data[0]?.promotion?.variant_count || 0;
        const productVariantIds = [...new Set(
          data
            .filter((item) => item.product_variant_id && !isNaN(item.product_variant_id))
            .map((item) => item.product_variant_id.toString())
        )];

        console.log("Extracted product_variant_ids:", productVariantIds);

        if (productVariantIds.length !== expectedVariantCount) {
          console.warn(`Cảnh báo: Số lượng biến thể (${productVariantIds.length}) không khớp với variant_count (${expectedVariantCount}) cho promotion_id ${id}`);
          productVariantIds.length = Math.min(productVariantIds.length, expectedVariantCount);
        }

        if (productVariantIds.length === 0) {
          console.warn(`Không tìm thấy biến thể hợp lệ cho promotion_id ${id}`);
        }

        setValue("promotion_id", id.toString());
        setValue("product_variant_id", productVariantIds);
        setCustomFormState((prev) => ({ ...prev, product_variant_id: productVariantIds }));
        trigger("product_variant_id");
      } catch (err) {
        console.error("Lỗi khi tải chi tiết:", err);
        let errorMessage = "Không thể tải thông tin khuyến mãi!";
        if (err.response?.status === 404) {
          errorMessage = "Không tìm thấy dữ liệu khuyến mãi!";
        } else if (err.response?.status === 500) {
          errorMessage = "Lỗi server. Vui lòng thử lại!";
        } else if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        }
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetail();
  }, [productVariants, setValue, id]);

  const onSubmit = async (formData) => {
    const selectedVariants = formData.product_variant_id || [];
    // Kiểm tra biến thể đã được sử dụng trong khuyến mãi khác
    const usedVariantsInOther = selectedVariants.filter((variantId) =>
      usedVariantIds.includes(parseInt(variantId)) &&
      !customFormState.product_variant_id?.includes(variantId)
    );

    if (usedVariantsInOther.length > 0) {
      console.warn("Các biến thể đã được sử dụng trong khuyến mãi khác:", usedVariantsInOther);
      const confirmAdd = window.confirm(
        `Các biến thể sau đã được sử dụng trong khuyến mãi khác: ${usedVariantsInOther
          .map(id => productVariants.find(v => v.id === parseInt(id))?.sku || id)
          .join(', ')}. Bạn có muốn xóa chúng khỏi các khuyến mãi khác và thêm vào khuyến mãi này không?`
      );
      if (!confirmAdd) return;
    }

    setIsLoading(true);
    try {
      const payload = {
        promotion_id: parseInt(formData.promotion_id),
        product_variant_ids: selectedVariants.map(id => parseInt(id)),
        status: "Active",
      };
      console.log("Submitting payload:", payload);
      const response = await axios.put(`${Constants.DOMAIN_API}/admin/promotion/${id}`, payload);
      toast.success("Cập nhật khuyến mãi thành công!");
      setTimeout(() => {
        navigate("/admin/promotion-products/getAll");
      }, 1000);
    } catch (err) {
      console.error("Lỗi khi gửi dữ liệu:", err);
      let errorMessage = "Lỗi khi cập nhật khuyến mãi!";
      if (err.response?.status === 400) {
        errorMessage = err.response.data.message || "Dữ liệu không hợp lệ! Vui lòng kiểm tra lại.";
      } else if (err.response?.status === 404) {
        errorMessage = "Không tìm thấy khuyến mãi để chỉnh sửa!";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Hiển thị tất cả biến thể trong Select, chỉ giữ SKU và tên sản phẩm
  const availableVariants = productVariants.map((variant) => ({
    value: variant.id.toString(),
    label: `${variant.sku} (${variant.product?.name || 'Tên sản phẩm không xác định'})`
  }));

  return (
    <div className="card p-4">
      <h4>Cập nhật sản phẩm khuyến mãi</h4>
      {isLoading && <div className="text-center">Đang tải...</div>}
      {error && (
        <div className="alert alert-danger">
          {error}
          <button
            className="btn btn-secondary ms-2"
            onClick={() => navigate("/admin/promotion-products/getAll")}
          >
            Quay lại
          </button>
        </div>
      )}
      {!isLoading && !error && (
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-3">
            <label className="form-label">Khuyến mãi</label>
            <select
              className="form-select"
              {...register("promotion_id", { required: "Vui lòng chọn chương trình khuyến mãi" })}
              disabled
            >
              <option value="">-- Chọn khuyến mãi --</option>
              {promotions.map((promo) => (
                <option key={promo.id} value={promo.id.toString()}>
                  {promo.name} ({getPromotionStatus(promo.start_date, promo.end_date)})
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
              options={availableVariants}
              className="basic-multi-select"
              classNamePrefix="select"
              onChange={(selectedOptions) => {
                const selectedIds = selectedOptions
                  ? selectedOptions.map((opt) => opt.value)
                  : [];
                setValue("product_variant_id", selectedIds);
                setCustomFormState((prev) => ({
                  ...prev,
                  product_variant_id: selectedIds
                }));
                trigger("product_variant_id");
              }}
              value={availableVariants.filter((option) =>
                customFormState.product_variant_id?.includes(option.value)
              )}
            />
            <input
              type="hidden"
              {...register("product_variant_id", {
                required: "Vui lòng chọn ít nhất một biến thể sản phẩm",
                validate: (value) =>
                  value && value.length > 0 ||
                  "Vui lòng chọn ít nhất một biến thể sản phẩm"
              })}
            />
            {errors.product_variant_id && (
              <small className="text-danger">
                {errors.product_variant_id.message}
              </small>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? "Đang cập nhật..." : "Cập nhật"}
          </button>
        </form>
      )}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default PromotionProductEdit;