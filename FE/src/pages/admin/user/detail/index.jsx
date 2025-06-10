import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Constants from "../../../../Constants";
import { toast } from "react-toastify";
import axios from "axios";
import Swal from "sweetalert2";
import {
  FaTrashAlt,
  FaEdit 
} from "react-icons/fa";

function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [addresses, setAddresses] = useState([]);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [selectedNewStatus, setSelectedNewStatus] = useState('');
  const [reasonOption, setReasonOption] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");
  const [isEdit, setIsEdit] = useState("");
  const [addressData, setAddressData] = useState("");

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

  // Hàm xử lý chọn trạng thái mới -> mở modal chọn lý do
  const handleStatusChange = (newStatus) => {
    setSelectedNewStatus(newStatus);
    setReasonOption('');
    setCustomReason('');
    setShowReasonModal(true);
  };

  // Gửi lý do + cập nhật trạng thái
  const handleSubmitReason = async () => {
    const finalReason = reasonOption === 'Khác' ? customReason : reasonOption;
    if (!finalReason || !finalReason.trim()) {
      toast.warning("Vui lòng nhập lý do thay đổi trạng thái.");
      return;
    }

    try {
      const res = await axios.put(`${Constants.DOMAIN_API}/admin/user/${id}/status`, {
        status: selectedNewStatus,
        reason: finalReason
      });
      toast.success(res.data.message);
      fetchUserDetail(); // Tải lại dữ liệu người dùng
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái người dùng:", error);
      toast.error("Không thể cập nhật trạng thái người dùng.");
    } finally {
      setShowReasonModal(false);
      setSelectedNewStatus('');
    }
  };


  // Danh sách lý do theo trạng thái
  const getReasonOptionsForStatus = (status) => {
    switch (status) {
      case "inactive":
        return (
          <>
            <option value="">-- Chọn lý do --</option>
            <option value="Không hoạt động trong thời gian dài">Không hoạt động trong thời gian dài</option>
            <option value="Yêu cầu tạm dừng của người dùng">Yêu cầu tạm dừng của người dùng</option>
            <option value="Lý do nội bộ hệ thống">Lý do nội bộ hệ thống</option>
            <option value="Khác">Khác</option>
          </>
        );
      case "locked":
        return (
          <>
            <option value="">-- Chọn lý do --</option>
            <option value="Vi phạm chính sách cộng đồng">Vi phạm chính sách cộng đồng</option>
            <option value="Hoạt động đáng ngờ">Hoạt động đáng ngờ</option>
            <option value="Spam hoặc lạm dụng">Spam hoặc lạm dụng</option>
            <option value="Khác">Khác</option>
          </>
        );
      case "active":
        return (
          <>
            <option value="">-- Chọn lý do --</option>
            <option value="Kích hoạt lại tài khoản">Kích hoạt lại tài khoản</option>
            <option value="Xác minh thành công">Xác minh thành công</option>
            <option value="Khác">Khác</option>
          </>
        );
      default:
        return (
          <>
            <option value="">-- Chọn lý do --</option>
            <option value="Lý do chung">Lý do chung</option>
            <option value="Khác">Khác</option>
          </>
        );
    }
  };

  // Hiển thị tên trạng thái tiếng Việt
  const getVietnameseStatus = (englishStatus) => {
    switch (englishStatus) {
      case "active": return "Hoạt động";
      case "inactive": return "Ngưng hoạt động";
      // case "pending": return "Chờ duyệt";
      case "locked": return "Bị khóa";
      default: return "Không xác định";
    }
  };


  // Phần address
  const getProvinceName = (list, id) => {
    const item = list.find(i => i.ProvinceID == id);
    return item?.ProvinceName || '';
  };

  const getDistrictName = (list, id) => {
    const item = list.find(i => i.DistrictID == id);
    return item?.DistrictName || '';
  };

  const getWardName = (list, id) => {
    const item = list.find(i => i.WardCode == id);
    return item?.WardName || '';
  };

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const res = await axios.get(`${Constants.DOMAIN_API}/apiRoutes/provinces`);
        setProvinces(res.data);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách tỉnh:", error);
      }
    };

    fetchProvinces();
  }, []);

  useEffect(() => {
    if (!selectedProvince) return;

    const fetchDistricts = async () => {
      try {
        const res = await axios.get(
          `${Constants.DOMAIN_API}/apiRoutes/districts?provinceId=${selectedProvince}`
        );
        setDistricts(res.data);
        setWards([]);
        setSelectedDistrict("");
        setSelectedWard("");
      } catch (error) {
        console.error("Lỗi khi lấy danh sách quận:", error);
      }
    };

    fetchDistricts();
  }, [selectedProvince]);

  useEffect(() => {
    if (!selectedDistrict) return;

    const fetchWards = async () => {
      try {
        const res = await axios.get(
          `${Constants.DOMAIN_API}/apiRoutes/wards?districtId=${selectedDistrict}`
        );
        setWards(res.data);
        setSelectedWard("");
      } catch (error) {
        console.error("Lỗi khi lấy danh sách phường:", error);
      }
    };

    fetchWards();
  }, [selectedDistrict]);

  const showAddressModal = (address = null) => {
    const isEdit = !!address;

    Swal.fire({
      title: isEdit ? "Cập nhật địa chỉ" : "Thêm địa chỉ mới",
      html: `
      <div class="container mt-3 text-left">
        <form>
          <div class="mb-4">
            <label for="swal-address_line" class="form-label font-semibold block mb-1">Địa chỉ:</label>
            <input type="text" id="swal-address_line" class="form-input w-full border rounded px-3 py-2" value="${address?.address_line || ''}">
          </div>
          <div class="mb-4">
            <label for="swal-province" class="form-label font-semibold block mb-1">Tỉnh/Thành phố:</label>
            <select id="swal-province" class="form-select w-full border rounded px-3 py-2">
              <option value="">Chọn tỉnh/thành phố</option>
              ${provinces.map(p => `<option value="${p.ProvinceID}">${p.ProvinceName}</option>`).join("")}
            </select>
          </div>
          <div class="mb-4">
            <label for="swal-district" class="form-label font-semibold block mb-1">Quận/Huyện:</label>
            <select id="swal-district" class="form-select w-full border rounded px-3 py-2" disabled>
              <option value="">Chọn quận/huyện</option>
            </select>
          </div>
          <div class="mb-4">
            <label for="swal-ward" class="form-label font-semibold block mb-1">Xã/Phường:</label>
            <select id="swal-ward" class="form-select w-full border rounded px-3 py-2" disabled>
              <option value="">Chọn xã/phường</option>
            </select>
          </div>
          <div class="form-check mb-3 flex items-center">
            <input type="checkbox" class="form-check-input mr-2" id="swal-is_default" ${address?.is_default === 1 ? "checked" : ""}>
            <label class="form-check-label font-semibold" for="swal-is_default">Đặt làm địa chỉ mặc định</label>
          </div>
        </form>
      </div>
    `,
      didOpen: async () => {
        const provinceSelect = Swal.getPopup().querySelector("#swal-province");
        const districtSelect = Swal.getPopup().querySelector("#swal-district");
        const wardSelect = Swal.getPopup().querySelector("#swal-ward");
        const addressInput = Swal.getPopup().querySelector("#swal-address_line");

        const fetchDistricts = async (provinceId) => {
          try {
            const res = await axios.get(`${Constants.DOMAIN_API}/apiRoutes/districts?provinceId=${provinceId}`);
            return res.data;
          } catch (err) {
            console.error("Lỗi tải quận:", err);
            return [];
          }
        };

        const fetchWards = async (districtId) => {
          try {
            const res = await axios.get(`${Constants.DOMAIN_API}/apiRoutes/wards?districtId=${districtId}`);
            return res.data;
          } catch (err) {
            console.error("Lỗi tải phường:", err);
            return [];
          }
        };

        // Hàm cập nhật địa chỉ đầy đủ vào ô input
        const updateFullAddress = () => {
          const provinceName = provinceSelect.options[provinceSelect.selectedIndex]?.text || "";
          const districtName = districtSelect.options[districtSelect.selectedIndex]?.text || "";
          const wardName = wardSelect.options[wardSelect.selectedIndex]?.text || "";

          let fullAddress = "";

          if (wardName && districtName && provinceName) {
            fullAddress = `${wardName}, ${districtName}, ${provinceName}`;
          } else if (districtName && provinceName) {
            fullAddress = `${districtName}, ${provinceName}`;
          } else if (provinceName) {
            fullAddress = `${provinceName}`;
          }

          addressInput.value = fullAddress;
        };

        // Load dữ liệu cũ nếu là edit
        if (isEdit && address) {
          const province = provinces.find(p => p.ProvinceName === address.city);
          if (province) {
            provinceSelect.value = province.ProvinceID;

            districtSelect.disabled = false;
            const districts = await fetchDistricts(province.ProvinceID);
            districtSelect.innerHTML = '<option value="">Chọn quận/huyện</option>';
            districts.forEach(d => {
              const option = document.createElement("option");
              option.value = d.DistrictID;
              option.text = d.DistrictName;
              if (d.DistrictName === address.district) option.selected = true;
              districtSelect.appendChild(option);
            });

            // Lấy DistrictID từ dropdown quận đã chọn
            const selectedDistrictOption = districtSelect.options[districtSelect.selectedIndex];
            const districtId = selectedDistrictOption?.value;

            if (districtId) {
              wardSelect.disabled = false;
              const wards = await fetchWards(districtId); // Dùng districtId ở đây ✅
              wardSelect.innerHTML = '<option value="">Chọn xã/phường</option>';
              wards.forEach(w => {
                const option = document.createElement("option");
                option.value = w.WardCode;
                option.text = w.WardName;
                if (w.WardName === address.ward) option.selected = true; // So sánh theo tên ✅
                wardSelect.appendChild(option);
              });
            }
          }

          updateFullAddress();
        }

        // Sự kiện chọn tỉnh
        provinceSelect.addEventListener("change", async (e) => {
          const provinceId = e.target.value;
          districtSelect.disabled = !provinceId;
          wardSelect.disabled = true;
          districtSelect.innerHTML = '<option value="">Chọn quận/huyện</option>';
          wardSelect.innerHTML = '<option value="">Chọn xã/phường</option>';

          if (!provinceId) return;

          const districts = await fetchDistricts(provinceId);
          districts.forEach(d => {
            const option = document.createElement("option");
            option.value = d.DistrictID;
            option.text = d.DistrictName;
            districtSelect.appendChild(option);
          });

          updateFullAddress();
        });

        // Sự kiện chọn quận
        districtSelect.addEventListener("change", async (e) => {
          const districtId = e.target.value;
          wardSelect.disabled = !districtId;
          wardSelect.innerHTML = '<option value="">Chọn xã/phường</option>';

          if (!districtId) return;

          const wards = await fetchWards(districtId);
          wards.forEach(w => {
            const option = document.createElement("option");
            option.value = w.WardCode;
            option.text = w.WardName;
            wardSelect.appendChild(option);
          });

          updateFullAddress();
        });

        // Sự kiện chọn phường
        wardSelect.addEventListener("change", () => {
          updateFullAddress();
        });
      },
      showCancelButton: true,
      confirmButtonText: isEdit ? "Cập nhật" : "Thêm",
      cancelButtonText: "Hủy",
      preConfirm: () => {
        const address_line = Swal.getPopup().querySelector("#swal-address_line").value.trim();
        const provinceSelect = Swal.getPopup().querySelector("#swal-province");
        const districtSelect = Swal.getPopup().querySelector("#swal-district");
        const wardSelect = Swal.getPopup().querySelector("#swal-ward");
        const is_default = Swal.getPopup().querySelector("#swal-is_default").checked ? 1 : 0;

        const city = provinceSelect.options[provinceSelect.selectedIndex]?.text || "";
        const district = districtSelect.options[districtSelect.selectedIndex]?.text || "";
        const ward = wardSelect.options[wardSelect.selectedIndex]?.text || "";

        if (!city || !district || !ward) {
          Swal.showValidationMessage("Vui lòng chọn đầy đủ tỉnh/quận/phường.");
          return false;
        }

        return {
          address_line,
          city,
          district,
          ward,
          is_default,
        };
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        if (isEdit) {
          await handleUpdateAddress(address.id, result.value);
        } else {
          await handleAddAddress(result.value);
        }
        fetchUserDetail();
      }
    });
  };

  const handleAddAddress = async (addressData) => {
    if (addressData.is_default === 1) {
      const hasDefault = addresses.some((addr) => addr.is_default === 1);
      if (hasDefault) {
        toast.success("Vui lòng bỏ chọn địa chỉ mặc định hiện tại trước khi đặt địa chỉ này làm mặc định.");
        return;
      }
    }
    try {
      const res = await axios.post(`${Constants.DOMAIN_API}/admin/user/${id}/addresses`, addressData);
      toast.success("Thêm địa chỉ thành công");
      fetchUserDetail();
    } catch (error) {
      console.error("Lỗi khi thêm địa chỉ:", error);
      toast.success("Thêm địa chỉ thất bại");
    }
  };

  const handleUpdateAddress = async (addressId, addressData) => {
    if (addressData.is_default === 1) {
      const hasOtherDefault = addresses.some(
        (addr) => addr.is_default === 1 && addr.id !== addressId
      );
      if (hasOtherDefault) {
        toast.success("Vui lòng bỏ chọn địa chỉ mặc định hiện tại trước khi đặt địa chỉ này làm mặc định.");
        return;
      }
    }
    try {
      const res = await axios.put(
        `${Constants.DOMAIN_API}/admin/user/${id}/addresses/${addressId}`,
        addressData
      );
      toast.success("Cập nhật địa chỉ thành công");
      fetchUserDetail();
    } catch (error) {
      console.error("Lỗi khi cập nhật địa chỉ:", error);
      toast.success("Lỗi khi cập nhật địa chỉ");
    }
  };

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

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white-50 min-h-screen">
      {/* Thông tin người dùng */}
      <div className="bg-white shadow-lg rounded-xl p-6 mb-8 border border-gray-200">
        <h1 className="text-xl font-semibold">
          Thông Tin người dùng
        </h1>

        {/* Layout: Avatar bên trái - Thông tin bên phải */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar bên trái */}
          <div className="md:w-1/3 flex justify-center md:justify-center">
            {user.avatar ? (
              <img
                src={user.avatar.startsWith('http') ? user.avatar : `${Constants.DOMAIN_API}/uploads/${user.avatar}`}
                alt={user.name}
                className="w-32 h-32 object-cover rounded-full shadow-md border-2 border-gray-300"
              />
            ) : (
              <div className="w-32 h-32 flex items-center justify-center bg-gray-100 rounded-full border-2 border-dashed border-gray-300">
                <span className="text-gray-400 text-sm text-center px-2">Không có avatar</span>
              </div>
            )}
          </div>
          {/* Thông tin bên phải */}
          <div className="md:w-2/3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 mb-6 -ml-6 w-full">
              <div className="flex items-center">
                <strong className="text-gray-600 w-24">Họ tên:</strong>
                <input
                  type="text"
                  className="text-gray-800 border border-gray-200 rounded px-3 py-1.5 bg-gray-50 w-full focus:outline-none"
                  value={user.name || ''}
                  readOnly
                />
              </div>

              {/* Email */}
              <div className="flex items-center">
                <strong className="text-gray-600 w-24">Email:</strong>
                <input
                  type="text"
                  className="text-blue-600 border border-gray-200 rounded px-3 py-1.5 bg-gray-50 w-full cursor-pointer hover:underline focus:outline-none"
                  value={user.email || ''}
                  readOnly
                  onClick={() => user.email && window.open(`mailto:${user.email}`)}
                />
              </div>

              {/* Vai trò */}
              <div className="flex items-center">
                <strong className="text-gray-600 w-24">Vai trò:</strong>
                <input
                  type="text"
                  className="capitalize px-3 py-1.5 border border-gray-200 rounded bg-blue-100 text-blue-800 text-sm font-medium w-full focus:outline-none"
                  value={user.role || ''}
                  readOnly
                />
              </div>

              {/* Trạng thái */}
              <div className="flex items-center">
                <strong className="text-gray-600 w-24">Trạng thái:</strong>
                <select
                  value={user.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="text-gray-800 border border-gray-200 rounded px-3 py-1.5 bg-gray-50 w-full focus:outline-none"
                >
                  <option value="active">Hoạt động</option>
                  <option value="inactive">Ngưng hoạt động</option>
                  <option value="locked">Bị khóa</option>
                </select>
              </div>

              {/* Ngày tạo */}
              <div className="flex items-center">
                <strong className="text-gray-600 w-24">Ngày tạo:</strong>
                <input
                  type="text"
                  className="text-gray-800 border border-gray-200 rounded px-3 py-1.5 bg-gray-50 w-full focus:outline-none"
                  value={user.created_at ? new Date(user.created_at).toLocaleDateString() : ''}
                  readOnly
                />
              </div>

              {/* Ngày cập nhật */}
              <div className="flex items-center">
                <strong className="text-gray-600 w-24">Ngày cập nhật:</strong>
                <input
                  type="text"
                  className="text-gray-800 border border-gray-200 rounded px-3 py-1.5 bg-gray-50 w-full focus:outline-none"
                  value={user.updated_at ? new Date(user.updated_at).toLocaleDateString() : ''}
                  readOnly
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal chọn lý do */}
      {showReasonModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              Lý do thay đổi trạng thái sang: <span className="text-blue-600">{getVietnameseStatus(selectedNewStatus)}</span>
            </h3>
            <label className="block mb-2">Chọn lý do mẫu:</label>
            <select
              value={reasonOption}
              onChange={(e) => {
                setReasonOption(e.target.value);
                setCustomReason('');
              }}
              className="w-full border rounded px-3 py-2 mb-4"
            >
              {getReasonOptionsForStatus(selectedNewStatus)}
            </select>
            {reasonOption === 'Khác' && (
              <>
                <label className="block mb-2">Nhập lý do khác:</label>
                <input
                  type="text"
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Nhập lý do..."
                />
              </>
            )}
            <div className="flex justify-end mt-4 space-x-2">
              <button
                onClick={() => setShowReasonModal(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmitReason}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Phần địa chỉ */}
      <section className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h3 className="text-xl font-semibold mb-4 border-b border-gray-200 pb-2 text-gray-700 flex justify-between items-center">
          Địa chỉ
          <button
            className="px-2 py-1 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition duration-200 ease-in-out text-sm flex items-center"
            onClick={() => showAddressModal()}
          >
            <i className="fas fa-plus mr-1 text-xs"></i>+ Thêm địa chỉ mới
          </button>
        </h3>
        {addresses.length === 0 ? (
          <p className="text-gray-600 italic">Chưa có địa chỉ nào.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300 rounded divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  {["ID", "Địa chỉ", "Xã/Phường", "Quận/Huyện", "Tỉnh/Thành phố", "Mặc định", "Thao tác"].map(header => (
                    <th key={header} className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {addresses.map(addr => (
                  <tr key={addr.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">{addr.id}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{addr.address_line}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{addr.ward}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{addr.district}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{addr.city}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-center font-semibold">
                      {addr.is_default === 1 ? (
                        <span className="text-green-600">Có</span>
                      ) : (
                        <span className="text-gray-400">Không</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap space-x-2">
                      <button
                        className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-green-700"
                        onClick={() => showAddressModal(addr)}
                      >
                        <FaEdit size={24} />
                      </button>
                      <button
                        className="text-2xl p-2 rounded-full bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 transition duration-200"
                        onClick={() => handleDeleteAddress(addr.id)}
                      >
                        <FaTrashAlt/>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Nút quay lại */}
      <div className="mt-4 text-left">
        <button
          onClick={() => navigate("/admin/user/getAll")}
          className="bg-gray-600 text-white px-6 py-2 rounded-md shadow-md hover:bg-gray-700 transition duration-200 ease-in-out"
        >
          Quay lại
        </button>
      </div>
    </div>
  );
}

export default UserDetail;