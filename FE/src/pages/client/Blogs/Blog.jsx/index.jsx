import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import PageTitle from "../../Helpers/PageTitle";
import Layout from "../../Partials/LayoutHomeThree";
import Constants from "../../../../Constants";

export default function Blog() {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [allBlogs, setAllBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await axios.get(`${Constants.DOMAIN_API}/blogs/${id}`);
        setBlog(res.data);
      } catch (error) {
        console.error("Lỗi khi tải blog:", error);
      }
    };
    fetchBlog();
  }, [id]);

  useEffect(() => {
    const fetchAllBlogs = async () => {
      try {
        const res = await axios.get(`${Constants.DOMAIN_API}/blogs`);
        setAllBlogs(res.data.blogs || []);
      } catch (error) {
        console.error("Lỗi khi tải danh sách blog:", error);
      }
    };
    fetchAllBlogs();
  }, [id]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${Constants.DOMAIN_API}/admin/blogcategory/list?status=1`);
        setCategories(res.data.data || []);
      } catch (error) {
        console.error("Lỗi khi tải danh mục:", error);
      }
    };
    fetchCategories();
  }, []);

  if (!blog) return <div className="text-center p-10">Đang tải...</div>;

  const hotBlogs = allBlogs.filter((b) => String(b.id) !== String(id)).slice(0, 4);

  const formatDateVN = (date) =>
    new Date(date).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const handleCategoryClick = (slug) => {
    navigate(`/blogs?category=${slug}`);
  };

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
            {/* === SIDEBAR === */}
            <aside className="w-full lg:w-[230px] flex-shrink-0">
              <div className="mb-7">
                <h3 className="text-[15px] font-bold mb-2">DANH MỤC TIN TỨC</h3>
                <ul className="border-b pb-3 mb-3">
                  {categories.map((cat) => (
                    <li key={cat.id} className="mb-1">
                      <button
                        onClick={() => handleCategoryClick(cat.slug)}
                        className="w-full text-left text-[15px] py-1 px-2 rounded hover:bg-gray-100"
                      >
                        {cat.name}
                      </button>
                    </li>
                  ))}
                </ul>

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
                            <span>{formatDateVN(blog.created_at)}</span>
                            <span className="mx-1">|</span>
                            <span>{blog.user_name || "Tác giả"}</span>
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>

            {/* === MAIN CONTENT === */}
            <main className="flex-1 min-w-0">
              <div>
                <img
                  src={blog.image_url || "/assets/images/default.jpg"}
                  alt={blog.title}
                  className="w-full max-h-[420px] object-cover rounded-md mb-6"
                />
                <div className="text-sm text-gray-500 mb-2">
                  {blog.user_name || "Tác giả"} • {formatDateVN(blog.created_at)}
                </div>
                <h1 className="text-2xl font-bold text-gray-800 leading-snug mb-3">
                  {blog.title}
                </h1>
                <div
                  className="prose max-w-none text-justify text-[17px] leading-relaxed text-gray-800"
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
 