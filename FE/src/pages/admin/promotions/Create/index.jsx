import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Constants from "../../../../Constants";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from "react-select";
import { FaArrowUp } from "react-icons/fa";

function PromotionCreate() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [showUserList, setShowUserList] = useState(false);
  const [promoCode, setPromoCode] = useState("");

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      description: "",
      discount_type: "percentage",
      discount_value: "",
      quantity: "",
      start_date: null,
      end_date: null,
      status_visibility: "visible",
      applicable_to: "all_products",
      min_price_threshold: "",
      max_price_threshold: "",
      user_ids: [],
    },
  });

  const applicableTo = watch("applicable_to");
  const discountType = watch("discount_type");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${Constants.DOMAIN_API}/admin/promotions/getusers`);
        setUsers(res.data.data); // Không sắp xếp lại, sử dụng thứ tự từ backend
      } catch (err) {
        console.error("Lỗi khi lấy danh sách người dùng:", err);
        toast.error("Không thể lấy danh sách người dùng. Vui lòng thử lại.");
      }
    };
    fetchUsers();
  }, []);

  const generateCodeFromName = (name) => {
    if (!name) return "";
    let code = name.toUpperCase();
    code = code.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    code = code.replace(/[^A-Z0-9]+/g, "_");
    code = code.substring(0, 20);
    code = code.replace(/^_+|_+$/g, "");
    return code;
  };

  const nameValue = watch("name");
  useEffect(() => {
    const code = generateCodeFromName(nameValue);
    setPromoCode(code);
    setValue("code", code);
  }, [nameValue, setValue]);

  const userOptions = users.map((user) => ({
    value: user.id,
    label: (
      <div className="flex items-center justify-between gap-2">
        <span>
          {user.name || user.email}{" "}
          <span className="text-sm">
            (
            <FaArrowUp className="inline text-green-600 mr-1" />
            <span className="text-green-600">{user.total_orders} đơn</span> -{" "}
            <span className="text-yellow-500">
              {user.total_spent_in_month.toLocaleString("vi-VN")}₫
            </span>
            )
          </span>
        </span>
      </div>
    ),
  }));

  function formatDateToLocalISO(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  const onSubmit = async (data) => {
    if (data.start_date instanceof Date && data.end_date instanceof Date) {
      if (data.start_date > data.end_date) {
        toast.error("Ngày bắt đầu không được sau ngày kết thúc.");
        return;
      }
    }
    const postData = { ...data };

    if (postData.status_visibility === "hidden") {
      postData.status = "inactive";
    } else {
      delete postData.status;
    }
    delete postData.status_visibility;

    if (postData.start_date instanceof Date) {
      postData.start_date = formatDateToLocalISO(postData.start_date);
    }
    if (postData.end_date instanceof Date) {
      postData.end_date = formatDateToLocalISO(postData.end_date);
    }

    if (!showUserList) {
      postData.user_ids = [];
    }

    try {
      await axios.post(`${Constants.DOMAIN_API}/admin/promotions/create`, postData);
      toast.success("Tạo khuyến mãi thành công");
      navigate("/admin/promotions/getAll");
    } catch (error) {
      if (error.response?.status === 409) {
        toast.error("Tên khuyến mãi đã tồn tại.");
      } else {
        toast.error("Tạo khuyến mãi thất bại");
      }
      console.error(error);
    }
  };

  const startDate = watch("start_date");

  const handleUserToggle = (userId) => {
    const currentUserIds = getValues("user_ids") || [];
    const updated = currentUserIds.includes(userId)
      ? currentUserIds.filter((id) => id !== userId)
      : [...currentUserIds, userId];
    setValue("user_ids", updated);
  };

  const addUser = (userId) => {
    const currentUserIds = getValues("user_ids") || [];
    if (!currentUserIds.includes(userId)) {
      setValue("user_ids", [...currentUserIds, userId]);
    }
  };

  const removeUser = (userId) => {
    const currentUserIds = getValues("user_ids") || [];
    setValue("user_ids", currentUserIds.filter((id) => id !== userId));
  };

  return (
    <div className="container mx-auto p-4 bg-white shadow rounded">
      <h2 className="text-xl font-semibold mb-4">Thêm khuyến mãi mới</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-4">
          <div>
            <label className="block mb-1 font-medium">Tên khuyến mãi</label>
            <input
              type="text"
              {...register("name", {
                required: "Tên khuyến mãi không được bỏ trống",
                onChange: (e) => {
                  e.target.value = e.target.value.toUpperCase();
                },
              })}
              className="w-full border rounded px-3 py-2"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block mb-1 font-medium">Loại giảm giá</label>
            <select {...register("discount_type")} className="w-full border rounded px-3 py-2">
              <option value="percentage">Phần trăm (%)</option>
              <option value="fixed">Cố định (VNĐ)</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 font-medium">
              Giá trị giảm ({discountType === "percentage" ? "%" : "VNĐ"})
            </label>
            {discountType === "fixed" ? (
              <Controller
                control={control}
                name="discount_value"
                rules={{
                  required: "Vui lòng nhập giá trị giảm",
                  validate: (value) => {
                    const minThreshold = Number(getValues("min_price_threshold") || 0);
                    const val = Number(value);

                    if (val < 0) {
                      return "Giá trị cố định phải >= 0";
                    }
                    if (val >= minThreshold) {
                      return "Giá trị giảm phải nhỏ hơn giá trị đơn hàng tối thiểu";
                    }
                    if (val > minThreshold * 0.8) {
                      return `Giá trị giảm không được vượt quá 80% đơn hàng (${(minThreshold * 0.8).toLocaleString("vi-VN")}₫)`;
                    }

                    return true;
                  },
                }}
                render={({ field }) => {
                  const formatVND = (value) => {
                    const number = parseInt(value.replace(/\D/g, "") || "0");
                    return number.toLocaleString("vi-VN");
                  };

                  const handleChange = (e) => {
                    const formatted = formatVND(e.target.value);
                    e.target.value = formatted;
                    const rawNumber = parseInt(formatted.replace(/\D/g, "") || "0");
                    field.onChange(rawNumber);
                  };

                  const displayValue =
                    typeof field.value === "number"
                      ? field.value.toLocaleString("vi-VN")
                      : "0";

                  return (
                    <input
                      {...field}
                      value={displayValue}
                      onChange={handleChange}
                      placeholder="VD: 50.000"
                      className="w-full border rounded px-3 py-2"
                    />
                  );
                }}
              />
            ) : (
              <input
                type="number"
                {...register("discount_value", {
                  required: "Vui lòng nhập giá trị giảm",
                  validate: (value) => {
                    const val = Number(value);
                    if (val < 1 || val > 80) {
                      return "Giá trị phần trăm phải từ 1 đến 80";
                    }
                    return true;
                  },
                })}
                className="w-full border rounded px-3 py-2"
              />
            )}
            {errors.discount_value && (
              <p className="text-red-500 text-sm mt-1">{errors.discount_value.message}</p>
            )}
          </div>

          <div>
            <label className="block mb-1 font-medium">Số lượt áp dụng</label>
            <input
              type="number"
              {...register("quantity", {
                required: "Vui lòng nhập số lượng",
                min: { value: 0, message: "Số lượng phải >= 0" },
              })}
              className="w-full border rounded px-3 py-2"
            />
            {errors.quantity && (
              <p className="text-red-500 text-sm mt-1">{errors.quantity.message}</p>
            )}
          </div>

          <div>
            <label className="block mb-1 font-medium">Áp dụng cho đơn hàng từ (VNĐ)</label>
            <Controller
              control={control}
              name="min_price_threshold"
              rules={{
                required: "Vui lòng nhập ngưỡng giá",
                validate: (value) =>
                  parseInt(value?.toString().replace(/\D/g, "") || "0") >= 0 || "Giá trị phải >= 0",
              }}
              render={({ field }) => {
                const formatVND = (value) => {
                  const number = parseInt(value.replace(/\D/g, "") || "0");
                  return number.toLocaleString("vi-VN");
                };
                const handleChange = (e) => {
                  const formatted = formatVND(e.target.value);
                  e.target.value = formatted;
                  const rawNumber = parseInt(formatted.replace(/\D/g, "") || "0");
                  field.onChange(rawNumber);
                };
                const displayValue =
                  typeof field.value === "number"
                    ? field.value.toLocaleString("vi-VN")
                    : "0";
                return (
                  <input
                    {...field}
                    value={displayValue}
                    onChange={handleChange}
                    placeholder="VD: 1.000.000"
                    className="w-full border rounded px-3 py-2"
                  />
                );
              }}
            />
            {errors.min_price_threshold && (
              <p className="text-red-500 text-sm mt-1">{errors.min_price_threshold.message}</p>
            )}
          </div>

          {/* Conditionally render Số tiền giảm giá tối đa */}
          {discountType === "percentage" && (
            <div>
              <label className="block mb-1 font-medium">Số tiền giảm giá tối đa (VNĐ)</label>
              <Controller
                control={control}
                name="max_price"
                rules={{
                  required: "Vui lòng nhập số tiền giảm tối đa",
                  validate: (value) => {
                    const num = parseInt(value?.toString().replace(/\D/g, "") || "0");
                    if (isNaN(num)) return "Phải là số hợp lệ";
                    if (num < 0) return "Phải lớn hơn hoặc bằng 0";

                    const discountValue = Number(getValues("discount_value"));
                    const minPrice = parseInt(
                      getValues("min_price_threshold")?.toString().replace(/\D/g, "") || "0"
                    );

                    const minDiscountAmount = Math.floor((discountValue / 100) * minPrice);

                    if (num < minDiscountAmount) {
                      return `Số tiền giảm tối đa phải lớn hơn hoặc bằng ${minDiscountAmount.toLocaleString(
                        "vi-VN"
                      )} (theo giá trị giảm và ngưỡng đơn hàng)`;
                    }

                    return true;
                  },
                }}
                render={({ field }) => {
                  const formatVND = (value) => {
                    const number = parseInt(value.replace(/\D/g, "") || "0");
                    return number.toLocaleString("vi-VN");
                  };
                  const handleChange = (e) => {
                    const formatted = formatVND(e.target.value);
                    e.target.value = formatted;
                    const rawNumber = parseInt(formatted.replace(/\D/g, "") || "0");
                    field.onChange(rawNumber);
                  };
                  const displayValue =
                    typeof field.value === "number"
                      ? field.value.toLocaleString("vi-VN")
                      : field.value || "";
                  return (
                    <input
                      {...field}
                      value={displayValue}
                      onChange={handleChange}
                      className="w-full border rounded px-3 py-2"
                    />
                  );
                }}
              />
              {errors.max_price && (
                <p className="text-red-500 text-sm mt-1">{errors.max_price.message}</p>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="block mb-1 font-medium">Ngày bắt đầu</label>
            <Controller
              control={control}
              name="start_date"
              rules={{ required: "Vui lòng chọn ngày bắt đầu" }}
              render={({ field }) => (
                <DatePicker
                  placeholderText="Chọn ngày bắt đầu"
                  onChange={(date) => field.onChange(date)}
                  selected={field.value}
                  dateFormat="dd/MM/yyyy"
                  className="w-full border rounded px-3 py-2"
                  minDate={new Date()}
                />
              )}
            />
            {errors.start_date && (
              <p className="text-red-500 text-sm mt-1">{errors.start_date.message}</p>
            )}
          </div>

          <div>
            <label className="block mb-1 font-medium">Ngày kết thúc</label>
            <Controller
              control={control}
              name="end_date"
              rules={{
                required: "Vui lòng chọn ngày kết thúc",
                validate: (endDate) => {
                  if (!startDate) return true;
                  return endDate >= startDate || "Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu";
                },
              }}
              render={({ field }) => (
                <DatePicker
                  placeholderText="Chọn ngày kết thúc"
                  onChange={(date) => field.onChange(date)}
                  selected={field.value}
                  dateFormat="dd/MM/yyyy"
                  className="w-full border rounded px-3 py-2"
                  minDate={startDate || new Date()}
                />
              )}
            />
            {errors.end_date && (
              <p className="text-red-500 text-sm mt-1">{errors.end_date.message}</p>
            )}
          </div>

          <div>
            <label className="block mb-1 font-medium">Áp dụng cho</label>
            <select
              {...register("applicable_to", { required: "Vui lòng chọn trường này" })}
              className="w-full border rounded px-3 py-2"
            >
              <option value="order">Đơn hàng</option>
              <option value="product">Sản phẩm</option>
            </select>
            {errors.applicable_to && (
              <p className="text-red-500 text-sm mt-1">{errors.applicable_to.message}</p>
            )}
          </div>

          <div>
            <label className="block mb-1 font-medium">Trạng thái hiển thị</label>
            <select
              {...register("status_visibility")}
              className="w-full border rounded px-3 py-2"
            >
              <option value="visible">Hiện</option>
              <option value="hidden">Ẩn</option>
            </select>
          </div>

          {applicableTo === "order" && (
            <div>
              <label className="block mb-1 font-medium flex items-center justify-between">
                <span>Áp dụng cho khách hàng đặc biệt</span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={showUserList}
                    onChange={() => setShowUserList((prev) => !prev)}
                  />
                  <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-green-600 peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600"></div>
                </label>
              </label>
              <Controller
                name="user_ids"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={userOptions}
                    isMulti
                    closeMenuOnSelect={false}
                    onChange={(selected) => {
                      field.onChange(selected ? selected.map((item) => item.value) : []);
                    }}
                    value={userOptions.filter((option) => field.value.includes(option.value))}
                    placeholder="Chọn khách hàng..."
                    isDisabled={!showUserList}
                  />
                )}
              />
            </div>
          )}
        </div>

        <div className="col-span-2">
          <label className="block mb-1 font-medium">Mô tả</label>
          <textarea
            {...register("description")}
            className="w-full border rounded px-3 py-2"
            rows={3}
          />
        </div>

        <div className="mt-6 flex gap-4">
          <button type="submit" className="bg-[#073272] text-white px-6 py-2 rounded mt-2 text-center">
            Tạo khuyến mãi
          </button>

          <button
            onClick={() => navigate("/admin/promotions/getAll")}
            className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 mt-2 text-center"
          >
            Quay lại
          </button>
        </div>
      </form>
    </div>
  );
}

export default PromotionCreate;