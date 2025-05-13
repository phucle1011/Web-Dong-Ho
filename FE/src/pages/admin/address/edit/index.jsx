import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import Constants from '../../../../Constants';

const AddressEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { register, handleSubmit, setValue, watch, formState: { errors }, setError } = useForm();

  const [users, setUsers] = useState([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);

  const selectedUserId = watch('user_id');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${Constants.DOMAIN_API}/admin/user/list`);
        setUsers(response.data.data);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách user:", error);
      }
    };

    const fetchAddress = async () => {
      try {
        const response = await axios.get(`${Constants.DOMAIN_API}/admin/address/${id}`);
        const data = response.data.data;
        setValue("user_id", data.user_id);
        setUserSearchTerm(data.user_name || '');
        setValue("address_line1", data.address_line1);
        setValue("address_line2", data.address_line2);
        setValue("city", data.city);
        setValue("district", data.district);
        setValue("province", data.province);
        setValue("postal_code", data.postal_code);
        setValue("is_default", data.is_default);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu địa chỉ:", error);
        alert("Không tìm thấy địa chỉ.");
      }
    };

    fetchUsers().then(fetchAddress);
  }, [id, setValue]);

  useEffect(() => {
    if (userSearchTerm) {
      const filtered = users.filter(user =>
        user.name.toLowerCase().includes(userSearchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers([]);
    }
  }, [userSearchTerm, users]);

  const handleSelectUser = (userId, name) => {
    setValue('user_id', userId);
    setUserSearchTerm(name);
    setFilteredUsers([]);
  };

  const onSubmit = async (data) => {
    if (!data.user_id) {
      setError('user_id', { message: 'Vui lòng chọn người dùng.' });
      return;
    }

    try {
      await axios.put(`${Constants.DOMAIN_API}/admin/address/edit/${id}`, {
        ...data,
        is_default: data.is_default ? true : false,
      });
      alert("Cập nhật địa chỉ thành công!");
      navigate('/admin/address/getAll');
    } catch (error) {
      console.error("Lỗi khi cập nhật địa chỉ:", error);
      alert("Cập nhật địa chỉ thất bại.");
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body p-4">
              <h5 className="card-title fw-semibold mb-4">Chỉnh sửa địa chỉ người dùng</h5>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="row mb-3">
                  <label className="col-sm-2 col-form-label">Người dùng</label>
                  <div className="col-sm-10 position-relative">
                    <input
                      type="text"
                      className={`form-control ${errors.user_id ? "is-invalid" : ""}`}
                      value={userSearchTerm}
                      onChange={(e) => {
                        setUserSearchTerm(e.target.value);
                        setValue('user_id', ''); // reset chọn user_id
                      }}
                      placeholder="Tìm kiếm người dùng..."
                      autoComplete="off"
                    />
                    {errors.user_id && <div className="invalid-feedback">{errors.user_id.message}</div>}
                    {filteredUsers.length > 0 && (
                      <ul className="list-group position-absolute w-100 mt-1" style={{ zIndex: 1000 }}>
                        {filteredUsers.map(user => (
                          <li
                            key={user.id}
                            className="list-group-item list-group-item-action"
                            onClick={() => handleSelectUser(user.id, user.name)}
                            style={{ cursor: "pointer" }}
                          >
                            {user.name} ({user.email})
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
                      className={`form-control ${errors.address_line1 ? 'is-invalid' : ''}`}
                      {...register("address_line1", { required: "Địa chỉ 1 là bắt buộc." })}
                    />
                    {errors.address_line1 && <div className="invalid-feedback">{errors.address_line1.message}</div>}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Địa chỉ 2</label>
                    <input type="text" className="form-control" {...register("address_line2")} />
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Thành phố</label>
                    <input
                      type="text"
                      className={`form-control ${errors.city ? 'is-invalid' : ''}`}
                      {...register("city", { required: "Thành phố là bắt buộc." })}
                    />
                    {errors.city && <div className="invalid-feedback">{errors.city.message}</div>}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Quận/Huyện</label>
                    <input
                      type="text"
                      className={`form-control ${errors.district ? 'is-invalid' : ''}`}
                      {...register("district", { required: "Quận/Huyện là bắt buộc." })}
                    />
                    {errors.district && <div className="invalid-feedback">{errors.district.message}</div>}
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Tỉnh</label>
                    <input type="text" className="form-control" {...register("province")} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Mã bưu điện</label>
                    <input
                      type="text"
                      className={`form-control ${errors.postal_code ? 'is-invalid' : ''}`}
                      {...register("postal_code", { required: "Mã bưu điện là bắt buộc." })}
                    />
                    {errors.postal_code && <div className="invalid-feedback">{errors.postal_code.message}</div>}
                  </div>
                </div>

                <div className="form-check mb-3">
                  <input type="checkbox" className="form-check-input" id="is_default" {...register("is_default")} />
                  <label className="form-check-label" htmlFor="is_default">Đặt làm địa chỉ mặc định</label>
                </div>

                <button type="submit" className="btn btn-primary">Cập nhật</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressEdit;
