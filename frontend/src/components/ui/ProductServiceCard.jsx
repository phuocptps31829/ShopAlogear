import { Link } from "react-router-dom";
import { TiTick } from "react-icons/ti";
import PropTypes from "prop-types";
import { checkImageUrl } from "../../utils/checkImageUrl";
import struggle from "../../assets/images/struggle.gif";
export default function ProductServiceCard({ data = {} }) {
  return (
    <div className="rounded-lg shadow-product bg-white relative max-w-[280px] block group border border-gray-200">
      <div className="flex justify-center overflow-hidden rounded-t-lg">
        <Link to={`/services/${data.slug}?view=1`} className="w-full">
          <img
            src={checkImageUrl(data.image)}
            alt="Tai nghe Sony WH-ULT900N"
            className="w-full object-cover aspect-[9/7] sm:min-h-[170px] group-hover:scale-110 transition-transform duration-300"
            loading="lazy"
          />
        </Link>
      </div>
      <div className="p-3 flex flex-col">
        <Link to={`/services/${data.slug}?view=1`} className="text-sm font-semibold line-clamp-2 min-h-[40px] text-center">{data.name}</Link>
        <div className="text-[12px] mt-2 italic">
          <div className="flex items-center"><TiTick className="mr-1 text-green-500" /> Lắp đặt tận nơi</div>
          <div className="flex items-center"><TiTick className="mr-1 text-green-500" /> Hỗ trợ nhanh chóng</div>
        </div>
        <div className="absolute text-black top-2 right-2 flex items-center justify-center mb-[6px]
          text-[12px] font-medium border border-blue-400 rounded-full bg-blue-100 z-10">
            <img src={struggle} alt="" className="w-7 rounded-full" />
        </div>  
      </div>
    </div>
  );
}

ProductServiceCard.propTypes = {
  data: PropTypes.object.isRequired,
};