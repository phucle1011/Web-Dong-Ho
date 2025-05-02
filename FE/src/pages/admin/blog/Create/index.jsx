import { useForm } from "react-hook-form";
import { Editor } from '@tinymce/tinymce-react';
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Constants from "../../../../Constants";

const BlogCreate = () => {
    const navigate = useNavigate();
    const editorRef = useRef(null);
    const [errorMessage, setErrorMessage] = useState("");

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm();

    const validateImage = (fileList) => {
        if (fileList.length === 0) return "Ảnh là bắt buộc";
        const file = fileList[0];
        const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
        if (!allowedTypes.includes(file.type)) return "Ảnh phải có định dạng jpeg, png hoặc jpg";
        if (file.size > 5 * 1024 * 1024) return "Ảnh không được vượt quá 5MB";
        return true;
    };

    const onSubmit = async (data) => {
        try {
            const content = editorRef.current?.getContent();
            const formData = new FormData();
            formData.append("title", data.title);
            formData.append("content", content);
            formData.append("image", data.image[0]);

            await axios.post(`${Constants.DOMAIN_API}/admin/blog/add`, formData);
            navigate("/admin/blog/getAll");
        } catch (error) {
            console.error("Lỗi khi thêm blog:", error);
            setErrorMessage("Thêm bài viết thất bại. Vui lòng thử lại.");
        }
    };

    return (
        <div className="container mx-auto p-4">
            <div className="bg-white p-6 rounded-lg shadow-md max-w-full mx-auto">
                <h3 className="text-2xl font-bold mb-4">Thêm bài viết</h3>

                {errorMessage && (
                    <div className="text-red-500 mb-4 font-semibold">{errorMessage}</div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data" className="p-4 border rounded-md shadow-lg">
                    <div className="mb-4">
                        <label className="block font-medium mb-2">Tiêu đề bài viết</label>
                        <input
                            type="text"
                            className="w-full p-2 border rounded"
                            {...register("title", { required: "Tiêu đề không được để trống" })}
                        />
                        {errors.title && <p className="text-red-500">{errors.title.message}</p>}
                    </div>

                    <div className="mb-4">
                        <label className="block font-medium mb-2">Nội dung</label>
                        <Editor
                            apiKey="hxo8p07686juzc8t31sz6h654xhecoydtwwa89l3dcx3plg2"
                            onInit={(evt, editor) => editorRef.current = editor}
                            init={{
                                height: 400,
                                menubar: false,
                                plugins: ['table', 'link', 'image', 'code', 'lists'],
                                toolbar:
                                    'undo redo | styles | bold italic underline | alignleft aligncenter alignright alignjustify | ' +
                                    'bullist numlist outdent indent | link image | table | code',
                            }}
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block font-medium mb-2">Hình ảnh</label>
                        <input
                            type="file"
                            className="w-full p-2 border rounded"
                            {...register("image", { validate: validateImage })}
                        />
                        {errors.image && <p className="text-red-500">{errors.image.message}</p>}
                    </div>

                    <button type="submit" className="px-4 py-2 bg-[#073272] text-white rounded hover:bg-blue-900">
                        Thêm bài viết
                    </button>
                </form>
            </div>
        </div>
    );
};

export default BlogCreate;
