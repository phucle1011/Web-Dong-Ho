import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { uploadToCloudinary } from "../../../../Upload/uploadToCloudinary.js";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import Constants from "../../../../Constants.jsx";

function AddVariantForm() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);

  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [attributes, setAttributes] = useState([
    { attribute_id: "", value: "" },
  ]);
  const [images, setImages] = useState([]);
  const [allAttributes, setAllAttributes] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    axios
      .get(`${Constants.DOMAIN_API}/admin/product-attributes`)
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
      const imageUrls = images.map((img) => img.url);

      const data = { sku, price, stock, attributes, images: imageUrls };
      await axios.post(
        `${Constants.DOMAIN_API}/admin/products/${productId}/variants`,
        data
      );
      toast.success("Tạo biến thể thành công!");
      navigate("/admin/products/getAll");
    } catch (err) {
      console.error("Lỗi tạo biến thể:", err);
      toast.error(
        err.response?.data?.error ||
          "Đã có lỗi xảy ra"
      );
    }
  };
  const removeAttributeRow = (index) => {
    const updated = [...attributes];
    updated.splice(index, 1);
    setAttributes(updated);
  };
  const deleteCloudImage = async (public_id) => {
    try {
      await axios.post(`${Constants.DOMAIN_API}/admin/products/imagesClauding`, {
        public_id,
      });
    } catch (err) {
      console.error("Lỗi xóa ảnh Cloudinary:", err);
    }
  };
  const handleCancel = async () => {
    // Xóa từng ảnh đã upload lên Cloudinary
    for (const img of images) {

      await deleteCloudImage(img.public_id);
    }

    navigate("/admin/products/getAll");
  };

  return (
    <div className="max-w-screen-xl mx-auto bg-white p-10 md:p-16 rounded shadow mt-2 mb-2">
      <h2 className="text-2xl font-semibold mb-6">Thêm biến thể sản phẩm</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SKU */}
        <div>
          <label className="block font-medium mb-2">Mã SKU *</label>
          <input
            type="text"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            className="w-full border px-3 py-2 rounded"
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
            className="w-full border px-3 py-2 rounded"
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
            className="w-full border px-3 py-2 rounded"
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
                      className="w-full border px-3 py-2 rounded bg-gray-100 text-gray-600"
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
                      className="w-full border px-3 py-2 rounded"
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
                    className="text-red-600 hover:text-red-800 p-1 rounded"
                    aria-label="Xóa thuộc tính"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4m-4 0a1 1 0 00-1 1v1h6V4a1 1 0 00-1-1m-4 0h4"
                      />
                    </svg>
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
              setUploading(true);
              const uploadedImages = [];

              for (const file of files) {
                try {
                  const { url, public_id } = await uploadToCloudinary(file);
                  uploadedImages.push({ url, public_id });
                } catch (error) {
                  console.error("Lỗi upload ảnh:", error);
                }
              }

              setImages((prev) => [...prev, ...uploadedImages]);

              setUploading(false);
            }}
            className="w-full border px-3 py-2 rounded"
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
        <div className="flex justify-start gap-2 mt-8">
          <button
            type="submit"
            disabled={uploading}
            className={`bg-[#073272] text-white px-6 py-3 rounded transition ${
              uploading ? "opacity-50 cursor-not-allowed" : "hover:bg-[#052354]"
            }`}
          >
            Tạo biến thể
          </button>

          <button
            type="button"
            onClick={handleCancel}
            className="bg-gray-200 text-gray-800 px-6 py-3 rounded hover:bg-gray-300 transition flex items-center justify-center"
          >
            Quay lại
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddVariantForm;
