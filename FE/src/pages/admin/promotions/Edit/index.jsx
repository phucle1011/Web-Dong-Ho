import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Constants from "../../../../Constants";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function PromotionEdit() {
    const { id } = useParams();
    const navigate = useNavigate();

    const {
        control,
        register,
        handleSubmit,
        watch,
        reset,
        getValues,
        setValue,
        formState: { errors }
    } = useForm();

    const [currentStatus, setCurrentStatus] = useState("");
    const startDate = watch("start_date");
    const discountType = watch("discount_type");
    const quantity = watch("quantity");

    useEffect(() => {
        const fetchPromotion = async () => {
            try {
                const res = await axios.get(`${Constants.DOMAIN_API}/admin/promotions/${id}`);
                const promo = res.data?.data;
                if (!promo) {
                    toast.error("Không tìm thấy khuyến mãi.");
                    return;
                }
                setCurrentStatus(promo.status);
                const parsedData = {
                    ...promo,
                    start_date: promo.start_date ? new Date(promo.start_date) : null,
                    end_date: promo.end_date ? new Date(promo.end_date) : null,
                    status_visibility: promo.status === "inactive" ? "hidden" : "visible",
                    min_price_threshold: promo.min_price_threshold !== undefined ? Number(promo.min_price_threshold) : 0,
                    max_price: promo.max_price !== undefined ? Number(promo.max_price) : 0,
                };
                reset(parsedData);
            } catch (error) {
                toast.error("Không thể tải dữ liệu khuyến mãi");
                console.error(error);
            }
        };
        if (id) fetchPromotion();
    }, [id, reset]);

    const onSubmit = async (data) => {
        if (data.start_date instanceof Date && data.end_date instanceof Date) {
            if (data.start_date > data.end_date) {
                toast.error("Ngày bắt đầu không được sau ngày kết thúc.");
                return;
            }
        }
        const putData = { ...data };
        if (putData.status_visibility === "hidden") {
            putData.status = "inactive";
        } else {
            delete putData.status;
        }
        delete putData.status_visibility;
        if (putData.start_date instanceof Date) {
            putData.start_date = putData.start_date.toISOString().split("T")[0];
        }
        if (putData.end_date instanceof Date) {
            putData.end_date = putData.end_date.toISOString().split("T")[0];
        }
        delete putData.id;
        delete putData.created_at;
        delete putData.updated_at;
        try {
            await axios.put(`${Constants.DOMAIN_API}/admin/promotions/${id}`, putData);
            toast.success("Cập nhật khuyến mãi thành công");
            navigate("/admin/promotions/getAll");
        } catch (error) {
            toast.error("Cập nhật khuyến mãi thất bại");
            console.error(error);
        }
    };

    const isExpired = currentStatus === "expired";
    const isActive = currentStatus === "active";

    return (
        <div className="container mx-auto p-4 bg-white shadow rounded">
            <h2 className="text-xl font-semibold mb-4">Cập nhật khuyến mãi</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block mb-1 font-medium">Tên khuyến mãi</label>
                    <input
                        type="text"
                        {...register("name", { required: "Tên khuyến mãi không được bỏ trống" })}
                        className="w-full border rounded px-3 py-2"
                        onChange={(e) => {
                            const upper = e.target.value.toUpperCase();
                            setValue("name", upper);
                        }}
                        disabled={isExpired || isActive}
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                </div>

                <div>
                    <label className="block mb-1 font-medium">Loại giảm giá</label>
                    <select
                        {...register("discount_type")}
                        className="w-full border rounded px-3 py-2"
                        disabled={isExpired || isActive}
                    >
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
                                    ? (value >= 1 && value <= 100) || "Giá trị phần trăm phải từ 1 đến 100"
                                    : value >= 0 || "Giá trị cố định phải >= 0"
                        })}
                        className="w-full border rounded px-3 py-2"
                        disabled={isExpired || isActive}
                    />
                    {errors.discount_value && (
                        <p className="text-red-500 text-sm mt-1">{errors.discount_value.message}</p>
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
                                disabled={isExpired || isActive}
                            />
                        )}
                    />
                    {errors.start_date && (
                        <p className="text-red-500 text-sm mt-1">{errors.start_date.message}</p>
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
                        disabled={isExpired || isActive}
                    />
                    {errors.quantity && (
                        <p className="text-red-500 text-sm mt-1">{errors.quantity.message}</p>
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
                                disabled={isExpired || isActive}
                            />
                        )}
                    />
                    {errors.end_date && (
                        <p className="text-red-500 text-sm mt-1">{errors.end_date.message}</p>
                    )}
                </div>

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

                                const discountType = getValues("discount_type");
                                const discountValue = Number(getValues("discount_value"));
                                const minPrice = parseInt(getValues("min_price_threshold")?.toString().replace(/\D/g, "") || "0");

                                let minDiscountAmount = 0;
                                if (discountType === "percentage") {
                                    minDiscountAmount = Math.floor((discountValue / 100) * minPrice);
                                } else if (discountType === "fixed") {
                                    minDiscountAmount = discountValue;
                                }

                                if (num < minDiscountAmount) {
                                    return `Số tiền giảm tối đa phải lớn hơn hoặc bằng ${minDiscountAmount.toLocaleString("vi-VN")} (theo giá trị giảm và ngưỡng đơn hàng)`;
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
                                    placeholder="VD: 50.000"
                                    className="w-full border rounded px-3 py-2"
                                />
                            );
                        }}
                    />
                    {errors.max_price && (
                        <p className="text-red-500 text-sm mt-1">{errors.max_price.message}</p>
                    )}
                </div>

                <div>
                    <label className="block mb-1 font-medium">Áp dụng cho</label>
                    <select
                        {...register("applicable_to", { required: "Vui lòng chọn trường này" })}
                        className="w-full border rounded px-3 py-2"
                        disabled={isExpired || isActive}
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
                                (parseInt(value?.toString().replace(/\D/g, "") || "0") >= 0) || "Giá trị phải >= 0",
                        }}
                        render={({ field }) => {
                            const formatVND = (value) => {
                                if (!value) return "";
                                const number = typeof value === "number" ? value : parseInt(value.toString().replace(/\D/g, "") || "0");
                                return number.toLocaleString("vi-VN") + " VNĐ";
                            };
                            return (
                                <input
                                    {...field}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, "");
                                        field.onChange(val ? parseInt(val) : 0);
                                    }}
                                    value={formatVND(field.value)}
                                    className="w-full border rounded px-3 py-2"
                                    disabled={isExpired || isActive}
                                />
                            );
                        }}
                    />
                    {errors.min_price_threshold && (
                        <p className="text-red-500 text-sm mt-1">{errors.min_price_threshold.message}</p>
                    )}
                </div>

                <div>
                    <label className="block mb-1 font-medium">Trạng thái hiển thị</label>
                    <select
                        {...register("status_visibility")}
                        className="w-full border rounded px-3 py-2"
                        disabled={isExpired}
                    >
                        <option value="visible">Hiển thị</option>
                        <option value="hidden">Ẩn</option>
                    </select>
                </div>

                <div className="col-span-2 mt-4">
                    <label className="block mb-1 font-medium">Mô tả</label>
                    <textarea
                        {...register("description")}
                        className="w-full border rounded px-3 py-2"
                        rows={3}
                        disabled={isExpired || isActive}
                    />
                </div>

                <div className="col-span-2 mt-4">
                    <button
                        type="submit"
                        className={`px-4 py-2 rounded text-white ${isExpired ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                            }`}
                        disabled={isExpired}
                    >
                        Cập nhật
                    </button>
                </div>
            </form>

            <div className="mt-6">
                <button
                    type="button"
                    onClick={() => navigate("/admin/promotions/getAll")}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors duration-200"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>Quay về</span>
                </button>
            </div>
        </div>
    );
}

export default PromotionEdit;