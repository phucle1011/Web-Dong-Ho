import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { uploadToCloudinary } from "../../../../Upload/uploadToCloudinary.js";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const EditVariantForm = () => {
  const { id } = useParams();
  const [variant, setVariant] = useState(null);
  const [attributesList, setAttributesList] = useState([]);
  const [formData, setFormData] = useState({
    sku: "",
    price: "",
    stock: "",
    attributes: [],
    images: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const attrRes = await axios.get("http://localhost:5000/admin/product-attributes");
        setAttributesList(attrRes.data.data);

        const res = await axios.get(`http://localhost:5000/admin/variants/${id}`);
        const data = res.data.data;
        setVariant(data);
        setFormData({
          sku: data.sku || "",
          price: data.price || "",
          stock: data.stock || "",
          attributes: data.attributeValues?.map((attr) => ({
            attribute_id: attr.product_attribute_id,
            value: attr.value,
          })) || [],
          images: data.images?.map((img) => ({
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
      setFormData((prev) => ({ ...prev, images: newImages }));
      toast.success("Tải ảnh lên thành công!");
    } catch (error) {
      console.error("Upload thất bại:", error);
      toast.error("Lỗi khi upload ảnh lên Cloudinary!");
    }
  };

  const handleDeleteAttribute = async (index) => {
    const attribute = formData.attributes[index];

    if (attribute.id) {
      try {
        await axios.delete(`http://localhost:5000/admin/variant-attributes/${attribute.id}`);
      } catch (error) {
        console.error("Lỗi khi xóa thuộc tính:", error);
        toast.error("Xoá thuộc tính thất bại!");
        return;
      }
    }

    const newAttributes = [...formData.attributes];
    newAttributes.splice(index, 1);
    setFormData((prev) => ({ ...prev, attributes: newAttributes }));
    toast.success("Đã xoá thuộc tính.");
  };

  const handleDeleteImage = async (index) => {
    const image = formData.images[index];
    if (!image) return;

    if (image.id) {
      try {
        await axios.delete(`http://localhost:5000/admin/variant-images/${image.id}`);
      } catch (error) {
        console.error("Lỗi khi xóa ảnh:", error);
        toast.error("Xoá ảnh thất bại!");
        return;
      }
    }

    const newImages = [...formData.images];
    newImages.splice(index, 1);
    setFormData((prev) => ({ ...prev, images: newImages }));
    toast.success("Đã xoá ảnh.");
  };

  const addImageField = () => {
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ""],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const preparedData = {
      ...formData,
      images: formData.images.map((img) => img.url),
    };

    try {
      await axios.put(`http://localhost:5000/admin/variants/${id}`, preparedData);
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
      className="max-w-2xl mx-auto p-4 bg-white shadow rounded"
    >
      <h2 className="text-xl font-bold mb-4">Sửa Biến Thể</h2>

      {/* SKU, price, stock giữ nguyên */}
      <div className="mb-4">
        <label className="block font-medium mb-2">Thuộc tính</label>
        {formData.attributes.map((attr, index) => (
          <div key={index} className="mb-2 flex gap-2">
            <select
              value={attr.attribute_id}
              onChange={(e) =>
                handleAttributeChange(index, "attribute_id", e.target.value)
              }
              className="border p-2 w-1/3 rounded"
            >
              <option value="">Chọn thuộc tính</option>
              {attributesList.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Giá trị"
              value={attr.value}
              onChange={(e) =>
                handleAttributeChange(index, "value", e.target.value)
              }
              className="border p-2 w-2/3 rounded"
            />
          </div>
        ))}
        <button
          type="button"
          onClick={addAttributeField}
          className="mt-2 text-blue-600 underline"
        >
          + Thêm thuộc tính
        </button>
      </div>

      <div className="mb-4">
        <label className="block font-medium mb-2">Ảnh biến thể</label>
        {formData.images.map((img, index) => (
          <div key={index} className="mb-2">
            {img.url && (
              <div className="flex items-center gap-2">
                <img src={img.url} alt={`image-${index}`} className="h-16" />
                <button
                  type="button"
                  onClick={() => handleDeleteImage(index)}
                  className="text-red-600 hover:underline"
                >
                  Xoá
                </button>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageChange(e, index)}
              className="block w-full border p-2 rounded"
            />
          </div>
        ))}

        <button
          type="button"
          onClick={addImageField}
          className="mt-2 text-blue-600 underline"
        >
          + Thêm ảnh
        </button>
      </div>

      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
      >
        Cập nhật
      </button>
    </form>
  );
};

export default EditVariantForm;
