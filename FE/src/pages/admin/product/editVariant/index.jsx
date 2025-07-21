import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import { uploadToCloudinary } from "../../../../Upload/uploadToCloudinary.js";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Constants from "../../../../Constants.jsx";

const EditVariantForm = () => {
  const { id } = useParams();
  const [variant, setVariant] = useState(null);
  const [attributesList, setAttributesList] = useState([]);
  const [formData, setFormData] = useState({
    id: "",
    sku: "",
    price: "",
    stock: "",
    attributes: [],
    images: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const attrRes = await axios.get(
          `${Constants.DOMAIN_API}/admin/product-attributes`
        );
        setAttributesList(attrRes.data.data);

        const res = await axios.get(
          `${Constants.DOMAIN_API}/admin/variants/${id}`
        );
        const data = res.data.data;

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

  const handleImageChange = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const url = await uploadToCloudinary(file);
      const newImages = [...formData.images];
      newImages[index] = { id: null, url };
      console.log(newImages);

      setFormData((prev) => ({ ...prev, images: newImages }));

      toast.success("Tải ảnh lên thành công!");
    } catch (error) {
      console.error("Upload thất bại:", error);
      toast.error("Lỗi khi upload ảnh lên Cloudinary!");
    }
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
    console.log(image);

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

    toast.success("Đã xoá ảnh.");
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
    };

    try {
      await axios.put(
        `${Constants.DOMAIN_API}/admin/variants/${id}`,
        preparedData
      );
      toast.success("Cập nhật biến thể thành công!");
    } catch (error) {
      console.error("Lỗi khi cập nhật:", error);
      toast.error("Cập nhật thất bại!");
    }
  };

  if (!variant) return <p>Đang tải dữ liệu...</p>;

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-5xl mx-auto p-10 bg-white shadow-lg rounded-lg space-y-8"
    >
      <h2 className="text-3xl font-bold text-center mb-6">
        Chỉnh sửa biến thể
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
                selectedAttr?.name.toLowerCase() === "color" ||
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
                className="text-blue-600 hover:underline"
              >
                + Thêm thuộc tính
              </button>
            )}
          </div>
        </fieldset>

        {/* Ảnh biến thể */}
        <fieldset className="flex-1 border rounded p-4">
          <legend className="font-semibold text-lg px-2">Ảnh biến thể</legend>
          <div className="space-y-4 mt-2">
            {formData.images.map((img, index) => (
              <div key={index} className="flex items-center gap-4">
                {img.url && (
                  <img
                    src={img?.url?.url || img?.url}
                    alt={`image-${index}`}
                    className="h-16 w-16 object-cover rounded"
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, index)}
                  className="flex-1 border p-2 rounded"
                />
                <button
                  type="button"
                  onClick={() => handleDeleteImage(index)}
                  className="text-red-600 hover:text-red-800 p-1 rounded"
                  aria-label="Xóa ảnh"
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
            ))}

            <button
              type="button"
              onClick={addImageField}
              className="text-blue-600 hover:underline"
            >
              + Thêm ảnh
            </button>
          </div>
        </fieldset>
      </div>

      {/* Nút submit */}
      <div className="flex gap-x-3 justify-start">
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white py-1.5 px-4 rounded text-sm"
        >
          Cập nhật
        </button>

        <Link
          to={`/admin/products/detail/${formData.product_id}`}
          className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
        >
          Quay lại
        </Link>
      </div>
    </form>
  );
};

export default EditVariantForm;
