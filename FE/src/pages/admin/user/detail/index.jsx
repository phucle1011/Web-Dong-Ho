import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Constants from "../../../../Constants";
import { toast } from "react-toastify";
import axios from "axios";
import Swal from "sweetalert2";

function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [addresses, setAddresses] = useState([]);

  useEffect(() => {
    fetchUserDetail();
  }, []);

  const fetchUserDetail = async () => {
    try {
      const res = await axios.get(`${Constants.DOMAIN_API}/admin/user/${id}`);
      if (res.data.data) {
        setUser(res.data.data);
        setAddresses(res.data.data.addresses || []);
      } else {
        setUser({});
        setAddresses([]);
      }
    } catch (error) {
      console.error("Lỗi khi lấy chi tiết người dùng:", error);
      toast.error("Không thể lấy chi tiết người dùng");
      navigate("/admin/user/getAll");
    }
  };

  const handleStatusChange = async (newStatus) => {
    Swal.fire({
      title: "Xác nhận đổi trạng thái",
      text: `Bạn có chắc chắn muốn đổi trạng thái của người dùng "${user.name}" thành "${getVietnameseStatus(
        newStatus
      )}" không?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Vâng, đổi!",
      cancelButtonText: "Hủy",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .put(`${Constants.DOMAIN_API}/admin/user/${id}/status`, {
            status: newStatus,
          })
          .then(() => {
            toast.success(`Đã cập nhật trạng thái thành: ${getVietnameseStatus(newStatus)}`);
            fetchUserDetail();
          })
          .catch((error) => {
            console.error("Lỗi khi cập nhật trạng thái người dùng:", error);
            toast.error("Lỗi khi cập nhật trạng thái người dùng");
          });
      }
    });
  };

  // Thêm địa chỉ mới
  const handleAddAddress = async (addressData) => {
    // Nếu người dùng muốn đặt làm mặc định thì kiểm tra đã có chưa
    if (addressData.is_default === 1) {
      const hasDefault = addresses.some((addr) => addr.is_default === 1);
      if (hasDefault) {
        Swal.fire({
          icon: "warning",
          title: "Chỉ được có một địa chỉ mặc định!",
          text: "Vui lòng bỏ chọn địa chỉ mặc định hiện tại trước khi đặt địa chỉ mới làm mặc định.",
        });
        return;
      }
    }

    try {
      const res = await axios.post(
        `${Constants.DOMAIN_API}/admin/user/${id}/addresses`,
        addressData
      );
      Swal.fire({
        icon: "success",
        title: "Thêm địa chỉ thành công!",
        text: res.data.message,
      });
      fetchUserDetail();
    } catch (error) {
      console.error("Lỗi khi thêm địa chỉ:", error);
      Swal.fire({
        icon: "error",
        title: "Lỗi!",
        text: error.response?.data?.message || "Không thể thêm địa chỉ.",
      });
    }
  };


  // Cập nhật địa chỉ
  const handleUpdateAddress = async (addressId, addressData) => {
    // Nếu đặt làm mặc định, kiểm tra có địa chỉ mặc định khác không
    if (addressData.is_default === 1) {
      const hasOtherDefault = addresses.some(
        (addr) => addr.is_default === 1 && addr.id !== addressId
      );
      if (hasOtherDefault) {
        Swal.fire({
          icon: "warning",
          title: "Chỉ được có một địa chỉ mặc định!",
          text: "Vui lòng bỏ chọn địa chỉ mặc định hiện tại trước khi đặt địa chỉ này làm mặc định.",
        });
        return;
      }
    }

    try {
      const res = await axios.put(
        `${Constants.DOMAIN_API}/admin/user/${id}/addresses/${addressId}`,
        addressData
      );
      Swal.fire({
        icon: "success",
        title: "Cập nhật địa chỉ thành công!",
        text: res.data.message,
      });
      fetchUserDetail();
    } catch (error) {
      console.error("Lỗi khi cập nhật địa chỉ:", error);
      Swal.fire({
        icon: "error",
        title: "Lỗi!",
        text: error.response?.data?.message || "Không thể cập nhật địa chỉ.",
      });
    }
  };

  // Xóa địa chỉ
  const handleDeleteAddress = async (addressId) => {
    Swal.fire({
      title: "Xác nhận xóa",
      text: "Bạn có chắc chắn muốn xóa địa chỉ này không?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await axios.delete(
            `${Constants.DOMAIN_API}/admin/user/${id}/addresses/${addressId}`
          );
          Swal.fire({
            icon: "success",
            title: "Xóa thành công!",
            text: res.data.message,
          });
          fetchUserDetail();
        } catch (error) {
          console.error("Lỗi khi xóa địa chỉ:", error);
          Swal.fire({
            icon: "error",
            title: "Lỗi!",
            text: error.response?.data?.message || "Không thể xóa địa chỉ.",
          });
        }
      }
    });
  };

  // Hàm lấy danh sách tỉnh/quận/xã từ API
  const fetchProvinces = async () => {
    try {
      const response = await axios.get(
        "https://open.oapi.vn/location/provinces?page=0&size=30&query="
      );
      return response.data.data || [];
    } catch (error) {
      console.error("Lỗi khi lấy danh sách tỉnh:", error);
      return [];
    }
  };

  const fetchDistricts = async (provinceId) => {
    if (!provinceId) return [];
    try {
      const response = await axios.get(
        `https://open.oapi.vn/location/districts/${provinceId}?page=0&size=30&query=`
      );
      return response.data.data || [];
    } catch (error) {
      console.error("Lỗi khi lấy danh sách quận/huyện:", error);
      return [];
    }
  };

  const fetchWards = async (districtId) => {
    if (!districtId) return [];
    try {
      const response = await axios.get(
        `https://open.oapi.vn/location/wards/${districtId}?page=0&size=30&query=`
      );
      return response.data.data || [];
    } catch (error) {
      console.error("Lỗi khi lấy danh sách xã/phường:", error);
      return [];
    }
  };

  // Hiển thị modal thêm hoặc cập nhật địa chỉ
  const showAddressModal = async (addressData = null) => {
    const provinces = await fetchProvinces();

    let cityOptions = `<option value="">Chọn thành phố</option>`;
    provinces.forEach((province) => {
      cityOptions += `<option value="${province.id}">${province.name}</option>`;
    });

    const isEdit = !!addressData;

    Swal.fire({
      title: isEdit ? "Cập nhật địa chỉ" : "Thêm địa chỉ mới",
      html: `
<div class="container mt-3 text-left">
  <form>
    <div class="mb-4">
      <label for="swal-address_line" class="form-label font-semibold block mb-1">Địa chỉ:</label>
      <input type="text" id="swal-address_line" class="form-input w-full border rounded px-3 py-2" value="${addressData?.address_line || ''}">
    </div>

    <div class="mb-4">
      <label for="swal-city" class="form-label font-semibold block mb-1">Tỉnh/Thành phố:</label>
      <select id="swal-city" class="form-select w-full border rounded px-3 py-2">
        ${cityOptions}
      </select>
    </div>

    <div class="mb-4">
      <label for="swal-district" class="form-label font-semibold block mb-1">Quận/Huyện:</label>
      <select id="swal-district" class="form-select w-full border rounded px-3 py-2" disabled>
        <option value="">Chọn quận/huyện</option>
      </select>
    </div>

    <div class="mb-4">
      <label for="swal-province" class="form-label font-semibold block mb-1">Xã/Phường/Thị Trấn:</label>
      <select id="swal-province" class="form-select w-full border rounded px-3 py-2" disabled>
        <option value="">Chọn xã/phường</option>
      </select>
    </div>

    <div class="form-check mb-3 flex items-center">
      <input type="checkbox" class="form-check-input mr-2" id="swal-is_default" ${addressData?.is_default === 1 ? "checked" : ""
        }>
      <label class="form-check-label font-semibold" for="swal-is_default">Đặt làm địa chỉ mặc định</label>
    </div>
  </form>
</div>
      `,
      didOpen: async () => {
        const citySelect = Swal.getPopup().querySelector("#swal-city");
        const districtSelect = Swal.getPopup().querySelector("#swal-district");
        const provinceSelect = Swal.getPopup().querySelector("#swal-province");

        if (isEdit && addressData) {
          citySelect.value = addressData.cityId || "";
          if (addressData.cityId) {
            districtSelect.disabled = false;
            const districts = await fetchDistricts(addressData.cityId);
            let districtOptions = '<option value="">Chọn quận/huyện</option>';
            districts.forEach((d) => {
              districtOptions += `<option value="${d.id}">${d.name}</option>`;
            });
            districtSelect.innerHTML = districtOptions;

            districtSelect.value = addressData.districtId || "";

            if (addressData.districtId) {
              provinceSelect.disabled = false;
              const wards = await fetchWards(addressData.districtId);
              let wardOptions = '<option value="">Chọn xã/phường</option>';
              wards.forEach((w) => {
                wardOptions += `<option value="${w.id}">${w.name}</option>`;
              });
              provinceSelect.innerHTML = wardOptions;

              provinceSelect.value = addressData.provinceId || "";
            }
          }
        }

        citySelect.addEventListener("change", async (e) => {
          const provinceId = e.target.value;
          if (!provinceId) {
            districtSelect.innerHTML = '<option value="">Chọn quận/huyện</option>';
            districtSelect.disabled = true;
            provinceSelect.innerHTML = '<option value="">Chọn xã/phường</option>';
            provinceSelect.disabled = true;
            return;
          }
          districtSelect.disabled = false;
          const districts = await fetchDistricts(provinceId);
          let districtOptions = '<option value="">Chọn quận/huyện</option>';
          districts.forEach((d) => {
            districtOptions += `<option value="${d.id}">${d.name}</option>`;
          });
          districtSelect.innerHTML = districtOptions;

          provinceSelect.innerHTML = '<option value="">Chọn xã/phường</option>';
          provinceSelect.disabled = true;
        });

        districtSelect.addEventListener("change", async (e) => {
          const districtId = e.target.value;
          if (!districtId) {
            provinceSelect.innerHTML = '<option value="">Chọn xã/phường</option>';
            provinceSelect.disabled = true;
            return;
          }
          provinceSelect.disabled = false;
          const wards = await fetchWards(districtId);
          let wardOptions = '<option value="">Chọn xã/phường</option>';
          wards.forEach((w) => {
            wardOptions += `<option value="${w.id}">${w.name}</option>`;
          });
          provinceSelect.innerHTML = wardOptions;
        });
      },
      showCancelButton: true,
      confirmButtonText: isEdit ? "Cập nhật" : "Thêm",
      cancelButtonText: "Hủy",
      preConfirm: () => {
        const address_line = Swal.getPopup().querySelector("#swal-address_line").value.trim();
        const cityId = Swal.getPopup().querySelector("#swal-city").value;
        const cityName = Swal.getPopup().querySelector("#swal-city").selectedOptions[0]?.text || "";
        const districtId = Swal.getPopup().querySelector("#swal-district").value;
        const districtName =
          Swal.getPopup().querySelector("#swal-district").selectedOptions[0]?.text || "";
        const provinceId = Swal.getPopup().querySelector("#swal-province").value;
        const provinceName =
          Swal.getPopup().querySelector("#swal-province").selectedOptions[0]?.text || "";
        const is_default = Swal.getPopup().querySelector("#swal-is_default").checked ? 1 : 0;

        if (!address_line || !cityId || !districtId || !provinceId) {
          Swal.showValidationMessage("Vui lòng nhập đầy đủ thông tin địa chỉ");
          return false;
        }

        return {
          address_line,
          cityId,
          city: cityName,
          districtId,
          district: districtName,
          provinceId,
          province: provinceName,
          is_default,
        };
      },
    }).then((result) => {
      if (result.isConfirmed) {
        if (isEdit) {
          handleUpdateAddress(addressData.id, result.value);
        } else {
          handleAddAddress(result.value);
        }
      }
    });
  };

  const getVietnameseStatus = (status) => {
    switch (status) {
      case "active":
        return "Hoạt động";
      case "inactive":
        return "Ngưng hoạt động";
      case "pending":
        return "Chờ duyệt";
      case "locked":
        return "Bị khóa";
      default:
        return "Không xác định";
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">
        Chi Tiết Người Dùng
      </h2>

      <div className="bg-white shadow-lg rounded-xl p-6 mb-8 border border-gray-200">
        <h3 className="text-2xl font-bold text-gray-700 mb-5 border-b pb-3">
          Thông Tin Cơ Bản
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
          <div className="flex items-center">
            <strong className="text-gray-600 w-24">ID:</strong>
            <span className="text-gray-800">{user.id}</span>
          </div>
          <div className="flex items-center">
            <strong className="text-gray-600 w-24">Họ tên:</strong>
            <span className="text-gray-800">{user.name}</span>
          </div>
          <div className="flex items-center">
            <strong className="text-gray-600 w-24">Email:</strong>
            <span className="text-blue-600 hover:underline">{user.email}</span>
          </div>
          <div className="flex items-center">
            <strong className="text-gray-600 w-24">Vai trò:</strong>
            <span className="capitalize px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {user.role}
            </span>
          </div>
          <div className="flex items-center">
            <strong className="text-gray-600 w-24">Trạng thái:</strong>
            <div className="flex items-center">
              <span
                className={`capitalize px-3 py-1 rounded-full text-sm font-medium
              ${user.status === 'active' ? 'bg-green-100 text-green-800' : ''}
              ${user.status === 'inactive' ? 'bg-red-100 text-red-800' : ''}
              ${user.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
              ${user.status === 'locked' ? 'bg-purple-100 text-purple-800' : ''}
            `}
              >
                {getVietnameseStatus(user.status)}
              </span>
              <select
                value={user.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="ml-3 border border-gray-300 rounded-md px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="active">Hoạt động</option>
                <option value="inactive">Ngưng hoạt động</option>
                <option value="pending">Chờ duyệt</option>
                <option value="locked">Bị khóa</option>
              </select>
            </div>
          </div>
          <div className="flex items-center">
            <strong className="text-gray-600 w-24">Ngày tạo:</strong>
            <span className="text-gray-800">{user.created_at && new Date(user.created_at).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center">
            <strong className="text-gray-600 w-24">Ngày cập nhật:</strong>
            <span className="text-gray-800">{user.updated_at && new Date(user.updated_at).toLocaleDateString()}</span>
          </div>
          {user.avatar && (
            <div className="col-span-1 md:col-span-2 flex flex-col items-start mt-4">
              <strong className="text-gray-600 mb-2">Ảnh đại diện:</strong>
              <img
                src={`${Constants.DOMAIN_API}/uploads/${user.avatar}`}
                alt={user.name}
                className="w-32 h-32 object-cover rounded-full shadow-md border-2 border-gray-300"
              />
            </div>
          )}
        </div>
      </div>

      <section className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-2xl font-semibold mb-4 border-b border-gray-200 pb-2 text-gray-700 flex justify-between items-center">
          Địa chỉ
          <button
            className="px-2 py-1 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition duration-200 ease-in-out text-sm flex items-center"
            onClick={() => showAddressModal()}
          >
            <i className="fas fa-plus mr-1 text-xs"></i> Thêm địa chỉ mới
          </button>

        </h3>

        {addresses.length === 0 ? (
          <p className="text-gray-600 italic">Chưa có địa chỉ nào.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300 rounded-md divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  {[
                    "ID",
                    "Địa chỉ",
                    "Thành phố",
                    "Quận/Huyện",
                    "Xã/Phường",
                    "Mặc định",
                    "Thao tác",
                  ].map((header) => (
                    <th
                      key={header}
                      className="px-4 py-3 text-left text-sm font-medium text-gray-700"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {addresses.map((addr) => (
                  <tr key={addr.id} className="hover:bg-gray-50 transition duration-200 ease-in-out">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{addr.id}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{addr.address_line}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{addr.city}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{addr.district}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{addr.province}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-semibold">
                      {addr.is_default === 1 ? (
                        <span className="text-green-600">Có</span>
                      ) : (
                        <span className="text-gray-400">Không</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap space-x-2">
                      <button
                        className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-200 ease-in-out"
                        onClick={() => showAddressModal(addr)}
                        title="Cập nhật địa chỉ"
                      >
                        <i className="fas fa-edit"></i> Cập nhật
                      </button>
                      <button
                        className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-200 ease-in-out"
                        onClick={() => handleDeleteAddress(addr.id)}
                        title="Xóa địa chỉ"
                      >
                        <i className="fas fa-trash"></i> Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default UserDetail;
