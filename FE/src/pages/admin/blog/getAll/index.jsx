import { Link } from "react-router-dom";
import FormDelete from "../../../../components/formDelete";
import { useState, useEffect } from "react";
import axios from "axios";
import Constants from "../../../../Constants";
const BlogGetAll = () => {
    const [selectedBlog, setSelectedBlog] = useState(null);
    const [blogData, setData] = useState([]);

    useEffect(() => {
        getAll();
    }, []);

    const getAll = async () => {
        try {
            const res = await axios.get(`${Constants.DOMAIN_API}/admin/blog/list`);
            console.log(res.data.data);
            setData(res.data.data);
        } catch (error) {
            console.log(error);
        }
    };

    const deleteBlog = async () => {
        if (!selectedBlog) return;
        try {
            await axios.delete(`${Constants.DOMAIN_API}/admin/blog/${selectedBlog.id}`);
            setSelectedBlog(null);
            getAll();
        } catch (error) {
            console.log("Lỗi khi xóa:", error);
        }
    };

    const renderBlog = (blog, index) => {
        return (
            <tr key={blog.id} className="border-b">
                <td className="p-2 border">{blog.title}</td>
                <td className="p-2 border">
                    <img className="w-[50px] h-[50px]" src={`${Constants.DOMAIN_API}/public/images/${blog.image}`} alt="blog" />
                </td>
                <td className="p-2 border max-w-[200px]">
                    <div className="line-clamp-2" dangerouslySetInnerHTML={{ __html: blog.content }} />
                </td>

                <td className="p-2  flex gap-2">
                    <Link
                        to={`/admin/blog/edit?id=${blog.id}`}
                        className="bg-yellow-500 text-white py-2 px-3 rounded"
                    >
                        <i className="fa-solid fa-pen-to-square text-md"></i>
                    </Link>
                    <button onClick={() => setSelectedBlog(blog)} className="bg-red-500 text-white py-2 px-3 rounded">
                        <i className="fa-solid fa-trash text-md"></i>
                    </button>
                </td>

            </tr>
        )
    };

    return (

        <>
            <div className="container mx-auto p-2">
                <div className="bg-white p-4 shadow rounded-md">
                    <Link
                        to="/admin/blog/create"
                        className=" inline-block bg-[#073272] text-white px-4 py-2 rounded"
                    >
                        Thêm bài viết
                    </Link>
                    <table className="w-full border-collapse border border-gray-300 mt-4">
                        <thead>
                            <tr className="bg-gray-200">
                                <th className="p-2 border">Tiêu đề bài viết</th>
                                <th className="p-2 border">Hình ảnh</th>
                                <th className="p-2 border">Nội dung</th>
                                <th className="p-2 border">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {blogData.map(renderBlog)}
                        </tbody>
                    </table>
                    <FormDelete
                        isOpen={selectedBlog !== null}
                        onClose={() => setSelectedBlog(null)}
                        onConfirm={deleteBlog}
                        message={`Bạn có chắc chắn muốn xóa tài xế "${selectedBlog?.title}" không?`}
                    />
                </div>
            </div >
        </>
    )
}
export default BlogGetAll;