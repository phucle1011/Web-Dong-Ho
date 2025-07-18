import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import PageTitle from "../../Helpers/PageTitle";
import Layout from "../../Partials/LayoutHomeThree";
import { FaRegEdit } from "react-icons/fa";

export default function Blog() {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [otherBlogs, setOtherBlogs] = useState([]);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/blogs/${id}`);
        setBlog(res.data);
      } catch (error) {
        console.error("Lỗi khi tải blog:", error);
      }
    };
    fetchBlog();
  }, [id]);

  useEffect(() => {
    const fetchOtherBlogs = async () => {
      try {
        const res = await axios.get("http://localhost:5000/blogs");
        const blogsArray = res.data.blogs || [];
        const filtered = blogsArray.filter((b) => Number(b.id) !== Number(id));
        setOtherBlogs(filtered);
      } catch (error) {
        console.error("Lỗi khi tải danh sách blog khác:", error);
      }
    };
    fetchOtherBlogs();
  }, [id]);

  if (!blog) return <div className="text-center p-10">Đang tải...</div>;

  return (
    <Layout childrenClasses="pt-0 pb-0">
      <div className="blog-page-wrapper w-full">
        {/* BREADCRUMB */}
        <div className="title-area mb-[40px]">
          <PageTitle
            title={blog.title}
            breadcrumb={[
              { name: "trang chủ", path: "/" },
              { name: "chi tiết tin tức", path: `/blogs/${id}` },
            ]}
          />
        </div>

        <div className="content-area w-full">
          <div className="container-x mx-auto">
            <div className="lg:flex lg:space-x-[40px]">
              {/* === BÀI VIẾT CHÍNH === */}
              <main className="flex-1">
                <div className="rounded overflow-hidden mb-6">
                  <img
                    src={blog.image_url || "/assets/images/default.jpg"}
                    alt={blog.title}
                    className="w-full h-[420px] object-cover rounded-md"
                  />
                </div>

                <div className="space-y-4">
                  <div className="text-sm text-gray-500">
                    {blog.author || "Tác giả"} •{" "}
                    {new Date(blog.created_at).toLocaleDateString("vi-VN")}
                  </div>

                  <h1 className="text-2xl font-bold text-gray-800 leading-snug">
                    {blog.title}
                  </h1>

                  <div
                    className="prose prose-sm max-w-none text-justify leading-relaxed text-gray-700"
                    dangerouslySetInnerHTML={{ __html: blog.content }}
                  />
                </div>
              </main>

              {/* === SIDEBAR BÀI VIẾT KHÁC === */}
              <aside className="w-full lg:w-[340px] mt-10 lg:mt-0">
                <div className="rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                  {/* Tiêu đề */}
                  <div className="bg-blue-600 px-4 py-3">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                      <FaRegEdit className="text-white" /> Bài viết khác
                    </h2>
                  </div>

                  {/* Danh sách bài khác */}
                  <div className="bg-white divide-y divide-gray-100">
                    {otherBlogs.length === 0 ? (
                      <div className="p-4 text-sm italic text-gray-500">Không có bài viết nào khác.</div>
                    ) : (
                      otherBlogs.slice(0, 6).map((item) => (
                        <a
                          key={item.id}
                          href={`/blogs/${item.id}`}
                          className="flex gap-3 p-3 hover:bg-gray-50 transition"
                        >
                          <img
                            src={item.image_url}
                            alt={item.title}
                            className="w-[70px] h-[50px] object-cover rounded"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-800 line-clamp-2">{item.title}</p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {new Date(item.created_at).toLocaleDateString("vi-VN")}
                            </p>
                          </div>
                        </a>
                      ))
                    )}
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
