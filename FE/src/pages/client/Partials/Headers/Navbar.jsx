import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Arrow from "../../Helpers/icons/Arrow";
import axios from "axios";
import Constants from "../../../../Constants";

export default function Navbar({ className, type }) {
  const [categoryToggle, setToggle] = useState(false);
  const [elementsSize, setSize] = useState("0px");
  const [categories, setCategories] = useState([]);

  const handler = () => {
    setToggle(!categoryToggle);
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${Constants.DOMAIN_API}/category/list`);
        if (Array.isArray(res.data.data)) {
          setCategories(res.data.data);
        } else {
          setCategories([]);
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh mục:", error);
        setCategories([]);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (categoryToggle) {
      const totalItems = categories.length + 1;
      setSize(`${42 * totalItems}px`);
    } else {
      setSize("0px");
    }
  }, [categoryToggle, categories]);

  return (
    <div
      className={`nav-widget-wrapper w-full  h-[60px] relative z-30 ${type === 3 ? "bg-qh3-blue" : "bg-qyellow"
        }  ${className || ""}`}
    >
      <div className="container-x mx-auto h-full">
        <div className="w-full h-full relative">
          <div className="w-full h-full flex justify-between items-center">
            <div className="category-and-nav flex xl:space-x-7 space-x-3 items-center">
              <div className="category w-[270px] h-[53px] bg-white px-5 rounded-t-md mt-[6px] relative">
                <button
                  onClick={handler}
                  type="button"
                  className="w-full h-full flex justify-between items-center"
                >
                  <div className="flex space-x-3 items-center">
                    <span>
                      <svg
                        className="fill-current"
                        width="14"
                        height="9"
                        viewBox="0 0 14 9"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <rect width="14" height="1" />
                        <rect y="8" width="14" height="1" />
                        <rect y="4" width="10" height="1" />
                      </svg>
                    </span>
                    <span className="text-sm font-600 text-qblacktext">
                      All Categories
                    </span>
                  </div>
                  <div>
                    <Arrow
                      width="5.78538"
                      height="1.28564"
                      className="fill-current text-qblacktext"
                    />
                  </div>
                </button>
                {categoryToggle && (
                  <div
                    className="fixed top-0 left-0 w-full h-full -z-10"
                    onClick={handler}
                  ></div>
                )}
                <div
                  className="category-dropdown w-full absolute left-0 top-[53px] overflow-hidden z-50"
                  style={{ height: elementsSize }}
                >
                  <ul className="categories-list">
                    <li className="category-item">
                      <Link to="/all-products">
                        <div
                          className={`flex justify-between items-center px-5 h-10 bg-white transition-all duration-300 ease-in-out cursor-pointer text-qblack ${type === 3
                            ? "hover:bg-qh3-blue hover:text-white"
                            : "hover:bg-qyellow"
                            }`}
                        >
                          <span className="text-sm font-600 text-qblacktext">Tất cả sản phẩm</span>
                        </div>
                      </Link>
                    </li>

                    {categories.map((category) => (
                      <li key={category.id} className="category-item">
                        <Link to={`/category/${category.slug}`}>
                          <div
                            className={`flex justify-between items-center px-5 h-10 bg-white transition-all duration-300 ease-in-out cursor-pointer text-qblack ${type === 3 ? "hover:bg-qh3-blue hover:text-white" : "hover:bg-qyellow"
                              }`}
                          >
                            <span className="text-sm font-600 text-qblacktext">{category.name}</span>
                          </div>
                        </Link>
                      </li>
                    ))}

                  </ul>
                </div>
              </div>
              <div className="nav">
                <ul className="nav-wrapper flex xl:space-x-10 space-x-5">
                  <li className="relative">
                    <Link
                      to="/"
                      className={`flex items-center text-sm font-600 cursor-pointer ${type === 3 ? "text-white" : "text-qblacktext"
                        }`}
                    >
                      <span>Trang chủ</span>
                    </Link>
                  </li>
                  <li className="relative">
                    <Link
                      to="/all-products"
                      className={`flex items-center text-sm font-600 cursor-pointer ${type === 3 ? "text-white" : "text-qblacktext"
                        }`}
                    >
                      <span>Sản phẩm</span>
                    </Link>
                  </li>
                  <li className="relative">
                    <span
                      className={`flex items-center text-sm font-600 cursor-pointer ${type === 3 ? "text-white" : "text-qblacktext"
                        }`}
                    >
                      <span>Trang</span>
                      <span className="ml-1.5 ">
                        <Arrow className="fill-current" />
                      </span>
                    </span>
                    <div className="sub-menu w-[220px] absolute left-0 top-[60px]">
                      <div
                        className="w-full bg-white flex justify-between items-center "
                        style={{
                          boxShadow: "0px 15px 50px 0px rgba(0, 0, 0, 0.14)",
                        }}
                      >
                        <div className="categories-wrapper w-full h-full p-5">
                          <div>
                            <div className="category-items">
                              <ul className="flex flex-col space-y-2">
                                <li>
                                  <Link to="/privacy-policy">
                                    <span
                                      className={`text-qgray text-sm font-400 border-b border-transparent   ${type === 3
                                        ? "hover:text-qh3-blue hover:border-qh3-blue"
                                        : "hover:text-qyellow hover:border-qyellow"
                                        }`}
                                    >
                                      Chính sách bảo mật
                                    </span>
                                  </Link>
                                </li>
                                <li>
                                  <Link to="/terms-condition">
                                    <span
                                      className={`text-qgray text-sm font-400 border-b border-transparent   ${type === 3
                                        ? "hover:text-qh3-blue hover:border-qh3-blue"
                                        : "hover:text-qyellow hover:border-qyellow"
                                        }`}
                                    >
                                      Điều khoản - Điều kiện
                                    </span>
                                  </Link>
                                </li>
                                <li>
                                  <Link to="/faq">
                                    <span
                                      className={`text-qgray text-sm font-400 border-b border-transparent   ${type === 3
                                        ? "hover:text-qh3-blue hover:border-qh3-blue"
                                        : "hover:text-qyellow hover:border-qyellow"
                                        }`}
                                    >
                                      Câu hỏi thường gặp
                                    </span>
                                  </Link>
                                </li>
                                <li>
                                  <Link to="/all-products">
                                    <span
                                      className={`text-qgray text-sm font-400 border-b border-transparent   ${type === 3
                                        ? "hover:text-qh3-blue hover:border-qh3-blue"
                                        : "hover:text-qyellow hover:border-qyellow"
                                        }`}
                                    >
                                      Sản phẩm
                                    </span>
                                  </Link>
                                </li>
                                <li>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                  <li>
                    <Link to="/about">
                      <span
                        className={`flex items-center text-sm font-600 cursor-pointer ${type === 3 ? "text-white" : "text-qblacktext"
                          }`}
                      >
                        <span>Về chúng tôi</span>
                      </span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/blogs">
                      <span
                        className={`flex items-center text-sm font-600 cursor-pointer ${type === 3 ? "text-white" : "text-qblacktext"
                          }`}
                      >
                        <span>Tin tức</span>
                      </span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/contact">
                      <span
                        className={`flex items-center text-sm font-600 cursor-pointer ${type === 3 ? "text-white" : "text-qblacktext"
                          }`}
                      >
                        <span>Liên hệ</span>
                      </span>
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="become-seller-btn">
              <Link to="/become-saller">
                <div className="black-btn w-[161px] h-[40px] flex justify-center items-center cursor-pointer">
                  <div className="flex space-x-2 items-center">
                    <span className="text-sm font-600">Become a Seller</span>
                    <span>
                      <svg
                        className="fill-current"
                        width="6"
                        height="10"
                        viewBox="0 0 6 10"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <rect
                          x="1.08984"
                          width="6.94106"
                          height="1.54246"
                          transform="rotate(45 1.08984 0)"
                          fill="white"
                        />
                        <rect
                          x="6"
                          y="4.9082"
                          width="6.94106"
                          height="1.54246"
                          transform="rotate(135 6 4.9082)"
                          fill="white"
                        />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
