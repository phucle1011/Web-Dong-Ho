import FormDelete from "../../../../components/formDelete";
import axios from "axios";
import Constants from "../../../../Constants";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";


const UserGetAll = () => {

    const [userData, setData] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        getAll();
    }, []);

    const getAll = async () => {
        try {
            const res = await axios.get(`${Constants.DOMAIN_API}/admin/user/list`);
            console.log(res.data.data);
            setData(res.data.data);
        } catch (error) {
            console.log(error);
        }
    };

    const deleteUser = async () => {
        if (!selectedUser) return;
        try {
            await axios.delete(`${Constants.DOMAIN_API}/admin/user/${selectedUser.id}`);
            setSelectedUser(null);
            getAll();
        } catch (error) {
            console.log("Lỗi khi xóa:", error);
        }
    };

    const renderUser = (user, index) => {
        return (
            <tr key={user.id} className="border-b">
                <td className="p-2 border">{user.id}</td>
                <td className="p-2 border text-center">
                    <img
                        src={user?.image ? `${Constants.DOMAIN_API}/uploads/${user.image}` : "https://media-public.canva.com/mDo-I/MAGCJcmDo-I/1/t.png"}
                        className="w-10 h-10 rounded-full"
                        alt="user"
                    />
                </td>
                <td className="p-2 border">{user.fullName}</td>
                <td className="p-2 border">{user.email}</td>
                <td className="p-2 border">{user.phone}</td>
                <td className="p-2 border">{user.role === 'admin' ? "Quản trị viên" : "Khách hàng"}</td>
                <td className="p-2 border">
                    <span className={`px-2 py-1 rounded-full text-xs ${user.status === 1
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                        }`}>
                        {user.status === 1 ? "Hoạt động" : "Bị khóa"}
                    </span>
                </td>
                <td className="p-2 flex gap-2">
                    <Link to={`/admin/user/edit?id=${user.id}`} className="bg-yellow-500 text-white py-2 px-3 rounded">
                        <i className="fa-solid fa-pen-to-square text-md"></i>
                    </Link>
                    <button
                        onClick={() => setSelectedUser(user)}
                        className="bg-red-500 text-white py-2 px-3 rounded"
                    >
                        <i className="fa-solid fa-trash text-md"></i>
                    </button>
                </td>
            </tr>

        );
    };
    return (
        <div className="container mx-auto p-2">
            <div className="bg-white p-4 shadow rounded-md">
                <Link
                    to="/admin/user/create"
                    className="inline-block bg-[#073272] text-white px-4 py-2 rounded"
                >
                    Thêm người dùng
                </Link>
                <table className="w-full border-collapse border border-gray-300 mt-4">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="p-2 border">ID</th>
                            <th className="p-2 border">Hình ảnh</th>
                            <th className="p-2 border">Họ và tên</th>
                            <th className="p-2 border">Email</th>
                            <th className="p-2 border">Số điện thoại</th>
                            <th className="p-2 border">Vai trò</th>
                            <th className="p-2 border">Trạng thái</th>
                            <th className="p-2 border">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {userData.map((renderUser))}
                    </tbody>
                </table>
                {selectedUser && (
                    <FormDelete
                        isOpen={selectedUser !== null}
                        onClose={() => setSelectedUser(null)}
                        onConfirm={deleteUser}
                        message={`Bạn có chắc chắn muốn xóa tài khoản "${selectedUser?.fullName}" không?`}
                    />
                )}
            </div>
        </div>
    )
}
export default UserGetAll;