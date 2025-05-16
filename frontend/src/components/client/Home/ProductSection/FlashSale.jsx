import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ProductApi } from "../../../../services/productApi";
import ProductCard from "../../../ui/ProductCard";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import icon_fs from "../../../../assets/images/icon-fs.png";
import ProductSkeleton from "../../../ui/ProductSkeleton";
 
export default function FlashSaleSection() {
    const [statusFlashSale, setStatusFlashSale] = useState(0);
    const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
    const { data, isLoading } = useQuery({
        queryKey: ["flashSaleProducts"],
        queryFn: ProductApi.getFlashSaleProducts,
        keepPreviousData: true,
    });

    useEffect(() => {
        if (!data?.endTime) return;

        let totalSeconds = data.endTime;

        const interval = setInterval(() => {
            if (totalSeconds > 0) {
                totalSeconds -= 1;
                setTimeLeft({
                    hours: Math.floor(totalSeconds / 3600),
                    minutes: Math.floor((totalSeconds % 3600) / 60),
                    seconds: totalSeconds % 60,
                });
            } else {
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [data?.endTime]);

    useEffect(() => {
        if(isLoading) return;
        setStatusFlashSale(data?.status ? 1 : 0);
    }, [data, isLoading]);

    return (
        statusFlashSale === 1 && (
            <section className="bg-gray-700 px-2 rounded-xl relative">
                <div className="flex justify-between items-center sm:flex-row flex-col">
                    <div className="sm:w-[40%] sm:min-w-[450px] self-center">
                        <img src={icon_fs} alt="" className="w-full" />
                    </div>
                    <div className=" text-white uppercase font-medium sm:mr-6">
                        <span className="text-center block w-full mb-2 text-lg">Kết thúc trong</span>
                        <div className="flex gap-2 justify-center items-center">
                            <span className="bg-[#00000072] p-2 px-3 rounded-md">{String(timeLeft.hours).padStart(2, "0")}</span>:
                            <span className="bg-[#00000072] p-2 px-3 rounded-md">{String(timeLeft.minutes).padStart(2, "0")}</span>:
                            <span className="bg-[#00000072] p-2 px-3 rounded-md">{String(timeLeft.seconds).padStart(2, "0")}</span>
                        </div>
                    </div>
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
                    autoplay={{ delay: 2500, disableOnInteraction: false, pauseOnMouseEnter: true, }}
                    loop={true}
                    navigation={true}
                    speed={1500}
                    className="carousel-product mt-4 md:mt-0 custom-swiper"
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
                                <ProductCard data={item} flashSale={true} />
                            </SwiperSlide>
                        ))
                    )}
                </Swiper>
            </section>
        ) 
    )
}
