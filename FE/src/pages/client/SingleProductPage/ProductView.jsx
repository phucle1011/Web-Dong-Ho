import { useState, useEffect } from "react";
import Star from "../Helpers/icons/Star";
import Selectbox from "../Helpers/Selectbox";
import axios from "axios";

export default function ProductView({ className, reportHandler }) {
  const [productData, setProductData] = useState(null);
  const [variants, setVariants] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
const [selectedVariant, setSelectedVariant] = useState(null);
const [variantImages, setVariantImages] = useState([]);
const [allVariants, setAllVariants] = useState([]);
const [filteredVariants, setFilteredVariants] = useState([]);

  // Gom state chọn thuộc tính
  const [selectedFilters, setSelectedFilters] = useState({
    dialSize: null,
    waterResistance: null,
    strapMaterial: null,
    movementType: null,
  });

  // Dữ liệu filter (các lựa chọn)
  const [filterOptions, setFilterOptions] = useState({
    dialSizes: [],
    waterResistances: [],
    strapMaterials: [],
    movementTypes: [],
    colors: [],
  });

  const [selectedImage, setSelectedImage] = useState("");

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        const productId = 1;
        const res = await axios.get(
          `http://localhost:5000/products/${productId}/variants`
        );
        const { product } = res.data;
        setProductData(product);
        setVariants(product.variants);
        setImages(product.variantImages);
        setAllVariants(product.variants); 

        // Trích xuất các loại thuộc tính
        const extractAttributeValues = (attrName, keyName) => {
  const seen = new Set();

  return product.variants
    .map((variant) => {
      const attr = variant.attributeValues.find(
        (a) => a.attribute.name === attrName
      );
      return {
        id: variant.id,
        [keyName]: attr ? attr.value : null,
        image: variant.images[0]?.image_url || "",
      };
    })
    .filter((item) => {
      const value = item[keyName];
      if (!value || seen.has(value)) return false;
      seen.add(value);
      return true;
    });
};


        setFilterOptions({
          dialSizes: extractAttributeValues("Dial Size", "dialSize"),
          waterResistances: extractAttributeValues(
            "Water Resistance",
            "waterResistance"
          ),
          strapMaterials: extractAttributeValues(
            "Strap Material",
            "strapMaterial"
          ),
          movementTypes: extractAttributeValues(
            "Movement Type",
            "movementType"
          ),
          colors: extractAttributeValues("Color", "color"),
        });

        // Ảnh mặc định
        const firstImage = product.thumbnail;
        if (firstImage) setSelectedImage(firstImage);
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, []);

 const updateFilter = (type, value) => {
  setSelectedFilters((prev) => {
    // Toggle filter
    const newFilters = {
      ...prev,
      [type]: prev[type] === value ? null : value,
    };

    // Lọc các biến thể phù hợp theo tất cả filter hiện tại
    const newFiltered = variants.filter((variant) => {
      return (
        (!newFilters.dialSize || getAttrValue(variant, "Dial Size") === newFilters.dialSize) &&
        (!newFilters.waterResistance || getAttrValue(variant, "Water Resistance") === newFilters.waterResistance) &&
        (!newFilters.strapMaterial || getAttrValue(variant, "Strap Material") === newFilters.strapMaterial) &&
        (!newFilters.movementType || getAttrValue(variant, "Movement Type") === newFilters.movementType) &&
        (!newFilters.color || variant.attributeValues.some(
          (a) => a.attribute.name === "Color" && a.value === newFilters.color
        ))
      );
    });

    setFilteredVariants(newFiltered);

    // Cập nhật ảnh
    const newImages = newFiltered.flatMap((v) => v.images || []);
    setVariantImages(newImages);

    if (!newFilters[type]) {
      const allImages = variants.flatMap((v) => v.images || []);
      setVariantImages(allImages);
      if (allImages.length > 0) {
        setSelectedImage(allImages[0].image_url);
      }
    } else {
      if (newImages.length > 0) {
        setSelectedImage(newImages[0].image_url);
      }
    }

    // Chỉ tự động chọn khi chỉ 1 biến thể phù hợp
    if (newFiltered.length === 1) {
      setSelectedVariant(newFiltered[0]);
    } else {
      setSelectedVariant(null);
    }

    return newFilters;
  });
};



  const getAttrValue = (variant, attrName) => {
  const attr = variant.attributeValues.find(
    (a) => a.attribute.name === attrName
  );
  return attr ? attr.value : null;
};


  const filteredBySelection = variants.filter((variant) => {
  return (
    (!selectedFilters.dialSize ||
      getAttrValue(variant, "Dial Size") === selectedFilters.dialSize) &&
    (!selectedFilters.waterResistance ||
      getAttrValue(variant, "Water Resistance") === selectedFilters.waterResistance) &&
    (!selectedFilters.strapMaterial ||
      getAttrValue(variant, "Strap Material") === selectedFilters.strapMaterial) &&
    (!selectedFilters.movementType ||
      getAttrValue(variant, "Movement Type") === selectedFilters.movementType) &&
    (!selectedFilters.color ||
      variant.attributeValues.some(
        (a) => a.attribute.name === "Color" && a.value === selectedFilters.color
      ))
  );
});


  const increment = () => setQuantity((q) => q + 1);
  const decrement = () => setQuantity((q) => Math.max(1, q - 1));

  if (loading) return <div>Loading product...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!productData) return null;
  const changeImgHandler = (url) => {
    setSelectedImage(url);
  };

  const validDialSizes = new Set(
    filteredBySelection .map((v) => getAttrValue(v, "Dial Size"))
  );
  const validWaterResistances = new Set(
    filteredBySelection .map((v) => getAttrValue(v, "Water Resistance"))
  );
  const validStrapMaterials = new Set(
    filteredBySelection .map((v) => getAttrValue(v, "Strap Material"))
  );
  const validMovementTypes = new Set(
    filteredBySelection .map((v) => getAttrValue(v, "Movement Type"))
  );
  const validColors = new Set(
    filteredBySelection .flatMap((v) =>
      v.attributeValues
        .filter((a) => a.attribute.name === "Color")
        .map((a) => a.value)
    )
  );
 const handleVariantSelect = (variant) => {
  // Nếu đã chọn variant này rồi, thì bỏ chọn
  if (selectedVariant && selectedVariant.id === variant.id) {
    setSelectedVariant(null);
    setSelectedFilters({
      dialSize: null,
      waterResistance: null,
      strapMaterial: null,
      movementType: null,
      color: null,
    });
    setFilteredVariants(variants);
    setVariantImages([]);
    setSelectedImage(""); // hoặc ảnh mặc định
    return;
  }

  // Nếu chọn variant mới
  const dialSize = getAttrValue(variant, "Dial Size");
  const waterResistance = getAttrValue(variant, "Water Resistance");
  const strapMaterial = getAttrValue(variant, "Strap Material");
  const movementType = getAttrValue(variant, "Movement Type");
  const color = getAttrValue(variant, "Color");

  const newFilters = {
    dialSize: dialSize || null,
    waterResistance: waterResistance || null,
    strapMaterial: strapMaterial || null,
    movementType: movementType || null,
    color: color || null,
  };

  setSelectedFilters(newFilters);

  const newFiltered = variants.filter((v) =>
    (!newFilters.dialSize || getAttrValue(v, "Dial Size") === newFilters.dialSize) &&
    (!newFilters.waterResistance || getAttrValue(v, "Water Resistance") === newFilters.waterResistance) &&
    (!newFilters.strapMaterial || getAttrValue(v, "Strap Material") === newFilters.strapMaterial) &&
    (!newFilters.movementType || getAttrValue(v, "Movement Type") === newFilters.movementType) &&
    (!newFilters.color || getAttrValue(v, "Color") === newFilters.color)
  );

  setFilteredVariants(newFiltered);

  const newImages = newFiltered.flatMap((v) => v.images || []);
  setVariantImages(newImages);
  if (newImages.length > 0) {
    setSelectedImage(newImages[0].image_url);
  }

  setSelectedVariant(variant);
};






  const handleAddToCart = (variantId, quantity) => {
  if (!variantId) {
    alert("Bạn chưa chọn biến thể sản phẩm.");
    return;
  }

  // Gửi lên API hoặc cập nhật state ở đây
  console.log("Add to cart:", { variantId, quantity });

  // Ví dụ gọi API
  // axios.post('/api/cart', { variantId, quantity })
};




  return (
    <div
      className={`product-view w-full lg:flex justify-between ${
        className || ""
      }`}
    >
      <div data-aos="fade-right" className="lg:w-1/2 xl:mr-[70px] lg:mr-[50px]">
        <div className="w-full">
          <div className="w-full h-[600px] border border-qgray-border flex justify-center items-center overflow-hidden relative mb-3">
            <img src={selectedImage} alt="" className="object-contain" />

            <div className="w-[80px] h-[80px] rounded-full bg-qyellow text-qblack flex justify-center items-center text-xl font-medium absolute left-[30px] top-[30px]">
              <span>-50%</span>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
  {(selectedVariant ? variantImages : images).map((img) => (
    <div
      onClick={() => changeImgHandler(img.image_url)}
      key={img.id}
      className="w-[110px] h-[110px] p-[15px] border border-qgray-border cursor-pointer"
    >
      <img
        src={img.image_url}
        alt=""
        className={`w-full h-full object-contain ${
          selectedImage !== img.image_url ? "opacity-50" : ""
        }`}
      />
    </div>
  ))}
</div>

        </div>
      </div>

      <div className="flex-1">
        <div className="product-details w-full mt-10 lg:mt-0">
          <span
            data-aos="fade-up"
            className="text-qgray text-xs font-normal uppercase tracking-wider mb-2 inline-block"
          >
            Mobile Phones
          </span>
          <p
            data-aos="fade-up"
            className="text-xl font-medium text-qblack mb-4"
          >
            {productData.name}
          </p>

          <div
            data-aos="fade-up"
            className="flex space-x-[10px] items-center mb-6"
          >
            <div className="flex">
              <Star />
              <Star />
              <Star />
              <Star />
              <Star />
            </div>
            <span className="text-[13px] font-normal text-qblack">
              6 Reviews
            </span>
          </div>

          

          <p
            data-aos="fade-up"
            className="text-qgray text-sm text-normal mb-[30px] leading-7"
          >
            {productData.description}
          </p>

          <span className="block text-sm font-semibold uppercase text-gray-600 mb-4 mt-8">
            Biến thể
          </span>
          <div
            className="flex flex-wrap gap-4"
            style={{
              transform: "translate3d(0px, 0px, 0px)",
              transition: "all",
              width: "100%",
            }}
          >
            {filteredBySelection .length === 0 && (
              <p className="col-span-full text-center text-gray-500">
                Không có biến thể phù hợp
              </p>
            )}

            {allVariants
  .filter((variant) => variant.attributeValues.length > 0)
  .map((variant) => {
    const name = variant.name || variant.sku || "Unnamed";
    const originalPrice = Number(variant.price || 0);
    const salePrice = Number(variant.final_price || 0);
    const isValid = filteredBySelection.some(v => v.id === variant.id);

    return (
      <div
        key={variant.id}
        className={`border rounded-xl px-4 py-2 min-w-[150px] text-center transition
          ${isValid ? "cursor-pointer hover:shadow" : "opacity-50 cursor-not-allowed"}
          ${variant.stock === 0 ? "opacity-50 cursor-not-allowed" : ""}
        `}
        onClick={() => {
          if (isValid && variant.stock > 0) {
            handleVariantSelect(variant);
            changeImgHandler(variant.images?.[0]?.image_url || "");
          }
        }}
      >
        <p className="font-semibold uppercase">{name}</p>

        {salePrice > 0 && salePrice < originalPrice ? (
          <div className="text-red-600 font-bold text-lg">
            <span>{salePrice.toLocaleString("vi-VN")}₫</span>
            <span className="text-gray-500 line-through ml-2 text-sm font-normal">
              {originalPrice.toLocaleString("vi-VN")}₫
            </span>
          </div>
        ) : (
          <p className="text-red-600 font-bold text-lg">
            {originalPrice.toLocaleString("vi-VN")}₫
          </p>
        )}

        <p>
          {variant.stock === 0 ? (
            <span className="text-gray-500 font-semibold">Hết hàng</span>
          ) : (
            <>Còn lại: {variant.stock}</>
          )}
        </p>
      </div>
    );
  })}



          </div>

          <div data-aos="fade-up" className="colors mb-[30px]">
            <span className="text-sm font-normal uppercase text-qgray mb-[14px] inline-block">
              COLOR
            </span>

            <div>
              <div className="flex space-x-4 items-center">
                {filterOptions.colors.map(({ id, color, image }) => {
                  const isValid = validColors.has(color);
                  const isSelected = selectedFilters.color === color;

                  return (
                    <button
                      key={id}
                      onClick={() => {
                        if (!isValid) return;
                        if (isSelected) {
                          updateFilter("color", null); // bỏ chọn màu
                          changeImgHandler(""); // reset ảnh nếu muốn
                        } else {
                          updateFilter("color", color);
                          changeImgHandler(image); // đổi ảnh theo màu được chọn
                        }
                      }}
                      type="button"
                      style={{ "--tw-ring-color": color }}
                      disabled={!isValid}
                      className={`w-[20px] h-[20px] rounded-full focus:ring-2 ring-offset-2 flex justify-center items-center
        ${isSelected ? "ring-4 ring-offset-2" : ""}
        ${!isValid ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
      `}
                    >
                      <span
                        style={{ background: color }}
                        className="w-[20px] h-[20px] block rounded-full border"
                      ></span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Dial Size */}
          <div>
            <span className="text-sm font-normal uppercase text-qgray mb-[14px] inline-block">
              dialSize
            </span>
            <div
              className="owl-stage flex gap-2 overflow-x-auto py-2"
              style={{ width: "100%" }}
            >
              {filterOptions.dialSizes.map(({ id, dialSize }) => {
                const isValid = validDialSizes.has(dialSize);
                const isSelected = selectedFilters.dialSize === dialSize;

                return (
                  <button
                    key={id}
                    onClick={() =>
                      isValid && updateFilter("dialSize", dialSize)
                    }
                    disabled={!isValid}
                    className={`px-3 py-1 rounded-md border transition
        ${
          isSelected
            ? "bg-blue-600 text-white border-blue-600"
            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
        }
        ${!isValid ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
      `}
                  >
                    {dialSize}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Water Resistance */}
          <div>
            <span className="text-sm font-normal uppercase text-qgray mb-[14px] inline-block">
              waterResistance
            </span>
            <div
              className="owl-stage flex gap-2 overflow-x-auto py-2"
              style={{ width: "100%" }}
            >
              {filterOptions.waterResistances.map(({ id, waterResistance }) => {
                const isValid = validWaterResistances.has(waterResistance);
                const isSelected =
                  selectedFilters.waterResistance === waterResistance;

                return (
                  <button
                    key={id}
                    onClick={() =>
                      isValid &&
                      updateFilter("waterResistance", waterResistance)
                    }
                    disabled={!isValid}
                    className={`px-3 py-1 rounded-md border transition
        ${
          isSelected
            ? "bg-blue-600 text-white border-blue-600"
            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
        }
        ${!isValid ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
      `}
                  >
                    {waterResistance}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Strap Material */}
          <div>
            <span className="text-sm font-normal uppercase text-qgray mb-[14px] inline-block">
              strapMaterial
            </span>
            <div
              className="owl-stage flex gap-2 overflow-x-auto py-2"
              style={{ width: "100%" }}
            >
              {filterOptions.strapMaterials.map(({ id, strapMaterial }) => {
                const isValid = validStrapMaterials.has(strapMaterial);
                const isSelected =
                  selectedFilters.strapMaterial === strapMaterial;

                return (
                  <button
                    key={id}
                    onClick={() =>
                      isValid && updateFilter("strapMaterial", strapMaterial)
                    }
                    disabled={!isValid}
                    className={`px-3 py-1 rounded-md border transition
        ${
          isSelected
            ? "bg-blue-600 text-white border-blue-600"
            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
        }
        ${!isValid ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
      `}
                  >
                    {strapMaterial}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Movement Type */}
          <div>
            <span className="text-sm font-normal uppercase text-qgray mb-[14px] inline-block">
              movementType
            </span>
            <div
              className="owl-stage flex gap-2 overflow-x-auto py-2"
              style={{ width: "100%" }}
            >
              {filterOptions.movementTypes.map(({ id, movementType }) => {
                const isValid = validMovementTypes.has(movementType);
                const isSelected =
                  selectedFilters.movementType === movementType;

                return (
                  <button
                    key={id}
                    onClick={() =>
                      isValid && updateFilter("movementType", movementType)
                    }
                    disabled={!isValid}
                    className={`px-3 py-1 rounded-md border transition
        ${
          isSelected
            ? "bg-blue-600 text-white border-blue-600"
            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
        }
        ${!isValid ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
      `}
                  >
                    {movementType}
                  </button>
                );
              })}
            </div>
          </div>

          

          <div data-aos="fade-up" className="product-size mb-[30px]"></div>

          <div
            data-aos="fade-up"
            className="quantity-card-wrapper w-full flex items-center h-[50px] space-x-[10px] mb-[30px]"
          >
            <div className="w-[120px] h-full px-[26px] flex items-center border border-qgray-border">
              <div className="flex justify-between items-center w-full">
                <button
                  onClick={decrement}
                  type="button"
                  className="text-base text-qgray"
                >
                  -
                </button>
                <span className="text-qblack">{quantity}</span>
                <button
                  onClick={increment}
                  type="button"
                  className="text-base text-qgray"
                >
                  +
                </button>
              </div>
            </div>
            <div className="w-[60px] h-full flex justify-center items-center border border-qgray-border">
              <button type="button">
                <span>
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M17 1C14.9 1 13.1 2.1 12 3.7C10.9 2.1 9.1 1 7 1C3.7 1 1 3.7 1 7C1 13 12 22 12 22C12 22 23 13 23 7C23 3.7 20.3 1 17 1Z"
                      stroke="#D5D5D5"
                      strokeWidth="2"
                      strokeMiterlimit="10"
                      strokeLinecap="square"
                    />
                  </svg>
                </span>
              </button>
            </div>
            <div className="flex-1 h-full">
              <button
  type="button"
  onClick={() => {
    if (!selectedVariant) {
      alert("Vui lòng chọn biến thể trước khi thêm vào giỏ hàng");
      return;
    }

    if (quantity > selectedVariant.stock) {
      alert(`Chỉ còn ${selectedVariant.stock} sản phẩm trong kho`);
      return;
    }

    // Gửi dữ liệu
    const payload = {
      variantId: selectedVariant.id,
      quantity: quantity,
    };

    console.log("Add to cart:", payload);
    // Gọi API add to cart ở đây nếu có
  }}
  className="black-btn text-sm font-semibold w-full h-full"
>
  Add To Cart
</button>



            </div>
          </div>

          <div data-aos="fade-up" className="mb-[20px]">
            <p className="text-[13px] text-qgray leading-7">
              <span className="text-qblack">Category :</span> Kitchen
            </p>
            <p className="text-[13px] text-qgray leading-7">
              <span className="text-qblack">Tags :</span> Beer, Foamer
            </p>
            <p className="text-[13px] text-qgray leading-7">
              <span className="text-qblack">SKU:</span> KE-91039
            </p>
          </div>

          <div
            data-aos="fade-up"
            className="flex space-x-2 items-center mb-[20px]"
          >
            <span>
              <svg
                width="12"
                height="13"
                viewBox="0 0 12 13"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M0 0C0.247634 0 0.475436 0 0.729172 0C0.738324 0.160174 0.747477 0.316279 0.757647 0.493233C1.05816 0.392044 1.33885 0.282211 1.62818 0.203395C3.11296 -0.201361 4.51385 0.0366111 5.84202 0.779512C6.47661 1.13494 7.14171 1.39071 7.86987 1.47207C8.88125 1.58496 9.82093 1.35817 10.7098 0.88426C10.9335 0.765274 11.1522 0.636627 11.411 0.491199C11.4161 0.606117 11.4237 0.693577 11.4237 0.780529C11.4242 3.18822 11.4222 5.5954 11.4288 8.00309C11.4293 8.1892 11.3718 8.29089 11.2096 8.38039C9.31956 9.42279 7.4285 9.43499 5.54557 8.37734C4.06231 7.54443 2.55363 7.43307 0.992568 8.13835C0.804428 8.22327 0.737816 8.33005 0.739341 8.53904C0.749003 9.9206 0.744426 11.3027 0.744426 12.6842C0.744426 12.7849 0.744426 12.8851 0.744426 13C0.48764 13 0.254244 13 0 13C0 8.67582 0 4.34961 0 0Z"
                  fill="#EB5757"
                />
              </svg>
            </span>

            <button
              type="button"
              onClick={reportHandler}
              className="text-qred font-semibold text-[13px]"
            >
              Report This Item
            </button>
          </div>

          <div
            data-aos="fade-up"
            className="social-share flex  items-center w-full"
          >
            <span className="text-qblack text-[13px] mr-[17px] inline-block">
              Share This
            </span>

            <div className="flex space-x-5 items-center">
              <span>
                <svg
                  width="10"
                  height="16"
                  viewBox="0 0 10 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3 16V9H0V6H3V4C3 1.3 4.7 0 7.1 0C8.3 0 9.2 0.1 9.5 0.1V2.9H7.8C6.5 2.9 6.2 3.5 6.2 4.4V6H10L9 9H6.3V16H3Z"
                    fill="#3E75B2"
                  />
                </svg>
              </span>
              <span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8 0C3.6 0 0 3.6 0 8C0 11.4 2.1 14.3 5.1 15.4C5 14.8 5 13.8 5.1 13.1C5.2 12.5 6 9.1 6 9.1C6 9.1 5.8 8.7 5.8 8C5.8 6.9 6.5 6 7.3 6C8 6 8.3 6.5 8.3 7.1C8.3 7.8 7.9 8.8 7.6 9.8C7.4 10.6 8 11.2 8.8 11.2C10.2 11.2 11.3 9.7 11.3 7.5C11.3 5.6 9.9 4.2 8 4.2C5.7 4.2 4.4 5.9 4.4 7.7C4.4 8.4 4.7 9.1 5 9.5C5 9.7 5 9.8 5 9.9C4.9 10.2 4.8 10.7 4.8 10.8C4.8 10.9 4.7 11 4.5 10.9C3.5 10.4 2.9 9 2.9 7.8C2.9 5.3 4.7 3 8.2 3C11 3 13.1 5 13.1 7.6C13.1 10.4 11.4 12.6 8.9 12.6C8.1 12.6 7.3 12.2 7.1 11.7C7.1 11.7 6.7 13.2 6.6 13.6C6.4 14.3 5.9 15.2 5.6 15.7C6.4 15.9 7.2 16 8 16C12.4 16 16 12.4 16 8C16 3.6 12.4 0 8 0Z"
                    fill="#E12828"
                  />
                </svg>
              </span>
              <span>
                <svg
                  width="18"
                  height="14"
                  viewBox="0 0 18 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M17.0722 1.60052C16.432 1.88505 15.7562 2.06289 15.0448 2.16959C15.7562 1.74278 16.3253 1.06701 16.5742 0.248969C15.8985 0.640206 15.1515 0.924742 14.3335 1.10258C13.6933 0.426804 12.7686 0 11.7727 0C9.85206 0 8.28711 1.56495 8.28711 3.48557C8.28711 3.7701 8.32268 4.01907 8.39382 4.26804C5.51289 4.12577 2.9165 2.73866 1.17371 0.604639C0.889175 1.13814 0.71134 1.70722 0.71134 2.34742C0.71134 3.5567 1.31598 4.62371 2.27629 5.26392C1.70722 5.22835 1.17371 5.08608 0.675773 4.83711V4.87268C0.675773 6.5799 1.88505 8.00258 3.48557 8.32268C3.20103 8.39382 2.88093 8.42938 2.56082 8.42938C2.34742 8.42938 2.09845 8.39382 1.88505 8.35825C2.34742 9.74536 3.62784 10.7768 5.15722 10.7768C3.94794 11.7015 2.45412 12.2706 0.818041 12.2706C0.533505 12.2706 0.248969 12.2706 0 12.2351C1.56495 13.2309 3.37887 13.8 5.37062 13.8C11.8082 13.8 15.3294 8.46495 15.3294 3.84124C15.3294 3.69897 15.3294 3.52113 15.3294 3.37887C16.0052 2.9165 16.6098 2.31186 17.0722 1.60052Z"
                    fill="#3FD1FF"
                  />
                </svg>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
