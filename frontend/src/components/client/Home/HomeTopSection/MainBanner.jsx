import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { bannerApi } from "../../../../services/bannerApi";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { IoImageOutline } from "react-icons/io5";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import no_image from "../../../../assets/images/no-image.png";
const URL_IMAGE = import.meta.env.VITE_URL_IMAGE;


const MainBanner = () => {
  const { data, error, isLoading } = useQuery({
    queryKey: ["bannerImage", { type: 1 }],
    queryFn: () => bannerApi.getAllBanner(
      { type: 1 }
    ),
    keepPreviousData: true,
  });

  if(error) return <div>{error.message}</div>

  return (
    <div className="relative aspect-[2/1] max-h-[340px] xl:min-w-[738px] xl:max-w-[738px] w-full" id="banner-main-container">
      <Swiper
        modules={[Autoplay, Navigation, Pagination]}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        loop={true}
        pagination={{ clickable: true }}
        navigation={true}
        className="w-full h-full rounded-xl shadow-sm"
      >
        {isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <SwiperSlide key={index}>
              <div className="flex justify-center items-center w-full h-full opacity-40 min-h-[200px] bg-gray-300">
                <IoImageOutline className="md:text-8xl text-5xl" />
              </div>
            </SwiperSlide>
          ))
        ) : (
          data?.products?.length === 0 ? (
            <SwiperSlide>
              <div className="flex justify-center items-center w-full h-full opacity-40 min-h-[200px] border border-gray-100">
                <img src={no_image} alt="No image" className="w-28 pointer-events-none" />
              </div>
            </SwiperSlide>
          ) :
          data?.products?.map((banner, index) => (
            <SwiperSlide key={index}>
              <Link to={banner.link} className="w-full h-full">
                <img src={`${URL_IMAGE}/${banner.image}`} loading="eager" alt={`Banner ${index + 1}`} className="w-full h-full object-cover rounded-sm" />
              </Link>
            </SwiperSlide>
          )
        ))}
      </Swiper>
    </div>
  );
};

export default MainBanner;
