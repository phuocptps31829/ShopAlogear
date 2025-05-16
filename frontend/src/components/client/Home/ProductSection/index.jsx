import { useQuery } from "@tanstack/react-query";
import OtherProducts from "./OtherProducts";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import InstallationService from "./InstallationService";
import Achievements from "./Achievements"; 
import FlashSaleSection from "./FlashSale";
import { categoryApi } from "../../../../services/categoryApi";
import ProductSkeleton from "../../../ui/ProductSkeleton";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function ProductSection() {
    const fetchCategories = (type) => categoryApi.getAllCategories({ type, all: 1 });

    const { data: categoriesType1, isLoading: isLoadingCategoriesType1 } = useQuery({
        queryKey: ["categories", 1],
        queryFn: () => fetchCategories(1),
        keepPreviousData: true,
    });

    const { data: categoriesType2, isLoading: isLoadingCategoriesType2 } = useQuery({
        queryKey: ["categories", 2],
        queryFn: () => fetchCategories(2),
        keepPreviousData: true,
    });

    const renderSkeletonSection = (count) => (
        Array.from({ length: count }).map((_, index) => (
            <section key={index}>
                <div className="flex justify-between items-center">
                    <Skeleton width={200} height={25} />
                    <Skeleton width={70} height={25} />
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
                    className="mt-3 carousel-product"
                >
                    {[...Array(6)].map((_, idx) => (
                        <SwiperSlide key={idx}>
                            <ProductSkeleton />
                        </SwiperSlide>
                    ))}
                </Swiper>
            </section>
        ))
    );

    const renderCategorySection = (categories, Component) =>
        categories
            ?.filter((item) => item.display == 1)
            .map((item) => <Component key={item.id} icon={item.icon} title={item.name} categoryID={item.id} />);

    return (
        <div className="mx-auto max-w-screen-xl px-3 md:px-5 py-4 space-y-10">
            <FlashSaleSection />
            <OtherProducts icon="⚡" title="Sản phẩm nổi bật" sort={9} notSamplePacks={1} />
            {isLoadingCategoriesType1 ? renderSkeletonSection(3) : renderCategorySection(categoriesType1, OtherProducts)}
            {isLoadingCategoriesType2 ? renderSkeletonSection(2) : renderCategorySection(categoriesType2, InstallationService)}
            <Achievements title="DỰ ÁN & KHÁCH HÀNG" />
        </div>
    )
}

