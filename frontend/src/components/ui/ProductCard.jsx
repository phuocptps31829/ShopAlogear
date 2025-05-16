import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToCart, toggleAllChecked } from "../../redux/cartSlice";
import PropTypes from "prop-types";
import { MdPayment } from "react-icons/md";
import { FaCartArrowDown } from "react-icons/fa";
import { formatVND } from "../../utils/formatPrice";
import toast from "react-hot-toast";
import fs_iconfire from "../../assets/images/fire.gif";
import { checkImageUrl } from "../../utils/checkImageUrl";
export default function ProductCard({
  data = {},
  flashSale = false,
  productInPopup = false,
  handleChooseProduct,
  dataPopupProductBag = []
}) {
  const navigate = useNavigate();
  const isSelected = dataPopupProductBag.some(item => item.id === data.id);
  const dispatch = useDispatch();
  const handleAddClick = ({ id, colorName, colorID }) => {
    const newItem = {
      id,
      checked: true,
      colorName: colorName,
      colorIdActive: colorID ? Number(colorID) : null,
    };
    dispatch(addToCart(newItem));
    toast.dismiss();
    toast.success("Đã thêm vào giỏ hàng");
  };

  const handleBuyNow = ({ id, colorName, colorID }) => {
    const newItem = {
      id,
      checked: true,
      colorName: colorName,
      colorIdActive: colorID ? Number(colorID) : null,
    };
    dispatch(toggleAllChecked({ isChecked: false }));
    dispatch(addToCart(newItem));
    navigate("/checkout");
  }

  return (
    data.type == 4 ? (
      <div className="rounded-xl bg-white relative overflow-hidden block group">
        {data.discount < data.price && (
          <div className="absolute left-0 top-0 text-white bg-red-400 z-10 rounded-full mt-1 ml-1 text-[11px] px-2 py-[2px] font-semibold">Giảm {Math.ceil(((data.price - data.discount) / data.price) * 100)}%</div>
        )}
        <div className="flex justify-center overflow-hidden rounded-lg relative">
          <Link to={`/products/${data.slug}?view=1`} className={`${productInPopup && "pointer-events-none"} w-full`}>
            <img
              alt={data.name}
              src={checkImageUrl(data.image)}
              className="aspect-[1/1] w-full object-cover group-hover:scale-110 transition-transform duration-500"
              loading="lazy"
            />
          </Link>
          {flashSale && (
            <img
              src={fs_iconfire}
              alt="flash sale icon"
              className="w-10 h-auto absolute top-1 right-1"
            />
          )}
          {(!productInPopup) && (
            <div className="absolute top-3/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex gap-3 w-fit px-2 py-2 duration-500 group-hover:top-8/9 opacity-0 group-hover:opacity-100 group-hover:pointer-events-auto pointer-events-none">
              <button
                className="relative bg-white shadow-md rounded-full p-[10px] cursor-pointer hover:bg-gray-300 group/tooltip"
                onClick={() => handleBuyNow({ id: data.id, colorName: data.colorName, colorID: data.colorID })}
              >
                <MdPayment size={17} />
                <span className="invisible group-hover/tooltip:visible absolute -top-7.5 left-1/2 -translate-x-1/2 bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                  Mua ngay
                </span>
              </button>
              <button
                className="relative bg-white shadow-md rounded-full p-[10px] cursor-pointer hover:bg-gray-300 group/tooltip"
                onClick={() =>
                  handleAddClick({ id: data.id, colorName: data.colorName, colorID: data.colorID })
                }
              >
                <FaCartArrowDown size={17} />
                <span className="invisible group-hover/tooltip:visible absolute -top-7.5 left-1/2 -translate-x-1/2 bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                  Thêm vào giỏ
                </span>
              </button>
            </div>
          )}
        </div>
        <div className="p-3 flex flex-col">
          <Link
            to={`/products/${data.slug}?view=1`}
            className={`${productInPopup && "pointer-events-none"} text-sm font-medium line-clamp-2 tracking-wider`}
          >
            {data.name}
          </Link>
            <div className="flex items-center">
              <span className="text-[16px] font-bold my-[4px] mr-2 text-red-500 text-center">
                {formatVND(data.discount)}
              </span>
              <div className="flex justify-center items-center">
                <span className="text-[12px] font-medium italic text-center line-through whitespace-nowrap">
                  {formatVND(data.price)}
                </span>
              </div>
            </div>
          {productInPopup && (
            <div className="flex items-center justify-between text-sm font-medium mt-2 gap-2">
              <Link to={`/products/${data.slug}?view=1`} target="_blank" className="text-blue-500 grow text-center">
                Xem chi tiết
              </Link>
              <button 
                className={`py-1 px-5 rounded-sm grow text-center  
                  ${isSelected ? "bg-gray-400 text-white cursor-default" : "bg-red-500 text-white cursor-pointer"}`}
                disabled={isSelected}
                onClick={() => !isSelected && handleChooseProduct(data)}
              >
              {isSelected ? "Đã chọn" : "Chọn"}
              </button>
            </div>
          )}
        </div>
      </div>
    ) : (
      <div className="rounded-xl shadow-product bg-white relative overflow-hidden block group border border-gray-200">
        <div className="flex justify-center overflow-hidden rounded-t-lg relative">
          <Link to={`/products/${data.slug}?view=1`} className={`${productInPopup && "pointer-events-none"} w-full`}>
            <img
              src={checkImageUrl(data.image)}
              alt={data.name}
              className="aspect-[11/10] sm:min-h-[170px] w-full object-contain group-hover:scale-110 transition-transform duration-500"
              loading="lazy"
            />
          </Link>
          {flashSale && (
            <img
              src={fs_iconfire}
              alt="flash sale icon"
              className="w-10 h-auto absolute top-1 right-1"
            />
          )}
          {(data.type == 1 && !productInPopup) && (
            <div className="absolute top-3/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex gap-3 w-fit px-2 py-2 duration-500 group-hover:top-8/9 opacity-0 group-hover:opacity-100 group-hover:pointer-events-auto pointer-events-none">
              {/* <button
                className="relative bg-white shadow-md rounded-full p-[10px] cursor-pointer hover:bg-gray-300 group/tooltip"
                onClick={() => handleBuyNow({ id: data.id, colorName: data.colorName, colorID: data.colorID })}
              >
                <MdPayment size={17} />
                <span className="invisible group-hover/tooltip:visible absolute -top-7.5 left-1/2 -translate-x-1/2 bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                  Mua ngay
                </span>
              </button> */}
              <button
                className="relative bg-white shadow-md rounded-full p-[10px] cursor-pointer hover:bg-gray-300 group/tooltip"
                onClick={() =>
                  handleAddClick({ id: data.id, colorName: data.colorName, colorID: data.colorID })
                }
              >
                <FaCartArrowDown size={17} />
                <span className="invisible group-hover/tooltip:visible absolute -top-7.5 left-1/2 -translate-x-1/2 bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                  Thêm vào giỏ
                </span>
              </button>
            </div>
          )}
        </div>
        <div className="p-3 flex flex-col">
          <Link
            to={`/products/${data.slug}?view=1`}
            className={`${productInPopup && "pointer-events-none"} tracking-wide text-sm font-semibold line-clamp-2 text-center min-h-[40px]`}
          >
            {data.name}
          </Link>
          {data.type == 1 ? (
            <>
              <span className="text-[16px] font-bold my-[4px] mr-2 text-red-500 text-center">
                {formatVND(data.discount)}
              </span>
              {data.discount < data.price ? (
                <div className="flex justify-center mb-1 items-center">
                  <span className="text-[12px] font-medium italic text-center line-through whitespace-nowrap">
                    {formatVND(data.price)}
                  </span>
                  <span className="text-[11px] bg-red-500 opacity-80 text-white px-1 ml-2 rounded-md drop-shadow-sm whitespace-nowrap">
                    - {Math.ceil(((data.price - data.discount) / data.price) * 100)}
                    %
                  </span>
                </div>
              ) : (
                <div className="h-[23px]"></div>
              )}
            </>
          ) : (
            <div className="sm:text-[13px] text-[12px] sm:px-3 px-1 sm:py-[4px] py-[5.2px] mb-2 text-center bg-yellow-200 italic rounded-md flex text-black items-center justify-center">
              Sản phẩm không có giá cố định, vui lòng liên hệ.
            </div>
          )}
          {!productInPopup ? (
            data.discount ? (
              <div className="flex">
                <button
                  className="bg-blue-500 w-full lg:max-w-[75%] mx-auto hover:bg-blue-400 text-white text-center rounded-xl grow py-[5.5px] mt-1 cursor-pointer text-[14px]"
                  onClick={() => handleBuyNow({ id: data.id, colorName: data.colorName, colorID: data.colorID })}
                >
                  Mua ngay
                </button>
                <button
                  className="border border-gray-500 w-[35%] ml-2 flex lg:hidden justify-center items-center mx-auto text-gray-400 text-center rounded-xl grow py-[5.5px] mt-1 cursor-pointer text-[14px]"
                  onClick={() =>
                    handleAddClick({ id: data.id, colorName: data.colorName, colorID: data.colorID })
                  }
                >
                  <FaCartArrowDown size={17} />
                </button>
              </div>
            ) : (
              <Link
                className="bg-blue-500 w-full max-w-[75%] mx-auto hover:bg-blue-400 text-white text-center rounded-xl grow py-[5.5px] mt-1 cursor-pointer text-[14px]"
                to="https://zalo.me/0961779795"
                target="_blank"
                onClick={(e) => e.stopPropagation()}
              >
                Liên hệ
              </Link>
            )
          ) : (
            <div className="flex items-center justify-between text-sm font-medium mt-2 gap-2">
              <Link to={`/products/${data.slug}?view=1`} target="_blank" className="text-blue-500 grow text-center">
                Xem chi tiết
              </Link>
              <button 
                className={`py-1 px-5 rounded-sm grow text-center  
                  ${isSelected ? "bg-gray-400 text-white cursor-default" : "bg-red-500 text-white cursor-pointer"}`}
                disabled={isSelected}
                onClick={() => !isSelected && handleChooseProduct(data)}
              >
              {isSelected ? "Đã chọn" : "Chọn"}
              </button>
            </div>
          )}
        </div>
      </div>
    )
  );
}

ProductCard.propTypes = {
  data: PropTypes.object.isRequired,
  flashSale: PropTypes.bool,
  productInPopup: PropTypes.bool,
  handleChooseProduct: PropTypes.func,
  dataPopupProductBag: PropTypes.array
};
