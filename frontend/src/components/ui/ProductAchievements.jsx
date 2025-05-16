import PropTypes from "prop-types";
import { useContext } from "react";
import { NavbarContext } from "../../contexts/NavBarContext";
import { checkImageUrl } from "../../utils/checkImageUrl";
export default function ProductAchievementsCard({ data }) {
  const { handleOpenPopup } =
      useContext(NavbarContext);
  return (
    <>
      <div className="rounded-lg shadow-product bg-white block group border border-gray-200 overflow-hidden w-full">
        <button 
          onClick={() => handleOpenPopup({ type:data.type, link: data.link })}
          className="flex justify-center w-full overflow-hidden rounded-t-lg relative cursor-pointer"
        >
          <img
            src={checkImageUrl(data.image)}
            alt={data.name}
            className="w-full object-cover aspect-[9/7] sm:min-h-[170px] group-hover:scale-110 transition-transform duration-300"
            loading="lazy"
          />
          <div className="absolute bg-gradient-to-b uppercase from-transparent to-black py-7 left-0 w-full bottom-0 text-white flex items-center flex-col">
            <div className="font-medium text-[11px]">{data.description}</div>
            <div className="md:text-xl text-sm font-bold italic text-red-200 flex items-center justify-center text-center px-2">{data.name}</div>
          </div>
        </button>
      </div>
    </>
  );
}

ProductAchievementsCard.propTypes = {
  data: PropTypes.object.isRequired,
};