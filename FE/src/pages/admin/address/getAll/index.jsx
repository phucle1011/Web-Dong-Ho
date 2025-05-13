import { useEffect, useState } from "react";
import axios from "axios";
import Constants from "../../../../Constants";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
function AddressList() {
    const [addresses, setAddresses] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAddresses = async () => {
            try {
                const response = await axios.get(`${Constants.DOMAIN_API}/admin/address/list`);
                setAddresses(response.data.data || []);
            } catch (error) {
                console.error("Lỗi khi tải địa chỉ:", error);
            }
        };

        fetchAddresses();
    }, []);

    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-12 d-flex align-items-stretch">
                    <div className="card w-100">
                        <div className="card-body p-4">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h5 className="card-title fw-semibold mb-0">Quản lý địa chỉ người dùng</h5>
                                <button
                                    className="btn btn-success"
                                    onClick={() => navigate("/admin/address/add")}
                                >
                                    + Thêm địa chỉ
                                </button>
                            </div>
                            <div className="table-responsive">
                                <table className="table text-nowrap mb-0 align-middle">
                                    <thead className="text-dark fs-4">
                                        <tr>
                                            <th>ID</th>
                                            <th>Người dùng</th>
                                            <th>Email</th>
                                            <th>Địa chỉ 1</th>
                                            <th>Địa chỉ 2</th>
                                            <th>Thành phố</th>
                                            <th>Quận/Huyện</th>
                                            <th>Tỉnh</th>
                                            <th>Mã bưu điện</th>
                                            <th>Mặc định</th>
                                            <th>Ngày tạo</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {addresses.map((item) => (
                                            <tr key={item.id}>
                                                <td>{item.id}</td>
                                                <td>{item.user_name}</td>
                                                <td>{item.user_email}</td>
                                                <td>{item.address_line1}</td>
                                                <td>{item.address_line2 || "-"}</td>
                                                <td>{item.city || "-"}</td>
                                                <td>{item.district}</td>
                                                <td>{item.province}</td>
                                                <td>{item.postal_code}</td>
                                                <td>
                                                    <span className={`badge ${item.is_default ? "bg-success" : "bg-secondary"}`}>
                                                        {item.is_default ? "Có" : "Không"}
                                                    </span>
                                                </td>
                                                <td>{new Date(item.created_at).toLocaleString()}</td>
                                                <td>
                                                    <div className="d-flex gap-2">
                                                        <Link to={`/admin/address/edit/${item.id}`} className="btn btn-sm btn-primary">
                                                            Sửa
                                                        </Link>
                                                        <button className="btn btn-sm btn-danger">Xóa</button>
                                                    </div>

                                                </td>
                                            </tr>
                                        ))}
                                        {addresses.length === 0 && (
                                            <tr>
                                                <td colSpan="12" className="text-center text-muted">
                                                    Không có địa chỉ nào.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AddressList;
