import { Helmet } from "react-helmet-async";
import { addToCart, toggleAllChecked } from "../../../redux/cartSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import PopupProducts from "../../ui/PopupProducts";
import { useEffect, useState, useMemo, useRef } from "react";
import PropTypes from "prop-types";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { formatVND } from "../../../utils/formatPrice";
import { checkImageUrl } from "../../../utils/checkImageUrl";
import Zoom from "react-medium-image-zoom";
import toast from "react-hot-toast";
const URL_DOMAIN = import.meta.env.VITE_URL_DOMAIN;


const TopInfo = ({ data, isLoading }) => {
  const [dataPopup, setDataPopup] = useState({
    title: "",
    categoryID: null,
  });
  const [selectedOptions, setSelectedOptions] = useState({});
  const [isPopupOpenProducts, setIsPopupOpenProducts] = useState(false);
  const [activeIndexImg, setActiveIndexImage] = useState(0);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const swiperRef = useRef(null); 

  const totalPrice = useMemo(() => {
    return Object.values(selectedOptions).reduce(
      (total, item) => total + item.discount * (item.quantity || 1),
      0
    );
  }, [selectedOptions]);

  const closePopupProducts = () => {
    setIsPopupOpenProducts(false);
  };

  const openPopupProducts = ({ title, categoryID }) => {
    setIsPopupOpenProducts(true);
    setDataPopup({
      title,
      categoryID,
    });
  };

  const handleChooseProduct = (product, categoryID) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [categoryID]: { ...product, quantity: 1 },
    }));
    setIsPopupOpenProducts(false);
  };

  const handleQuantityChange = (categoryID, newQuantity) => {
    if (newQuantity < 1) return;
    setSelectedOptions((prev) => ({
      ...prev,
      [categoryID]: {
        ...prev[categoryID],
        quantity: newQuantity,
      },
    }));
  };

  const handleRemoveProduct = (categoryID) => {
    setSelectedOptions((prev) => {
      const newOptions = { ...prev };
      delete newOptions[categoryID];
      return newOptions;
    });
  };

  const handleCheckout = () => {
    if (Object.keys(selectedOptions).length === 0) {
      toast.dismiss();
      toast.error("Vui lòng chọn sản phẩm!");
      return;
    }
    dispatch(toggleAllChecked({ isChecked: false }));
    Object.values(selectedOptions).forEach((product) => {
      dispatch(
        addToCart({
          id: product.id,
          quantity: product.quantity,
          colorName: product.colorName,
          colorIdActive: product.colorID,
          checked: true,
        })
      );
    });
    navigate("/checkout");
  };

  useEffect(() => {
    if (isLoading || !data) return;
    setSelectedOptions({});
    setActiveIndexImage(0);
    if (swiperRef.current) {
      swiperRef.current.slideTo(0); // Đặt slide về đầu khi data thay đổi
    }
  }, [data, isLoading]);

  const handleSlideChange = (swiper) => {
    setActiveIndexImage(swiper.activeIndex);
  };

  const handleThumbnailClick = (index) => {
    setActiveIndexImage(index);
    if (swiperRef.current) {
      swiperRef.current.slideTo(index); // Chuyển slide chính khi click thumbnail
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
        <link rel="canonical" href={`${URL_DOMAIN}/services/${data?.slug}`} />
      </Helmet>
      <div className="flex flex-col justify-between lg:flex-row gap-4 sm:gap-14 lg:items-center">
        <div className="flex flex-col gap-3 lg:w-2/4">
          {isLoading ? (
            <div className="w-full h-full aspect-[1/1] sm:min-h-[450px] object-cover rounded-xl">
              <Skeleton width="100%" height="100%" />
            </div>
          ) : (
            <Swiper
              slidesPerView={1}
              onSlideChange={handleSlideChange}
              onSwiper={(swiper) => (swiperRef.current = swiper)}
              initialSlide={activeIndexImg}
              className="w-full aspect-[1/1]"
            >
              {data?.images?.map((image, index) => (
                <SwiperSlide key={index}>
                  <Zoom zoomMargin={50} transitionDuration={500}>
                    <img
                      src={checkImageUrl(image.image)}
                      alt=""
                      className="w-full h-full aspect-[1/1] sm:min-h-[450px] object-cover rounded-xl"
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
            >
              {isLoading
                ? Array.from({ length: 5 }).map((_, index) => (
                    <SwiperSlide
                      key={index}
                      className="w-full aspect-[1/1] rounded-md cursor-pointer object-cover"
                    >
                      <Skeleton width="100%" height="100%" />
                    </SwiperSlide>
                  ))
                : data?.images?.length > 0 &&
                  data.images.map((image, index) => (
                    <SwiperSlide
                      key={index}
                      className={`w-full aspect-[1/1] rounded-md cursor-pointer object-cover ${
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
                        } w-full aspect-[1/1] rounded-md cursor-pointer object-cover`}
                        onClick={() => handleThumbnailClick(index)} // Chuyển slide khi click
                      />
                    </SwiperSlide>
                  ))}
            </Swiper>
          </div>
        </div>
        <div className="flex flex-col lg:w-2/4 self-start w-full">
          <span className="text-gray-600 font-semibold block mb-1">
            {isLoading ? <Skeleton width={150} /> : data?.categories?.[0]?.name}
          </span>
          <h1 className="md:text-3xl text-xl sm:text-2xl font-bold mb-4">
            {isLoading ? <Skeleton width={300} /> : data?.name}
          </h1>
          <div className="space-y-2.5 p-2 sm:text-[16px] text-[14px] mb-4 max-h-[450px] overflow-y-auto custom-scrollbar">
            {isLoading
              ? Array.from({ length: 7 }).map((_, index) => (
                  <div key={index} className="flex items-center w-full">
                    <Skeleton
                      height={40}
                      containerClassName="w-full max-w-[500px]"
                    />
                  </div>
                ))
              : data?.options?.map((item, index) => (
                  <div
                    key={index}
                    className="p-3 w-full rounded-md bg-gray-50 max-w-[500px] flex justify-between items-center border border-gray-200 hover:transform hover:scale-101 transition-transform"
                  >
                    {selectedOptions[item.categoryID] ? (
                      <div className="w-full flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <img
                            src={checkImageUrl(selectedOptions[item.categoryID].image)}
                            alt=""
                            className="w-12 aspect-[1/1] object-contain"
                          />
                          <span className="font-semibold max-w-[200px] line-clamp-2 text-[14px]">
                            {selectedOptions[item.categoryID].name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            disabled={selectedOptions[item.categoryID].quantity === 1}
                            className={`w-8 aspect-[1/1] bg-gray-200 rounded hover:bg-gray-300 ${
                              selectedOptions[item.categoryID].quantity === 1
                                ? "opacity-50 cursor-default"
                                : "cursor-pointer"
                            }`}
                            onClick={() =>
                              handleQuantityChange(
                                item.categoryID,
                                selectedOptions[item.categoryID].quantity - 1
                              )
                            }
                          >
                            -
                          </button>
                          <span className="w-8 font-semibold text-center flex justify-center items-center text-sm">
                            {selectedOptions[item.categoryID].quantity}
                          </span>
                          <button
                            className="w-8 aspect-[1/1] cursor-pointer bg-gray-200 rounded hover:bg-gray-300"
                            onClick={() =>
                              handleQuantityChange(
                                item.categoryID,
                                selectedOptions[item.categoryID].quantity + 1
                              )
                            }
                          >
                            +
                          </button>
                          <button
                            className="text-red-500 ml-2 hover:text-red-600 font-bold text-sm cursor-pointer"
                            onClick={() => handleRemoveProduct(item.categoryID)}
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center w-full">
                        <div className="flex items-center sm:text-sm text-[13px]">
                          <span className="mr-2 text-lg">{item?.image}</span>
                          <span className="font-semibold max-w-[300px] line-clamp-1">
                            {item.name}
                          </span>
                        </div>
                        {item.categoryID && (
                          <button
                            className="sm:text-sm text-[12px] font-medium bg-red-600 sm:px-4 px-2 py-1 text-white rounded-full cursor-pointer hover:bg-red-700"
                            onClick={() =>
                              openPopupProducts({
                                title: item.name,
                                categoryID: item.categoryID,
                              })
                            }
                          >
                            Chọn
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
          </div>
          <div className="sm:max-w-[507px] max-w-[500px]">
            <div className="max-w-[390px] flex text-[15px] font-semibold py-2 bg-gray-50 border border-gray-300 rounded-full ml-auto px-3 items-center justify-between w-full">
              Chi phí ước tính:
              <span className="text-red-500 font-semibold">
                {formatVND(totalPrice)}
              </span>
            </div>
          </div>
          <div className="flex flex-col mt-2">
            <div className="flex gap-3 flex-row mt-2 h-[44px] sm:max-w-[507px] max-w-[500px] justify-end">
              <button
                onClick={handleCheckout}
                className="max-w-[300px] relative group/tooltip sm:text-md text-[15px] grow flex justify-center items-center border-2 text-white bg-blue-500 hover:bg-blue-600 text-center font-semibold px-6 rounded-3xl h-full cursor-pointer"
              >
                Thanh toán ngay
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col sm:mt-10 mt-6 bg-white shadow-sm rounded-lg overflow-hidden">
        <h2 className="p-3 border-b border-gray-200 text-xl sm:text-2xl font-semibold">
          Mô tả chi tiết
        </h2>
        {isLoading ? (
          <div className="p-3">
            <Skeleton count={12} height={20} className="mb-2" />
          </div>
        ) : (
          <div className="p-3">
            <div dangerouslySetInnerHTML={{ __html: data?.detail }} />
          </div>
        )}
      </div>
      {isPopupOpenProducts && (
        <PopupProducts
          closePopup={closePopupProducts}
          dataPopup={dataPopup}
          handleChooseProduct={(product) =>
            handleChooseProduct(product, dataPopup.categoryID)
          }
        />
      )}
    </>
  );
};

TopInfo.propTypes = {
  data: PropTypes.object,
  isLoading: PropTypes.bool,
};

export default TopInfo;
