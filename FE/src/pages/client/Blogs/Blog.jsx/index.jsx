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
              { name: "trang chủ", path: "/" },
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
                    <span className="text-base text-qgraytwo capitalize">
                      By {blog.author || "Admin"}
                    </span>
                    <span className="text-base text-qgraytwo capitalize">
                      {new Date(blog.created_at).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                  <h2 className="text-[24px] font-semibold mb-4">{blog.title}</h2>
                  <div
                    className="text-base text-qgray leading-7"
                    style={{ textAlign: "justify" }}
                    dangerouslySetInnerHTML={{ __html: blog.content }}
                  />
                </div>
              </div>

              {/* Sidebar bên phải */}
              <div className="w-full lg:w-[350px] mt-10 lg:mt-0 space-y-8">
            

                {/* Các bài viết khác */}
<div className="rounded-lg shadow-md border border-gray-200 overflow-hidden">
  {/* Tiêu đề màu xanh */}
  <div className="bg-blue-600 p-4">
    <h2 className="text-xl font-semibold text-white flex items-center gap-2">
      <FaRegEdit /> Bài viết khác
    </h2>
  </div>

  {/* Nội dung bài viết khác */}
  <div className="bg-white p-5">
    {otherBlogs.length === 0 ? (
      <p className="text-sm text-qgraytwo italic">Không có bài viết nào khác.</p>
    ) : (
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left text-gray-600">
          <tbody>
            {otherBlogs.map((item) => (
              <tr key={item.id} className="border-b border-gray-200">
                <td className="py-2 pr-3">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-[80px] h-[50px] object-cover rounded"
                  />
                </td>
                <td className="py-2">
                  <a
                    href={`/blogs/${item.id}`}
                    className="font-medium text-qblack hover:text-yellow-500 transition"
                  >
                    {item.title.length > 60 ? item.title.slice(0, 60) + "..." : item.title}
                  </a>
                  <p className="text-xs text-qgraytwo mt-1">
                    {new Date(item.created_at).toLocaleDateString("vi-VN")}
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
</div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
