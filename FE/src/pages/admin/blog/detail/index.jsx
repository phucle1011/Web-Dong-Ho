import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Constants from "../../../../Constants";
import { FaArrowLeft } from "react-icons/fa";
import 'tinymce/skins/ui/oxide/skin.min.css';
import 'tinymce/skins/content/default/content.min.css';

function BlogDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBlogDetail();
    }, [id]);

    const fetchBlogDetail = async () => {
        try {
            const response = await axios.get(`${Constants.DOMAIN_API}/admin/blog/${id}`);
            setBlog(response.data);
        } catch (error) {
            console.error("Lỗi khi tải chi tiết bài viết:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-center mt-5">Đang tải...</div>;
    }

    if (!blog) {
        return <div className="text-center text-danger mt-5">Không tìm thấy bài viết.</div>;
    }

    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-12 d-flex align-items-stretch">
                    <div className="card w-100 mt-4">
                        <div className="card-body p-4">
                            <div className="d-flex justify-between align-items-center mb-4">
                                <h5 className="card-title fw-semibold text-primary">
                                    Chi tiết bài viết
                                </h5>
                                <button
                                    className="btn btn-outline-secondary d-flex align-items-center gap-2"
                                    onClick={() => navigate(-1)}
                                >
                                    <FaArrowLeft /> Quay lại
                                </button>
                            </div>

                            <table className="table">
                                <tbody>
                                    <tr>
                                        <th style={{ width: '200px' }}>Tiêu đề:</th>
                                        <td className="fw-semibold">{blog.title}</td>
                                    </tr>
                                    <tr>
                                        <th>Hình ảnh:</th>
                                        <td>
                                            <img
                                                src={blog.image_url}
                                                alt={blog.title}
                                                style={{ width: "300px", maxHeight: "300px", objectFit: "cover" }}
                                                className="img-thumbnail"
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>Nội dung:</th>
                                        <td>
                                            <div
                                                dangerouslySetInnerHTML={{ __html: blog.content }}
                                                style={{ maxWidth: "600px", wordBreak: "break-word" }}
                                            />
                                        </td>
                                    </tr>

                                    <tr>
                                        <th>Người viết (ID):</th>
                                        <td>{blog.user_id}</td>
                                    </tr>
                                    <tr>
                                        <th>Ngày tạo:</th>
                                        <td>{new Date(blog.created_at).toLocaleDateString("vi-VN")}</td>
                                    </tr>
                                </tbody>
                            </table>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BlogDetail;
