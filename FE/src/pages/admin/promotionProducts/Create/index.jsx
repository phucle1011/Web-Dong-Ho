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
  const [usedVariantIds, setUsedVariantIds] = useState([]);
  const [usedPromotionIds, setUsedPromotionIds] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [selectedPromotionId, setSelectedPromotionId] = useState(null);
  const [selectedVariantIds, setSelectedVariantIds] = useState([]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    trigger,
    formState: { errors },
  } = useForm();

  const getPromotionStatus = (startDate, endDate) => {
    if (!startDate || !endDate) return { status: "Không xác định", className: "text-gray-500" };
    const currentDate = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (currentDate < start) {
      return { status: "Sắp bắt đầu", className: "text-blue-500" };
    }
    if (currentDate <= end) {
      return { status: "Đang hoạt động", className: "text-green-500" };
    }
    return { status: "Đã kết thúc", className: "text-gray-500" };
  };

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const res = await axios.get(
          `${Constants.DOMAIN_API}/admin/promotions/ss/all`
        );
        const data = Array.isArray(res.data.data) ? res.data.data : [];
        setPromotions(data);
      } catch (error) {
        console.error("Lỗi khi tải danh sách promotion:", error);
        toast.error("Không thể tải danh sách khuyến mãi!");
      }
    };

    const fetchProductVariants = async () => {
      try {
        const res = await axios.get(
          `${Constants.DOMAIN_API}/admin/product-variants`
        );
        setProductVariants(res.data.data || []);
      } catch (error) {
        console.error("Lỗi khi tải danh sách biến thể sản phẩm:", error);
        toast.error("Không thể tải danh sách biến thể sản phẩm!");
      }
    };

    const fetchUsedVariantsAndPromotions = async () => {
      try {
        const res = await axios.get(`${Constants.DOMAIN_API}/admin/promotion`, {
          params: { limit: 1000 },
        });
        const promotionProducts = Array.isArray(res.data.data)
          ? res.data.data
          : [];
        const usedVariantIds = [
          ...new Set(
            promotionProducts
              .filter((item) => item.product_variant_id && !isNaN(item.product_variant_id))
              .map((item) => item.product_variant_id)
          ),
        ];
        const usedPromotionIds = [
          ...new Set(
            promotionProducts
              .filter((item) => item.promotion_id && !isNaN(item.promotion_id))
              .map((item) => item.promotion_id)
          ),
        ];
        console.log("Used promotion IDs:", usedPromotionIds);
        setUsedVariantIds(usedVariantIds);
        setUsedPromotionIds(usedPromotionIds);
      } catch (error) {
        console.error("Lỗi khi tải danh sách biến thể hoặc khuyến mãi đã sử dụng:", error);
        toast.error("Không thể tải danh sách đã sử dụng!");
      } finally {
        setIsFetching(false);
      }
    };

    fetchPromotions();
    fetchProductVariants();
    fetchUsedVariantsAndPromotions();
  }, []);

  const onSubmit = async (data) => {
    const usedVariants = data.product_variant_id.filter((id) =>
      usedVariantIds.includes(parseInt(id))
    );

    if (usedVariants.length > 0) {
      const variantDetails = usedVariants
        .map((id) => {
          const variant = productVariants.find((v) => v.id === parseInt(id));
          return variant
            ? `${variant.sku} (${variant.product?.name || "Tên không xác định"})`
            : id;
        })
        .join(", ");
      toast.error(
        `Không thể thêm các biến thể sau vì chúng đã được sử dụng trong khuyến mãi khác: ${variantDetails}. Mỗi biến thể chỉ được áp dụng cho một khuyến mãi.`
      );
      return;
    }

    const payload = {
      promotion_id: parseInt(data.promotion_id),
      product_variant_id: data.product_variant_id.map((id) => parseInt(id)),
    };

    setIsLoading(true);
    try {
      console.log("Submitting payload:", payload);
      await axios.post(
        `${Constants.DOMAIN_API}/admin/promotion-products`,
        payload
      );
      toast.success("Thêm sản phẩm khuyến mãi thành công!");
      reset();
      setUsedVariantIds((prev) => [...new Set([...prev, ...data.product_variant_id])]);
      setUsedPromotionIds((prev) => [...new Set([...prev, parseInt(data.promotion_id)])]);
      setSelectedPromotionId(null);
      setSelectedVariantIds([]);
      if (onSuccess) onSuccess();
      setTimeout(() => {
        navigate("/admin/promotion-products/getAll");
      }, 1000);
    } catch (err) {
      console.error("Lỗi khi thêm sản phẩm khuyến mãi:", err);
      let errorMessage = "Lỗi khi thêm sản phẩm khuyến mãi!";
      if (err.response?.status === 400) {
        errorMessage = err.response.data.message || "Dữ liệu không hợp lệ!";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const availablePromotions = promotions.filter(
    (promo) => !usedPromotionIds.includes(promo.id)
  );

  const availableVariants = productVariants
    .filter(
      (variant) =>
        !usedVariantIds.includes(variant.id) &&
        !selectedVariantIds.includes(variant.id)
    )
    .map((variant) => ({
      value: variant.id,
      label: `${variant.sku} (${variant.product?.name || "Tên SP không xác định"})`,
    }));

  const CustomOption = ({ innerProps, label, data }) => (
    <div
      {...innerProps}
      className="flex items-center px-2 py-1 hover:bg-gray-100 cursor-pointer"
    >
      <span>{data.name}</span>
      <span className={`ml-2 ${data.statusClass}`}>{data.status}</span>
    </div>
  );

  const CustomSingleValue = ({ innerProps, label, data }) => (
    <div {...innerProps} className="flex items-center">
      <span>{data.name}</span>
      <span className={`ml-2 ${data.statusClass}`}>{data.status}</span>
    </div>
  );

  const promotionOptions = availablePromotions.map((promo) => {
    const { status, className } = getPromotionStatus(promo.start_date, promo.end_date);
    return {
      value: promo.id,
      label: `${promo.name} (${status})`,
      name: promo.name,
      status,
      statusClass: className,
    };
  });

  return (
    <div className="card p-4">
      <h4>Thêm mới sản phẩm khuyến mãi</h4>
      {isFetching && <div className="text-center">Đang tải dữ liệu...</div>}
      {isLoading && <div className="text-center">Đang xử lý...</div>}
      {!isFetching && (
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-3">
            <label className="form-label">Khuyến mãi</label>
            <Select
              options={promotionOptions}
              className="basic-single-select"
              classNamePrefix="select"
              components={{ Option: CustomOption, SingleValue: CustomSingleValue }}
              onChange={(selectedOption) => {
                const value = selectedOption ? selectedOption.value : "";
                setSelectedPromotionId(value);
                setValue("promotion_id", value);
                trigger("promotion_id");
              }}
              placeholder="Chọn khuyến mãi..."
              isClearable
              isDisabled={promotionOptions.length === 0}
            />
            <input
              type="hidden"
              {...register("promotion_id", {
                required: "Vui lòng chọn khuyến mãi",
              })}
            />
            {errors.promotion_id && (
              <small className="text-danger">{errors.promotion_id.message}</small>
            )}
            {promotionOptions.length === 0 && (
              <small className="text-warning">
                Không có khuyến mãi nào khả dụng. Vui lòng tạo khuyến mãi mới hoặc kiểm tra các khuyến mãi đã sử dụng.
              </small>
            )}
          </div>

          <div className="mb-4">
            <label className="form-label mb-2">Chọn các biến thể sản phẩm</label>
            <Select
              isMulti
              options={availableVariants}
              className="basic-multi-select"
              classNamePrefix="select"
              onChange={(selectedOptions) => {
                const selectedIds = selectedOptions
                  ? selectedOptions.map((opt) => opt.value)
                  : [];
                setSelectedVariantIds(selectedIds);
                setValue("product_variant_id", selectedIds);
                trigger("product_variant_id");
              }}
              isDisabled={!selectedPromotionId}
              placeholder="Chọn các biến thể sản phẩm..."
            />
            <input
              type="hidden"
              {...register("product_variant_id", {
                required: "Vui lòng chọn ít nhất một biến thể sản phẩm",
                validate: (value) =>
                  value && value.length > 0 ||
                  "Vui lòng chọn ít nhất một biến thể sản phẩm",
              })}
            />
            {errors.product_variant_id && (
              <small className="text-danger">{errors.product_variant_id.message}</small>
            )}
            {availableVariants.length === 0 && (
              <small className="text-warning">
                Không có biến thể nào khả dụng. Tất cả biến thể đã được sử dụng hoặc đã chọn.
              </small>
            )}
            <p className="text-xs text-gray-600 mt-2">
              Chỉ có thể chọn các biến thể chưa được sử dụng trong bất kỳ khuyến mãi nào.
            </p>
          </div>

          <div className="d-flex gap-2">
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? "Đang thêm..." : "Thêm mới"}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate("/admin/promotion-products/getAll")}
            >
              Quay về
            </button>
          </div>
        </form>
      )}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default PromotionProductForm;