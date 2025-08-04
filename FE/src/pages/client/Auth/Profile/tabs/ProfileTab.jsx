import { useRef, useState, useEffect } from "react";
import InputCom from "../../../Helpers/InputCom";
import axios from "axios";
import { uploadToCloudinary } from "../../../../../Upload/uploadToCloudinary"; // Đường dẫn đúng với cấu trúc dự án của bạn
import { decodeToken } from "../../../Helpers/jwtDecode";
import { toast } from "react-toastify";
import Constants from "../../../../.././Constants";

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
  const [initialUser, setInitialUser] = useState(null);

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
          `${Constants.DOMAIN_API}/users/${decoded.id}`,
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
        setInitialUser({
          ...response.data.data,
          address: defaultAddress || null,
        });

        setProfileImg(response.data.data.avatar);
      } catch (error) {
        console.error("Lỗi khi lấy thông tin user:", error);
      }
    };

    fetchUser();
  }, []);

const deleteCloudImage = async (public_id) => {
  try {
    await axios.post(`${Constants.DOMAIN_API}/admin/products/imagesClauding`, {
      public_id,
    });
    console.log("Đã xóa ảnh Cloudinary:", public_id);
  } catch (err) {
    console.error("Xóa ảnh thất bại:", err);
  }
};
const handleCancel = async () => {
  const file = profileImgInput.current?.files?.[0];

  // Nếu người dùng đã chọn ảnh mới
  if (file && profileImg !== initialUser?.avatar) {
    try {
      const uploaded = await uploadToCloudinary(file); // kiểm tra upload ảnh
      if (uploaded?.public_id) {
        await deleteCloudImage(uploaded.public_id);     // Gọi API xoá
      }
    } catch (err) {
      console.error("Lỗi xử lý ảnh khi hủy:", err);
    }
  }

  // Reset lại dữ liệu ban đầu
  if (initialUser) {
    setUser(initialUser);
    setProfileImg(initialUser.avatar);
    if (profileImgInput.current) {
      profileImgInput.current.value = ""; // reset input file
    }
  }

  toast.info("Đã hủy thay đổi.");
};
  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem("token");

      let avatarUrl = user.avatar;
      const file = profileImgInput.current?.files[0];
      if (file) {
        avatarUrl = await uploadToCloudinary(file);
      }

      await axios.put(
        `${Constants.DOMAIN_API}/users/${user.id}`,
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
                  className="w-[32px] h-[32px] absolute bottom-7 sm:right-0 right-[105px]  bg-qblack rounded-full cursor-pointer"
                >
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 32 32"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M16.5147 11.5C17.7284 12.7137 18.9234 13.9087 20.1296 15.115C19.9798 15.2611 19.8187 15.4109 19.6651 15.5683C17.4699 17.7635 15.271 19.9587 13.0758 22.1539C12.9334 22.2962 12.7948 22.4386 12.6524 22.5735C12.6187 22.6034 12.5663 22.6296 12.5213 22.6296C11.3788 22.6334 10.2362 22.6297 9.09365 22.6334C9.01498 22.6334 9 22.6034 9 22.536C9 21.4009 9 20.2621 9.00375 19.1271C9.00375 19.0746 9.02997 19.0109 9.06368 18.9772C10.4123 17.6249 11.7609 16.2763 13.1095 14.9277C14.2295 13.8076 15.3459 12.6913 16.466 11.5712C16.4884 11.5487 16.4997 11.5187 16.5147 11.5Z"
                      fill="white"
                    />
                    <path
                      d="M20.9499 14.2904C19.7436 13.0842 18.5449 11.8854 17.3499 10.6904C17.5634 10.4694 17.7844 10.2446 18.0054 10.0199C18.2639 9.76139 18.5261 9.50291 18.7884 9.24443C19.118 8.91852 19.5713 8.91852 19.8972 9.24443C20.7251 10.0611 21.5492 10.8815 22.3771 11.6981C22.6993 12.0165 22.7105 12.4698 22.3996 12.792C21.9238 13.2865 21.4443 13.7772 20.9686 14.2717C20.9648 14.2792 20.9536 14.2867 20.9499 14.2904Z"
                      fill="white"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="action-area flex space-x-4 items-center">
        <button
  type="button"
  className="text-sm bg-red-600 hover:bg-red-700 text-white font-semibold px-4 h-[50px] rounded transition"
  onClick={handleCancel}
>
  Hủy
</button>


        <button
          type="button"
          className="w-[164px] h-[50px] bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition"
          onClick={handleUpdate}
        >
          Cập nhật tài khoản
        </button>
      </div>
    </>
  );
}
