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
  FaEdit
} from "react-icons/fa";
import { uploadToCloudinary } from "../../../../Upload/uploadToCloudinary.js";
import { Editor } from "@tinymce/tinymce-react";

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

useEffect(() => {
  if (id) {
    fetchProduct();
    fetchVariants(currentPage);
  }
}, [id, currentPage]);
 
  const fetchProduct = async () => {
    try {
      const res = await axios.get(`${Constants.DOMAIN_API}/admin/products/${id}`);
      setProduct(res.data.data);
      setFormData(res.data.data);
      setDescription(res.data.data.description)
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


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "price" || name === "discount_price"
          ? parseFloat(value)
          : value,
    }));
  };
const productData = {
        ...formData,
        description: description,
      };
  const handleSave = async () => {
    try {
      setSaving(true);
      await axios.put(`${Constants.DOMAIN_API}/admin/products/${id}`, productData);
      toast.success("Cập nhật sản phẩm thành công!");
      fetchProduct(); // Cập nhật lại dữ liệu
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
    toast.success("Xóa sản phẩm thành công");

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

        <div className="flex gap-6 mb-4">
  <div className="flex flex-col items-start gap-2">
  {/* Ảnh thumbnail */}
  <img
    src={formData.thumbnail || "https://via.placeholder.com/150"}
    alt={formData.thumbnail}
    className="w-40 h-40 object-cover rounded"
  />

  {/* Input upload ảnh thumbnail nằm bên dưới ảnh */}
  <input
    type="file"
    accept="image/*"
    onChange={handleThumbnailChange}
    className="mt-2"
  />
</div>



  {/* Inputs chia 2 cột */}
  <div className="flex-1">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="font-semibold">Tên sản phẩm:</label>
        <input
          type="text"
          name="name"
          className="border rounded p-2 w-full"
          value={formData.name}
          onChange={handleChange}
        />
      </div>

      <div>
        <label className="font-semibold">Trạng thái:</label>
        <select
          name="status"
          className="border rounded p-2 w-full"
          value={formData.status}
          onChange={handleChange}
        >
          <option value={1}>Hiển thị</option>
          <option value={0}>Ẩn</option>
        </select>
      </div>

      <div>
        <label className="font-semibold">Danh mục:</label>
        <input
          type="text"
          className="border rounded p-2 w-full"
          value={formData.category?.name || "Không có"}
          readOnly
        />
      </div>

      <div>
        <label className="font-semibold">Thương hiệu:</label>
        <input
          type="text"
          className="border rounded p-2 w-full"
          value={formData.brand?.name || "Không có"}
          readOnly
        />
      </div>
    </div>

    {/* Mô tả để cuối */}
    <div className="mt-4">
      <label className="font-semibold">Mô tả:</label>
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
                
                cb(result.url, { title: file.name }); // truyền đúng kiểu string URL
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


        <div className="flex gap-3 mt-4">
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
            <td className="p-2 border text-center">{index + 1}</td> {/* Hiển thị STT */}
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
    onClick={() => handleDeleteVariant(variant.id)}
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
        {currentPage < totalPages - 2 && <span className="px-2">...</span>}
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
