import React, { useState, useEffect } from "react";
import { decodeToken } from "../../../Helpers/jwtDecode";
import Swal from "sweetalert2";

export default function AddressesTab() {
  const [userId, setUserId] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (token) {
      const decoded = decodeToken(token);
      const id = decoded?.user_id || decoded?.id || null;
      setUserId(id);
    }
  }, []);

  useEffect(() => {
    if (userId) fetchAddresses();
  }, [userId]);

  const fetchAddresses = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:5000/address/user/${userId}`);
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Lỗi khi tải địa chỉ");
      }

      const text = await res.text();
      const data = text ? JSON.parse(text) : {};

      if (data.success && Array.isArray(data.data)) {
        setAddresses(data.data);
      } else {
        setAddresses([]);
        setError(data.message || "Không có địa chỉ nào");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

 const handleAddOrEditAddress = async (editAddress = null) => {
  const isEdit = Boolean(editAddress);
  const currentDefault = addresses.find((a) => a.is_default);
  const defaultChecked = isEdit ? editAddress.is_default : false;

  let provinces = [];
  try {
    // Fetch provinces từ backend của bạn
    const provincesRes = await fetch("http://localhost:5000/api/provinces");
    if (!provincesRes.ok) {
      const errorText = await provincesRes.text();
      throw new Error(errorText || "Lỗi khi tải danh sách tỉnh.");
    }
    provinces = await provincesRes.json();
  } catch (err) {
    Swal.fire({
      icon: "error",
      title: "Lỗi",
      text: err.message,
    });
    return;
  }

  const provinceOptions = provinces
    .map(
      (p) =>
        `<option value="${p.ProvinceID || p.ProvinceID}" ${
          p.ProvinceName === editAddress?.province ? "selected" : ""
        }>${p.ProvinceName}</option>`
    )
    .join("");

  const { value: formValues } = await Swal.fire({
    title: isEdit ? "Sửa địa chỉ" : "Thêm địa chỉ mới",
    html: `
      <input id="swal-address_line" class="swal2-input" placeholder="Địa chỉ cụ thể" value="${
        editAddress?.address_line || ""
      }">
      <select id="swal-province" class="swal2-input"><option value="">Chọn tỉnh</option>${provinceOptions}</select>
      <select id="swal-district" class="swal2-input"><option value="">Chọn quận/huyện</option></select>
      <label style="display:flex; align-items:center; justify-content:center; margin-top:10px;">
        <input type="checkbox" id="swal-is_default" style="margin-right:8px;" ${
          defaultChecked ? "checked" : ""
        }> Đặt làm địa chỉ mặc định
      </label>
    `,
    didOpen: async () => {
      const provinceSelect = document.getElementById("swal-province");
      const districtSelect = document.getElementById("swal-district");

      async function loadDistricts(provinceId, selectedDistrictName = null) {
        try {
          const res = await fetch(
            `http://localhost:5000/api/districts?provinceId=${provinceId}`
          );
          if (!res.ok) {
            const errorText = await res.text();
            throw new Error(errorText || "Lỗi khi tải danh sách quận/huyện.");
          }
          const data = await res.json();
          districtSelect.innerHTML =
            '<option value="">Chọn quận/huyện</option>' +
            (data || [])
              .map(
                (d) =>
                  `<option value="${d.DistrictID}" ${
                    d.DistrictName === selectedDistrictName ? "selected" : ""
                  }>${d.DistrictName}</option>`
              )
              .join("");
        } catch (err) {
          Swal.showValidationMessage(`Lỗi: ${err.message}`);
        }
      }

      provinceSelect.addEventListener("change", () => {
        const provinceId = provinceSelect.value;
        if (provinceId) loadDistricts(provinceId);
        else {
          districtSelect.innerHTML = '<option value="">Chọn quận/huyện</option>';
        }
      });

      // Nếu đang sửa, load sẵn data
      if (editAddress?.province) {
        const selectedProvince = provinces.find(
          (p) => p.ProvinceName === editAddress.province
        );
        if (selectedProvince) {
          provinceSelect.value = selectedProvince.ProvinceID;
          await loadDistricts(selectedProvince.ProvinceID, editAddress.district);
          // set selected district
          const districtsRes = await fetch(
            `http://localhost:5000/api/districts?provinceId=${selectedProvince.ProvinceID}`
          );
          const districtsData = await districtsRes.json();
          const selectedDistrict = (districtsData || []).find(
            (d) => d.DistrictName === editAddress.district
          );
          if (selectedDistrict) {
            districtSelect.value = selectedDistrict.DistrictID;
          }
        }
      }
    },
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: isEdit ? "Cập nhật" : "Lưu",
    preConfirm: () => {
      const address_line = document.getElementById("swal-address_line").value.trim();
      const provinceEl = document.getElementById("swal-province");
      const districtEl = document.getElementById("swal-district");

      const province = provinceEl.options[provinceEl.selectedIndex]?.text || "";
      const district = districtEl.options[districtEl.selectedIndex]?.text || "";

      const is_default = document.getElementById("swal-is_default").checked;

      if (!address_line || !province || !district) {
        Swal.showValidationMessage("Vui lòng nhập đầy đủ thông tin");
        return null;
      }

      return { address_line, province, district, is_default };
    },
  });

  if (!formValues) return;

  try {
    setSubmitting(true);

    const isChangingDefault =
      formValues.is_default &&
      currentDefault &&
      (!isEdit || editAddress.id !== currentDefault.id);

    if (isChangingDefault) {
      const confirmDefault = await Swal.fire({
        title: "Thay đổi địa chỉ mặc định?",
        text: "Hiện tại đã có một địa chỉ mặc định. Bạn có muốn thay đổi địa chỉ mặc định không?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Có, thay đổi",
        cancelButtonText: "Không",
      });

      if (!confirmDefault.isConfirmed) return;
    }

    // Remove default from old address if needed
    if (isChangingDefault) {
      const resOldDefault = await fetch(`http://localhost:5000/user/${userId}/addresses/${currentDefault.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_default: false }),
      });
      if (!resOldDefault.ok) {
          const errorText = await resOldDefault.text();
          throw new Error(errorText || "Lỗi khi cập nhật địa chỉ mặc định cũ.");
      }
      const dataOldDefault = await resOldDefault.text();
      if (dataOldDefault && !JSON.parse(dataOldDefault).success) {
          throw new Error(JSON.parse(dataOldDefault).message || "Không thể bỏ đặt mặc định địa chỉ cũ.");
      }
    }

    const url = isEdit
      ? `http://localhost:5000/user/${userId}/addresses/${editAddress.id}`
      : `http://localhost:5000/user/${userId}/addresses`;

    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formValues),
    });

    const text = await res.text();
    const data = text ? JSON.parse(text) : {};

    if (res.ok && data.success) {
      Swal.fire({
        icon: "success",
        title: isEdit ? "Cập nhật thành công" : "Thêm địa chỉ thành công",
        timer: 1500,
        showConfirmButton: false,
      });
      fetchAddresses();
    } else {
      Swal.fire({
        icon: "error",
        title: "Thất bại",
        text: data.message || "Có lỗi xảy ra",
      });
    }
  } catch (err) {
    Swal.fire({
      icon: "error",
      title: "Lỗi",
      text: err.message,
    });
  } finally {
    setSubmitting(false);
  }
};
  const handleDeleteAddress = async (id) => {
    const confirm = await Swal.fire({
      title: "Xóa địa chỉ?",
      text: "Bạn có chắc chắn muốn xóa địa chỉ này?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await fetch(`http://localhost:5000/user/${userId}/addresses/${id}`, {
        method: "DELETE",
      });

      const text = await res.text();
      const data = text ? JSON.parse(text) : {};

      if (res.ok && data.success) {
        Swal.fire({
          icon: "success",
          title: "Đã xóa",
          timer: 1200,
          showConfirmButton: false,
        });
        fetchAddresses();
      } else {
        throw new Error(data.message || "Xóa không thành công");
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: err.message,
      });
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">Lỗi: {error}</p>;

  return (
    <div>
      <div className="w-[180px] h-[50px] mt-4">
        <button
          type="button"
          className="yellow-btn w-full h-full"
          onClick={() => handleAddOrEditAddress()}
          disabled={submitting}
        >
          <div className="w-full text-sm font-semibold">Thêm địa chỉ</div>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-[30px] mt-6">
        {addresses.length === 0 && <p>Chưa có địa chỉ nào.</p>}
        {addresses.map((address, idx) => (
          <div
            key={address.id}
            className="w-full bg-primarygray p-5 border relative"
          >
            <div className="flex justify-between items-center">
              <p className="title text-[22px] font-semibold">
                Địa chỉ #{idx + 1}
              </p>
              <div className="flex gap-2">
                <button
                  className="border border-qgray w-[34px] h-[34px] rounded-full flex justify-center items-center"
                  onClick={() => handleAddOrEditAddress(address)}
                  title="Sửa"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-5 h-5 text-blue-600"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.862 3.487a2.125 2.125 0 113 3L7.5 19.849l-4 1 1-4L16.862 3.487z"
                    />
                  </svg>
                </button>

                <button
                  className="border border-qgray w-[34px] h-[34px] rounded-full flex justify-center items-center"
                  onClick={() => handleDeleteAddress(address.id)}
                  title="Xóa"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="#EB5757"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <p className="mt-2 text-base">
              <strong>Địa Chỉ Cụ Thể :</strong> {address.address_line}
            </p>
            <p className="mt-1 text-base">
              <strong>Tỉnh Thành Phố :</strong> {address.province}
            </p>
            <p className="mt-1 text-base">
              <strong>Quận Huyện :</strong> {address.district}
            </p>
            <p className="mt-1 text-base">
              <strong>Mặc Định Địa Chỉ :</strong>{" "}
              {address.is_default ? (
                <span className="text-green-600 font-semibold">Có</span>
              ) : (
                "Không"
              )}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}