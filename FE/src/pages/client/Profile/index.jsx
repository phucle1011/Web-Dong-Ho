import Navbar from "../../../components/client/Navbar";
import axios from "axios";
import { useState, useEffect } from "react";
import Constants from "../../../Constants";
import { Link } from "react-router-dom";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

function Profile() {
    const [profileData, setProfileData] = useState({
        id: null,
        fullName: "",
        email: "",
        phone: "",
        password: "",
        image: "",
    });
    const [imageFile, setImageFile] = useState(null);

    useEffect(() => {
        getData();
    }, []);

    const getData = async () => {
        try {
            const token = Cookies.get("token");
            if (!token) {
                console.log("Không tìm thấy token trong cookie");
                return;
            }

            const decoded = jwtDecode(token);
            const userId = decoded.id;

            const res = await axios.get(`${Constants.DOMAIN_API}/profile/getId/${userId}`);
            if (res.data && res.data.data) {
                const userData = res.data.data;
                // Khởi tạo mật khẩu mặc định là "oldPassword" khi lấy dữ liệu
                userData.password = "oldPassword";
                setProfileData(res.data.data);
                console.log("Sau khi cập nhật:", res.data.data);
            } else {
                console.log("Không có dữ liệu người dùng.");
                alert("Không tìm thấy thông tin người dùng.");
            }
        } catch (err) {
            console.log("Lỗi khi lấy dữ liệu", err);
            alert("Có lỗi xảy ra, vui lòng thử lại.");
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfileData({ ...profileData, [name]: value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        console.log("Trước khi cập nhật:", profileData);

        try {
            const formData = new FormData();
            if (profileData.fullName && profileData.fullName.trim() !== "") {
                formData.append("fullName", profileData.fullName);
            }

            if (profileData.email && profileData.email.trim() !== "") {
                formData.append("email", profileData.email);
            }

            if (profileData.phone && profileData.phone.trim() !== "") {
                formData.append("phone", profileData.phone);
            }

            if (profileData.password && profileData.password.trim() !== "" && profileData.password !== "oldPassword") {
                formData.append("password", profileData.password);
            }

            if (imageFile) {
                formData.append("image", imageFile);
            }


            await axios.patch(
                `${Constants.DOMAIN_API}/profile/update/${profileData.id}`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                }
            );

            alert("Cập nhật thành công!");
            getData();
        } catch (error) {
            console.log("Update error:", error);
            alert("Cập nhật thất bại!");
        }
        console.log(`${Constants.DOMAIN_API}/${profileData.image}`);
    };

    return (
        <main className="profile mt-[11%] mb-[1%] h-full">
            <div className="flex w-[80%] mx-auto">
                <div className="w-[20%] bg-gray-100 p-3 rounded-md border border-gray-200">
                    <Navbar />
                </div>

                <form className="w-[80%] bg-white p-5 rounded-md ml-4" onSubmit={handleSubmit}>
                    <div className="flex items-center gap-4 relative justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">Thông tin cá nhân</h1>
                            <p className="text-gray-600">Quản lý và cập nhật thông tin cá nhân của bạn.</p>
                        </div>

                        <label htmlFor="avatarInput" className="cursor-pointer relative">
                            <img
                                src={`${Constants.DOMAIN_API}/${profileData.image}`}
                                alt="Ảnh đại diện"
                                className="w-24 h-24 rounded-full object-cover"
                            />
                            <input
                                type="file"
                                id="avatarInput"
                                className="opacity-0 absolute w-full h-full top-0 left-0 cursor-pointer"
                                onChange={handleImageChange}
                            />
                        </label>
                    </div>

                    <div className="space-y-4 border-gray-300 mt-[2%]">
                        <div className="flex justify-between items-center border-b border-gray-300 pb-2">
                            <label className="font-medium w-1/5">Họ và tên</label>
                            <div className="flex items-center gap-2 w-4/5">
                                <input
                                    type="text"
                                    name="fullName"
                                    value={profileData.fullName}
                                    onChange={handleInputChange}
                                    className="rounded-md p-2 w-full focus:ring-1 focus:ring-blue-500 border-gray-300"
                                />
                                <i className="fas fa-pen text-gray-400"></i>
                            </div>
                        </div>

                        <div className="flex justify-between items-center border-b border-gray-300 pb-2">
                            <label className="font-medium w-1/5">Password</label>
                            <div className="flex items-center gap-2 w-4/5">
                                <input
                                    type="password"
                                    name="password"
                                    value={profileData.password}
                                    onChange={handleInputChange}
                                    className="rounded-md p-2 w-full focus:ring-1 focus:ring-blue-500 border-gray-300"
                                />
                                <i className="fas fa-pen text-gray-400"></i>
                            </div>
                        </div>

                        <div className="flex justify-between items-center border-b border-gray-300 pb-2">
                            <label className="font-medium w-1/5">Địa chỉ email</label>
                            <div className="flex items-center gap-2 w-4/5">
                                <input
                                    type="email"
                                    name="email"
                                    value={profileData.email}
                                    onChange={handleInputChange}
                                    className="rounded-md p-2 w-full focus:ring-1 focus:ring-blue-500 border-gray-300"
                                />
                                <i className="fas fa-pen text-gray-400"></i>
                            </div>
                        </div>

                        <div className="flex justify-between items-center border-b border-gray-300 pb-2">
                            <label className="font-medium w-1/5">Số điện thoại</label>
                            <div className="flex items-center gap-2 w-4/5">
                                <input
                                    type="tel"
                                    name="phone"
                                    value={profileData.phone}
                                    onChange={handleInputChange}
                                    className="rounded-md p-2 w-full focus:ring-1 focus:ring-blue-500 border-gray-300"
                                />
                                <i className="fas fa-pen text-gray-400"></i>
                            </div>
                        </div>
                    </div>

                    <button className="bg-[#043175] text-white px-6 py-2 rounded mt-[1%]">Cập nhật</button>
                </form>
            </div>
        </main>
    );
}

export default Profile;
