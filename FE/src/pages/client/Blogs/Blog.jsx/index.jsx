import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import PageTitle from "../../Helpers/PageTitle";
import Layout from "../../Partials/LayoutHomeThree";

const DUMMY_CATEGORIES = [
  { name: "Trang chủ", path: "/" },
  { name: "Sản phẩm", path: "/all-products" },
  { name: "Tin tức", path: "/blogs" },
  { name: "Liên hệ", path: "/contact" },
  { name: "Giới thiệu", path: "/about" },
  { name: "Câu hỏi thường gặp", path: "/faq" },
];

export default function Blog() {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [allBlogs, setAllBlogs] = useState([]);

  useEffect(() => {
    // Lấy chi tiết blog
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
    // Lấy tất cả blog
    const fetchAllBlogs = async () => {
      try {
        const res = await axios.get("http://localhost:5000/blogs");
        setAllBlogs(res.data.blogs || []);
      } catch (error) {
        console.error("Lỗi khi tải danh sách blog:", error);
      }
    };
    fetchAllBlogs();
  }, [id]);

  if (!blog) return <div className="text-center p-10">Đang tải...</div>;

  // Chủ đề hot: 4 bài đầu, không tính bài đang xem
  const hotBlogs = allBlogs.filter(b => String(b.id) !== String(id)).slice(0, 4);

  return (
    <Layout childrenClasses="pt-0 pb-0">
      <div className="w-full bg-gray-50 min-h-screen">
        <div className="title-area mb-[40px]">
          <PageTitle
            title={blog.title}
            breadcrumb={[
              { name: "trang chủ", path: "/" },
              { name: "chi tiết tin tức", path: `/blogs/${id}` },
            ]}
          />
        </div>
        <div className="container-x mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* === SIDEBAR TRÁI (Danh mục + Chủ đề hot) === */}
            <aside className="w-full lg:w-[230px] flex-shrink-0">
              <div className="mb-7">
                <h3 className="text-[15px] font-bold mb-2">DANH MỤC TIN TỨC</h3>
                <ul className="border-b pb-3 mb-3">
                  {DUMMY_CATEGORIES.map((cat) => (
                    <li key={cat.name} className="mb-1">
                      <Link
                        to={cat.path}
                        className={`block text-[15px] py-1 px-2 rounded hover:bg-gray-100 
                          ${cat.name === "Tin tức" ? "text-primary font-semibold" : ""}`}
                      >
                        {cat.name}
                      </Link>
                    </li>
                  ))}
                </ul>
                <div>
                  <h4 className="font-bold text-xs text-gray-700 uppercase mb-3">Chủ đề hot</h4>
                  <ul>
                    {hotBlogs.map((blog) => (
                      <li key={blog.id} className="flex gap-2 mb-4">
                        <Link to={`/blogs/${blog.id}`} className="flex gap-2 group">
                          <img
                            src={blog.image_url}
                            alt={blog.title}
                            className="w-[60px] h-[50px] object-cover rounded-md flex-shrink-0"
                          />
                          <div>
                            <div className="text-[13px] font-semibold leading-snug line-clamp-2 group-hover:text-primary">
                              {blog.title}
                            </div>
                            <div className="text-[12px] text-gray-400 mt-1 flex items-center gap-1">
                              <span>{new Date(blog.created_at).toLocaleDateString("vi-VN")}</span>
                              <span className="mx-1"></span>
                              {blog.user_name || "Tác giả"}
                            </div>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </aside>

            {/* === MAIN NỘI DUNG BÀI VIẾT (KHÔNG BỌC CARD) === */}
            <main className="flex-1 min-w-0">
              <div>
                <img
                  src={blog.image_url || "/assets/images/default.jpg"}
                  alt={blog.title}
                  className="w-full h-[420px] object-cover rounded-md mb-6"
                />
                <div className="text-sm text-gray-500 mb-2">
                  {blog.author || "Tác giả"} •{" "}
                  {new Date(blog.created_at).toLocaleDateString("vi-VN")}
                </div>
                <h1 className="text-2xl font-bold text-gray-800 leading-snug mb-3">
                  {blog.title}
                </h1>
                <div
                  className="prose prose-sm max-w-none text-justify leading-relaxed text-gray-700"
                  dangerouslySetInnerHTML={{ __html: blog.content }}
                />
              </div>
            </main>
          </div>
        </div>
      </div>
    </Layout>
  );
}
