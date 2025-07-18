import { useEffect, useState } from "react";
import PageTitle from "../Helpers/PageTitle";
import Layout from "../Partials/LayoutHomeThree";
import { Link } from "react-router-dom";

export default function Blogs() {
  const [blogData, setBlogData] = useState({ blogs: [] });

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await fetch("http://localhost:5000/blogs");
        const data = await response.json();
        setBlogData({ blogs: data.blogs });
      } catch (error) {
        console.error("Error fetching blogs:", error);
      }
    };

    fetchBlogs();
  }, []);

  const blogs = blogData.blogs;
  const mainBlog = blogs[0];
  const highlightBlogs = blogs.slice(1, 3);
  const gridBlogs = blogs.slice(3, 9);
  const otherBlogs = blogs.slice(9);

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

      <div className="w-full py-[60px]">
        <div className="container-x mx-auto">
          <div className="w-full flex flex-col lg:flex-row gap-8">
            {/* Nội dung chính */}
            <main className="flex-1">
              {/* === BÀI VIẾT NỔI BẬT === */}
              {mainBlog && (
                <Link to={`/blogs/${mainBlog.id}`}>
                  <article className="mb-6 group">
                    <div className="relative overflow-hidden rounded-lg">
                      <img
                        src={mainBlog.image_url}
                        alt={mainBlog.title}
                        className="w-full h-[320px] object-cover transition-transform group-hover:scale-105 duration-300"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
                        <h2 className="text-xl font-bold leading-snug line-clamp-2">{mainBlog.title}</h2>
                        <p className="text-sm mt-1 text-gray-300 line-clamp-2">{mainBlog.meta_description}</p>
                      </div>
                    </div>
                  </article>
                </Link>
              )}

              {/* === 2 bài viết vừa dưới bài lớn === */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                {highlightBlogs.map((blog) => (
                  <Link to={`/blogs/${blog.id}`} key={blog.id}>
                    <article className="flex gap-3 rounded-md border hover:shadow-md transition overflow-hidden">
                      <img
                        src={blog.image_url}
                        alt={blog.title}
                        className="w-[120px] h-[90px] object-cover"
                      />
                      <div className="flex flex-col justify-between p-2">
                        <h3 className="text-sm font-semibold text-gray-800 line-clamp-2">{blog.title}</h3>
                        <p className="text-[12px] text-gray-500">
                          {blog.author || "Tác giả"} • {new Date(blog.created_at).toLocaleDateString("vi-VN")}
                        </p>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>

              {/* === Danh sách các bài viết mới === */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {gridBlogs.map((blog) => (
                  <Link to={`/blogs/${blog.id}`} key={blog.id}>
                    <article className="rounded-md border hover:shadow-md transition overflow-hidden h-full flex flex-col">
                      <img
                        src={blog.image_url}
                        alt={blog.title}
                        className="w-full h-[180px] object-cover"
                      />
                      <div className="p-3 flex-1 flex flex-col">
                        <p className="text-[12px] text-gray-400 mb-1">
                          {blog.author || "Tác giả"} • {new Date(blog.created_at).toLocaleDateString("vi-VN")}
                        </p>
                        <h4 className="text-base font-semibold text-gray-800 line-clamp-2 mb-1">{blog.title}</h4>
                        <p className="text-sm text-gray-600 line-clamp-3 mt-auto">
                          {blog.meta_description || "Không có mô tả"}
                        </p>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </main>

            {/* === Sidebar bài viết khác === */}
            <aside className="w-full lg:w-72 flex-shrink-0">
              <h2 className="text-gray-700 text-sm font-semibold mt-8 lg:mt-0 mb-3 border-b border-gray-300 pb-2">
                BÀI VIẾT KHÁC
              </h2>
              <ul className="space-y-4 text-xs text-gray-700 font-normal">
                {otherBlogs.map((blog) => (
                  <li key={blog.id} className="flex gap-3">
                    <Link to={`/blogs/${blog.id}`} className="flex gap-3">
                      <img
                        src={blog.image_url}
                        alt={blog.title}
                        className="w-[60px] h-[50px] object-cover flex-shrink-0 rounded"
                      />
                      <div className="leading-tight">
                        <p className="text-[11px] font-medium line-clamp-2">{blog.title}</p>
                        <p className="text-[10px] text-gray-400">
                          {new Date(blog.created_at).toLocaleDateString("vi-VN")}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </div>
      </div>
    </Layout>
  );
}
