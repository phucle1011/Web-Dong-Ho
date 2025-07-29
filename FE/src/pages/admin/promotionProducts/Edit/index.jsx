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
  const [customFormState, setCustomFormState] = useState({
    product_variant_id: [],
  });
  const [variantPromotions, setVariantPromotions] = useState({});
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [showTooltip, setShowTooltip] = useState(null);
  const [selectedVariantIds, setSelectedVariantIds] = useState([]);
  const [variantQuantities, setVariantQuantities] = useState({});

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
      const currentDate = new Date();
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

  const getStatusDisplayName = (status) =>
    ({
      "Đang hoạt động": "Đang diễn ra",
      "Sắp bắt đầu": "Sắp diễn ra",
      "Đã kết thúc": "Đã hết hạn",
      "Không xác định": "Vô hiệu hóa",
    }[status] || "Vô hiệu hóa");

  const getStatusBadgeClass = (status) =>
    ({
      "Đang hoạt động": "bg-green-100 text-green-800",
      "Sắp bắt đầu": "bg-blue-100 text-blue-800",
      "Đã kết thúc": "bg-red-100 text-red-800",
      "Không xác định": "bg-gray-200 text-gray-800",
    }[status] || "bg-gray-200 text-gray-800");

  const formatDiscountValue = (discountValue, discountType) => {
    if (discountValue === null || discountValue === undefined) return "-";
    try {
      const value = parseFloat(discountValue);
      if (isNaN(value)) return "-";
      return discountType === "percentage"
        ? `${value.toFixed(2)}%`
        : `${value.toLocaleString("vi-VN")} VNĐ`;
    } catch (err) {
      console.error("Lỗi khi định dạng discountValue:", err);
      return "-";
    }
  };

  const truncateProductName = (name, maxLength = 30) => {
    if (!name || typeof name !== "string") return "Không xác định";
    if (name.length <= maxLength) return name;
    return `${name.substring(0, maxLength)}...`;
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (!id || isNaN(id)) {
          throw new Error("ID khuyến mãi không hợp lệ!");
        }

        const promoRes = await axios.get(
          `${Constants.DOMAIN_API}/admin/promotions/ss/all`
        );
        const promoData = Array.isArray(promoRes.data.data)
          ? promoRes.data.data
          : [];
        if (!promoData.length) {
          throw new Error("Dữ liệu khuyến mãi không hợp lệ");
        }
        const sortedPromotions = promoData.sort((a, b) => {
          const statusA = getPromotionStatus(a.start_date, a.end_date);
          const statusB = getPromotionStatus(b.start_date, b.end_date);
          const order = {
            "Đang hoạt động": 1,
            "Sắp bắt đầu": 2,
            "Đã kết thúc": 3,
            "Không xác định": 4,
          };
          return order[statusA] - order[statusB];
        });
        setPromotions(sortedPromotions);

        const variantRes = await axios.get(
          `${Constants.DOMAIN_API}/admin/product-variants`
        );
        const variants = Array.isArray(variantRes.data.data)
          ? variantRes.data.data
          : [];
        if (!variants.length) {
          throw new Error("Dữ liệu biến thể sản phẩm không hợp lệ");
        }
        setProductVariants(variants);

        const promotionProductsRes = await axios.get(
          `${Constants.DOMAIN_API}/admin/promotion`
        );
        const promotionProducts = Array.isArray(promotionProductsRes.data.data)
          ? promotionProductsRes.data.data
          : [];

        const usedIds = [
          ...new Set(
            promotionProducts
              .filter(
                (item) =>
                  item.product_variant_id && !isNaN(item.product_variant_id)
              )
              .map((item) => item.product_variant_id)
          ),
        ];
        setUsedVariantIds(usedIds);

        const promotionsByVariant = {};
        promotionProducts.forEach((item) => {
          if (item.product_variant_id && item.promotion) {
            promotionsByVariant[item.product_variant_id] = {
              promotion_id: item.promotion_id,
              name: item.promotion.name || "Không rõ tên",
              start_date: item.promotion.start_date,
              end_date: item.promotion.end_date,
              status: getPromotionStatus(
                item.promotion.start_date,
                item.promotion.end_date
              ),
              discount_value: item.promotion.discount_value,
              discount_type: item.promotion.discount_type,
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
        setError(
          err.message || "Không thể tải dữ liệu ban đầu! Vui lòng thử lại."
        );
        toast.error(
          err.message || "Không thể tải dữ liệu ban đầu! Vui lòng thử lại."
        );
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
        const res = await axios.get(
          `${Constants.DOMAIN_API}/admin/promotion?promotion_id=${id}`
        );
        const data = Array.isArray(res.data.data) ? res.data.data : [];

        const variantIds = data.map((item) =>
          item.product_variant_id.toString()
        );
        const quantities = {};
        data.forEach((item) => {
          quantities[item.product_variant_id] = item.variant_quantity;
        });
        setSelectedVariantIds(variantIds);
        setVariantQuantities(quantities);

        console.log("fetchDetail - raw API response:", res.data);

        if (!data.length) {
          throw new Error("Không tìm thấy dữ liệu khuyến mãi!");
        }

        const productVariantIds = [
          ...new Set(
            data
              .filter(
                (item) =>
                  item.promotion_id === parseInt(id) &&
                  item.product_variant_id &&
                  !isNaN(item.product_variant_id)
              )
              .map((item) => item.product_variant_id.toString())
          ),
        ];

        const expectedVariantCount = data[0]?.promotion?.variant_count || 0;
        if (
          productVariantIds.length !== expectedVariantCount &&
          expectedVariantCount > 0
        ) {
          console.warn(
            `Số lượng biến thể (${productVariantIds.length}) không khớp với variant_count (${expectedVariantCount}) cho promotion_id ${id}`
          );
        }

        setExistingVariantIds(productVariantIds);
        setCustomFormState({ product_variant_id: productVariantIds });
        setValue("product_variant_id", productVariantIds);

        const promotion =
          promotions.find((p) => p.id === parseInt(id)) || data[0]?.promotion;
        if (promotion) {
          setSelectedPromotion({
            ...promotion,
            variant_count: expectedVariantCount,
          });
          setValue("promotion_id", id.toString());
        } else {
          throw new Error(`Không tìm thấy khuyến mãi với ID ${id}`);
        }

        trigger("product_variant_id");

        console.log("fetchDetail - promotion_id:", id);
        console.log("fetchDetail - productVariantIds:", productVariantIds);
        console.log(
          "fetchDetail - expectedVariantCount:",
          expectedVariantCount
        );
        console.log("fetchDetail - customFormState:", {
          product_variant_id: productVariantIds,
        });
        console.log("fetchDetail - selectedPromotion:", promotion);
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

  useEffect(() => {
    if (
      existingVariantIds.length !== customFormState.product_variant_id.length
    ) {
      setCustomFormState({ product_variant_id: existingVariantIds });
      setValue("product_variant_id", existingVariantIds);
      trigger("product_variant_id");
      console.log("Sync - existingVariantIds:", existingVariantIds);
      console.log("Sync - customFormState:", {
        product_variant_id: existingVariantIds,
      });
    }
  }, [existingVariantIds, setValue, trigger]);

  const onSubmit = async (formData) => {
    const selectedVariants = formData.product_variant_id || [];
    const selectedPromotion = promotions.find(
      (p) => p.id === parseInt(formData.promotion_id)
    );

    const existingVariantCount = existingVariantIds.length;
    const newVariantCount = selectedVariants.length;
    const variantCountChange = newVariantCount - existingVariantCount;

    if (
      variantCountChange > 0 &&
      selectedPromotion.quantity < variantCountChange
    ) {
      toast.error(
        `Không thể thêm ${variantCountChange} biến thể. Khuyến mãi chỉ còn ${selectedPromotion.quantity} lượt khả dụng.`
      );
      return;
    }
    // Kiểm tra nếu có biến thể nào nhập số lượng > tồn kho
    const overStockVariants = selectedVariantIds.filter((id) => {
      const variant = productVariants.find((v) => v.id === parseInt(id));
      const quantity = parseInt(variantQuantities[id]) || 0;
      return variant && quantity > variant.stock;
    });

    if (overStockVariants.length > 0) {
      const names = overStockVariants
        .map((id) => {
          const variant = productVariants.find((v) => v.id === parseInt(id));
          return `${variant?.sku} (${variant?.product?.name || "Không rõ"})`;
        })
        .join(", ");
      toast.error(`Số lượng vượt tồn kho cho: ${names}`);
      return;
    }

    const usedVariantsInOther = selectedVariants.filter(
      (variantId) =>
        !existingVariantIds.includes(variantId) &&
        usedVariantIds.includes(parseInt(variantId))
    );

    if (usedVariantsInOther.length > 0) {
      const variantDetails = usedVariantsInOther
        .map((id) => {
          const variant = productVariants.find((v) => v.id === parseInt(id));
          return variant
            ? `${variant.sku} (${
                variant.product?.name || "Tên không xác định"
              })`
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
      const allVariantIds = selectedVariants.map((id) => parseInt(id));

      const payload = {
        promotion_id: parseInt(id),
        products: selectedVariantIds.map((variantId) => ({
          product_variant_id: parseInt(variantId),
          variant_quantity: parseInt(variantQuantities[variantId]) || 0,
        })),
      };

      console.log("Submitting payload:", payload);
      await axios.put(`${Constants.DOMAIN_API}/admin/promotion/${id}`, payload);

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
        errorMessage =
          err.response.data.error ||
          "Dữ liệu không hợp lệ! Vui lòng kiểm tra lại.";
      } else if (err.response?.status === 404) {
        errorMessage = "Không tìm thấy khuyến mãi để chỉnh sửa!";
      } else if (err.response?.status === 409) {
        errorMessage =
          "Một hoặc nhiều biến thể đã được sử dụng trong khuyến mãi khác!";
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const availableVariants = productVariants.map((variant) => ({
    value: variant.id.toString(),
    label: `${variant.sku} (${truncateProductName(
      variant.product?.name,
      30
    )}) - ${
      variantPromotions[variant.id]
        ? `Đang áp dụng cho ${variantPromotions[variant.id].name} (${
            variantPromotions[variant.id].status
          })`
        : "Chưa được sử dụng"
    }`,
    isDisabled:
      usedVariantIds.includes(variant.id) &&
      !existingVariantIds.includes(variant.id.toString()),
  }));

  console.log("Render - customFormState:", customFormState);
  console.log("Render - existingVariantIds:", existingVariantIds);
  console.log("Render - availableVariants:", availableVariants);
  console.log("Render - selectedPromotion:", selectedPromotion);

  return (
    <div className="card p-4">
      <style>
        {`
          .truncate-text {
            max-width: 200px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            position: relative;
          }
          .tooltip {
            visibility: hidden;
            background-color: #333;
            color: #fff;
            text-align: center;
            border-radius: 4px;
            padding: 8px;
            position: absolute;
            z-index: 10;
            top: 100%;
            left: 0;
            min-width: 200px;
            opacity: 0;
            transition: opacity 0.2s;
          }
          .truncate-text:hover .tooltip {
            visibility: visible;
            opacity: 1;
          }
        `}
      </style>
      <h4>Cập nhật khuyến mãi</h4>
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
            <label className="form-label">Khuyến mãi *</label>
            <select
              className="form-select"
              {...register("promotion_id", {
                required: "Vui lòng chọn chương trình khuyến mãi",
              })}
              disabled
              value={id}
            >
              <option value="">-- Chọn khuyến mãi --</option>
              {promotions.map((promo) => (
                <option key={promo.id} value={promo.id.toString()}>
                  {promo.name} (
                  {getPromotionStatus(promo.start_date, promo.end_date)})
                </option>
              ))}
            </select>
            {errors.promotion_id && (
              <small className="text-danger">
                {errors.promotion_id.message}
              </small>
            )}
            {selectedPromotion && (
              <p className="mt-2 text-sm text-gray-600">
                Tên khuyến mãi: <strong>{selectedPromotion.name}</strong> (Trạng
                thái:{" "}
                {getStatusDisplayName(
                  getPromotionStatus(
                    selectedPromotion.start_date,
                    selectedPromotion.end_date
                  )
                )}
                )
                <br />
                Tổng lượt áp dụng:{" "}
                <strong>
                  {Object.values(variantQuantities).reduce(
                    (acc, val) => acc + Number(val || 0),
                    0
                  )}
                </strong>
                <br />
                Số lượng biến thể:{" "}
                <strong>{selectedPromotion.variant_count || 0}</strong>
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="form-label mb-2">
              Chọn các biến thể sản phẩm *
            </label>
            {/* <Select
  isMulti
  options={availableVariants}
  className="basic-multi-select"
  classNamePrefix="select"
  onChange={(selectedOptions) => {
    const selectedIds = selectedOptions.map(opt => opt.value);
    setCustomFormState({ product_variant_id: selectedIds });
    setSelectedVariantIds(selectedIds);
    const newQuantities = {};
    selectedIds.forEach(id => {
      newQuantities[id] = variantQuantities[id] || 1;
    });
    setVariantQuantities(newQuantities);
    setValue("product_variant_id", selectedIds);
    trigger("product_variant_id");
  }}
  value={availableVariants.filter(opt =>
    customFormState.product_variant_id?.includes(opt.value)
  )}
  placeholder="Chọn hoặc thêm biến thể sản phẩm..."
/> */}

            {errors.product_variant_id && (
              <small className="text-danger">
                {errors.product_variant_id.message}
              </small>
            )}
          </div>
          <Select
            isMulti
            options={availableVariants}
            value={availableVariants.filter((opt) =>
              selectedVariantIds.includes(opt.value)
            )}
            onChange={(selected) => {
              const ids = selected.map((opt) => opt.value);
              setSelectedVariantIds(ids);
              const newQuantities = {};
              ids.forEach((id) => {
                newQuantities[id] = variantQuantities[id] || 1;
              });
              setVariantQuantities(newQuantities);
            }}
          />
          {/* --- Hiển thị table --- */}
          {selectedVariantIds.length > 0 && (
            <div className="mt-6">
              <label className="form-label block mb-2 text-lg font-semibold">
                Nhập số lượng áp dụng cho từng biến thể:
              </label>
              <div className="overflow-x-auto border rounded shadow-sm">
                <table className="w-full table-auto text-sm text-left text-gray-800">
                  <thead className="bg-gray-100 sticky top-0 z-0">
                    <tr>
                      <th className="px-4 py-2 border text-center">#</th>
                      <th className="px-4 py-2 border">SKU</th>
                      <th className="px-4 py-2 border">Tên sản phẩm</th>
                      <th className="px-4 py-2 border text-center">Tồn kho</th>
                      <th className="px-4 py-2 border text-center">
                        Số lượng áp dụng
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedVariantIds.map((id, index) => {
                      const variant = productVariants.find(
                        (v) => v.id === parseInt(id)
                      );
                      const stock = variant?.stock || 1;

                      return (
                        <tr
                          key={id}
                          className="bg-white hover:bg-gray-50 transition"
                        >
                          <td className="px-4 py-2 border text-center">
                            {index + 1}
                          </td>
                          <td className="px-4 py-2 border">{variant?.sku}</td>
                          <td className="px-4 py-2 border">
                            {variant?.product?.name || "Tên SP không xác định"}
                          </td>
                          <td className="px-4 py-2 border text-center">
                            {stock}
                          </td>
                          <td className="px-4 py-2 border text-center">
                            <input
                              type="number"
                              min="1"
                              max={stock}
                              value={variantQuantities[id] || 1}
                              onWheel={(e) => e.target.blur()}
                              onKeyDown={(e) => {
                                const currentVal = variantQuantities[id] || 1;
                                if (e.key === "ArrowUp") {
                                  if (currentVal >= stock) {
                                    e.preventDefault();
                                    toast.warning(
                                      `Số lượng không được vượt quá tồn kho (${stock})!`
                                    );
                                  } else {
                                    setVariantQuantities((prev) => ({
                                      ...prev,
                                      [id]: currentVal + 1,
                                    }));
                                    e.preventDefault();
                                  }
                                }
                                if (e.key === "ArrowDown") {
                                  if (currentVal <= 1) {
                                    e.preventDefault();
                                    toast.warning("Số lượng tối thiểu là 1!");
                                  } else {
                                    setVariantQuantities((prev) => ({
                                      ...prev,
                                      [id]: currentVal - 1,
                                    }));
                                    e.preventDefault();
                                  }
                                }
                              }}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10);
                                if (isNaN(val) || val <= 0) {
                                  setVariantQuantities((prev) => ({
                                    ...prev,
                                    [id]: 1,
                                  }));
                                } else if (val > stock) {
                                  toast.warning(
                                    `Số lượng không được vượt quá tồn kho (${stock})!`
                                  );
                                } else {
                                  setVariantQuantities((prev) => ({
                                    ...prev,
                                    [id]: val,
                                  }));
                                }
                              }}
                              className="border px-2 py-1 w-24 rounded text-center"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {/* <div className="mb-4">
            <h5 className="text-lg font-semibold mb-2">
              Các biến thể đang được áp dụng cho khuyến mãi này
            </h5>
            {customFormState.product_variant_id?.length > 0 ? (
              <table className="w-full table-auto border border-collapse border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2">SKU biến thể</th>
                    <th className="border p-2">Tên sản phẩm</th>
                    <th className="border p-2">Khuyến mãi liên quan</th>
                    <th className="border p-2">Phần trăm</th>
                    <th className="border p-2">Trạng thái</th>
                    <th className="border p-2">Ngày bắt đầu</th>
                    <th className="border p-2">Ngày kết thúc</th>
                  </tr>
                </thead>
                <tbody>
                  {customFormState.product_variant_id.map((variantId) => {
                    const variant = productVariants.find(
                      (v) => v.id === parseInt(variantId)
                    );
                    const promo = variantPromotions[variantId];
                    const isCurrentPromotion =
                      !promo || promo.promotion_id === parseInt(id);
                    const status = isCurrentPromotion
                      ? getPromotionStatus(
                          selectedPromotion?.start_date,
                          selectedPromotion?.end_date
                        )
                      : promo?.status || "Không xác định";
                    const productName =
                      variant?.product?.name || "Không xác định";
                    const isTruncated = productName.length > 30;
                    return (
                      <tr key={variantId}>
                        <td className="border p-2">
                          {variant?.sku || "Không xác định"}
                        </td>
                        <td
                          className="border p-2 truncate-text"
                          onMouseEnter={() =>
                            isTruncated && setShowTooltip(variantId)
                          }
                          onMouseLeave={() => setShowTooltip(null)}
                        >
                          {truncateProductName(productName)}
                          {isTruncated && (
                            <span
                              className="tooltip"
                              style={{
                                visibility:
                                  showTooltip === variantId
                                    ? "visible"
                                    : "hidden",
                                opacity: showTooltip === variantId ? 1 : 0,
                              }}
                            >
                              {productName}
                            </span>
                          )}
                        </td>
                        <td className="border p-2">
                          {isCurrentPromotion
                            ? selectedPromotion?.name || "Khuyến mãi hiện tại"
                            : promo?.name || "Không xác định"}
                        </td>
                        <td className="border p-2">
                          {formatDiscountValue(
                            isCurrentPromotion
                              ? selectedPromotion?.discount_value
                              : promo?.discount_value,
                            isCurrentPromotion
                              ? selectedPromotion?.discount_type
                              : promo?.discount_type
                          )}
                        </td>
                        <td className="border p-2 text-center">
                          <span
                            className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(
                              status
                            )}`}
                          >
                            {getStatusDisplayName(status)}
                          </span>
                        </td>
                        <td className="border p-2">
                          {isCurrentPromotion
                            ? selectedPromotion?.start_date
                              ? new Date(
                                  selectedPromotion.start_date
                                ).toLocaleDateString("vi-VN")
                              : "-"
                            : promo?.start_date
                            ? new Date(promo.start_date).toLocaleDateString(
                                "vi-VN"
                              )
                            : "-"}
                        </td>
                        <td className="border p-2">
                          {isCurrentPromotion
                            ? selectedPromotion?.end_date
                              ? new Date(
                                  selectedPromotion.end_date
                                ).toLocaleDateString("vi-VN")
                              : "-"
                            : promo?.end_date
                            ? new Date(promo.end_date).toLocaleDateString(
                                "vi-VN"
                              )
                            : "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <p className="text-sm text-gray-600">
                Không có biến thể nào được áp dụng cho khuyến mãi này. Vui lòng
                chọn biến thể mới trong mục trên hoặc kiểm tra dữ liệu backend
                nếu cần.
              </p>
            )}
          </div> */}

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
