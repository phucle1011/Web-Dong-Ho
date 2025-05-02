import { useForm, Controller } from "react-hook-form";
import { Editor } from '@tinymce/tinymce-react';
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import Constants from "../../../../Constants";

const BlogEdit = () => {
    const [queryParams] = useSearchParams();
    const navigate = useNavigate();
    const [initialContent, setInitialContent] = useState("");
    const [previewImage, setPreviewImage] = useState(null);
    const { control, register, handleSubmit, setValue, watch, formState: { errors } } = useForm();

    useEffect(() => {
        if (queryParams.get("id")) {
            getBlogInfo();
        }
    }, []);

    const getBlogInfo = async () => {
        try {
            const res = await axios.get(`${Constants.DOMAIN_API}/admin/blog/getById/${queryParams.get("id")}`);
            const data = res.data.data;
            setValue("title", data.title);
            setValue("content", data.content);
            setValue("status", data.status);
            if (data.image) {
                setPreviewImage(data.image);
            }
        } catch (error) {
            console.log("Error fetching user info: ", error);
        }
    };

    const onSubmit = async (data) => {
        try {
            const formData = new FormData();
            formData.append("title", data.title);
            formData.append("content", data.content);
            if (data.image && data.image.length > 0) {
                formData.append("image", data.image[0]);
            }

            await axios.patch(`${Constants.DOMAIN_API}/admin/blog/update/${queryParams.get("id")}`, formData);
            navigate("/admin/blog/getAll");
        } catch (error) {
            console.error("Lỗi khi cập nhật blog:", error);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <div className="bg-white p-6 rounded-lg shadow-md max-w-full mx-auto">
                <h3 className="text-2xl font-bold mb-4">Chỉnh sửa bài viết</h3>
                <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data">
                    <div className="mb-4">
                        <label className="block font-medium mb-2">Tiêu đề</label>
                        <input
                            type="text"
                            className="w-full p-2 border rounded"
                            {...register("title", { required: "Tiêu đề không được để trống" })}
                        />
                        {errors.title && <span className="text-red-500">{errors.title.message}</span>}
                    </div>

                    <div className="mb-4">
                        <label className="block font-medium mb-2">Nội dung</label>
                        <Controller
                            name="content"
                            control={control}
                            defaultValue=""
                            render={({ field: { onChange, value } }) => (
                                <Editor
                                    apiKey="hxo8p07686juzc8t31sz6h654xhecoydtwwa89l3dcx3plg2"
                                    value={value}
                                    onEditorChange={(content) => onChange(content)}
                                    init={{
                                        height: 400,
                                        menubar: false,
                                        plugins: ["table", "link", "image", "code", "lists"],
                                        toolbar:
                                            'undo redo | bold italic underline | alignleft aligncenter alignright | bullist numlist | link image code',
                                    }}
                                />
                            )}
                        />
                        {errors.content && <span className="text-red-500">{errors.content.message}</span>}
                    </div>

                    <div className="mb-4">
                        <label className="block font-medium mb-2">Ảnh</label>
                        <input
                            type="file"
                            className="w-full p-2 border rounded"
                            {...register("image")}
                        />
                        {
                            <img
                                src={`${Constants.DOMAIN_API}/public/images/${previewImage}`}
                                alt="Ảnh hiện tại"
                                className="mt-2 w-[100px] h-[100px] object-cover rounded"
                            />
                        }
                    </div>

                    <button type="submit" className="px-4 py-2 bg-[#073272] text-white rounded">
                        Lưu chỉnh sửa
                    </button>
                </form>
            </div>
        </div>
    );
};

export default BlogEdit;
