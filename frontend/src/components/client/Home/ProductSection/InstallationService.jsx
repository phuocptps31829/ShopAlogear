import ProductServiceCard from "../../../ui/ProductServiceCard";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import PropTypes from "prop-types";
import { useQuery } from "@tanstack/react-query";
import { ProductApi } from "../../../../services/productApi";
import ProductSkeleton from "../../../ui/ProductSkeleton";
import struggle from "../../../../assets/images/struggle.gif";
export default function InstallationService({ title, categoryID, excludeSlugs = [] }) {
  const { data, error, isLoading } = useQuery({
    queryKey: ["allProducts", { categoryID: categoryID, excludeSlugs }],
    queryFn: () => ProductApi.getAllProducts({ categoryID: categoryID, exclude: excludeSlugs, all: 1 }),
    keepPreviousData: true,
  });

  if (error) return <div>{error.message}</div>;

  return (
    <section id="service-section">
      <div className="flex justify-between items-center">

        <h1 className="uppercase font-semibold text-[17px] flex items-center sm:text-[22px] border border-gray-400 px-3 py-[2px] rounded-full">
          <img src={struggle} alt="" className="mr-1 w-10" />{title}
        </h1>
      </div>
      <Swiper
        modules={[Autoplay, Navigation, Pagination]}
        spaceBetween={10}
        slidesPerView={2}
        slidesPerGroup={1}
        breakpoints={{
          300: { slidesPerView: 2 },
          640: { slidesPerView: 3 },
          1024: { slidesPerView: 5 },
        }}
        autoplay={{
          delay: 2500,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        loop={true}
        navigation={true}
        speed={1500}
        className="mt-3 carousel-product custom-swiper"
        lazy={true}
      >
        {isLoading
          ? [...Array(5)].map((_, index) => (
              <SwiperSlide key={index}>
                <ProductSkeleton typeProduct={2} />
              </SwiperSlide>
            ))
          : data.products.map((item, index) => (
              <SwiperSlide key={index}>
                <ProductServiceCard data={item} />
              </SwiperSlide>
            ))}
      </Swiper>
    </section>
  );
}

InstallationService.propTypes = {
  title: PropTypes.string,
  categoryID: PropTypes.number,
  excludeSlugs: PropTypes.arrayOf(PropTypes.string),
  limit: PropTypes.number,
};
