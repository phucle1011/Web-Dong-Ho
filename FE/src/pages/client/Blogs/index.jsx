
import { useEffect, useState } from "react";
import BlogCard from "../Helpers/Cards/BlogCard";
import DataIteration from "../Helpers/DataIteration";
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

        // Format dữ liệu thành { blogs: [...] }
        setBlogData({ blogs: data.blogs });
      } catch (error) {
        console.error("Error fetching blogs:", error);
      }
    };

    fetchBlogs();
  }, []);

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
          <div className="w-full flex flex-col md:flex-row gap-8">
            {/* Left Sidebar */}
            <aside className="w-full md:w-72 flex-shrink-0">
              <h2 className="text-gray-700 text-sm font-normal mt-8 mb-3 border-b border-gray-300 pb-2">
                BÀI VIẾT KHÁC
              </h2>
              <ul className="space-y-4 text-xs text-gray-700 font-normal">
                {blogData.blogs.slice(0, 4).map((blog) => (
                  <li key={blog.id} className="flex gap-3">
                    <img
                      src={blog.image_url}
                      alt={blog.meta_description || blog.title}
                      className="w-[60px] h-[50px] object-cover flex-shrink-0"
                      width={60}
                      height={50}
                    />
                    <div className="leading-tight">
                      <p className="italic text-[11px] mb-0.5">{blog.title}</p>
                      <p className="text-[10px] text-gray-400 mb-0.5">
                        {new Date(blog.created_at).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </aside>

            {/* Main Content */}
            <main className="flex-1">
              <h2 className="text-gray-800 font-bold text-lg mb-6">TIN TỨC MỚI</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
                <DataIteration
                  datas={blogData.blogs}
                  startLength={0}
                  endLength={blogData.blogs.length}
                >
                  {({ datas }) => (
                    <Link to={`/blogs/${datas.id}`} key={datas.id}>
                      <article className="cursor-pointer hover:shadow-lg transition border rounded overflow-hidden h-full">
                        <img
                          src={datas.image_url}
                          alt={datas.meta_description || datas.title}
                          className="w-full h-[200px] object-cover mb-2"
                          width={300}
                          height={200}
                        />
                        <div className="p-3">
                          <h3 className="text-sm font-semibold text-gray-800 mb-1 leading-tight group-hover:text-yellow-600 transition">
                            {datas.title}
                          </h3>
                          <p className="text-xs text-gray-400 mb-2">
                            {new Date(datas.created_at).toLocaleDateString("vi-VN")}
                          </p>
                          <p
                            className="text-xs text-gray-700 leading-relaxed line-clamp-3"
                            dangerouslySetInnerHTML={{ __html: datas.content }}
                          />
                        </div>
                      </article>
                    </Link>

                  )}
                </DataIteration>
              </div>
            </main>
          </div>
        </div>
      </div>
    </Layout>
  );
}
