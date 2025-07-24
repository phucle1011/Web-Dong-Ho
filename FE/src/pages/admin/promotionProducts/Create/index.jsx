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

  const fetchPromotions = async () => {
    try {
      const res = await axios.get(`${Constants.DOMAIN_API}/admin/promotions/ss/all`);
      const data = Array.isArray(res.data.data) ? res.data.data : [];
      setPromotions(data);
    } catch (error) {
      console.error("Lỗi khi tải danh sách promotion:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      toast.error("Không thể tải danh sách khuyến mãi!");
    }
  };

  const fetchProductVariants = async () => {
    try {
      const res = await axios.get(`${Constants.DOMAIN_API}/admin/product-variants`);
      setProductVariants(res.data.data || []);
    } catch (error) {
      console.error("Lỗi khi tải danh sách biến thể sản phẩm:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      toast.error("Không thể tải danh sách biến thể sản phẩm!");
    }
  };

  const fetchUsedVariantsAndPromotions = async () => {
    try {
      const res = await axios.get(`${Constants.DOMAIN_API}/admin/promotion`, {
        params: { limit: 1000 },
      });
      const promotionProducts = Array.isArray(res.data.data) ? res.data.data : [];
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

      setUsedVariantIds(usedVariantIds);
      setUsedPromotionIds(usedPromotionIds);
    } catch (error) {
      console.error("Lỗi khi tải danh sách biến thể hoặc khuyến mãi đã sử dụng:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      toast.error("Không thể tải danh sách đã sử dụng!");
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      setIsFetching(true);
      try {
        await Promise.all([
          fetchPromotions(),
          fetchProductVariants(),
          fetchUsedVariantsAndPromotions(),
        ]);
      } catch (error) {
        console.error("Lỗi khi khởi tạo dữ liệu:", error);
      }
      setIsFetching(false);
    };
    initializeData();
  }, []);

  const onSubmit = async (data) => {
    if (isLoading) return; // Ngăn gửi trùng lặp

    const selectedPromotion = promotions.find((p) => p.id === parseInt(data.promotion_id));
    if (!selectedPromotion) {
      toast.error("Khuyến mãi không hợp lệ!");
      return;
    }

    if (data.product_variant_id.length > selectedPromotion.quantity) {
      toast.error(
        `Không thể thêm ${data.product_variant_id.length} biến thể. Khuyến mãi chỉ còn ${selectedPromotion.quantity} lượt khả dụng.`
      );
      return;
    }

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
        `Không thể thêm các biến thể sau vì chúng đã được sử dụng trong khuyến mãi khác: ${variantDetails}.`
      );
      return;
    }

    const payload = {
      promotion_id: parseInt(data.promotion_id),
      product_variant_id: data.product_variant_id.map((id) => parseInt(id)),
    };

    setIsLoading(true);
    try {
    
      const response = await axios.post(
        `${Constants.DOMAIN_API}/admin/promotion-products`,
        payload
      );

      toast.success("Thêm sản phẩm khuyến mãi thành công!");

      // Cập nhật lại dữ liệu
      await Promise.all([
        fetchPromotions(),
        fetchUsedVariantsAndPromotions(),
      ]);

      // Cập nhật danh sách đã sử dụng
      setUsedVariantIds((prev) => [...new Set([...prev, ...data.product_variant_id])]);
      setUsedPromotionIds((prev) => [...new Set([...prev, parseInt(data.promotion_id)])]);

      reset();
      setSelectedPromotionId(null);
      setSelectedVariantIds([]);
      if (onSuccess) onSuccess();
      setTimeout(() => {
        navigate("/admin/promotion-products/getAll");
      }, 1000);
    } catch (err) {
      console.error("Error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        payload,
      });
      let errorMessage = "Lỗi khi thêm sản phẩm khuyến mãi!";
      if (err.response?.status === 400) {
        errorMessage = err.response.data.error || "Dữ liệu không hợp lệ!";
      } else if (err.response?.status === 409) {
        errorMessage = err.response.data.error || "Cặp promotion-product đã tồn tại!";
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const availablePromotions = promotions.filter(
    (promo) => !usedPromotionIds.includes(promo.id) && promo.quantity > 0
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
      <span className="ml-2 text-gray-500">(Còn: {data.quantity})</span>
    </div>
  );

  const CustomSingleValue = ({ innerProps, label, data }) => (
    <div {...innerProps} className="flex items-center">
      <span>{data.name}</span>
      <span className={`ml-2 ${data.statusClass}`}>{data.status}</span>
      <span className="ml-2 text-gray-500">(Còn: {data.quantity})</span>
    </div>
  );

  const promotionOptions = availablePromotions.map((promo) => {
    const { status, className } = getPromotionStatus(promo.start_date, promo.end_date);
    return {
      value: promo.id,
      label: `${promo.name} (${status}, Còn: ${promo.quantity})`,
      name: promo.name,
      status,
      statusClass: className,
      quantity: promo.quantity,
    };
  });

  return (
    <div className="font mb-4">
      <h4>Thêm khuyến mãi</h4>
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
                setSelectedVariantIds([]);
                setValue("product_variant_id", []);
              }}
              placeholder="Chọn khuyến mãi..."
              isClearable
              isDisabled={promotionOptions.length === 0}
            />
            <input
              type="hidden"
              {...register("promotion_id", {
                required: "Vui lòng chọn khuyến mãi",
                validate: (value) => !isNaN(value) || "ID khuyến mãi không hợp lệ",
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
                const selectedPromotion = promotions.find(
                  (p) => p.id === parseInt(selectedPromotionId)
                );
                if (selectedPromotion && selectedIds.length > selectedPromotion.quantity) {
                  toast.error(
                    `Không thể chọn ${selectedIds.length} biến thể. Khuyến mãi chỉ còn ${selectedPromotion.quantity} lượt khả dụng.`
                  );
                  return;
                }
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
                  value && value.length > 0 && value.every((id) => !isNaN(id))
                    ? true
                    : "Vui lòng chọn ít nhất một biến thể sản phẩm hợp lệ",
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
              {selectedPromotionId &&
                ` Số lượng biến thể tối đa: ${
                  promotions.find((p) => p.id === parseInt(selectedPromotionId))?.quantity
                }`}
            </p>
          </div>

          <div className="mt-8 flex items-center gap-1">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-[#073272] text-white px-6 py-2 rounded hover:bg-[#052354] transition"
            >
              {isLoading ? "Đang thêm..." : "Thêm mới"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/admin/promotion-products/getAll")}
              className="bg-gray-200 text-gray-800 px-6 py-2 rounded hover:bg-gray-300 transition"
            >
              Quay lại
            </button>
          </div>
        </form>
      )}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default PromotionProductForm;