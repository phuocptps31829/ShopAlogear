import { Helmet } from "react-helmet-async";
import { useEffect, useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { addToCart, toggleAllChecked } from "../../../redux/cartSlice";
import { Link, useNavigate } from "react-router-dom";
import Zoom from "react-medium-image-zoom";
import { FaCartArrowDown } from "react-icons/fa";
import { BsFillChatLeftDotsFill } from "react-icons/bs";
import "react-medium-image-zoom/dist/styles.css";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { FaPlus, FaMinus, FaCheck } from "react-icons/fa6";
import "swiper/css";
import "swiper/css/navigation";
import PropTypes from "prop-types";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { formatVND } from "../../../utils/formatPrice";
import toast from "react-hot-toast";
import { checkImageUrl } from "../../../utils/checkImageUrl";
const URL_DOMAIN = import.meta.env.VITE_URL_DOMAIN;

const TopInfo = ({ data, isLoading }) => {
  const navigate = useNavigate();
  const [activeColorName, setActiveColorName] = useState(null);
  const [activeColorId, setActiveColorId] = useState(null);
  const [activeIndexImg, setActiveIndexImage] = useState(0);
  const [amount, setAmount] = useState(1);
  const [typeProduct, setTypeProduct] = useState(null);
  const dispatch = useDispatch();
  const swiperRef = useRef(null);
  const swiperThumbnailRef = useRef(null);

  const handleAddClick = ({id, colorName, colorID}) => {
    const newItem = {
      id,
      checked: true,
      colorName: colorName,
      colorIdActive: colorID ? Number(colorID) : null,
      quantity: amount,
    }
    dispatch(addToCart(newItem));
    toast.dismiss();
    toast.success("Đã thêm vào giỏ hàng");
  }

  const handleBuyNow = ({ id, colorName, colorID }) => {
    const newItem = {
      id,
      checked: true,
      colorName: colorName,
      colorIdActive: colorID ? Number(colorID) : null,
      quantity: amount,
    };
    dispatch(toggleAllChecked({ isChecked: false }));
    dispatch(addToCart(newItem));
    navigate("/checkout");
  }

  useEffect(() => {
    if (isLoading || !data) return;
    setActiveIndexImage(0);
    if (data.colors.length > 0) {
      setActiveColorId(data.colors[0].id);
      setActiveColorName(data.colors[0].name);
    }
    setTypeProduct(data.type);
    if (swiperRef.current) {
      swiperRef.current.slideTo(0); 
    }
  }, [data, isLoading]);

  const handleSlideChange = (swiper) => {
    setActiveIndexImage(swiper.activeIndex);
  };

  const handleThumbnailClick = (index) => {
    setActiveIndexImage(index);
    if (swiperRef.current) {
      swiperRef.current.slideTo(index);
    }
    if (swiperThumbnailRef.current) {
      swiperThumbnailRef.current.slideTo(index);
    }
  };

  const handleColorChange = (colorId, colorName) => {
    setActiveColorId(colorId);
    setActiveColorName(colorName);
    const newImageIndex = data.images.findIndex(
      (image) => image.colorID === colorId
    );
    if (newImageIndex !== -1) {
      setActiveIndexImage(newImageIndex);
      if (swiperRef.current) {
        swiperRef.current.slideTo(newImageIndex);
      }
      if (swiperThumbnailRef.current) {
        swiperThumbnailRef.current.slideTo(newImageIndex);
      }
    }
  };
 
  return (
    <>
      <Helmet>
        <title>{data?.name || "AloGear - Nhạc cụ âm nhạc cao cấp"}</title>
        <meta
          name="description"
          content="Khám phá bộ sưu tập nhạc cụ cao cấp tại AloGear. Chất lượng tuyệt hảo, âm thanh đỉnh cao dành cho người yêu nhạc."
        />
        <link rel="canonical" href={`${URL_DOMAIN}/product/${data?.slug}`} />
      </Helmet>
      
      <div className="flex flex-col justify-between lg:flex-row gap-4 sm:gap-14 lg:items-center">
        <div className="flex flex-col gap-3 lg:w-2/4">
          {isLoading ? (
            <div className="w-full h-full aspect-[1/1] sm:min-h-[450px] object-cover rounded-xl">
              <Skeleton width="100%" height="100%" />
            </div>
          ) : (
            <Swiper
              modules={[Navigation]}
              navigation={true}
              slidesPerView={1}
              autoplay={{ delay: 9000, disableOnInteraction: false, pauseOnMouseEnter: true }}
              loop={true}
              speed={1200}
              onSlideChange={handleSlideChange}
              onSwiper={(swiper) => (swiperRef.current = swiper)}
              initialSlide={activeIndexImg}
              className="w-full aspect-[1/1] rounded-xl custom-swiper"
            >
              {data.images.map((image, index) => (
                <SwiperSlide key={index}>
                  <Zoom zoomMargin={40} transitionDuration={500}>
                    <img
                      src={checkImageUrl(image.image)}
                      alt=""
                      className="w-full h-full aspect-[1/1] object-contain rounded-xl"
                    />
                  </Zoom>
                </SwiperSlide>
              ))}
            </Swiper>
          )}
          <div className="relative w-full">
            <Swiper
              modules={[Navigation]}
              navigation={true}
              slidesPerView={4}
              spaceBetween={10}
              breakpoints={{
                640: { slidesPerView: 6 },
                320: { slidesPerView: 4 },
              }}
              className="w-full"
              onSwiper={(swiper) => (swiperThumbnailRef.current = swiper)}
            >
              {isLoading
                ? Array.from({ length: 5 }).map((_, index) => (
                    <SwiperSlide
                      key={index}
                      className="w-full aspect-[1/1] rounded-md cursor-pointer object-contain"
                    >
                      <Skeleton width="100%" height="100%" />
                    </SwiperSlide>
                  ))
                : data.images.length > 0 &&
                  data.images.map((image, index) => (
                    <SwiperSlide
                      key={index}
                      className={`w-full aspect-[1/1] rounded-md cursor-pointer object-contain ${
                        activeIndexImg === index
                          ? "border-gray-900 border-2"
                          : "border-black border-1"
                      }`}
                    >
                      <img
                        src={checkImageUrl(image.image)}
                        alt=""
                        className={`${
                          activeIndexImg === index ? "" : "opacity-60"
                        } w-full aspect-[1/1] rounded-md cursor-pointer object-contain`}
                        onClick={() => handleThumbnailClick(index)} // Đồng bộ khi click thumbnail
                      />
                    </SwiperSlide>
                  ))}
            </Swiper>
          </div>
        </div>
        <div className="flex flex-col lg:w-2/4 self-start w-full">
          <span className=" text-gray-600 font-semibold block mb-1">
            {isLoading ? <Skeleton width={150} /> : data.categories[0].name}
          </span>
          <h1 className="md:text-3xl text-xl sm:text-2xl font-bold mb-4">
            {isLoading ? <Skeleton width={300} /> : data.name}
          </h1>
          {typeProduct != 4 ? (
            <>
              {isLoading ? (
                <Skeleton count={5} height={25} className="mb-2" />
              ) : (
                <div className="sm:space-y-3.5 space-y-2 text-[14px] mb-3" dangerouslySetInnerHTML={{ __html: data.description }}>
                </div>
              )} 
            </>
          ) : (
            <div className="iframe-detail-product mb-2" dangerouslySetInnerHTML={{__html: data?.iframe || ""}}></div>
          )}
          {(typeProduct != 2) && (
            <h6 className="text-2xl font-medium flex items-baseline mb-3">
              <span className="text-[25px] font-bold mr-3 text-red-500">
                {isLoading ? (
                  <Skeleton width={150} />
                ) : (
                  formatVND(data.discount)
                )}
              </span>
              {data?.discount < data?.price && (
                <>
                  <span className="line-through text-gray-500 text-[16px]">
                    {isLoading ? <Skeleton width={75} /> : formatVND(data.price)}
                  </span>
                  <span className="text-[11px] bg-red-500 opacity-80 text-white px-1 py-[2px] ml-2 rounded-md drop-shadow-sm whitespace-nowrap">
                    -{" "}
                    {isLoading
                      ? 0
                      : Math.ceil(
                          ((data.price - data.discount) / data.price) * 100
                        )}
                    %
                  </span>
                </>
              )}
            </h6>
          )}
          <div className="flex flex-col">
            {isLoading ? (
              <>
                <Skeleton width={75} height={25} className="mb-2" />
                <div className="flex gap-3 flex-wrap">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={index} width={85} height={35} />
                  ))}
                </div>
              </>
            ) : (
              (typeProduct != 4 &&
              data.colors.length > 0) && (
                <div className="mb-3">
                  <h2 className="mb-2">Màu sắc:</h2>
                  <div className="flex gap-3 flex-wrap">
                    {data.colors.map((color, index) => (
                      <button
                        key={index}
                        className={`${
                          activeColorId == color.id
                            ? "border-gray-500"
                            : "border-gray-300"
                        } relative overflow-hidden cursor-pointer flex items-center border rounded-sm py-2 px-4`}
                        onClick={() => handleColorChange(color.id, color.name)}
                      >
                        {activeColorId == color.id && (
                          <div className="absolute right-0 bottom-0 bg-gray-500 text-white p-[3px] rounded-tl-sm">
                            <FaCheck size={7} />
                          </div>
                        )}
                        <span
                          style={{ backgroundColor: color.code }}
                          className="w-5 h-5 rounded-full block shadow-btn"
                        ></span>
                        <span className="ml-2 text-[14px]">{color.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )
            )}
            {isLoading ? (
              <>
                <Skeleton width={75} height={25} className="mb-2 mt-3" />
                <Skeleton width={140} height={35} />
              </>
            ) : (
              typeProduct == 1 && (
                <div className="mb-3">
                  <h2 className="mb-2">Số lượng:</h2>
                  <div className="flex flex-row items-center">
                    <button
                      className="bg-gray-200 py-3 px-3 rounded-lg text-gray-800 text-3xl cursor-pointer"
                      onClick={() => {
                        if (amount > 1) setAmount((prev) => prev - 1);
                      }}
                    >
                      <FaMinus size={16} />
                    </button>
                    <div className="px-6 rounded-lg">{amount}</div>
                    <button
                      className="bg-gray-200 py-3 px-3 rounded-lg text-gray-800 text-3xl cursor-pointer"
                      onClick={() => setAmount((prev) => prev + 1)}
                    >
                      <FaPlus size={16} />
                    </button>
                  </div>
                </div>
              ))}
            {typeProduct == 2 && (
              <div className="text-md h-[46px]  my-2 text-red-500 mt-6 italic rounded-md flex items-center">
                <span className="mr-2 text-xl">*</span>Sản phẩm không có giá cố định, vui lòng liên hệ để trao đổi giá.
              </div>
            )}
            {isLoading ? (
                <Skeleton height={50} className="mb-2 w-full mt-3" />
            ) : (
            (!data?.quantity || data?.quantity == 0) && typeProduct != 2 ? (
              <div className="flex items-center gap-3 mt-2 h-12">
                <div
                  className="flex justify-center h-full items-center border-2 border-red-400 text-red-500 grow font-semibold rounded-2xl cursor-pointer"
                >
                  Sản phẩm đã hết hàng 
                </div>
                <Link
                  to="https://zalo.me/0961779795"
                  target="_blank"
                  className="relative h-full group/tooltip flex justify-center items-center border-2 text-blue-500 border-blue-400 text-center font-semibold px-6 rounded-2xl cursor-pointer"
                >
                  <BsFillChatLeftDotsFill size={20} />
                  <span className="invisible group-hover/tooltip:visible absolute -top-10 left-1/2 -translate-x-1/2 bg-[#000000cd] text-white text-xs rounded px-2 py-2 whitespace-nowrap">
                    Liên hệ
                  </span>
                </Link>
              </div>  
            ) : (
              <div className="flex gap-3 flex-row mt-4 h-[44px] max-w-[592px]">
                {(typeProduct != 2) ? (
                  <>
                    <button
                      onClick={() => handleBuyNow({ id: data.id, colorName: activeColorName, colorID: activeColorId })}
                      className="flex justify-center items-center bg-blue-500 hover:bg-blue-700 grow text-white font-semibold rounded-2xl h-full cursor-pointer"
                    >
                      Mua ngay
                    </button>
                    <button 
                      className="relative group/tooltip flex justify-center items-center border-2 text-gray-500 border-gray-400 px-6 font-semibold rounded-2xl h-full cursor-pointer"
                      onClick={() => handleAddClick({ id: data.id, colorName: activeColorName, colorID: activeColorId })}
                    >
                      <FaCartArrowDown size={20} />
                      <span className="invisible group-hover/tooltip:visible absolute -top-10 left-1/2 -translate-x-1/2 bg-[#000000cd] text-white text-xs rounded px-2 py-2 whitespace-nowrap">
                        Thêm vào giỏ
                      </span>
                    </button>
                    <Link
                      to="https://zalo.me/0961779795"
                      target="_blank"
                      className="relative group/tooltip flex justify-center items-center border-2 text-blue-500 border-blue-400 text-center font-semibold px-6 rounded-2xl h-full cursor-pointer"
                    >
                      <BsFillChatLeftDotsFill size={20} />
                      <span className="invisible group-hover/tooltip:visible absolute -top-10 left-1/2 -translate-x-1/2 bg-[#000000cd] text-white text-xs rounded px-2 py-2 whitespace-nowrap">
                        Liên hệ
                      </span>
                    </Link>
                  </>
                ) : (
                    <Link
                      to="https://zalo.me/0961779795"
                      target="_blank"
                      className="w-full mt-3 relative flex justify-center items-center border-2 text-white bg-blue-500 text-center font-semibold px-6 rounded-md h-full cursor-pointer"
                    >
                      Liên hệ để mua hàng
                    </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      {typeProduct != 4 && (
        <div className="flex flex-col mt-10 bg-white shadow-sm rounded-lg overflow-hidden">
          <h2 className="p-3 border-b border-gray-200 text-xl sm:text-2xl font-semibold">
            Mô tả chi tiết
          </h2>
          {isLoading ? (
            <div className="p-3">
              <Skeleton count={12} height={20} className="mb-2" />
            </div>
          ) : (
            <div className="p-3 w-full flex">
              <div dangerouslySetInnerHTML={{ __html: data?.detail }} />
            </div>
          )}
        </div>
      )}
    </>
  );
};

TopInfo.propTypes = {
  data: PropTypes.object,
  isLoading: PropTypes.bool,
};

export default TopInfo;
