import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import Star from "../Helpers/icons/Star";
import InputForm from "../Helpers/InputForm";
import PageTitle from "../Helpers/PageTitle";
import Layout from "../Partials/LayoutHomeThree";

const MAX_COMPARE = 4;
const MIN_COMPARE = 2;

export default function ProductsCompare() {
  const [variants, setVariants] = useState([]);
  const [searchInputs, setSearchInputs] = useState(Array(MAX_COMPARE).fill(""));
  const [selectedVariants, setSelectedVariants] = useState(Array(MAX_COMPARE).fill(null));
  const [filteredLists, setFilteredLists] = useState(Array(MAX_COMPARE).fill([]));
  const [allAttributes, setAllAttributes] = useState([]);
  const [bestChoice, setBestChoice] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/products/compare")
      .then((res) => res.json())
      .then((data) => {
        const variantList = [];

        data.data.forEach((product) => {
          product.variants.forEach((variant) => {
            variantList.push({
              productId: product.id,
              productName: product.name,
              productDescription: product.description,
              productThumbnail: product.thumbnail,
              brand: product.brand?.name || "-",
              average_rating: product.average_rating,
              variantId: variant.id,
              price: variant.price,
              stock: variant.stock,
              sku: variant.sku,
              images: variant.images,
              attributeValues: variant.attributeValues,
            });
          });
        });

        setVariants(variantList);
        setFilteredLists(Array(MAX_COMPARE).fill(variantList));

        const attrSet = new Set();
        variantList.forEach((v) => {
          v.attributeValues?.forEach((av) => {
            attrSet.add(av.attribute.name);
          });
        });
        setAllAttributes(Array.from(attrSet));
      })
      .catch(console.error);
  }, []);

  const handleSearchInputChange = (index, value) => {
    const newSearchInputs = [...searchInputs];
    newSearchInputs[index] = value;
    setSearchInputs(newSearchInputs);

    const filtered = variants.filter(
      (v) =>
        v.productName.toLowerCase().includes(value.toLowerCase()) ||
        v.sku?.toLowerCase().includes(value.toLowerCase()) ||
        v.productDescription?.toLowerCase().includes(value.toLowerCase())
    );

    const newFilteredLists = [...filteredLists];
    newFilteredLists[index] = filtered;
    setFilteredLists(newFilteredLists);
  };

  const handleSelectVariant = (index, variant) => {
    if (selectedVariants.some((v, idx) => v?.variantId === variant.variantId && idx !== index)) {
      Swal.fire({
        icon: "warning",
        title: "Trùng biến thể",
        text: "Biến thể này đã được chọn ở cột khác!",
      });
      return;
    }

    const newSelected = [...selectedVariants];
    newSelected[index] = variant;
    setSelectedVariants(newSelected);

    const newSearchInputs = [...searchInputs];
    newSearchInputs[index] = variant.productName;
    setSearchInputs(newSearchInputs);
  };

  const handleClearVariant = (index) => {
    const newSelected = [...selectedVariants];
    newSelected[index] = null;
    setSelectedVariants(newSelected);

    const newSearchInputs = [...searchInputs];
    newSearchInputs[index] = "";
    setSearchInputs(newSearchInputs);

    const newFilteredLists = [...filteredLists];
    newFilteredLists[index] = variants;
    setFilteredLists(newFilteredLists);
  };

  const canCompare = selectedVariants.filter(Boolean).length >= MIN_COMPARE;

  const renderStars = (rating) => {
    if (!rating) return null;
    const stars = [];
    const r = Math.floor(rating);
    for (let i = 0; i < 5; i++) {
      stars.push(<Star key={i} fill={i < r} />);
    }
    return stars;
  };

  const getAttributeValue = (variant, attributeName) => {
    const av = variant.attributeValues?.find((a) => a.attribute.name === attributeName);
    return av ? av.value : "-";
  };

  const getImageUrl = (variant) => {
    return variant.images?.[0]?.image_url || null;
  };

  const calculateScore = (variant) => {
    let score = 0;
    if (variant.average_rating) score += variant.average_rating * 10;
    if (variant.price) score += 10000 / variant.price;
    if (variant.stock > 0) score += 5;
    if (variant.brand && variant.brand !== "-") score += 2;
    return score;
  };

  const handleCompareClick = () => {
    if (!canCompare) {
      Swal.fire({
        icon: "error",
        title: "Chưa đủ biến thể",
        text: `Vui lòng chọn ít nhất ${MIN_COMPARE} biến thể để so sánh.`,
      });
      return;
    }

    const scoredVariants = selectedVariants
      .filter(Boolean)
      .map((v) => ({ ...v, score: calculateScore(v) }));

    const bestVariant = scoredVariants.reduce((prev, current) =>
      prev.score > current.score ? prev : current
    );

    setBestChoice(bestVariant);

    Swal.fire({
      icon: "success",
      title: "Kết quả so sánh",
      html: `
        <p>Sản phẩm đáng mua nhất là:</p>
        <p><strong>${bestVariant.productName}</strong></p>
        <p>Giá: ${Number(bestVariant.price).toLocaleString("vi-VN", {
          style: "currency",
          currency: "VND",
        })}</p>
        <p>Đánh giá: ${bestVariant.average_rating || "Không có"}</p>
        <img src="${bestVariant.productThumbnail}" alt="Hình ảnh" style="max-width: 150px; margin-top: 10px;" />
      `,
    });
  };

  return (
    <Layout childrenClasses="pt-0 pb-0">
      <div className="products-compare-wrapper w-full bg-white pb-[40px]">
        <div className="w-full mb-5">
          <PageTitle
            breadcrumb={[
              { name: "Trang chủ", path: "/" },
              { name: "So sánh sản phẩm", path: "/products-compare" },
            ]}
            title="So sánh sản phẩm"
          />
        </div>

        <div className="container-x mx-auto overflow-x-auto">
          <div className="w-full border border-qgray-border">
            <table className="table-wrapper min-w-[900px] border-collapse border border-gray-300">
              <tbody>
                {/* Dòng tìm kiếm + sản phẩm */}
                <tr>
                  <td className="w-[233px] pt-[30px] px-[26px] align-top bg-[#FAFAFA] font-semibold">
                    So sánh sản phẩm
                    <p className="text-[13px] text-qgraytwo mt-2">
                      Tìm kiếm và chọn biến thể để so sánh
                    </p>
                  </td>
                  {Array(MAX_COMPARE).fill(0).map((_, i) => (
                    <td key={i} className="w-[235px] bg-white p-4 border border-gray-300">
                      <InputForm
                        placeholder="Tìm sản phẩm hoặc biến thể..."
                        value={searchInputs[i]}
                        inputHandler={(e) => handleSearchInputChange(i, e.target.value)}
                      />
                      {!selectedVariants[i] && searchInputs[i] && (
                        <ul className="bg-white border border-qgray-border max-h-40 overflow-y-auto mt-1 rounded shadow-md">
                          {filteredLists[i].slice(0, 5).map((v) => (
                            <li
                              key={v.variantId}
                              className="p-2 cursor-pointer hover:bg-gray-200"
                              onClick={() => handleSelectVariant(i, v)}
                            >
                              {v.productName} - {v.sku}
                            </li>
                          ))}
                          {filteredLists[i].length === 0 && (
                            <li className="p-2 text-center text-gray-500">Không có kết quả</li>
                          )}
                        </ul>
                      )}
                      {selectedVariants[i] && (
                        <div className="mt-4">
                          <div className="flex justify-center mb-3">
                            <img
                              src={selectedVariants[i].productThumbnail}
                              alt={selectedVariants[i].productName}
                              className="w-[161px] h-[161px] object-contain"
                            />
                          </div>
                          <p className="text-center text-[15px] font-medium text-qblack leading-[24px] mb-1">
                            {selectedVariants[i].productName}
                          </p>
                          <p className="text-center text-[15px] font-medium text-qred leading-[24px] mb-1">
                            {Number(selectedVariants[i].price).toLocaleString("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            })}
                          </p>
                          <button
                            className="block mx-auto text-xs text-blue-500 underline"
                            onClick={() => handleClearVariant(i)}
                          >
                            Xóa
                          </button>
                        </div>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Các dòng thông tin cơ bản */}
                {[
                  { label: "Tên sản phẩm", value: (v) => v?.productName || "-" },
                  {
                    label: "Hình ảnh",
                    value: (v) => {
                      const url = getImageUrl(v);
                      return url ? (
                        <img src={url} className="w-20 h-20 mx-auto object-contain" alt="" />
                      ) : "-";
                    },
                  },
                  { label: "Mô tả", value: (v) => v?.productDescription || "-" },
                  { label: "Thương hiệu", value: (v) => v?.brand || "-" },
                  {
                    label: "Giá",
                    value: (v) =>
                      Number(v?.price).toLocaleString("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }),
                  },
                  { label: "SKU", value: (v) => v?.sku || "-" },
                  { label: "Tồn kho", value: (v) => v?.stock ?? "-" },
                  {
                    label: "Đánh giá",
                    value: (v) => (
                      <div className="flex flex-col items-center">
                        <div className="flex">{renderStars(v.average_rating)}</div>
                        <span className="text-xs">{v.average_rating || "-"}</span>
                      </div>
                    ),
                  },
                ].map(({ label, value }) => (
                  <tr key={label} className="border-t border-gray-300">
                    <td className="text-sm bg-[#FAFAFA] font-semibold px-[26px] py-[20px]">{label}</td>
                    {selectedVariants.map((v, i) => (
                      <td key={i} className="text-center text-sm px-[26px] py-[20px]">
                        {v ? value(v) : "-"}
                      </td>
                    ))}
                  </tr>
                ))}

                {/* Dòng thuộc tính động */}
                {allAttributes.map((attr) => (
                  <tr key={attr} className="border-t border-gray-300">
                    <td className="text-sm bg-[#FAFAFA] font-semibold px-[26px] py-[20px]">{attr}</td>
                    {selectedVariants.map((v, i) => {
                      const value = v ? getAttributeValue(v, attr) : "-";
                      return (
                        <td key={i} className="text-center text-sm px-[26px] py-[20px]">
                          {attr.toLowerCase() === "color" || attr.toLowerCase() === "màu sắc" ? (
                            value !== "-" ? (
                              <div
                                className="w-6 h-6 rounded-full mx-auto border"
                                style={{ backgroundColor: value }}
                                title={value}
                              />
                            ) : "-"
                          ) : (
                            value
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-center mt-6">
            <button
              onClick={handleCompareClick}
              className={`px-6 py-2 rounded text-white ${canCompare ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"}`}
              disabled={!canCompare}
            >
              So sánh
            </button>
          </div>

          {!canCompare && (
            <p className="text-center mt-6 text-red-600 font-semibold">
              Vui lòng chọn ít nhất {MIN_COMPARE} sản phẩm để so sánh
            </p>
          )}

          {/* Kết quả sản phẩm tốt nhất */}
          {bestChoice && (
            <div className="mt-8 text-center">
              <h2 className="text-xl font-bold text-green-600 mb-4">🎉 Sản phẩm đáng mua nhất</h2>
              <div className="inline-block p-4 border border-green-400 rounded shadow">
                <img
                  src={bestChoice.productThumbnail}
                  alt={bestChoice.productName}
                  className="w-32 h-32 mx-auto object-contain mb-2"
                />
                <h3 className="text-lg font-semibold">{bestChoice.productName}</h3>
                <p className="text-qred font-medium">
                  {Number(bestChoice.price).toLocaleString("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  })}
                </p>
                <p>Đánh giá: {bestChoice.average_rating || "Không có"}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
