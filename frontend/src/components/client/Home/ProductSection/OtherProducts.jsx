import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ProductCard from "../../../ui/ProductCard";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import PropTypes from "prop-types";
import { useQuery } from "@tanstack/react-query";
import { ProductApi } from "../../../../services/productApi";
import ProductSkeleton from "../../../ui/ProductSkeleton";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
export default function OtherProducts({ icon, title, removeViewAll = false, categoryID = null, excludeSlugs = [], sort = null, limit = 7, notSamplePacks = null }) {
    const [hiddenSection, setHiddenSection] = useState(false);
    const { data, error, isLoading } = useQuery({
        queryKey: ["allProducts", { categoryID, excludeSlugs }], 
        queryFn: () => ProductApi.getAllProducts({ 
            type: 1,
            categoryID: categoryID,
            exclude: excludeSlugs,
            limit: limit,
            sort: sort,
            notSamplePacks: notSamplePacks,
        }),
        keepPreviousData: true,
    });

    useEffect(() => {
        if(isLoading) return;
        setHiddenSection(data.products.length > 0 ? false : true);
    }, [data, isLoading]);

    if(error) return <div>{error.message}</div>;

    return (
        !hiddenSection && (
            <section>
                <div className="flex justify-between items-center">
                    {isLoading ? (
                        <>
                            <Skeleton width={200} height={25} />
                            <Skeleton width={70} height={25} />
                        </>
                    ) : (
                        <>
                            <Link to={`/category/products?${categoryID ? `categoryID=${categoryID}` : `sort=${sort}`}`} className="uppercase font-semibold text-[17px] sm:text-[22px] title-link">
                                {icon} {title}
                            </Link>
                            {!removeViewAll && (
                                <Link
                                    to={`/category/products?${categoryID ? `categoryID=${categoryID}` : `sort=${sort}`}`}
                                    className="bg-gray-200 text-[13px] px-3 py-[6px] rounded-md text-gray-700 border border-gray-300"
                                >
                                    Xem tất cả
                                </Link>
                            )}
                        </>
                    )}
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
                    autoplay={{ delay: 2500, disableOnInteraction: false, pauseOnMouseEnter: true }}
                    loop={true}
                    speed={1500}
                    navigation={true}
                    className="mt-3 carousel-product custom-swiper"
                    lazy={true}
                >
                    {isLoading ? (
                        [...Array(5)].map((_, index) => (
                            <SwiperSlide key={index}>
                                <ProductSkeleton />
                            </SwiperSlide>
                        ))
                    ) : (
                        data.products.map((item, index) => (
                            <SwiperSlide key={index}>
                                <ProductCard data={item} />
                            </SwiperSlide>
                        ))
                    )}
                </Swiper>
            </section>
        )
    )
}

OtherProducts.propTypes = {
    icon: PropTypes.string,
    notSamplePacks: PropTypes.bool,
    title: PropTypes.string,
    removeViewAll: PropTypes.bool,
    categoryID: PropTypes.number,
    excludeSlugs: PropTypes.arrayOf(PropTypes.string),
    sort: PropTypes.number,
    limit: PropTypes.number,
};
