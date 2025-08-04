import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link,useNavigate } from "react-router-dom";
import { uploadToCloudinary } from "../../../../Upload/uploadToCloudinary.js";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Constants from "../../../../Constants.jsx";

const EditVariantForm = () => {
  const { id } = useParams();
  const [variant, setVariant] = useState(null);
  const [attributesList, setAttributesList] = useState([]);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
  id: "",
  sku: "",
  price: "",
  stock: "",
  attributes: [],
  images: [],
  is_auction_only: 0,
});


  useEffect(() => {
  const fetchData = async () => {
    try {
      const attrRes = await axios.get(`${Constants.DOMAIN_API}/admin/product-attributes`);
      setAttributesList(attrRes.data.data);

      const res = await axios.get(`${Constants.DOMAIN_API}/admin/variants/${id}`);
      const data = res.data.data;

      // Nếu biến thể đang có mã giảm giá
      const hasPromotion = data.promotionProducts && data.promotionProducts.length > 0;

      setVariant(data);
      setFormData({
        sku: data.sku || "",
        price: data.price || "",
        stock: data.stock || "",
        product_id: data.product_id || "",
        attributes:
          data.attributeValues?.map((attr) => ({
            id: attr.id,
            attribute_id: attr.product_attribute_id,
            value: attr.value,
          })) || [],
        images:
          data.images?.map((img) => ({
            id: img.id,
            url: img.image_url,
          })) || [],
        is_auction_only: Number(data.is_auction_only) || 0,
        has_promotion: hasPromotion, // <-- thêm cờ
      });
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu:", err);
      toast.error("Lỗi khi tải dữ liệu!");
    }
  };

  fetchData();
}, [id]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAttributeChange = (index, field, value) => {
    const newAttributes = [...formData.attributes];
    newAttributes[index][field] = value;
    setFormData((prev) => ({ ...prev, attributes: newAttributes }));
  };

  const addAttributeField = () => {
    setFormData((prev) => ({
      ...prev,
      attributes: [...prev.attributes, { attribute_id: "", value: "" }],
    }));
  };

 const handleImageUpload = async (e) => {
  const files = Array.from(e.target.files || []);
  if (files.length === 0) return;

  try {
    const uploadedImages = [];

    for (const file of files) {
      const { url, public_id } = await uploadToCloudinary(file);
      uploadedImages.push({ id: null, url: { url, public_id } });
    }

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...uploadedImages],
    }));

    toast.success("Tải ảnh lên thành công!");
  } catch (error) {
    console.error("Upload thất bại:", error);
    toast.error("Lỗi khi upload ảnh lên Cloudinary!");
  }

  e.target.value = ""; // reset input để có thể chọn lại
};


  const handleDeleteAttribute = async (id) => {
    const newAttributes = [...formData.attributes];
    const index = newAttributes.findIndex((attr) => attr.id === id);
    if (index === -1) return;

    if (id) {
      try {
        await axios.delete(
          `${Constants.DOMAIN_API}/admin/product-variants/deleteAttributeValueById/${id}`
        );
      } catch (error) {
        console.error("Lỗi khi xóa thuộc tính:", error);
        toast.error("Xoá thuộc tính thất bại!");
        return;
      }
    }

    newAttributes.splice(index, 1);
    setFormData((prev) => ({ ...prev, attributes: newAttributes }));
  };

  const handleDeleteImage = async (index) => {
    const image = formData.images[index];
    if (!image) return;
    try {
      // Nếu ảnh đã lưu trong DB (có id), xóa theo id
      if (image.id) {
        await axios.delete(
          `${Constants.DOMAIN_API}/admin/variant-images/${image.id}`
        );
      } else if (image.url.public_id) {
        // Nếu ảnh chưa lưu DB nhưng đã upload lên Cloudinary thì xóa theo public_id
        await axios.post(
          `${Constants.DOMAIN_API}/admin/products/imagesClauding`,
          {
            public_id: image.url.public_id,
          }
        );
      }
    } catch (error) {
      console.error("Lỗi khi xóa ảnh:", error);
      toast.error("Xoá ảnh thất bại!");
      return;
    }

    // Xóa ảnh khỏi state
    const newImages = [...formData.images];
    newImages.splice(index, 1);
    setFormData((prev) => ({ ...prev, images: newImages }));

    toast.error("Đã xoá ảnh.");
  };

  const addImageField = () => {
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, { id: null, url: "" }],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const preparedData = {
  ...formData,
  images: formData.images.map((img) => img.url),
  is_auction_only: Number(formData.is_auction_only) || 0,
};


    try {
      await axios.put(
        `${Constants.DOMAIN_API}/admin/variants/${id}`,
        preparedData
      );
      toast.success("Cập nhật biến thể thành công!");
      navigate(`/admin/products/detail/${formData.product_id}`);
    } catch (error) {
      console.error("Lỗi khi cập nhật:", error);
      toast.error("Cập nhật thất bại!");
    }
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
 const handleBack = async () => {
  // Duyệt tất cả ảnh chưa có id (chưa lưu vào DB)
  const cloudOnlyImages = formData.images.filter(
    (img) => !img.id && img.url?.public_id
  );

  // Xóa từng ảnh trên Cloudinary
  for (const img of cloudOnlyImages) {
    await deleteCloudImage(img.url.public_id);
  }

  // Quay lại trang chi tiết sản phẩm
  navigate(`/admin/products/detail/${formData.product_id}`);
};

  if (!variant) return <p>Đang tải dữ liệu...</p>;

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-5xl mx-auto p-10 bg-white shadow-lg rounded-lg space-y-8"
    >
     <h2 className="text-3xl font-bold text-center mb-6">
  Chỉnh sửa biến thể
  {/* {Number(formData.is_auction_only) === 1 && (
    <span className="ml-2 inline-block px-2 py-0.5 text-xs rounded bg-purple-100 text-purple-700 border border-purple-200">
      Đấu giá
    </span>
  )} */}
</h2>

      

      {/* Thông tin cơ bản */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label htmlFor="sku" className="block text-sm font-medium mb-1">
            SKU
          </label>
          <input
            type="text"
            id="sku"
            name="sku"
            value={formData.sku}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            placeholder="Mã SKU"
          />
        </div>
        <div>
          <label htmlFor="price" className="block text-sm font-medium mb-1">
            Giá
          </label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            placeholder="Giá"
          />
        </div>
        <div>
          <label htmlFor="stock" className="block text-sm font-medium mb-1">
            Tồn kho
          </label>
          <input
            type="number"
            id="stock"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            placeholder="Tồn kho"
            disabled={Number(formData.is_auction_only) === 1}

          />
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-4">
        {/* Thuộc tính */}
        <fieldset className="flex-1 border rounded p-4">
          <legend className="font-semibold text-lg px-2">Thuộc tính</legend>
          <div className="space-y-4 mt-2">
            {formData.attributes.map((attr, index) => {
              const selectedAttr = attributesList.find(
                (item) => item.id === parseInt(attr.attribute_id)
              );
              const isColor =
                selectedAttr?.name.toLowerCase() === "màu sắc" ||
                selectedAttr?.name.toLowerCase() === "màu";

              return (
                <div
                  key={index}
                  className="flex flex-col md:flex-row items-center gap-4"
                >
                  <select
                    value={attr.attribute_id}
                    onChange={(e) =>
                      handleAttributeChange(
                        index,
                        "attribute_id",
                        e.target.value
                      )
                    }
                    className="border p-2 rounded w-full md:w-1/3"
                  >
                    <option value="">Chọn thuộc tính</option>
                    {attributesList
                      .filter((item) => {
                        const isSelected = formData.attributes.some(
                          (a, i) =>
                            i !== index && parseInt(a.attribute_id) === item.id
                        );
                        return !isSelected;
                      })
                      .map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                  </select>

                  {isColor ? (
                    <input
                      type="color"
                      value={attr.value}
                      onChange={(e) =>
                        handleAttributeChange(index, "value", e.target.value)
                      }
                      className="border rounded w-full md:w-1/3 h-10"
                    />
                  ) : (
                    <input
                      type="text"
                      placeholder="Giá trị"
                      value={attr.value}
                      onChange={(e) =>
                        handleAttributeChange(index, "value", e.target.value)
                      }
                      className="border p-2 rounded w-full md:w-1/3"
                    />
                  )}

                  <button
                    type="button"
                    onClick={() => handleDeleteAttribute(attr.id)}
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
                </div>
              );
            })}

            {formData.attributes.length < attributesList.length && (
              <button
                type="button"
                onClick={addAttributeField}
                className="text-blue-600 "
              >
                + Thêm thuộc tính
              </button>
            )}
          </div>
        </fieldset>

        {/* Ảnh biến thể */}
        <fieldset className="flex-1 border rounded p-4">
  <legend className="font-semibold text-lg px-2">Ảnh biến thể</legend>

  {/* Input chọn nhiều ảnh */}
  <input
    type="file"
    multiple
    accept="image/*"
    onChange={handleImageUpload}
    className="w-full border p-2 rounded mb-4"
  />

  {/* Hiển thị ảnh theo dạng thanh cuộn ngang */}
  <div className="flex overflow-x-auto gap-4">
    {formData.images.map((img, index) => (
      <div key={index} className="relative flex-shrink-0">
        <img
          src={img.url?.url || img.url}
          alt={`image-${index}`}
          className="w-24 h-24 object-cover rounded border"
        />
        <button
  type="button"
  onClick={() => handleDeleteImage(index)}
  className="absolute top-1 right-1 bg-red-600 text-white w-5 h-5 flex items-center justify-center text-xs rounded-full shadow hover:scale-110 transition"
  aria-label="Xóa ảnh"
>
  ×
</button>

      </div>
    ))}
  </div>
</fieldset>

      </div>

      {/* Nút submit */}
 <div className="flex flex-col md:flex-row items-start md:items-center gap-2 justify-start">

  <button
    type="submit"
    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-sm"
  >
    Cập nhật
  </button>
  <button
  type="button"
  onClick={handleBack}
  className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
>
  Quay lại
</button>


 {/* Toggle is_auction_only */}
 <div className="form-check form-switch d-flex align-items-center gap-2">
  <input
      className="form-check-input"
  type="checkbox"
  checked={Number(formData.is_auction_only) === 1}
  onChange={(e) => {
    if (formData.has_promotion) {
      toast.error("Biến thể đang được áp mã giảm giá, không thể bật đấu giá!");
      return;
    }
    const checked = e.target.checked;
    setFormData((prev) => ({
      ...prev,
      is_auction_only: checked ? 1 : 0,
      stock: checked ? 1 : prev.stock,
    }));
  }}
/>

  <label className="form-check-label ms-2" htmlFor="auctionSwitch">
    {Number(formData.is_auction_only) === 1
      ? "Biến thể đấu giá (không thể thay đổi)"
      : "Đặt là biến thể đấu giá"}
  </label>
</div>


  
</div>

    </form>
  );
};

export default EditVariantForm;
