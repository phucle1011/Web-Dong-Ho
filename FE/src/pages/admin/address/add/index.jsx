import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Constants from "../../../../Constants";

function AddressAdd() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);

  const [address, setAddress] = useState({
    address_line1: "",
    address_line2: "",
    city: "",
    district: "",
    province: "",
    postal_code: "",
    is_default: false,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${Constants.DOMAIN_API}/admin/user/list`);
        setUsers(response.data.data || []);
      } catch (error) {
        console.error("Lỗi khi tải danh sách người dùng:", error);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (userSearchTerm) {
      const filtered = users.filter((user) =>
        user.name.toLowerCase().includes(userSearchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers([]);
    }
  }, [userSearchTerm, users]);

  const handleSelectUser = (userId, userName) => {
    setSelectedUserId(userId);
    setUserSearchTerm(userName);
    setFilteredUsers([]);
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setAddress((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleCheckboxChange = () => {
    setAddress((prev) => ({
      ...prev,
      is_default: !prev.is_default,
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!selectedUserId) newErrors.user = "Vui lòng chọn người dùng.";
    if (!address.address_line1) newErrors.address_line1 = "Địa chỉ 1 là bắt buộc.";
    if (!address.city) newErrors.city = "Thành phố là bắt buộc.";
    if (!address.district) newErrors.district = "Quận/Huyện là bắt buộc.";
    if (!address.province) newErrors.province = "Tỉnh là bắt buộc.";
    if (!address.postal_code) newErrors.postal_code = "Mã bưu điện là bắt buộc.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await axios.post(`${Constants.DOMAIN_API}/admin/address/add`, {
        user_id: selectedUserId,
        ...address,
      });
      alert("Địa chỉ đã được thêm thành công!");
      navigate("/admin/address/getAll");
    } catch (error) {
      console.error("Lỗi khi thêm địa chỉ:", error);
      alert("Thêm địa chỉ thất bại.");
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body p-4">
              <h5 className="card-title fw-semibold mb-4">Thêm địa chỉ người dùng</h5>

              <form onSubmit={handleSubmit}>
                {/* Người dùng */}
                <div className="row mb-3">
                  <label className="col-sm-2 col-form-label">Người dùng</label>
                  <div className="col-sm-10 position-relative">
                    <input
                      type="text"
                      className={`form-control ${errors.user ? "is-invalid" : ""}`}
                      value={userSearchTerm}
                      onChange={(e) => setUserSearchTerm(e.target.value)}
                      placeholder="Tìm kiếm người dùng..."
                      autoComplete="off"
                    />
                    {errors.user && <div className="invalid-feedback">{errors.user}</div>}
                    {filteredUsers.length > 0 && (
                      <ul className="list-group position-absolute w-100 mt-1" style={{ zIndex: 1000 }}>
                        {filteredUsers.map((user) => (
                          <li
                            key={user.id}
                            className="list-group-item list-group-item-action"
                            onClick={() => handleSelectUser(user.id, user.name)}
                            style={{ cursor: "pointer" }}
                          >
                            {user.name} - {user.email}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* Địa chỉ */}
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Địa chỉ 1</label>
                    <input
                      type="text"
                      className={`form-control ${errors.address_line1 ? "is-invalid" : ""}`}
                      id="address_line1"
                      value={address.address_line1}
                      onChange={handleInputChange}
                    />
                    {errors.address_line1 && <div className="invalid-feedback">{errors.address_line1}</div>}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Địa chỉ 2</label>
                    <input
                      type="text"
                      className="form-control"
                      id="address_line2"
                      value={address.address_line2}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Thành phố</label>
                    <input
                      type="text"
                      className={`form-control ${errors.city ? "is-invalid" : ""}`}
                      id="city"
                      value={address.city}
                      onChange={handleInputChange}
                    />
                    {errors.city && <div className="invalid-feedback">{errors.city}</div>}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Quận/Huyện</label>
                    <input
                      type="text"
                      className={`form-control ${errors.district ? "is-invalid" : ""}`}
                      id="district"
                      value={address.district}
                      onChange={handleInputChange}
                    />
                    {errors.district && <div className="invalid-feedback">{errors.district}</div>}
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Tỉnh</label>
                    <input
                      type="text"
                      className={`form-control ${errors.province ? "is-invalid" : ""}`}
                      id="province"
                      value={address.province}
                      onChange={handleInputChange}
                    />
                    {errors.province && <div className="invalid-feedback">{errors.province}</div>}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Mã bưu điện</label>
                    <input
                      type="text"
                      className={`form-control ${errors.postal_code ? "is-invalid" : ""}`}
                      id="postal_code"
                      value={address.postal_code}
                      onChange={handleInputChange}
                    />
                    {errors.postal_code && <div className="invalid-feedback">{errors.postal_code}</div>}
                  </div>
                </div>

                <div className="form-check mb-3">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="is_default"
                    checked={address.is_default}
                    onChange={handleCheckboxChange}
                  />
                  <label className="form-check-label" htmlFor="is_default">
                    Đặt làm mặc định
                  </label>
                </div>

                <button type="submit" className="btn btn-primary">Lưu địa chỉ</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddressAdd;
