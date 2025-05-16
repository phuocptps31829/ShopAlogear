import { useQuery } from "@tanstack/react-query";
import { bannerApi } from "../../../../services/bannerApi";
import { IoImageOutline } from "react-icons/io5";
import no_image from "../../../../assets/images/no-image.png";
const URL_IMAGE = import.meta.env.VITE_URL_IMAGE;

const PromoAds = () => {
  const { data, error, isLoading } = useQuery({
    queryKey: ["bannerImage", { type: 2 }],
    queryFn: () => bannerApi.getAllBanner(
      { type: 2, limit: 3 }
    ),
    keepPreviousData: true,
  });

  if(error) return <div>{error.message}</div>
  return (
    <div className="flex-col max-h-[340px] hidden xl:flex gap-3.5 w-full">
      {isLoading ? (
        Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="w-full grow rounded-xl shadow-sm border border-gray-400 opacity-40 flex justify-center items-center"
          >
            <IoImageOutline className="text-5xl" />
          </div>
        ))
      ) : (
        data?.products?.length > 0 ? (
          data?.products?.map((ad, index) => (
            <div key={index} className="grow w-full max-h-[104px] max-w-[235px]">
              <img
                loading="eager"
                src={`${URL_IMAGE}/${ad.image}`}
                className="w-full h-full rounded-xl shadow-sm"
              />
            </div>
          ))
        ) : (
          Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="w-full grow rounded-md shadow-sm border border-gray-300 opacity-40 flex justify-center items-center">
              <img src={no_image} alt="No image" className="w-10 pointer-events-none" />
            </div>
          ))
        )
      )}
    </div>
  );
};

export default PromoAds;
