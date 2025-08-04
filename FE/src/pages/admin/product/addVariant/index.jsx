import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import { uploadToCloudinary } from "../../../../Upload/uploadToCloudinary.js";
import { toast } from "react-toastify";
import Constants from "../../../../Constants.jsx";

function AddVariantForm() {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [uploading, setUploading] = useState(false);

  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [isAuctionOnly, setIsAuctionOnly] = useState(0); // 🔹 Toggle đấu giá

  const [attributes, setAttributes] = useState([
    { attribute_id: "", value: "" },
  ]);
  const [images, setImages] = useState([]); // [{ url, public_id }]
  const [allAttributes, setAllAttributes] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    axios
      .get(`${Constants.DOMAIN_API}/admin/product-attributes`)
      .then((res) => setAllAttributes(res.data.data || []))
      .catch((err) => console.error("Lỗi lấy thuộc tính:", err));
  }, []);

  const addAttributeRow = () => {
    setAttributes((prev) => [...prev, { attribute_id: "", value: "" }]);
  };

  const removeAttributeRow = (index) => {
    setAttributes((prev) => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
  };

  const handleAttributeChange = (index, field, value) => {
    setAttributes((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!sku.trim()) newErrors.sku = "Vui lòng nhập mã SKU.";
    if (!price || parseFloat(price) <= 0)
      newErrors.price = "Giá phải lớn hơn 0.";

    // Nếu KHÔNG phải đấu giá mới validate stock người dùng nhập
    if (Number(isAuctionOnly) !== 1) {
      if (
        stock === "" ||
        Number.isNaN(parseInt(stock)) ||
        parseInt(stock) < 0
      ) {
        newErrors.stock = "Tồn kho không hợp lệ.";
      }
    }

    attributes.forEach((attr, i) => {
      if (!attr.attribute_id) newErrors[`attr_${i}_id`] = "Chọn thuộc tính.";
      if (!String(attr.value).trim())
        newErrors[`attr_${i}_value`] = "Nhập giá trị.";
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const deleteCloudImage = async (public_id) => {
    try {
      await axios.post(
        `${Constants.DOMAIN_API}/admin/products/imagesClauding`,
        {
          public_id,
        }
      );
    } catch (err) {
      console.error("Lỗi xóa ảnh Cloudinary:", err);
    }
  };

  const handleCancel = async () => {
    // Xóa các ảnh đã upload lên Cloudinary (nếu có)
    for (const img of images) {
      if (img?.public_id) {
        await deleteCloudImage(img.public_id);
      }
    }
    navigate("/admin/products/getAll");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra lại thông tin.");
      return;
    }

    try {
      const imageUrls = images.map((img) => img.url);

      const data = {
        sku,
        price,
        stock: Number(isAuctionOnly) === 1 ? 1 : stock, // 🔹 Ép stock = 1 nếu đấu giá
        attributes,
        images: imageUrls,
        is_auction_only: Number(isAuctionOnly) || 0, // 🔹 Gửi lên backend
      };

      await axios.post(
        `${Constants.DOMAIN_API}/admin/products/${productId}/variants`,
        data
      );

      toast.success("Tạo biến thể thành công!");
      navigate("/admin/products/getAll");
    } catch (err) {
      console.error("Lỗi tạo biến thể:", err);
      toast.error(err.response?.data?.error || "Đã có lỗi xảy ra");
    }
  };

  return (
    <div className="max-w-screen-xl mx-auto bg-white p-10 md:p-16 rounded shadow mt-2 mb-2">
      <h2 className="text-2xl font-semibold mb-6">Thêm biến thể sản phẩm</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SKU + Giá + Tồn kho + Toggle Đấu giá */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* SKU */}
          <div className="w-full md:w-1/3">
            <label className="block font-medium mb-2">
              Mã SKU <span style={{ color: "red", fontWeight: "bold" }}>*</span>
            </label>
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
          <div className="w-full md:w-1/3">
            <label className="block font-medium mb-2">
              Giá <span style={{ color: "red", fontWeight: "bold" }}>*</span>
            </label>
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

          {/* Tồn kho + Toggle Đấu giá */}
          <div className="w-full md:w-1/3">
            <label className="block font-medium mb-2">
              Số lượng tồn kho{" "}
              <span style={{ color: "red", fontWeight: "bold" }}>*</span>
            </label>
            <input
              type="number"
              value={Number(isAuctionOnly) === 1 ? 1 : stock}
              onChange={(e) => setStock(e.target.value)}
              className="w-full border px-3 py-2 rounded"
              disabled={Number(isAuctionOnly) === 1} // 🔹 Khóa khi là đấu giá
            />
            {errors.stock && (
              <p className="text-red-600 text-sm mt-1">{errors.stock}</p>
            )}

            {/* Toggle is_auction_only (Bootstrap 5 switch) */}
            <div className="form-check form-switch mt-2">
              <input
                className="form-check-input"
                type="checkbox"
                id="auctionSwitch"
                checked={Number(isAuctionOnly) === 1}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setIsAuctionOnly(checked ? 1 : 0);
                  if (checked) {
                    setStock(1); // 🔹 Khi bật đấu giá, ép stock = 1
                  }
                }}
              />
              <label className="form-check-label ms-2" htmlFor="auctionSwitch">
                {Number(isAuctionOnly) === 1
                  ? "Biến thể đấu giá (kho = 1)"
                  : "Đặt làm biến thể đấu giá"}
              </label>
            </div>
          </div>
        </div>

        {/* Thuộc tính và ảnh */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Thuộc tính */}
          <div className="w-full md:w-1/2">
            <label className="block font-medium mb-2">
              Thuộc tính biến thể{" "}
              <span style={{ color: "red", fontWeight: "bold" }}>*</span>
            </label>

            {attributes.map((attr, index) => {
              const selectedAttr = allAttributes.find(
                (a) => a.id.toString() === String(attr.attribute_id)
              );
              const isColor =
                selectedAttr?.name?.toLowerCase() === "màu sắc" ||
                selectedAttr?.name?.toLowerCase() === "màu";

              return (
                <div key={index} className="flex gap-4 mb-2 items-center">
                  {/* Tên thuộc tính */}
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
                            return !attributes.some(
                              (a, i) =>
                                String(a.attribute_id) === String(opt.id) &&
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
                        isColor ? "h-10 p-1" : "px-2 py-2"
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

            {attributes.length < allAttributes.length && (
              <button
                type="button"
                onClick={addAttributeRow}
                className="text-blue-600 text-sm"
              >
                + Thêm thuộc tính
              </button>
            )}
          </div>

          {/* Ảnh biến thể */}
          <div className="w-full md:w-1/2">
            <label className="block font-medium mb-2">Ảnh biến thể</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={async (e) => {
                const files = Array.from(e.target.files || []);
                if (!files.length) return;

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
              className="w-full border px-2 py-1.5 rounded"
            />

            {/* Hiển thị ảnh */}
            <div className="mt-4 flex gap-4 overflow-x-auto whitespace-nowrap">
              {images.map((img, index) => (
                <div key={index} className="relative group flex-shrink-0">
                  <img
                    src={img.url}
                    alt={`variant-${index}`}
                    className="w-24 h-24 object-cover rounded border"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      const deleted = images[index];
                      if (deleted?.public_id) {
                        await deleteCloudImage(deleted.public_id);
                      }

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
        </div>

        {/* Submit */}
        <div className="flex gap-2 mt-4">
          <button
            type="submit"
            disabled={uploading}
            className={`bg-[#073272] text-white px-4 py-2 rounded transition ${
              uploading ? "opacity-50 cursor-not-allowed" : "hover:bg-[#052354]"
            }`}
          >
            Tạo biến thể
          </button>

          <Link
            to="/admin/products/getAll"
            onClick={handleCancel}
            className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
          >
            Quay lại
          </Link>
        </div>
      </form>
    </div>
  );
}

export default AddVariantForm;
