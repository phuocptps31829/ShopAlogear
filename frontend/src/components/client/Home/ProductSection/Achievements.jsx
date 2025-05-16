import ProductAchievementsCard from "../../../ui/ProductAchievements";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import PropTypes from "prop-types";
import { useQuery } from "@tanstack/react-query";
import { CooperatesApi } from "../../../../services/cooperatesApi";
import ProductSkeleton from "../../../ui/ProductSkeleton";

export default function Achivements({ title }) {
  const { data, error, isLoading } = useQuery({
    queryKey: "allCooperates",
    queryFn: () => CooperatesApi.getAllCooperates(),
    keepPreviousData: true,
  });

  if (error) return <div>{error.message}</div>;

  return (
    <section className="customer-achievements">
      <div className="flex justify-between items-center">
        <h1 className="uppercase font-semibold text-[17px] sm:text-[22px]">
          {title}
        </h1>
      </div>
      <Swiper
        modules={[Autoplay]}
        spaceBetween={10}
        slidesPerView={2}
        breakpoints={{
          300: { slidesPerView: 2 },
          640: { slidesPerView: 3 },
          1024: { slidesPerView: 4 },
        }}
        autoplay={{
          delay: 0,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        speed={3000}
        loop={true}
        className="mt-3 carousel-product"
        lazy={true}
      >
        {isLoading
          ? [...Array(5)].map((_, index) => (
              <SwiperSlide key={index}>
                <ProductSkeleton typeProduct={3} />
              </SwiperSlide>
            ))
          : data.products.slice(0, data.totalRecords / 2).map((item, index) => (
              <SwiperSlide key={index}>
                <ProductAchievementsCard data={item} />
              </SwiperSlide>
            ))}
      </Swiper>
      <Swiper
        modules={[Autoplay]}
        spaceBetween={10}
        slidesPerView={2}
        breakpoints={{
          300: { slidesPerView: 2 },
          640: { slidesPerView: 3 },
          1024: { slidesPerView: 4 },
        }}
        autoplay={{
          delay: 0,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
          reverseDirection: true,
        }}
        speed={3000}
        loop={true}
        className="carousel-product custom-swiper"
      >
        {isLoading
          ? [...Array(5)].map((_, index) => (
              <SwiperSlide key={index}>
                <ProductSkeleton typeProduct={3} />
              </SwiperSlide>
            ))
          : data.products
              .slice(data.totalRecords / 2, data.totalRecords)
              .map((item, index) => (
                <SwiperSlide key={index}>
                  <ProductAchievementsCard data={item} />
                </SwiperSlide>
              ))}
      </Swiper>
    </section>
  );
}

Achivements.propTypes = {
  title: PropTypes.string,
};
