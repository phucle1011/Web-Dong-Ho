import React, { useState, useEffect } from "react";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Constants from "../../../../Constants";
import { toast } from "react-toastify";
import moment from "moment-timezone";

const AuctionCreate = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [form, setForm] = useState({
        auctions_product_id: null,
        start_price: "",
        priceStep: "",
        start_time: null,
        end_time: null,
    });
    const [errors, setErrors] = useState({
        auctions_product_id: "",
        start_price: "",
        priceStep: "",
        start_time: "",
        end_time: "",
    });

    const [loading, setLoading] = useState(false);

    const fetchProducts = async () => {
        try {
            const res = await axios.get(`${Constants.DOMAIN_API}/admin/auction-products`);
            const options = res.data.data.map((p) => ({
                value: p.id,
                label: p.sku,
            }));
            setProducts(options);
        } catch (err) {
            toast.error("Lỗi khi tải danh sách sản phẩm");
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const formatCurrency = (value) => {
        if (!value) return "";
        const num = value.toString().replace(/\D/g, "");
        return num.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    const parseCurrency = (value) => {
        if (!value) return 0;
        return parseInt(value.replace(/\D/g, ""), 10) || 0;
    };

    const validateField = (name, value) => {
        let error = "";

        if (!value) {
            error = "Trường này không được bỏ trống";
        } else if ((name === "start_price" || name === "priceStep") && parseCurrency(value) <= 0) {
            error = "Giá trị phải lớn hơn 0";
        } else if (name === "end_time" && form.start_time && value <= form.start_time) {
            error = "Thời gian kết thúc phải sau thời gian bắt đầu";
        }

        setErrors(prev => ({ ...prev, [name]: error }));
        return !error;
    };

    const handleChange = (key, value) => {
        if (key === "start_price" || key === "priceStep") {
            const formattedValue = formatCurrency(value);
            setForm({ ...form, [key]: formattedValue });
            validateField(key, formattedValue);
        } else {
            setForm({ ...form, [key]: value });
            validateField(key, value);
        }
    };

    const formatToMySQL = (date) => {
        return moment.tz(date, "Asia/Ho_Chi_Minh").format("YYYY-MM-DD HH:mm:ss");
    };

    const validateForm = () => {
        let isValid = true;
        const newErrors = { ...errors };

        if (!form.auctions_product_id) {
            newErrors.auctions_product_id = "Vui lòng chọn sản phẩm";
            isValid = false;
        }
        if (!form.start_price) {
            newErrors.start_price = "Vui lòng nhập giá khởi điểm";
            isValid = false;
        } else if (parseCurrency(form.start_price) <= 0) {
            newErrors.start_price = "Giá khởi điểm phải lớn hơn 0";
            isValid = false;
        }
        if (!form.priceStep) {
            newErrors.priceStep = "Vui lòng nhập bước giá";
            isValid = false;
        } else if (parseCurrency(form.priceStep) <= 0) {
            newErrors.priceStep = "Bước giá phải lớn hơn 0";
            isValid = false;
        }
        if (!form.start_time) {
            newErrors.start_time = "Vui lòng chọn thời gian bắt đầu";
            isValid = false;
        }
        if (!form.end_time) {
            newErrors.end_time = "Vui lòng chọn thời gian kết thúc";
            isValid = false;
        } else if (form.start_time && form.end_time <= form.start_time) {
            newErrors.end_time = "Thời gian kết thúc phải sau thời gian bắt đầu";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const payload = {
            ...form,
            start_price: parseCurrency(form.start_price),
            priceStep: parseCurrency(form.priceStep),
            start_time: formatToMySQL(form.start_time),
            end_time: formatToMySQL(form.end_time),
        };

        setLoading(true);
        try {
            const res = await axios.post(`${Constants.DOMAIN_API}/admin/auctions`, payload);
            toast.success("Tạo phiên đấu giá thành công!");
            navigate("/admin/auctions/getAll");
        } catch (err) {
            toast.error(err.response?.data?.message || "Lỗi không xác định");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-screen-lg mx-auto bg-white p-5 md:p-10 rounded shadow mt-2 mb-2">
            <h2 className="text-xl font-semibold">Tạo phiên đấu giá</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    <div className="md:col-span-6">
                        <label className="block mb-1 font-medium">
                            Sản phẩm đấu giá <span className="text-red-500">*</span>
                        </label>
                        <Select
                            options={products}
                            onChange={(selected) =>
                                handleChange("auctions_product_id", selected?.value || null)
                            }
                            placeholder="Chọn sản phẩm"
                            className={errors.auctions_product_id ? "border-red-500" : ""}
                        />
                        {errors.auctions_product_id && (
                            <p className="text-red-500 text-sm mt-1">{errors.auctions_product_id}</p>
                        )}
                    </div>

                    <div className="md:col-span-6">
                        <label className="block mb-1 font-medium">
                            Giá khởi điểm <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                className={`form-control w-full px-3 py-2 border rounded pl-8 ${errors.start_price ? "border-red-500" : ""}`}
                                placeholder="Nhập giá khởi điểm"
                                value={form.start_price}
                                onChange={(e) => handleChange("start_price", e.target.value)}
                                onBlur={(e) => validateField("start_price", e.target.value)}
                            />
                        </div>
                        {errors.start_price && (
                            <p className="text-red-500 text-sm mt-1">{errors.start_price}</p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-6">
                    <div className="md:col-span-6">
                        <label className="block mb-1 font-medium">
                            Bước giá <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                className={`form-control w-full px-3 py-2 border rounded pl-8 ${errors.priceStep ? "border-red-500" : ""}`}
                                placeholder="Nhập bước giá"
                                value={form.priceStep}
                                onChange={(e) => handleChange("priceStep", e.target.value)}
                                onBlur={(e) => validateField("priceStep", e.target.value)}
                            />
                        </div>
                        {errors.priceStep && (
                            <p className="text-red-500 text-sm mt-1">{errors.priceStep}</p>
                        )}
                    </div>

                    <div className="md:col-span-3">
                        <label className="block mb-1 font-medium">
                            Thời gian bắt đầu <span className="text-red-500">*</span>
                        </label>
                        <DatePicker
                            selected={form.start_time}
                            onChange={(date) => handleChange("start_time", date)}
                            showTimeSelect
                            timeFormat="HH:mm"
                            timeIntervals={15}
                            dateFormat="yyyy-MM-dd HH:mm:ss"
                            className={`w-full px-3 py-2 border rounded ${errors.start_time ? "border-red-500" : ""}`}
                            placeholderText="Chọn thời gian bắt đầu"
                            onBlur={() => validateField("start_time", form.start_time)}
                        />
                        {errors.start_time && (
                            <p className="text-red-500 text-sm mt-1">{errors.start_time}</p>
                        )}
                    </div>

                    <div className="md:col-span-3 ml-auto">
                        <label className="block mb-1 font-medium">
                            Thời gian kết thúc <span className="text-red-500">*</span>
                        </label>
                        <DatePicker
                            selected={form.end_time}
                            onChange={(date) => handleChange("end_time", date)}
                            showTimeSelect
                            timeFormat="HH:mm"
                            timeIntervals={15}
                            dateFormat="yyyy-MM-dd HH:mm:ss"
                            className={`w-full px-3 py-2 border rounded ${errors.end_time ? "border-red-500" : ""}`}
                            placeholderText="Chọn thời gian kết thúc"
                            onBlur={() => validateField("end_time", form.end_time)}
                        />
                        {errors.end_time && (
                            <p className="text-red-500 text-sm mt-1">{errors.end_time}</p>
                        )}
                    </div>
                </div>

                <div className="mt-4 flex gap-4 no-print">
                    <button
                        type="submit"
                        className="bg-[#073272] text-white px-6 py-2 rounded hover:bg-[#052354] transition"
                        disabled={loading}
                    >
                        {loading ? "Đang tạo..." : "Tạo phiên đấu giá"}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate("/admin/auctions/getAll")}
                        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                    >
                        Quay lại
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AuctionCreate;