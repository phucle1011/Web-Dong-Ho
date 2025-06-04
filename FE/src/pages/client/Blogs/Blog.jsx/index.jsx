import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import PageTitle from "../../Helpers/PageTitle";
import Layout from "../../Partials/LayoutHomeThree";
import {
  FaSearch,
  FaRegEdit,
  FaSpinner,
  FaExclamationCircle,
  FaInfoCircle,
} from "react-icons/fa";

export default function Blog() {
  const { id } = useParams();

  const [blog, setBlog] = useState(null);
  const [otherBlogs, setOtherBlogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);

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

  const handleSearch = async () => {
    const trimmed = searchTerm.trim();
    if (!trimmed) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    setSearchError(null);

    try {
      const res = await axios.get(
        `http://localhost:5000/blogs/search?q=${encodeURIComponent(trimmed)}`
      );
      setSearchResults(res.data.blogs || []);
    } catch (error) {
      console.error("Lỗi khi tìm kiếm:", error);
      setSearchError("Lỗi khi tìm kiếm bài viết");
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  if (!blog) return <div className="text-center p-10">Đang tải...</div>;

  return (
    <Layout childrenClasses="pt-0 pb-0">
      <div className="blog-page-wrapper w-full">
        <div className="title-area mb-[60px]">
          <PageTitle
            title={blog.title}
            breadcrumb={[
              { name: "home", path: "/" },
              { name: "blog details", path: `/blogs/${id}` },
            ]}
          />
        </div>
        <div className="content-area w-full">
          <div className="container-x mx-auto">
            <div className="blog-article lg:flex lg:space-x-[30px] mb-7">
              {/* Nội dung bài viết bên trái */}
              <div className="flex-1">
                <div className="img w-full h-[457px]">
                  <img
                    src={blog.image_url || "/assets/images/default.jpg"}
                    alt="blog"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="blog pl-[24px] pt-[24px]">
                  <div className="short-data flex space-x-9 items-center mb-3">
                    <div className="flex space-x-1.5 items-center">
                      <span className="text-base text-qgraytwo capitalize">
                        By {blog.author || "Admin"}
                      </span>
                    </div>
                    <div className="flex space-x-1.5 items-center">
                      <span className="text-base text-qgraytwo capitalize">
                        {new Date(blog.created_at).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                  </div>
                  <h2 className="text-[24px] font-semibold mb-4">{blog.title}</h2>
                  <p
                    className="text-base text-qgray leading-7"
                    style={{ textAlign: "justify" }}
                  >
                    {blog.content.replace(/<[^>]+>/g, "")}
                  </p>

                </div>
              </div>

              {/* Sidebar bên phải */}
              <div className="w-full lg:w-[350px] mt-10 lg:mt-0 space-y-8">
                {/* Tìm kiếm */}
                <div className="bg-white p-5 rounded-lg shadow-md border border-gray-200">
                  <h1 className="text-xl font-semibold mb-4 text-qblack flex items-center gap-2">
                    <FaSearch className="text-qblack" /> Tìm bài viết
                  </h1>
                  <div className="relative mb-4">
                    <input
                      type="text"
                      placeholder="Nhập từ khóa..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSearch();
                      }}
                      className="w-full py-2 pl-4 pr-10 border rounded-full focus:outline-none bg-[#F9F3E9] placeholder:text-qgraytwo"
                    />
                    <button
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-qblack"
                      onClick={handleSearch}
                      aria-label="Tìm kiếm"
                    >
                      🔍
                    </button>
                  </div>

                  {/* Kết quả tìm kiếm */}
                  {searchLoading && (
                    <p className="text-sm text-qgraytwo flex items-center gap-2">
                      <FaSpinner className="animate-spin text-qgraytwo" /> Đang tìm kiếm...
                    </p>
                  )}
                  {searchError && (
                    <p className="text-sm text-red-600 font-medium flex items-center gap-2">
                      <FaExclamationCircle /> {searchError}
                    </p>
                  )}
                  {!searchLoading && searchResults.length === 0 && searchTerm.trim() !== "" && (
                    <p className="text-sm italic text-qgraytwo flex items-center gap-2">
                      <FaInfoCircle /> đang tìm
                    </p>
                  )}
                  {!searchLoading && searchResults.length > 0 && (
                    <ul className="divide-y divide-gray-200 max-h-64 overflow-y-auto">
                      {searchResults.map((item) => (
                        <li key={item.id} className="py-2">
                          <a
                            href={`/blogs/${item.id}`}
                            className="text-sm text-qblack hover:text-yellow-500 font-medium"
                            title={item.title}
                          >
                            {item.title.length > 70 ? item.title.slice(0, 70) + "..." : item.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}

                </div>

                {/* Các bài viết khác */}
                <div className="bg-white p-5 rounded-lg shadow-md border border-gray-200">
                  <h2 className="text-xl font-semibold mb-4 text-qblack flex items-center gap-2">
                    <FaRegEdit className="text-qblack" /> Bài viết khác
                  </h2>
                  {otherBlogs.length === 0 ? (
                    <p className="text-sm text-qgraytwo italic">Không có bài viết nào khác.</p>
                  ) : (
                    <ul className="space-y-3">
                      {otherBlogs.map((item) => (
                        <li key={item.id}>
                          <a
                            href={`/blogs/${item.id}`}
                            className="text-sm font-medium text-qblack hover:text-yellow-500 transition duration-200"
                          >
                            {item.title.length > 60
                              ? item.title.slice(0, 60) + "..."
                              : item.title}
                          </a>
                          <p className="text-xs text-qgraytwo mt-1">
                            {new Date(item.created_at).toLocaleDateString("vi-VN")}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
