import { useRef, useState, useEffect } from "react";
import InputCom from "../../../Helpers/InputCom";
import axios from "axios";
import { uploadToCloudinary } from "../../../../../Upload/uploadToCloudinary"; // Đường dẫn đúng với cấu trúc dự án của bạn
import { decodeToken } from "../../../Helpers/jwtDecode";
import { toast } from "react-toastify";

export default function ProfileTab() {
  const [user, setUser] = useState({
    name: "",
    email: "",
    phone: "",
    avatar: "",
    address: {
      address_line: "",
      ward: "",
      district: "",
      city: "",
    },
  });

  const [profileImg, setProfileImg] = useState(null);
  const profileImgInput = useRef(null);

  const browseProfileImg = () => {
    profileImgInput.current.click();
  };

  const profileImgChangeHandler = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfileImg(event.target.result); // Hiển thị ảnh tạm thời
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const decoded = decodeToken(token);
        const response = await axios.get(
          `http://localhost:5000/users/${decoded.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const defaultAddress = response.data.data.addresses?.find(
          (addr) => addr.is_default === 1
        );

        setUser({
          ...response.data.data,
          address: defaultAddress || null, // nếu không có thì set null
        });
        setProfileImg(response.data.data.avatar);
      } catch (error) {
        console.error("Lỗi khi lấy thông tin user:", error);
      }
    };

    fetchUser();
  }, []);

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem("token");

      let avatarUrl = user.avatar;
      const file = profileImgInput.current?.files[0];
      if (file) {
        avatarUrl = await uploadToCloudinary(file);
      }

      await axios.put(
        `http://localhost:5000/users/${user.id}`,
        {
          name: user.name,
          phone: user.phone,
          avatar: avatarUrl.url,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Cập nhật thông tin thành công!");
    } catch (err) {
      console.error("Cập nhật lỗi:", err);
      toast.error("Cập nhật thất bại.");
    }
  };

  return (
    <>
      <div className="flex space-x-8">
        <div className="w-[570px]">
          <div className="input-item mb-8">
            <input
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
              label="Name*"
              placeholder="Your full name"
              type="text"
              inputClasses="h-[50px]"
              value={user.name || ""}
              onChange={(e) => setUser({ ...user, name: e.target.value })}
            />
          </div>

          <div className="input-item flex space-x-2.5 mb-8">
            <div className="w-1/2 h-full">
              <input
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm opacity-50 cursor-not-allowed"
                type="email"
                placeholder="demoemail@gmail.com"
                readOnly
                value={user.email || ""}
                onChange={(e) => setUser({ ...user, email: e.target.value })}
              />
            </div>
            <div className="w-1/2 h-full">
              <input
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                label="Phone Number*"
                placeholder="012 3 *******"
                type="text"
                inputClasses="h-[50px]"
                value={user.phone || ""}
                onChange={(e) => setUser({ ...user, phone: e.target.value })}
              />
            </div>
          </div>

          {user.address ? (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Địa chỉ chi tiết
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                  value={user.address?.address_line || "Chưa có"}
                  readOnly
                  tabIndex={-1}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Phường / Xã
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                  value={user.address?.ward || "Chưa có"}
                  readOnly
                  tabIndex={-1}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Quận / Huyện
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                  value={user.address?.district || "Chưa có"}
                  readOnly
                  tabIndex={-1}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Tỉnh / Thành phố
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                  value={user.address?.city || "Chưa có"}
                  readOnly
                  tabIndex={-1}
                />
              </div>
            </>
          ) : (
            <div className="mb-8">
              <p className="text-red-500 mb-4">Bạn chưa có địa chỉ mặc định.</p>
              <a
                href="/profile#address"
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              >
                Thêm địa chỉ
              </a>
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="update-logo w-full mb-9">
            <h1 className="text-xl font-bold text-qblack flex items-center mb-2">
              Cập nhật tài khoản
            </h1>
            <div className="flex xl:justify-center justify-start">
              <div className="relative">
                <div className="sm:w-[198px] sm:h-[198px] w-[199px] h-[199px] rounded-full overflow-hidden relative">
                  <img
                    src={
                      profileImg ||
                      `${process.env.REACT_APP_PUBLIC_URL}/assets/images/edit-profileimg.jpg`
                    }
                    alt="avatar"
                    className="object-cover w-full h-full"
                  />
                </div>
                <input
                  ref={profileImgInput}
                  onChange={profileImgChangeHandler}
                  type="file"
                  accept="image/*"
                  className="hidden"
                />
                <div
                  onClick={browseProfileImg}
                  className="w-[32px] h-[32px] absolute bottom-7 sm:right-0 right-[105px] bg-qblack rounded-full cursor-pointer"
                >
                  <svg width="32" height="32" fill="white" viewBox="0 0 32 32">
                    <path d="M16.5147 11.5L20.1296 15.115..." />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="action-area flex space-x-4 items-center">
        <button type="button" className="text-sm text-qred font-semibold">
          Hủy
        </button>
        <button
          type="button"
          className="w-[164px] h-[50px] bg-qblack text-white text-sm"
          onClick={handleUpdate}
        >
          Cập nhật tài khoản
        </button>
      </div>
    </>
  );
}
