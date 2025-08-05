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
  const minOrderValue = selectedPromotion?.min_order_value || 0;
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
      if (currentDate <= end) return "Đang diễn ra";
      return "Đã kết thúc";
    } catch (err) {
      console.error("Lỗi khi tính trạng thái khuyến mãi:", err);
      return "Không xác định";
    }
  };

  const getStatusDisplayName = (status) =>
    ({
      "Đang diễn ra": "Đang diễn ra",
      "Sắp bắt đầu": "Sắp bắt đầu",
      "Đã kết thúc": "Đã hết hạn",
      "Không xác định": "Vô hiệu hóa",
    }[status] || "Vô hiệu hóa");

  const getStatusBadgeClass = (status) =>
    ({
      "Đang diễn ra": "bg-green-100 text-green-800",
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
            "Đang diễn ra": 1,
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
            min_order_value: parseFloat(promotion.min_price_threshold) || 0,
          });
          setValue("promotion_id", id.toString());
        } else {
          throw new Error(`Không tìm thấy khuyến mãi với ID ${id}`);
        }

        trigger("product_variant_id");
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
      const invalid = selectedVariantIds.filter(
        (id) => !variantQuantities[id] || variantQuantities[id] < 1
      );
      if (invalid.length) {
        toast.error(
          `Vui lòng nhập số lượng ≥ 1 cho biến thể: ${invalid.join(", ")}`
        );
        return;
      }

      const payload = {
        promotion_id: parseInt(id, 10),
        products: selectedVariantIds.map((variantId) => ({
          product_variant_id: parseInt(variantId, 10),
          variant_quantity: variantQuantities[variantId] || 1,
        })),
      };

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
      console.error("Response payload:", err.response?.data);
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

  const availableVariants = productVariants.map((variant) => {
    const price = parseFloat(variant.price) || 0;
    const disabledByUsage =
      usedVariantIds.includes(variant.id) &&
      !existingVariantIds.includes(variant.id.toString());
    const disabledByPrice = price < minOrderValue;

    return {
      value: variant.id.toString(),
      label: `${variant.sku} — Giá: ${price.toLocaleString("vi-VN")}₫`,
      isDisabled: disabledByUsage || disabledByPrice,
      _price: price,
    };
  });

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
                Số lượng biến thể:{" "}
                <strong>{selectedPromotion.variant_count || 0}</strong>
              </p>
            )}
          </div>

          <div className="mb-1">
            <label className="form-label mb-2">
              Chọn các biến thể sản phẩm *
            </label>
            <Select
              isMulti
              options={availableVariants}
              className="basic-multi-select"
              classNamePrefix="select"
              onChange={(selectedOptions) => {
                const selectedIds = selectedOptions.map((opt) => opt.value);
                setCustomFormState({ product_variant_id: selectedIds });
                setSelectedVariantIds(selectedIds);
                const newQuantities = {};
                selectedIds.forEach((id) => {
                  newQuantities[id] = variantQuantities[id] || 1;
                });
                setVariantQuantities(newQuantities);
                setValue("product_variant_id", selectedIds);
                trigger("product_variant_id");
              }}
              value={availableVariants.filter((opt) =>
                selectedVariantIds.includes(opt.value)
              )}
              placeholder="Chọn hoặc thêm biến thể sản phẩm..."
              formatOptionLabel={(opt) => (
                <div
                  style={{
                    opacity: opt.isDisabled ? 0.5 : 1,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <span style={{ flex: 1 }}>{opt.label}</span>
                  {usedVariantIds.includes(+opt.value) &&
                    !existingVariantIds.includes(opt.value) && (
                      <em className="ms-1 text-sm text-red-500">(Đã dùng)</em>
                    )}
                  {opt._price < minOrderValue && (
                    <em className="ms-1 text-sm text-blue-500">
                      (Giá &lt; {minOrderValue.toLocaleString("vi-VN")}₫)
                    </em>
                  )}
                </div>
              )}
              isOptionDisabled={(opt) => opt.isDisabled}
            />
            {errors.product_variant_id && (
              <small className="text-danger">
                {errors.product_variant_id.message}
              </small>
            )}
          </div>

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