import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import FormDelete from "../../../../components/formDelete";
import { toast } from "react-toastify";
import Constants from "../../../../Constants.jsx";
import { Modal, Carousel } from "react-bootstrap";
import {
  FaAngleDoubleLeft,
  FaChevronLeft,
  FaChevronRight,
  FaAngleDoubleRight,
  FaTrashAlt,
  FaEdit,
} from "react-icons/fa";
import { uploadToCloudinary } from "../../../../Upload/uploadToCloudinary.js";
import { Editor } from "@tinymce/tinymce-react";
import Select from "react-select";

import * as XLSX from "xlsx";
const AdminProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [formData, setFormData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [startIndex, setStartIndex] = useState(0);

  const [variants, setVariants] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 5;

  const [description, setDescription] = useState("");
 const [categoryOptions, setCategoryOptions] = useState([]);
  const [brandOptions, setBrandOptions] = useState([]);
  const handleImageClick = (images, index) => {
    setSelectedImages(images);
    setStartIndex(index);
    setShowModal(true);
  };
  const fetchVariants = async (page = 1) => {
    try {
      const res = await axios.get(
        `${Constants.DOMAIN_API}/admin/products/${id}?page=${page}&limit=${limit}`
      );

      setVariants(res.data.data.variants); // cập nhật biến thể theo trang
      setCurrentPage(res.data.data.pagination.page); // đồng bộ trang hiện tại với backend
      setTotalPages(res.data.data.pagination.totalPages); // tổng số trang
    } catch (error) {
      console.error("Lỗi khi lấy biến thể:", error);
    }
  };

 

  const fetchProduct = async () => {
  try {
    const res = await axios.get(
      `${Constants.DOMAIN_API}/admin/products/${id}`
    );

    const productData = res.data?.data || {};
console.log(res.data?.data);

    // Lấy thông tin mô tả riêng
    setDescription(productData.description || "");

    // Thiết lập state formData với dữ liệu đã xử lý
    setFormData({
      ...productData,
      category: productData.category
        ? {
            value: productData.category.id,
            label: productData.category.name,
          }
        : null,
      brand: productData.brand
        ? {
            value: productData.brand.id,
            label: productData.brand.name,
          }
        : null,
    });

    // Lưu lại thông tin sản phẩm gốc (nếu cần)
    setProduct(productData);

    // Gọi song song danh sách danh mục và thương hiệu
    const [categoriesRes, brandsRes] = await Promise.all([
      axios.get("http://localhost:5000/admin/category/list"),
      axios.get("http://localhost:5000/admin/brand/list"),
    ]);

    // Gán options cho Select
    setCategoryOptions(
      (categoriesRes.data?.data || []).map((cat) => ({
        value: cat.id,
        label: cat.name,
      }))
    );
    setBrandOptions(
      (brandsRes.data?.data || []).map((brand) => ({
        value: brand.id,
        label: brand.name,
      }))
    );
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết sản phẩm:", error);
  }
};


  useEffect(() => {
    const fetchData = async () => {
      await fetchProduct();
      await fetchVariants(currentPage);
    };
    if (id) {
      fetchData();
    }
  }, [id, currentPage]);
 // Gọi API lấy danh sách danh mục và thương hiệu
  useEffect(() => {
    const fetchData = async () => {
      try {
        
      } catch (error) {
        console.error("Lỗi khi gọi API:", error);
      }
    };

    fetchData();
  }, []);
  const handleChange = (e) => {
  const { name, value } = e.target;

  if (name === "name") {
    const slug = value
      .toLowerCase()
      .normalize("NFD")                  // Loại bỏ dấu tiếng Việt
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s-]/g, "")         // Xoá ký tự đặc biệt
      .trim()
      .replace(/\s+/g, "-")             // Thay khoảng trắng thành dấu gạch ngang
      .replace(/--+/g, "-");            // Xoá dấu gạch ngang dư

    setFormData((prev) => ({
      ...prev,
      name: value,
      slug: slug,
    }));
  } else {
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "price" || name === "discount_price"
          ? parseFloat(value)
          : value,
    }));
  }
};

  const productData = {
  ...formData,
  category_id: formData?.category?.value || null,
  brand_id: formData?.brand?.value || null,
  description: description || "",
};

  const handleSave = async () => {
    try {
      setSaving(true);
      await axios.put(
        `${Constants.DOMAIN_API}/admin/products/${id}`,
        productData
      );
      toast.success("Cập nhật sản phẩm thành công!");
      navigate("/admin/products/getAll");
      // fetchProduct(); // Cập nhật lại dữ liệu
    } catch (error) {
      console.error("Lỗi khi cập nhật sản phẩm:", error);
    } finally {
      setSaving(false);
    }
  };
  const deleteProduct = async () => {
    if (!selectedProduct) return;

    try {
      await axios.delete(
        `${Constants.DOMAIN_API}/admin/variants/${selectedProduct.id}`
      );
      toast.error("Xóa sản phẩm thành công");

      // 👉 Gọi lại API để cập nhật danh sách biến thể
      fetchVariants(currentPage);
    } catch (error) {
      console.error("Lỗi khi xóa sản phẩm:", error);
      if (
        error.response?.data?.error?.includes("foreign key constraint fails")
      ) {
        toast.error("Không thể xóa vì có sản phẩm đang sử dụng sản phẩm này.");
      } else {
        toast.error("Xóa thất bại. Vui lòng thử lại.");
      }
    } finally {
      setSelectedProduct(null);
    }
  };

  if (!formData) return <div>Đang tải...</div>;
  const handleThumbnailChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      // Gọi hàm upload từ file riêng của bạn
      const imageUrl = await uploadToCloudinary(file); // Đảm bảo đã import hoặc dùng đúng hàm

      // Cập nhật lại thumbnail cho form
      setFormData((prev) => ({
        ...prev,
        thumbnail: imageUrl.url,
      }));

      toast.success("Tải ảnh lên thành công!");
    } catch (error) {
      console.error("Lỗi khi upload ảnh:", error);
      toast.error("Tải ảnh thất bại!");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white shadow rounded-md p-4">
        <h2 className="text-2xl font-semibold mb-4">Chỉnh sửa sản phẩm</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-4">
          {/* Card 1: Ảnh đại diện + Upload */}
          <div className="p-4 border rounded shadow bg-white flex flex-col items-center">
            <label className="font-semibold mb-2 self-start">
              Ảnh đại diện:
            </label>
            <img
              src={formData.thumbnail || ""}
              alt="Thumbnail"
              className="w-32 h-32 object-cover rounded mb-2"
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleThumbnailChange}
              className="w-full"
            />
          </div>
          {/* Card 2: Tên + Slug */}
          <div className="p-4 border rounded shadow bg-white">
            {/* Tên sản phẩm */}
            <div>
              <label className="font-semibold mb-1 block">Tên sản phẩm:</label>
              <input
                type="text"
                name="name"
                className="border rounded p-2 w-full"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            {/* Gạch ngang */}
            <hr className="my-3" />

            {/* Slug */}
            <div>
              <label className="font-semibold mb-1 block">Slug:</label>
              <input
              readOnly
                type="text"
                name="slug"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed"
                value={formData.slug}
                onChange={handleChange}
              />
            </div>
          </div>
          {/* Card 3: Danh mục + Thương hiệu */}
          <div className="p-4 border rounded shadow bg-white">
  {/* Danh mục */}
  <div style={{ position: "relative", zIndex: 1 }}>
    <label className="font-semibold mb-1 block">Danh mục:</label>
    <Select
      options={categoryOptions}
      value={formData?.category || null}
      onChange={(selected) =>
        setFormData((prev) => ({ ...prev, category: selected }))
      }
      placeholder="Chọn danh mục"
      isClearable
          menuPortalTarget={document.body}
    styles={{
      menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    }}
    />
  </div>

  <hr className="my-3" />

  {/* Thương hiệu */}
  <div style={{ position: "relative", zIndex: 1 }}>
  <label className="font-semibold mb-1 block">Thương hiệu:</label>
  <Select
    options={brandOptions}
    value={formData?.brand || null}
    onChange={(selected) =>
      setFormData((prev) => ({ ...prev, brand: selected }))
    }
    placeholder="Chọn thương hiệu"
    isClearable
    menuPortalTarget={document.body}
    styles={{
      menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    }}
  />
</div>

</div>


          {/* Card 4: Trạng thái */}
          <div className="p-4 border rounded shadow bg-white">
            <span className="fw-semibold d-block mb-1">
              Trạng thái hiển thị:
            </span>
            <div className="border rounded p-2">
              <div className="form-check form-switch m-0">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="statusSwitch"
                  checked={formData.status === 1}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      status: e.target.checked ? 1 : 0,
                    }))
                  }
                />
                <span className="form-check-label ms-2">
                  {formData.status === 1 ? "Hiển thị" : "Ẩn"}
                </span>
              </div>
            </div>

            <hr className="my-3" />

            <span className="fw-semibold d-block mb-1">
              Tình trạng xuất bản:
            </span>
            <div className="border rounded p-2">
              <div className="form-check form-switch m-0">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="publicationSwitch"
                  checked={formData.publication_status === "published"}
                  onChange={(e) => {
                    if (formData.publication_status !== "published") {
                      setFormData((prev) => ({
                        ...prev,
                        publication_status: e.target.checked
                          ? "published"
                          : "draft",
                      }));
                    }
                  }}
                  disabled={formData.publication_status === "published"}
                />
                <span className="form-check-label ms-2">
                  {formData.publication_status === "published"
                    ? "Đã xuất bản"
                    : "Bản nháp"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label className="font-semibold block mb-2">Mô tả:</label>
          <Editor
            apiKey="hn83ucgq5arqkhxqdclbke1h3fu5a2zqpprjn87b3fol67jm"
            value={description}
            init={{
              height: 400,
              menubar: true,
              plugins: [
                "advlist",
                "autolink",
                "lists",
                "link",
                "image",
                "charmap",
                "preview",
                "anchor",
                "searchreplace",
                "visualblocks",
                "code",
                "fullscreen",
                "insertdatetime",
                "media",
                "table",
                "help",
                "wordcount",
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

        <div className="flex gap-2 mt-4">
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            disabled={saving}
          >
            {saving ? "Đang lưu..." : "Lưu"}
          </button>
          <Link
            to="/admin/products/getAll"
            className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
          >
            Quay lại
          </Link>
        </div>

        {/* Bảng biến thể vẫn giữ nguyên như cũ */}
        {variants?.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Biến thể sản phẩm:</h3>
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-2 border">#</th> {/* Cột thứ tự */}
                  <th className="p-2 border">SKU</th>
                  <th className="p-2 border">Giá</th>
                  <th className="p-2 border">Kho</th>
                  <th className="p-2 border">Thuộc tính</th>
                  <th className="p-2 border">Ảnh</th>
                  <th className="p-2 border">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {variants.map((variant, index) => (
                  <tr key={variant.id} className="border-b">
                    <td className="p-2 border text-center">{index + 1}</td>{" "}
                    {/* Hiển thị STT */}
                    <td className="p-2 border">{variant.sku}</td>
                    <td className="p-2 border">
                      {Number(variant.price).toLocaleString()} đ
                    </td>
                    <td className="p-2 border">
                      {variant.stock !== undefined ? variant.stock : "Chưa có"}
                    </td>
                    <td className="p-2 border">
                      {variant.attributeValues?.map((av) => (
                        <div
                          key={av.id}
                          className="flex items-center gap-2 mb-1"
                        >
                          <strong>{av.attribute?.name}:</strong>
                          {av.attribute?.name.toLowerCase() === "color" ? (
                            <div
                              className="w-6 h-6 rounded border"
                              style={{ backgroundColor: av.value }}
                              title={av.value}
                            ></div>
                          ) : (
                            <span>{av.value}</span>
                          )}
                        </div>
                      ))}
                    </td>
                    <td className="p-2 border text-center">
                      <div className="flex justify-center items-center h-full">
                        {variant.images && variant.images.length > 0 ? (
                          <img
                            key={variant.images[0].id}
                            src={variant.images[0].image_url}
                            alt="Variant"
                            width="60"
                            className="cursor-pointer rounded border"
                            onClick={() => handleImageClick(variant.images, 0)}
                          />
                        ) : (
                          <span>Không có ảnh</span>
                        )}
                      </div>
                    </td>
                    <td className="p-2 border text-center">
                      <div className="flex gap-2 justify-center">
                        <Link
                          to={`/admin/products/editVariant/${variant.id}`}
                          className="bg-yellow-500 text-white p-2 rounded w-8 h-8 inline-flex items-center justify-center"
                        >
                          <FaEdit size={20} className="font-bold" />
                        </Link>
                        {variant.canDelete && (
                          <button
                            onClick={() => setSelectedProduct(variant)}
                            className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
                            title="Xoá biến thể"
                          >
                            <FaTrashAlt size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="w-full flex justify-center mt-4">
              <div className="inline-flex items-center space-x-1">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(1)}
                  className="px-2 py-1 border rounded disabled:opacity-50"
                >
                  <FaAngleDoubleLeft />
                </button>
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="px-2 py-1 border rounded disabled:opacity-50"
                >
                  <FaChevronLeft />
                </button>

                {currentPage > 2 && (
                  <>
                    <button
                      onClick={() => setCurrentPage(1)}
                      className="px-3 py-1 border rounded"
                    >
                      1
                    </button>
                    {currentPage > 3 && <span className="px-2">...</span>}
                  </>
                )}

                {[...Array(totalPages)].map((_, i) => {
                  const page = i + 1;
                  if (page >= currentPage - 1 && page <= currentPage + 1) {
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1 border rounded ${
                          currentPage === page
                            ? "bg-blue-500 text-white"
                            : "bg-blue-100 text-black hover:bg-blue-200"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  }
                  return null;
                })}

                {currentPage < totalPages - 1 && (
                  <>
                    {currentPage < totalPages - 2 && (
                      <span className="px-2">...</span>
                    )}
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      className="px-3 py-1 border rounded"
                    >
                      {totalPages}
                    </button>
                  </>
                )}

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="px-2 py-1 border rounded disabled:opacity-50"
                >
                  <FaChevronRight />
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(totalPages)}
                  className="px-2 py-1 border rounded disabled:opacity-50"
                >
                  <FaAngleDoubleRight />
                </button>
              </div>
            </div>

            {selectedProduct && (
              <FormDelete
                isOpen={true}
                onClose={() => setSelectedProduct(null)}
                onConfirm={deleteProduct}
                message={`Bạn có chắc chắn muốn xóa sản phẩm "${selectedProduct.name}" không?`}
              />
            )}
          </div>
        )}
      </div>
      {/* Modal hiển thị ảnh lớn */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="lg"
        centered
        backdrop="static"
        animation={true}
      >
        <Modal.Header closeButton>
          <Modal.Title>Xem ảnh </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Carousel interval={null} defaultActiveIndex={startIndex}>
            {selectedImages.map((img) => (
              <Carousel.Item key={img.id}>
                <img
                  className="d-block w-100"
                  src={img.image_url}
                  alt="Bình luận"
                  style={{ maxHeight: "70vh", objectFit: "contain" }}
                />
              </Carousel.Item>
            ))}
          </Carousel>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default AdminProductDetail;
