import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Constants from "../../../../Constants.jsx";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PromotionProductEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [productVariants, setProductVariants] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [usedVariantIds, setUsedVariantIds] = useState([]);
  const [existingVariantIds, setExistingVariantIds] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [customFormState, setCustomFormState] = useState({ product_variant_id: [] });
  const [variantPromotions, setVariantPromotions] = useState({});
  const [selectedPromotion, setSelectedPromotion] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    formState: { errors },
  } = useForm();

  const getPromotionStatus = (startDate, endDate) => {
    if (!startDate || !endDate) return "Không xác định";
    try {
      const currentDate = new Date(); // 02:07 AM +07, 13/07/2025
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return "Không xác định";
      }
      if (currentDate < start) return "Sắp bắt đầu";
      if (currentDate <= end) return "Đang hoạt động";
      return "Đã kết thúc";
    } catch (err) {
      console.error("Lỗi khi tính trạng thái khuyến mãi:", err);
      return "Không xác định";
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (!id || isNaN(id)) {
          throw new Error("ID khuyến mãi không hợp lệ!");
        }

        const promoRes = await axios.get(`${Constants.DOMAIN_API}/admin/promotions/ss/all`);
        const promoData = Array.isArray(promoRes.data.data) ? promoRes.data.data : [];
        if (!promoData.length) {
          throw new Error("Dữ liệu khuyến mãi không hợp lệ");
        }
        const sortedPromotions = promoData.sort((a, b) => {
          const statusA = getPromotionStatus(a.start_date, a.end_date);
          const statusB = getPromotionStatus(b.start_date, b.end_date);
          const order = { "Đang hoạt động": 1, "Sắp bắt đầu": 2, "Đã kết thúc": 3, "Không xác định": 4 };
          return order[statusA] - order[statusB];
        });
        setPromotions(sortedPromotions);

        const variantRes = await axios.get(`${Constants.DOMAIN_API}/admin/product-variants`);
        const variants = Array.isArray(variantRes.data.data) ? variantRes.data.data : [];
        if (!variants.length) {
          throw new Error("Dữ liệu biến thể sản phẩm không hợp lệ");
        }
        setProductVariants(variants);

        const promotionProductsRes = await axios.get(`${Constants.DOMAIN_API}/admin/promotion`);
        const promotionProducts = Array.isArray(promotionProductsRes.data.data)
          ? promotionProductsRes.data.data
          : [];

        const usedIds = [...new Set(
          promotionProducts
            .filter((item) => item.product_variant_id && !isNaN(item.product_variant_id))
            .map((item) => item.product_variant_id)
        )];
        setUsedVariantIds(usedIds);

        const promotionsByVariant = {};
        promotionProducts.forEach((item) => {
          if (item.product_variant_id && item.promotion) {
            promotionsByVariant[item.product_variant_id] = {
              promotion_id: item.promotion_id,
              name: item.promotion.name || "Không rõ tên",
              start_date: item.promotion.start_date,
              end_date: item.promotion.end_date,
              status: getPromotionStatus(item.promotion.start_date, item.promotion.end_date),
            };
          }
        });
        variants.forEach((variant) => {
          if (!promotionsByVariant[variant.id]) {
            promotionsByVariant[variant.id] = null;
          }
        });
        setVariantPromotions(promotionsByVariant);

        console.log("fetchData - promotions:", sortedPromotions);
        console.log("fetchData - productVariants:", variants);
        console.log("fetchData - usedVariantIds:", usedIds);
        console.log("fetchData - variantPromotions:", promotionsByVariant);
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu ban đầu:", err);
        setError(err.message || "Không thể tải dữ liệu ban đầu! Vui lòng thử lại.");
        toast.error(err.message || "Không thể tải dữ liệu ban đầu! Vui lòng thử lại.");
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
      setError(null);
      try {
        const res = await axios.get(`${Constants.DOMAIN_API}/admin/promotion?promotion_id=${id}`);
        const data = Array.isArray(res.data.data) ? res.data.data : [];
        console.log("fetchDetail - raw API response:", res.data);
        console.log("fetchDetail - filtered data:", data);

        if (!data.length) {
          throw new Error("Không tìm thấy dữ liệu khuyến mãi!");
        }

        const productVariantIds = [...new Set(
          data
            .filter((item) => item.promotion_id === parseInt(id) && item.product_variant_id && !isNaN(item.product_variant_id))
            .map((item) => item.product_variant_id.toString())
        )];

        console.log("fetchDetail - productVariantIds:", productVariantIds);

        if (productVariantIds.length === 0) {
          console.log(`Không tìm thấy biến thể nào cho promotion_id ${id}`);
        }

        const expectedVariantCount = data[0]?.promotion?.variant_count || 0;
        if (productVariantIds.length !== expectedVariantCount && expectedVariantCount > 0) {
          console.log(
            `Cảnh báo: Số lượng biến thể (${productVariantIds.length}) không khớp với variant_count (${expectedVariantCount}) cho promotion_id ${id}`
          );
        }

        setExistingVariantIds(productVariantIds);
        setCustomFormState({ product_variant_id: productVariantIds });
        setValue("product_variant_id", productVariantIds);

        const promotion = promotions.find((p) => p.id === parseInt(id));
        if (promotion) {
          setSelectedPromotion(promotion);
          setValue("promotion_id", id.toString());
        } else if (data[0]?.promotion) {
          setSelectedPromotion(data[0].promotion);
          setValue("promotion_id", id.toString());
        } else {
          throw new Error(`Không tìm thấy khuyến mãi với ID ${id}`);
        }

        trigger("product_variant_id");

        console.log("fetchDetail - promotion_id:", id);
        console.log("fetchDetail - existingVariantIds:", productVariantIds);
        console.log("fetchDetail - customFormState:", { product_variant_id: productVariantIds });
        console.log("fetchDetail - promotion status:", getPromotionStatus(promotion?.start_date || data[0]?.promotion?.start_date, promotion?.end_date || data[0]?.promotion?.end_date));
      } catch (err) {
        console.error("Lỗi khi tải chi tiết khuyến mãi:", err);
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
  }, [productVariants, setValue, id, trigger, promotions]);

  // Đồng bộ customFormState với existingVariantIds
  useEffect(() => {
    if (existingVariantIds.length !== customFormState.product_variant_id.length) {
      const newVariantIds = [...existingVariantIds];
      setCustomFormState({ product_variant_id: newVariantIds });
      setValue("product_variant_id", newVariantIds);
      trigger("product_variant_id");
      console.log("Sync - existingVariantIds:", existingVariantIds);
      console.log("Sync - customFormState:", { product_variant_id: newVariantIds });
    }
  }, [existingVariantIds, setValue, trigger]);

  const onSubmit = async (formData) => {
    const selectedVariants = formData.product_variant_id || [];

    const usedVariantsInOther = selectedVariants.filter(
      (variantId) => !existingVariantIds.includes(variantId) && usedVariantIds.includes(parseInt(variantId))
    );

    if (usedVariantsInOther.length > 0) {
      const variantDetails = usedVariantsInOther
        .map((id) => {
          const variant = productVariants.find((v) => v.id === parseInt(id));
          return variant
            ? `${variant.sku} (${variant.product?.name || "Tên không xác định"})`
            : id;
        })
        .join(", ");
      const confirmAdd = window.confirm(
        `Các biến thể sau đã được sử dụng trong khuyến mãi khác: ${variantDetails}. Bạn có muốn xóa chúng khỏi các khuyến mãi khác và thêm vào khuyến mãi này không?`
      );
      if (!confirmAdd) return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const allVariantIds = selectedVariants.map(id => parseInt(id));

      const payload = {
        promotion_id: parseInt(formData.promotion_id),
        product_variant_ids: allVariantIds,
        status: "Active",
      };

      console.log("Submitting payload:", payload);
      await axios.put(`${Constants.DOMAIN_API}/admin/promotion/${id}`, payload);

      // Cập nhật existingVariantIds sau khi gửi thành công
      setExistingVariantIds(selectedVariants);
      setCustomFormState({ product_variant_id: selectedVariants });
      setValue("product_variant_id", selectedVariants);

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
      } else if (err.response?.status === 409) {
        errorMessage = "Một hoặc nhiều biến thể đã được sử dụng trong khuyến mãi khác!";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const availableVariants = productVariants.map((variant) => ({
    value: variant.id.toString(),
    label: `${variant.sku} (${variant.product?.name || 'Tên sản phẩm không xác định'}) - ${
      variantPromotions[variant.id]
        ? `Đang áp dụng cho ${variantPromotions[variant.id].name} (${variantPromotions[variant.id].status})`
        : 'Chưa được sử dụng'
    }`,
    isDisabled: usedVariantIds.includes(variant.id) && !existingVariantIds.includes(variant.id.toString()),
  }));

  // Debug trước khi render
  console.log("Render - customFormState:", customFormState);
  console.log("Render - existingVariantIds:", existingVariantIds);
  console.log("Render - availableVariants:", availableVariants);
  console.log("Render - selected values for Select:", availableVariants.filter((option) =>
    customFormState.product_variant_id?.includes(option.value)
  ));

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
              value={id}
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
            {selectedPromotion && (
              <p className="mt-2 text-sm text-gray-600">
                Tên khuyến mãi: <strong>{selectedPromotion.name}</strong> (Trạng thái: {getPromotionStatus(selectedPromotion.start_date, selectedPromotion.end_date)})
              </p>
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
                setValue("product_variant_id", selectedIds);
                setCustomFormState({ product_variant_id: selectedIds });
                trigger("product_variant_id");
                console.log("Select onChange - selectedIds:", selectedIds);
                console.log("Select onChange - updatedVariantIds:", selectedIds);
              }}
              value={availableVariants.filter((option) =>
                customFormState.product_variant_id?.includes(option.value)
              )}
              placeholder="Chọn hoặc thêm biến thể sản phẩm..."
            />
            <input
              type="hidden"
              {...register("product_variant_id")}
            />
            {errors.product_variant_id && (
              <small className="text-danger">{errors.product_variant_id.message}</small>
            )}
         
          </div>

          <div className="mb-4">
            <h5 className="text-lg font-semibold mb-2">Các biến thể đang được áp dụng cho khuyến mãi này</h5>
            {customFormState.product_variant_id?.length > 0 ? (
              <table className="w-full table-auto border border-collapse border-gray-300">
                <thead>
                  <tr>
                    <th className="border p-2">SKU biến thể</th>
                    <th className="border p-2">Tên sản phẩm</th>
                    <th className="border p-2">Khuyến mãi liên quan</th>
                    <th className="border p-2">Trạng thái</th>
                    <th className="border p-2">Ngày bắt đầu</th>
                    <th className="border p-2">Ngày kết thúc</th>
                  </tr>
                </thead>
                <tbody>
                  {customFormState.product_variant_id.map((variantId) => {
                    const variant = productVariants.find((v) => v.id === parseInt(variantId));
                    const promo = variantPromotions[variantId];
                    return (
                      <tr key={variantId}>
                        <td className="border p-2">{variant?.sku || "Không xác định"}</td>
                        <td className="border p-2">{variant?.product?.name || "Không xác định"}</td>
                        <td className="border p-2">
                          {promo && promo.promotion_id !== parseInt(id)
                            ? promo.name
                            : selectedPromotion?.name || "Khuyến mãi hiện tại"}
                        </td>
                        <td className="border p-2">
                          {promo && promo.promotion_id !== parseInt(id)
                            ? promo.status
                            : getPromotionStatus(selectedPromotion?.start_date, selectedPromotion.end_date)}
                        </td>
                        <td className="border p-2">
                          {promo && promo.promotion_id !== parseInt(id)
                            ? new Date(promo.start_date).toLocaleDateString("vi-VN")
                            : selectedPromotion?.start_date
                              ? new Date(selectedPromotion.start_date).toLocaleDateString("vi-VN")
                              : "-"}
                        </td>
                        <td className="border p-2">
                          {promo && promo.promotion_id !== parseInt(id)
                            ? new Date(promo.end_date).toLocaleDateString("vi-VN")
                              : selectedPromotion?.end_date
                              ? new Date(selectedPromotion.end_date).toLocaleDateString("vi-VN")
                              : "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <p className="text-sm text-gray-600">
                Không có biến thể nào được áp dụng cho khuyến mãi này. Vui lòng chọn biến thể mới trong mục trên hoặc kiểm tra dữ liệu backend nếu cần.
              </p>
            )}
          </div>

          <div className="mt-8 flex items-center gap-1">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-[#073272] text-white px-6 py-2 rounded hover:bg-[#052354] transition"
            >
              {isLoading ? "Đang cập nhật..." : "Cập nhật"}
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

export default PromotionProductEdit;