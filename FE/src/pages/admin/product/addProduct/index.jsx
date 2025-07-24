import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import Constants from "../../../../Constants.jsx";
import { uploadToCloudinary } from "../../../../Upload/uploadToCloudinary.js";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import { Editor } from "@tinymce/tinymce-react";
import Select from "react-select";
import AddBrandModal from "../addBrandModal/AddBrandModal.jsx"; // đường dẫn tùy bạn
import AddCategoryModal from "../addBrandModal/AddCategoryModal";
import ParentComponent from "../cartOne/ParentComponent.jsx"; // đường dẫn tùy vào nơi bạn đặt file
import { deleteImageFromCloudinary  } from "../../../../Upload/uploadToCloudinary.js";

import CustomUploadAdapter from "../../../../Upload/CustomUploadAdapter"; 
const StatusEnum = {
  DRAFT: "DRAFT",
  PUBLISHED: "PUBLISHED",
};
const AddProduct = () => {
  const {
  register,
  handleSubmit,
  watch,
  formState: { errors },
  reset,
  setValue,       // ✅ thêm dòng này
  trigger         // ✅ và dòng này
} = useForm(
  {defaultValues: {
    is_featured: StatusEnum.DRAFT,
  },}
);

    const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
const [brandOptions, setBrandOptions] = useState([]);
const [categoryOptions, setCategoryOptions] = useState([]);
const [thumbnailFile, setThumbnailFile] = useState(null);
const [thumbnailUrl, setThumbnailUrl] = useState("");
const [uploading, setUploading] = useState(false);
const [description, setDescription] = useState("");
const status = watch("status");
const [showBrandModal, setShowBrandModal] = useState(false);
const [showCategoryModal, setShowCategoryModal] = useState(false);
const [slugEdit, setSlugEdit] = useState(false); // Có đang chỉnh slug thủ công không?

const [variants, setVariants] = useState([]);
  const [attributes, setAttributes] = useState([]);


const handleBrandAdded = () => {
  setShowBrandModal(false);
  fetchData(); // hoặc reload brandOptions nếu cần
};

const handleCategoryAdded = () => {
  setShowCategoryModal(false);
  fetchData(); // load lại danh sách category
};



// 👇 Di chuyển ra ngoài useEffect để dùng được ở nhiều chỗ
const fetchData = async () => {
  try {
    const [categoryRes, brandRes] = await Promise.all([
      axios.get(`${Constants.DOMAIN_API}/admin/category/list`),
      axios.get(`${Constants.DOMAIN_API}/admin/brand/list`),
    ]);

    const brandList = brandRes.data.data || [];
    const categoryList = categoryRes.data.data || [];

    const brandData = brandList
      .filter((brand) => brand.status === "active")
      .map((brand) => ({
        value: brand.id,
        label: brand.name,
      }));

    const categoryData = categoryList
      .filter((cat) => cat.status === "active")
      .map((cat) => ({
        value: cat.id,
        label: cat.name,
      }));

    setBrandOptions(brandData);
    setCategoryOptions(categoryData);
  } catch (err) {
    console.error("Lỗi khi load category/brand:", err);
  }
};

useEffect(() => {
  fetchData();
}, []);

  // Gọi API lấy danh sách danh mục và thương hiệu
  useEffect(() => {
  fetchData();
}, []);
  useEffect(() => {
    const fetchAttributes = async () => {
      const res = await axios.get(`${Constants.DOMAIN_API}/admin/product-attributes`);
      setAttributes(res.data.data);
       // tuỳ theo API trả gì
    };
    fetchAttributes();
  }, []);
useEffect(() => {
  if (!slugEdit) {
    const name = watch("name");
    const slug = generateSlug(name || "");
    setValue("slug", slug);
    trigger("slug");
  }
}, [watch("name")]);



function CustomUploadAdapterPlugin(editor) {
  editor.plugins.get("FileRepository").createUploadAdapter = (loader) => {
    return new CustomUploadAdapter(loader);
  };
}
const onSubmit = async (formData) => {
  setLoading(true);
  setMessage("");

  try {
    // Bước 1: Kiểm tra dữ liệu biến thể trước khi gửi
    for (let i = 0; i < variants.length; i++) {
      const variant = variants[i];
      if (
        !variant.sku?.trim() ||
        !variant.stock?.toString().trim() ||
        !variant.price?.toString().trim() ||
        
        !variant.attributes?.length
      ) {
        toast.error(` Biến thể ${i + 1} đang thiếu thông tin bắt buộc.`);
        setLoading(false);
        return;
      }
    }

    // Bước 2: Gửi request tạo sản phẩm chính
    const productData = {
      ...formData,
      thumbnail: thumbnailUrl,
      description: description,
    };

    const productRes = await axios.post(`${Constants.DOMAIN_API}/admin/products`, productData);
    const newProductId = productRes.data.product.id;

    // Bước 3: Gửi từng biến thể
    for (const variant of variants) {
      const variantData = {
        ...variant,
        images: variant.images.map((img) => img.url),
      };

      await axios.post(`${Constants.DOMAIN_API}/admin/products/${newProductId}/variants`, variantData);
    }

    toast.success(" Thêm sản phẩm và biến thể thành công!");
    navigate("/admin/products/getAll");

    // Reset form
    reset();
    setThumbnailFile(null);
    setThumbnailUrl("");
  } catch (error) {
    console.error(error);
    toast.error(" Lỗi: " + (error.response?.data?.error || "Không xác định"));
  } finally {
    setLoading(false);
  }
};



const handleThumbnailChange = async (e) => {
  const file = e.target.files[0];
  if (file) {
    setThumbnailFile(file);
    console.log(file);
    
    try {
      const url = await uploadToCloudinary(file);
      setThumbnailUrl(url);

    } catch (err) {
      console.error("Upload failed:", err);
      toast.error(" Upload ảnh thất bại");
    }
  }
};
const generateSlug = (text) => {
  return text
    .toLowerCase()
    .normalize("NFD") // chuẩn hóa
    .replace(/[\u0300-\u036f]/g, "") // xóa dấu
    .replace(/[^a-z0-9 -]/g, "") // xóa ký tự đặc biệt
    .trim()
    .replace(/\s+/g, "-") // thay khoảng trắng bằng dấu -
    .replace(/-+/g, "-"); // bỏ dấu - lặp
};




  return (
    <div className="max-w-screen-xl mx-auto bg-white p-5 md:p-10 rounded shadow mt-2 mb-2">
  <h2 className="text-2xl font-semibold mb-6">Thêm sản phẩm mới</h2>

  {message && <p className="mb-4 text-sm text-blue-600">{message}</p>}

  <form onSubmit={handleSubmit(onSubmit)} noValidate>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

  {/* Tên sản phẩm */}
  {/* Tên sản phẩm */}
<div className="col-span-1 border p-3 rounded">
  <div className="flex items-center justify-between mb-1">
    <label className="form-label">Tên sản phẩm</label>
  </div>
  <input
    type="text"
    className="form-control"
    {...register("name", { required: "Vui lòng nhập tên sản phẩm" })}
  />
  {errors.name && (
    <small className="text-danger">{errors.name.message}</small>
  )}

<div className="flex items-center justify-between mb-1 pt-4">
    <label className="form-label">Slug</label>
  </div>
<input
  type="text"
  readOnly
  className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed"
  value={watch("slug") || ""}
  {...register("slug")}
  onFocus={() => setSlugEdit(true)}
  onBlur={() => setSlugEdit(false)}
  onChange={e => {
    setValue("slug", e.target.value);
    trigger("slug");
  }}
  disabled={false} // hoặc cho phép chỉnh sửa nếu cần
/>

  {errors.slug && (
    <small className="text-danger">{errors.slug.message}</small>
  )}
</div>




  {/* Thương hiệu */}
<div className="col-span-1 border p-3 rounded">
  {/* ========== THƯƠNG HIỆU ========== */}
  <div className="flex items-center justify-between mb-1">
    <label className="form-label">Thương hiệu</label>
    <button
      type="button"
      onClick={() => setShowBrandModal(true)}
      className="text-blue-600 hover:underline text-sm"
    >
      + Thêm thương hiệu
    </button>
  </div>

  <Select
    options={brandOptions}
    className="basic-single-select"
    classNamePrefix="select"
    onChange={(selectedOption) => {
      const value = selectedOption ? selectedOption.value : null;
      setValue("brand_id", value);
      trigger("brand_id");
    }}
    placeholder="Chọn thương hiệu..."
    isClearable
    menuPortalTarget={document.body}
    styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
  />
  <input
    type="hidden"
    {...register("brand_id", {
      required: "Vui lòng chọn 1 thương hiệu",
    })}
  />
  {errors.brand_id && (
    <small className="text-danger">{errors.brand_id.message}</small>
  )}

  {showBrandModal && (
    <AddBrandModal
      onClose={() => setShowBrandModal(false)}
      onSuccess={handleBrandAdded}
    />
  )}

  {/* ========== DANH MỤC ========== */}
  {/* ========== DANH MỤC ========== */}
{/* ========== DANH MỤC ========== */}
<div className="flex items-center justify-between mt-4 mb-1">
  <label className="form-label">Danh mục</label>
  <button
    type="button"
    onClick={() => setShowCategoryModal(true)}
    className="text-blue-600 hover:underline text-sm"
  >
    + Thêm danh mục
  </button>
</div>

<Select
  isMulti
  options={categoryOptions}
  className="basic-multi-select"
  classNamePrefix="select"
  onChange={(selectedOptions) => {
    const values = selectedOptions ? selectedOptions.map(opt => opt.value) : [];
    setValue("category_id", values);
    trigger("category_id");
  }}
  placeholder="Chọn danh mục..."
  isClearable
  menuPortalTarget={document.body}
  styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
/>

<input
  type="hidden"
  {...register("category_id", {
    required: "Vui lòng chọn ít nhất 1 danh mục",
  })}
/>
{errors.category_id && (
  <small className="text-danger">{errors.category_id.message}</small>
)}

{showCategoryModal && (
  <AddCategoryModal
    onClose={() => setShowCategoryModal(false)}
    onSuccess={handleCategoryAdded}
  />
)}




</div>





  {/* Ảnh sản phẩm */}
  {/* Cột trái: upload ảnh */}
  <div className="col-span-1 border p-3 rounded">
    <label className="block font-medium mb-1 text-sm">Ảnh sản phẩm *</label>
    <input
      type="file"
      className="w-full border px-3 py-2 rounded text-sm"
      accept="image/*"
      onChange={handleThumbnailChange}
    />
    {thumbnailUrl && (
      <img
        src={thumbnailUrl.url}
        alt="Preview"
        className="mt-2 w-full h-auto max-h-48 object-contain border rounded"
      />
    )}
  </div>

  {/* Cột phải: trạng thái + nút */}
  <div className="border p-3 rounded flex flex-col justify-between">
    <fieldset className="mb-4">
  <legend className="fs-5 fw-semibold text-dark mb-3">Tùy chọn sản phẩm</legend>

  <div className="d-flex justify-content-end gap-5">
    {/* Toggle Xuất bản */}
    <div className="form-check form-switch d-flex align-items-center gap-2">
      <input
        type="checkbox"
        className="form-check-input"
        id="statusSwitch"
        {...register("status")}
        defaultChecked={true}
      />
      <label
        className="form-check-label"
        htmlFor="statusSwitch"
        style={{ minWidth: "70px", textAlign: "left" }}
      >
        {watch("status") ? " Hiển thị" : " Ẩn "}
      </label>
    </div>

    {/* Toggle Hiển thị trên trang chủ */}
    <div className="form-check form-switch d-flex align-items-center gap-2">
  <input
    type="checkbox"
    className="form-check-input"
    id="featuredSwitch"
    onChange={(e) => {
      setValue("is_featured", e.target.checked ? StatusEnum.PUBLISHED : StatusEnum.DRAFT);
    }}
    checked={watch("is_featured") === StatusEnum.PUBLISHED}
  />
  <label
    className="form-check-label"
    htmlFor="featuredSwitch"
    style={{ minWidth: "70px", textAlign: "left" }}
  >
    {watch("is_featured") === StatusEnum.PUBLISHED ? "Xuất bản" : "Nháp"}
  </label>
</div>

  </div>
</fieldset>



    {/* Nút submit */}
    <div className="flex justify-end items-center gap-2 pt-2 border-t mt-auto">
      <Link
        to="/admin/products/getAll"
            className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
      >
        Quay lại
      </Link>
      <button
        type="submit"
        disabled={loading}
        className="bg-[#073272] text-white px-6 py-2 rounded hover:bg-[#052354] transition"
      >
        {loading ? "Đang thêm..." : "Thêm sản phẩm"}
      </button>
    </div>
  </div>






  {/* Mô tả (chiếm toàn bộ 3 cột) */}
  <div className="col-span-2">
    <label className="block font-medium mb-1 text-sm mb-2">Mô tả</label>
    <div className="bg-white border rounded">
      <Editor
        apiKey="hn83ucgq5arqkhxqdclbke1h3fu5a2zqpprjn87b3fol67jm"
        value={description}
        init={{
          height: 400,
          menubar: true,
          plugins: [
            "advlist", "autolink", "lists", "link", "image", "charmap", "preview", "anchor",
            "searchreplace", "visualblocks", "code", "fullscreen",
            "insertdatetime", "media", "table", "help", "wordcount"
          ],
          toolbar:
            "undo redo | formatselect | bold italic backcolor | \
             alignleft aligncenter alignright alignjustify | \
             bullist numlist outdent indent | image | help",
          image_title: true,
          automatic_uploads: true,
          file_picker_types: "image",
          file_picker_callback: function (cb, value, meta) {
            const input = document.createElement("input");
            input.setAttribute("type", "file");
            input.setAttribute("accept", "image/*");
            input.onchange = async function () {
              const file = input.files[0];
              if (!file) return;
              try {
                const result = await uploadToCloudinary(file);
                cb(result.url, { title: file.name });
              } catch (err) {
                console.error("Upload lỗi:", err);
              }
            };
            input.click();
          },
        }}
        onEditorChange={(content) => setDescription(content)}
      />
    </div>
  </div>




</div>
<div className="col-span-1 border p-3 rounded" >
  <ParentComponent allAttributes={attributes}
onVariantsChange={setVariants} />
</div>
  </form>
</div>




  );
};

export default AddProduct;
