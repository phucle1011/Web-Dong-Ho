import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import PageTitle from "../Helpers/PageTitle";
import Layout from "../Partials/LayoutHomeThree";
import Constants from "../../../Constants";
import {
  FaChevronLeft,
  FaChevronRight,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
} from "react-icons/fa";

const PAGE_SIZE = 6;

export default function Blogs() {
  const [blogs, setBlogs] = useState([]);
  const [page, setPage] = useState(1);
  const [categories, setCategories] = useState([]);
  const location = useLocation();

  // Lấy slug category từ query string
  const params = new URLSearchParams(location.search);
  const categorySlug = params.get("category");

  // Lấy danh sách blog từ API
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const url = categorySlug
          ? `${Constants.DOMAIN_API}/blogs?category=${categorySlug}`
          : `${Constants.DOMAIN_API}/blogs`;
        const response = await fetch(url);
        const data = await response.json();
        setBlogs(data.blogs || []);
        setPage(1); // reset về trang 1 khi lọc
      } catch (error) {
        console.error("Lỗi khi tải danh sách blog:", error);
      }
    };

    fetchBlogs();
  }, [categorySlug]);

  // Lấy danh mục
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${Constants.DOMAIN_API}/admin/blogcategory/list`);
        const data = await res.json();
        setCategories(data.data || []);
      } catch (err) {
        console.error("Lỗi khi tải danh mục:", err);
      }
    };

    fetchCategories();
  }, []);

  const hotBlogs = blogs.slice(0, 4);
  const totalPages = Math.ceil(blogs.length / PAGE_SIZE);
  const pagedBlogs = blogs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const formatDateVN = (d) => {
    const date = new Date(d);
    const weekday = [
      "Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư",
      "Thứ Năm", "Thứ Sáu", "Thứ Bảy"
    ];
    return `${weekday[date.getDay()]}, ${date.toLocaleDateString("vi-VN")}`;
  };

  const goToPage = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Layout childrenClasses="pt-0 pb-0">
      <div className="blogs-wrapper w-full-width">
        <div className="title-bar">
          <PageTitle
            title="Tin Tức"
            breadcrumb={[
              { name: "trang chủ", path: "/" },
              { name: "tin tức", path: "/blogs" },
            ]}
          />
        </div>
      </div>

      <div className="w-full py-[60px] bg-white">
        <div className="container-x mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <aside className="w-full lg:w-[230px] flex-shrink-0">
              <div className="mb-7">
                <h3 className="text-[15px] font-bold mb-2">DANH MỤC TIN TỨC</h3>
                <ul className="border-b pb-3 mb-3">
                  {categories.map((cat) => (
                    <li key={cat.id} className="mb-1">
                      <Link
                        to={`/blogs?category=${cat.slug}`}
                        className={`block text-[15px] py-1 px-2 rounded hover:bg-gray-100 ${
                          categorySlug === cat.slug ? "bg-gray-200 font-semibold" : ""
                        }`}
                      >
                        {cat.name}
                      </Link>
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
                            <span className="text-[13px] text-gray-400 font-normal">|</span>
                            <span>{blog.user_name}</span>
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>

            {/* Blog list */}
            <main className="flex-1 min-w-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
                {pagedBlogs.map((blog) => (
                  <Link
                    to={`/blogs/${blog.id}`}
                    key={blog.id}
                    className="block group h-full border-b border-gray-100 hover:bg-gray-50 transition"
                  >
                    <img
                      src={blog.image_url}
                      alt={blog.title}
                      className="w-full h-[180px] object-cover rounded-t-2xl"
                      style={{ borderRadius: "18px 18px 0 0" }}
                    />
                    <div className="pt-3 pb-3 px-2">
                      <div className="flex items-center gap-2 text-[14px] font-semibold mb-1">
                        <span className="text-gray-500">{formatDateVN(blog.created_at)}</span>
                        <span className="text-[16px] text-gray-300 font-normal">|</span>
                        <span className="text-gray-500">{blog.user_name}</span>
                      </div>
                      <h3 className="text-base font-semibold text-gray-800 mb-1 line-clamp-2 group-hover:text-primary transition">
                        {blog.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-3">
                        {blog.meta_description ||
                          (blog.content || "")
                            .replace(/<[^>]+>/g, "")
                            .slice(0, 130) + "..."}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              <div className="flex justify-center gap-2 mt-10">
                <button
                  disabled={page === 1}
                  onClick={() => goToPage(1)}
                  className="px-2 py-1 border rounded disabled:opacity-50"
                  title="Trang đầu"
                >
                  <FaAngleDoubleLeft />
                </button>
                <button
                  disabled={page === 1}
                  onClick={() => goToPage(page - 1)}
                  className="px-2 py-1 border rounded disabled:opacity-50"
                  title="Trước"
                >
                  <FaChevronLeft />
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => goToPage(i + 1)}
                    className={`px-3 py-1 rounded border-2 mx-0.5 transition-all duration-150 ${
                      page === i + 1
                        ? "bg-blue-600 text-white border-blue-600 font-bold shadow"
                        : "bg-white text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  disabled={page === totalPages}
                  onClick={() => goToPage(page + 1)}
                  className="px-2 py-1 border rounded disabled:opacity-50"
                  title="Tiếp"
                >
                  <FaChevronRight />
                </button>
                <button
                  disabled={page === totalPages}
                  onClick={() => goToPage(totalPages)}
                  className="px-2 py-1 border rounded disabled:opacity-50"
                  title="Trang cuối"
                >
                  <FaAngleDoubleRight />
                </button>
              </div>
            </main>
          </div>
        </div>
      </div>
    </Layout>
  );
}
