import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { uploadToCloudinary } from "../../../../Upload/uploadToCloudinary.js";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

function AddVariantForm() {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [attributes, setAttributes] = useState([
    { attribute_id: "", value: "" },
  ]);
  const [images, setImages] = useState([]);
  const [allAttributes, setAllAttributes] = useState([]);
  const [errors, setErrors] = useState({}); // <-- lưu lỗi

  useEffect(() => {
    axios
      .get("http://localhost:5000/admin/product-attributes")
      .then((res) => setAllAttributes(res.data.data || []))
      .catch((err) => console.error("Lỗi lấy thuộc tính:", err));
  }, []);

  const addAttributeRow = () => {
    setAttributes([...attributes, { attribute_id: "", value: "" }]);
  };

  const handleAttributeChange = (index, field, value) => {
    const updated = [...attributes];
    updated[index][field] = value;
    setAttributes(updated);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!sku.trim()) newErrors.sku = "Vui lòng nhập mã SKU.";
    if (!price || parseFloat(price) <= 0)
      newErrors.price = "Giá phải lớn hơn 0.";
    if (!stock || parseInt(stock) < 0)
      newErrors.stock = "Tồn kho không hợp lệ.";

    attributes.forEach((attr, i) => {
      if (!attr.attribute_id) newErrors[`attr_${i}_id`] = "Chọn thuộc tính.";
      if (!attr.value.trim()) newErrors[`attr_${i}_value`] = "Nhập giá trị.";
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra lại thông tin.");
      return;
    }

    try {
      const data = { sku, price, stock, attributes, images };
      await axios.post(
        `http://localhost:5000/admin/products/${productId}/variants`,
        data
      );
      toast.success("Tạo biến thể thành công!");
      navigate("/admin/products/getAll");
    } catch (err) {
      console.error("Lỗi tạo biến thể:", err);
      toast.error(err.response?.data?.error || "Đã có lỗi xảy ra");
    }
  };
  const removeAttributeRow = (index) => {
    const updated = [...attributes];
    updated.splice(index, 1);
    setAttributes(updated);
  };

  return (
    <div className="max-w-screen-xl mx-auto bg-white p-8 rounded shadow mt-8">
      <h2 className="text-2xl font-semibold mb-6">Thêm biến thể sản phẩm</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SKU */}
        <div>
          <label className="block font-medium mb-2">Mã SKU *</label>
          <input
            type="text"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            className="w-full border px-4 py-3 rounded"
          />
          {errors.sku && (
            <p className="text-red-600 text-sm mt-1">{errors.sku}</p>
          )}
        </div>

        {/* Giá */}
        <div>
          <label className="block font-medium mb-2">Giá *</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full border px-4 py-3 rounded"
          />
          {errors.price && (
            <p className="text-red-600 text-sm mt-1">{errors.price}</p>
          )}
        </div>

        {/* Tồn kho */}
        <div>
          <label className="block font-medium mb-2">Số lượng tồn kho *</label>
          <input
            type="number"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className="w-full border px-4 py-3 rounded"
          />
          {errors.stock && (
            <p className="text-red-600 text-sm mt-1">{errors.stock}</p>
          )}
        </div>

        {/* Thuộc tính biến thể */}
        <div>
          <label className="block font-medium mb-2">
            Thuộc tính biến thể *
          </label>
          {attributes.map((attr, index) => {
            const selectedAttr = allAttributes.find(
              (a) => a.id.toString() === attr.attribute_id.toString()
            );
            const isColor = selectedAttr?.name?.toLowerCase() === "color";

            return (
              <div key={index} className="flex gap-4 mb-2 items-center">
                {/* Tên thuộc tính (không thay đổi sau khi đã chọn) */}
                <div className="w-1/2">
                  {selectedAttr ? (
                    <input
                      type="text"
                      value={selectedAttr.name}
                      disabled
                      className="w-full border px-4 py-3 rounded bg-gray-100 text-gray-600"
                    />
                  ) : (
                    <select
                      value={attr.attribute_id}
                      onChange={(e) =>
                        handleAttributeChange(
                          index,
                          "attribute_id",
                          e.target.value
                        )
                      }
                      className="w-full border px-4 py-3 rounded"
                    >
                      <option value="">-- Chọn thuộc tính --</option>
                      {allAttributes
                        .filter((opt) => {
                          // Lọc bỏ những attribute_id đã được chọn ở các dòng khác
                          return !attributes.some(
                            (a, i) =>
                              a.attribute_id === opt.id.toString() &&
                              i !== index
                          );
                        })
                        .map((opt) => (
                          <option key={opt.id} value={opt.id}>
                            {opt.name}
                          </option>
                        ))}
                    </select>
                  )}
                  {errors[`attr_${index}_id`] && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors[`attr_${index}_id`]}
                    </p>
                  )}
                </div>

                {/* Giá trị thuộc tính */}
                <div className="w-1/2">
                  <input
                    type={isColor ? "color" : "text"}
                    placeholder={isColor ? "" : "Giá trị"}
                    value={attr.value}
                    onChange={(e) =>
                      handleAttributeChange(index, "value", e.target.value)
                    }
                    className={`w-full border rounded ${
                      isColor ? "h-12 p-1" : "px-4 py-3"
                    }`}
                  />

                  {errors[`attr_${index}_value`] && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors[`attr_${index}_value`]}
                    </p>
                  )}
                </div>

                {attributes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeAttributeRow(index)}
                    className="text-red-600 hover:underline text-sm"
                  >
                    X
                  </button>
                )}
              </div>
            );
          })}

          <button
            type="button"
            onClick={addAttributeRow}
            className="text-blue-600 hover:underline text-sm"
          >
            + Thêm thuộc tính
          </button>
        </div>

        {/* Ảnh biến thể */}
        <div>
          <label className="block font-medium mb-2">Ảnh biến thể</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={async (e) => {
              const files = Array.from(e.target.files);
              const uploadedUrls = [];

              for (const file of files) {
                try {
                  const url = await uploadToCloudinary(file);
                  uploadedUrls.push(url);
                } catch (error) {
                  console.error("Lỗi upload ảnh:", error);
                }
              }

              setImages((prev) => [...prev, ...uploadedUrls]);
            }}
            className="w-full border px-4 py-3 rounded"
          />

          {/* Hiển thị ảnh */}
          <div className="mt-4 flex flex-wrap gap-4">
            {images.map((url, index) => (
              <div key={index} className="relative group">
                <img
                  src={url}
                  alt={`variant-${index}`}
                  className="w-24 h-24 object-cover rounded border"
                />
                <button
                  type="button"
                  onClick={() => {
                    const updated = [...images];
                    updated.splice(index, 1);
                    setImages(updated);
                  }}
                  className="absolute top-0 right-0 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full opacity-80 group-hover:opacity-100"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="bg-[#073272] text-white px-6 py-3 rounded hover:bg-[#052354] transition"
        >
          Tạo biến thể
        </button>
      </form>
    </div>
  );
}

export default AddVariantForm;
