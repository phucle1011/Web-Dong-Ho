// src/utils/uploadToCloudinary.js

export const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "upload_preset"); // thay bằng upload preset của bạn
  formData.append("cloud_name", "disgf4yl7");       // thay bằng cloud name

  try {
    const res = await fetch("https://api.cloudinary.com/v1_1/disgf4yl7/image/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
     return {
    url: data.secure_url,
    public_id: data.public_id,
  };
      
  } catch (err) {
    console.error("Lỗi khi upload ảnh lên Cloudinary:", err);
    throw err;
  }
};
