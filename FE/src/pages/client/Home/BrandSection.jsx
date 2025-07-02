export default function BrandSection({ className, sectionTitle, type }) {
  return (
    <div data-aos="fade-up" className={`w-full ${className || ""}`}>
      <div className="container-x mx-auto">
        {type !== 3 && (
          <div className=" section-title flex justify-between items-center mb-5">
            <div>
              <h1 className="sm:text-3xl text-xl font-600 text-qblacktext">
                {sectionTitle}
              </h1>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-5 sm:grid-cols-4 grid-cols-2">
          <div className="item">
            <div className="w-full h-[130px] bg-white border border-primarygray flex justify-center items-center">
              <img
                src={`https://donghomytan.vn/wp-content/uploads/2020/08/Zenith-logo.jpg`}
                alt="logo"
              />
            </div>
          </div>
          <div className="item">
            <div className="w-full h-[130px] bg-white border border-primarygray flex justify-center items-center">
              <img
                src={`https://galle.vn/upload_images/images/news/2021/09/01/3-logo-rolex.jpg`}
                alt="logo"
              />
            </div>
          </div>
          <div className="item">
            <div className="w-full h-[130px] bg-white border border-primarygray flex justify-center items-center">
              <img
                src={`https://galle.vn/upload_images/images/news/2021/09/01/4-logo-breitling.jpg`}
                alt="logo"
              />
            </div>
          </div>
          <div className="item">
            <div className="w-full h-[130px] bg-white border border-primarygray flex justify-center items-center">
              <img
                src={`https://galle.vn/upload_images/images/news/2021/09/01/5-logo-longines.jpg`}
                alt="logo"
              />
            </div>
          </div>
          {/* <div className="item">
            <div className="w-full h-[130px] bg-white border border-primarygray flex justify-center items-center">
              <img
                src={``}
                alt="logo"
              />
            </div>
          </div> */}
          <div className="item">
            <div className="w-full h-[130px] bg-white border border-primarygray flex justify-center items-center">
              <img
                src={`https://galle.vn/upload_images/images/news/2021/09/01/7-logo-ulysse-nardin.jpg`}
                alt="logo"
              />
            </div>
          </div>
          <div className="item">
            <div className="w-full h-[130px] bg-white border border-primarygray flex justify-center items-center">
              <img
                src={`https://galle.vn/upload_images/images/news/2021/09/01/11-logo-frederique-constant.jpg`}
                alt="logo"
              />
            </div>
          </div>
          <div className="item">
            <div className="w-full h-[130px] bg-white border border-primarygray flex justify-center items-center">
              <img
                src={`https://galle.vn/upload_images/images/news/2021/09/01/9-logo-breguet.jpg`}
                alt="logo"
              />
            </div>
          </div>
          {/* <div className="item">
            <div className="w-full h-[130px] bg-white border border-primarygray flex justify-center items-center">
              <img
                src={`https://donghomytan.vn/wp-content/uploads/2020/08/Omega-logo.jpg`}
                alt="logo"
              />
            </div>
          </div> */}
          <div className="item">
            <div className="w-full h-[130px] bg-white border border-primarygray flex justify-center items-center">
              <img
                src={`https://benhviendongho.vn/wp-content/uploads/2024/10/logo-hang-dong-ho-orient.jpg`}
                alt="logo"
              />
            </div>
          </div>
          <div className="item">
            <div className="w-full h-[130px] bg-white border border-primarygray flex justify-center items-center">
              <img
                src={`https://benhviendongho.vn/wp-content/uploads/2024/10/logo-hang-dong-ho-citizen.jpg`}
                alt="logo"
              />
            </div>
          </div>
          <div className="item">
            <div className="w-full h-[130px] bg-white border border-primarygray flex justify-center items-center">
              <img
                src={`https://mediaelly.sgp1.digitaloceanspaces.com/uploads/2023/02/27143704/top-nhung-thuong-hieu-dong-ho-so-huu-logo-dep-nhat-the-gioi.5.jpg`}
                alt="logo"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
