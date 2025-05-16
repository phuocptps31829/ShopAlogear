import PropTypes from "prop-types";
import { IoTrashBin, IoClose } from "react-icons/io5";
import { Link } from "react-router-dom";
import { IoIosCloseCircle } from "react-icons/io";
import { formatVND } from "../../utils/formatPrice";
import empty from "../../assets/images/empty.png";
import { checkImageUrl } from "../../utils/checkImageUrl";
import Zoom from "react-medium-image-zoom";
export default function PopupProductBag({ closePopup, dataPopup = [], handleRemoveProduct }) {

  return (
    <div className="fixed inset-0 bg-[#00000080] flex justify-center items-center z-50 m-0">
      <div className="bg-gray-300 border-3 border-white p-4 relative w-full max-w-3xl mx-3 md:mx-0 rounded min-h-[350px]">
        <button
          onClick={closePopup}
          className="absolute -top-2 -right-2 z-10 bg-black border-3 border-white text-white rounded-full cursor-pointer p-1"
        >
          <IoClose size={22} />
        </button>
        <h2 className="font-medium mb-2 px-2">Danh sách sản phẩm đã chọn:</h2>
        <div className="max-h-[80vh] overflow-y-auto custom-scrollbar relative px-2 cart-content">
          {dataPopup.length > 0 ? (
            <>
              {dataPopup.map((item, index) => (
                <div
                  key={`${item.id}-${item.colorName}-${index}`}
                  className="grid grid-cols-1 lg:grid-cols-[auto_150px_50px] w-full relative gap-4 md:py-4 items-center p-4 bg-white rounded-lg shadow-sm border border-gray-200 my-4"
                >
                  <button onClick={() => handleRemoveProduct(index)} className="text-red-500 items-center justify-center cursor-pointer absolute lg:hidden block -top-2 -right-2">
                    <IoIosCloseCircle size={30} />
                  </button>
                  <div className="flex items-center gap-4">
                    <Zoom zoomMargin={50} transitionDuration={500}>
                      <img src={checkImageUrl(item.image)} alt={item.name} className="w-23 aspect-[1/1] object-cover" />
                    </Zoom>
                    <div className="space-y-1">
                      <Link
                        to={`/products/${item.slug}`}
                        className="font-semibold line-clamp-2"
                      >
                        {item.name}
                      </Link>
                      <p className="text-sm text-gray-600">
                        Màu: {item.colorName || "Không có"}
                      </p>
                      <p className="text-sm text-gray-600 font-medium lg:block hidden">
                        {formatVND(item.discount)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    {/* <div className="flex items-center justify-between md:justify-center border border-gray-700 w-fit lg:mx-auto rounded-sm overflow-hidden">
                      <button className="w-7 h-7 cursor-pointer border-r border-gray-700">
                        -
                      </button>
                      <span className="mx-3">1</span>
                      <button className="w-7 h-7 border-l cursor-pointer border-gray-700">
                        +
                      </button>
                    </div> */}
                    <div className="font-medium lg:text-center grow text-sm">Số lượng: 1</div>
                    <span className="text-right font-medium lg:hidden block">
                      {formatVND(item.discount)}
                    </span>
                  </div>

                  <button 
                    onClick={() => handleRemoveProduct(index)}
                    className="text-red-500 items-center justify-center cursor-pointer lg:flex hidden"
                  >
                    <IoTrashBin size={22} />
                  </button>
                </div>
              ))}
            </>
          ) : (
            <div className="w-full text-center py-10 font-medium text-gray-500">
                <img src={empty} alt="empty" className="mx-auto w-20 opacity-70 mb-5" />
                Không có sản phẩm nào được chọn.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

PopupProductBag.propTypes = {
  closePopup: PropTypes.func,
  dataPopup: PropTypes.array,
  openPopupProductBag: PropTypes.func,
  handleRemoveProduct: PropTypes.func,
};
