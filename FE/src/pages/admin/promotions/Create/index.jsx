import React from "react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Constants from "../../../../Constants";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function PromotionCreate() {
  const navigate = useNavigate();
  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: "",
      description: "",
      discount_type: "percentage",
      discount_value: 0,
      quantity: 0,
      start_date: null,
      end_date: null,
      status_visibility: "visible",
      applicable_to: "all_products",
      min_price_threshold: 0
    }
  });

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
      postData.start_date = postData.start_date.toISOString().split("T")[0];
    }
    if (postData.end_date instanceof Date) {
      postData.end_date = postData.end_date.toISOString().split("T")[0];
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

  const discountType = watch("discount_type");
  const startDate = watch("start_date");

  return (
    <div className="container mx-auto p-4 bg-white shadow rounded">
      <h2 className="text-xl font-semibold mb-4">Thêm khuyến mãi mới</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">

        <div>
          <label className="block mb-1 font-medium">Tên khuyến mãi</label>
          <input
            type="text"
            {...register("name", { required: "Tên khuyến mãi không được bỏ trống" })}
            className="w-full border rounded px-3 py-2"
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block mb-1 font-medium">Mô tả</label>
          <textarea
            {...register("description")}
            className="w-full border rounded px-3 py-2"
            rows={3}
          />
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
          <input
            type="number"
            {...register("discount_value", {
              required: "Vui lòng nhập giá trị giảm",
              validate: (value) =>
                discountType === "percentage"
                  ? (value >= 1 && value <= 80) || "Giá trị phần trăm phải từ 1 đến 80"
                  : (value >= 0) || "Giá trị cố định phải >= 0"
            })}
            className="w-full border rounded px-3 py-2"
          />
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
              min: { value: 0, message: "Số lượng phải >= 0" }
            })}
            className="w-full border rounded px-3 py-2"
          />
          {errors.quantity && (
            <p className="text-red-500 text-sm mt-1">{errors.quantity.message}</p>
          )}
        </div>

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
              }
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
          <label className="block mb-1 font-medium">Áp dụng cho đơn hàng từ (VNĐ)</label>
          <Controller
            control={control}
            name="min_price_threshold"
            rules={{
              required: "Vui lòng nhập ngưỡng giá",
              validate: (value) =>
                parseInt(value?.toString().replace(/\D/g, "") || "0") >= 0 ||
                "Giá trị phải >= 0",
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
          {errors.min_price_threshold && (
            <p className="text-red-500 text-sm mt-1">{errors.min_price_threshold.message}</p>
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

        <button
          type="submit"
          className="bg-[#073272] text-white px-4 py-2 rounded"
        >
          Tạo khuyến mãi
        </button>
      </form>
    </div>
  );
}

export default PromotionCreate;
