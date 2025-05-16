import { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { removeFromCart, updateQuantity, toggleChecked, toggleAllChecked, clearCheckedItems } from "../../../redux/cartSlice";
import { useQuery } from "@tanstack/react-query";
import { ProductApi } from "../../../services/productApi";
import { Link } from "react-router-dom";
import { IoTrashBin } from "react-icons/io5";
import { IoIosCloseCircle } from "react-icons/io";
import { FaArrowLeftLong } from "react-icons/fa6";
import { formatVND } from "../../../utils/formatPrice";
import LoadingSpin from "../../ui/LoadingSpin";
import { checkImageUrl } from "../../../utils/checkImageUrl";
import toast from "react-hot-toast";

const Cart = () => {
  const [dataCart, setDataCart] = useState([]);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null); // Cho xóa từng sản phẩm
  const [isClearChecked, setIsClearChecked] = useState(false); // Xác định loại xóa (từng sản phẩm hay đã chọn)
  const dispatch = useDispatch();
  const [renderFirstTime, setRenderFirstTime] = useState(true);
  const cartItemsFromRedux = useSelector((state) => state.cart.cart); 
  const productCheckeds = cartItemsFromRedux.filter(item => item.checked);
  const productIDs = cartItemsFromRedux.map((item) => item.id) || [];
  
  const { data: productsData, error, isLoading } = useQuery({
    queryKey: ["allProducts", {
      productIDs: productIDs,
      limit: productIDs.length
    }],
    queryFn: () => ProductApi.getAllProducts({
      productIDs: productIDs,
      limit: productIDs.length
    }),
    enabled: productIDs.length > 0 && renderFirstTime,
    keepPreviousData: true,
  });

  useEffect(() => {
    if (productsData?.products) {
      const validProductIDs = productsData.products
      .filter((prod) => prod.quantity > 0)
      .map((prod) => prod.id);
  
      const updatedCart = cartItemsFromRedux
        .filter((cartItem) => validProductIDs.includes(cartItem.id))
        .map((cartItem) => {
          const product = productsData.products.find(
            (prod) => prod.id === cartItem.id
          );
          if (product) {
            const newQuantity =
              cartItem.quantity > product.quantity
                ? product.quantity
                : cartItem.quantity;
  
            if (newQuantity !== cartItem.quantity) {
              dispatch(
                updateQuantity({
                  id: cartItem.id,
                  colorName: cartItem.colorName,
                  quantity: newQuantity,
                })
              );
            }
            return product
              ? {
                  ...product,
                  maxQuantity: product.quantity,
                  quantity: newQuantity,
                  checked: cartItem.checked || false,
                  colorName: cartItem.colorName,
                }
              : null; 
          }
        })
        .filter((item) => item !== null); 
  
      setDataCart(updatedCart);
  
      const removedItems = cartItemsFromRedux.filter(
        (cartItem) => !validProductIDs.includes(cartItem.id)
      );
      if (removedItems.length > 0) {
        removedItems.forEach((item) => {
          dispatch(removeFromCart({ id: item.id, colorName: item.colorName }));
        });
      }
  
      setRenderFirstTime(false);
    }
  }, [productsData, cartItemsFromRedux, dispatch]);

  const totalPrice = useMemo(() => {
    return dataCart
      .filter((item) => item.checked)
      .reduce((total, item) => total + item.discount * item.quantity, 0);
  }, [dataCart]);

  const handleRemoveClick = ({ id, colorName }) => {
    setItemToRemove({ id, colorName });
    setIsClearChecked(false); // Xóa từng sản phẩm
    setShowConfirmPopup(true);
  };

  const handleClearCheckedClick = () => {
    if (productCheckeds.length > 0) {
      setIsClearChecked(true); // Xóa các sản phẩm đã chọn
      setShowConfirmPopup(true);
    }
  };

  const confirmRemove = () => {
    if (isClearChecked) {
      // Xóa các sản phẩm đã chọn
      setDataCart((prevCart) => prevCart.filter((item) => !item.checked));
      dispatch(clearCheckedItems());
    } else if (itemToRemove) {
      // Xóa từng sản phẩm
      setDataCart((prevCart) =>
        prevCart.filter(
          (item) => !(item.id === itemToRemove.id && item.colorName === itemToRemove.colorName)
        )
      );
      dispatch(removeFromCart({ id: itemToRemove.id, colorName: itemToRemove.colorName }));
    }
    setShowConfirmPopup(false);
    setItemToRemove(null);
    setIsClearChecked(false);
  };

  const cancelRemove = () => {
    setShowConfirmPopup(false);
    setItemToRemove(null);
    setIsClearChecked(false);
  };

  const handleIncrease = ({ id, colorName, maxQuantity }) => {
    if (dataCart.find(item => item.id === id && item.colorName === colorName)?.quantity >= maxQuantity) {
      toast.dismiss();
      toast.error("Số lượng sản phẩm đã đạt tối đa");
      return;
    };
    setDataCart(prevCart =>
      prevCart.map(item =>
        item.id === id && item.colorName === colorName
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
    dispatch(updateQuantity({ id, colorName, quantity: (dataCart.find(item => item.id === id && item.colorName === colorName)?.quantity || 1) + 1 }));
  };
  
  const handleDecrease = ({ id, colorName }) => {
    setDataCart(prevCart =>
      prevCart.map(item =>
        item.id === id && item.colorName === colorName
          ? { ...item, quantity: Math.max(1, item.quantity - 1) }
          : item
      )
    );
    dispatch(updateQuantity({ id, colorName, quantity: Math.max(1, (dataCart.find(item => item.id === id && item.colorName === colorName)?.quantity || 1) - 1) }));
  };
  
  const handleChecked = ({ id, colorName }) => {
    setDataCart(prevCart =>
      prevCart.map(item =>
        item.id === id && item.colorName === colorName
          ? { ...item, checked: !item.checked }
          : item
      )
    );
    dispatch(toggleChecked({ id, colorName }));
  };
  
  const handleSelectAll = (e) => {
    dispatch(toggleAllChecked({ isChecked: e.target.checked }));
  };

  useEffect(() => {
    if (!showConfirmPopup) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    }
  }, [showConfirmPopup]);

  if (error) return <div>{error.message}</div>;

  return (
    <div className="mx-auto max-w-screen-xl px-3 md:px-5 py-10">
      <h2 className="text-2xl font-bold mb-5 uppercase">Giỏ hàng của bạn</h2>
      <div className="grid lg:grid-cols-[50px_450px_250px_250px_auto] px-4 gap-4 border-b border-gray-400 pb-2 text-gray-700 font-semibold">
        <div className="flex items-center gap-3">
          <input
            id="selectAll"
            type="checkbox"
            className="w-5 h-5"
            checked={cartItemsFromRedux.every(item => item.checked) && cartItemsFromRedux.length > 0}
            onChange={handleSelectAll}
          />
          <label htmlFor="selectAll" className="lg:hidden block cursor-pointer">
            Chọn tất cả
          </label>
        </div>
        <span className="lg:block hidden">Sản phẩm</span>
        <span className="text-center lg:block hidden">Số lượng</span>
        <span className="text-center lg:block hidden"></span>
        <span className="text-right lg:block hidden">Tổng cộng</span>
      </div>
      {isLoading ? (
        <div className="w-full text-center py-10 font-medium text-gray-700 flex flex-col items-center justify-center">
          <LoadingSpin />
          <span className="mt-4">Đang tải giỏ hàng...</span> 
        </div>
      ) : (
        dataCart.length > 0 ? (
          dataCart.map((item, index) => (
            <div
              key={`${item.id}-${item.colorName}-${index}`}
              className="grid grid-cols-1 lg:grid-cols-[50px_450px_250px_250px_auto] relative gap-4 md:py-4 items-center p-4 bg-white rounded-lg shadow-sm border border-gray-200 my-4"
            >
              <input
                checked={item.checked}
                type="checkbox"
                className="w-5 h-5"
                onChange={() => handleChecked({ id: item.id, colorName: item.colorName })}
              />
              <button 
                onClick={() => handleRemoveClick({ id: item.id, colorName: item.colorName })}
                className="text-red-500 items-center justify-center cursor-pointer absolute lg:hidden block -top-2 -right-2"
              >
                <IoIosCloseCircle size={30} />
              </button>
              <div className="flex items-center gap-4">
                <img src={checkImageUrl(item.image)} alt={item.name} className="w-23 aspect-[1/1] object-contain" />
                <div className="space-y-1">
                  <Link to={`/products/${item.slug}`} className="font-semibold line-clamp-2">{item.name}</Link>
                  <p className="text-sm text-gray-600">Màu: {item.colorName || "Không có"}</p>
                  <p className="text-sm text-gray-600 font-medium">
                    {formatVND(item.discount)}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center justify-between md:justify-center border border-gray-700 w-fit lg:mx-auto rounded-sm overflow-hidden">
                  <button onClick={() => handleDecrease({ id: item.id, colorName: item.colorName })} className="w-7 h-7 cursor-pointer border-r border-gray-700">
                    -
                  </button>
                  <span className="mx-3">
                    {item.quantity}
                  </span>
                  <button onClick={() => handleIncrease({ id: item.id, colorName: item.colorName, maxQuantity: item.maxQuantity })} className="w-7 h-7 border-l cursor-pointer border-gray-700">
                    +
                  </button>
                </div>
                <span className="text-right font-medium lg:hidden block">
                  {formatVND(item.discount)}
                </span>
              </div>
      
              <button 
                onClick={() => handleRemoveClick({ id: item.id, colorName: item.colorName })}
                className="text-red-500 items-center justify-center cursor-pointer lg:flex hidden"
              >
                <IoTrashBin size={22} />
              </button>
      
              <span className="text-right font-medium lg:block hidden">
                {formatVND(item.discount * item.quantity)}
              </span>
            </div>
          ))
        ) : (
          <div className="w-full text-center py-10 font-medium text-gray-500">Không có sản phẩm nào trong giỏ hàng.</div>
        )
      )}

      {dataCart.length > 0 && (
        <div className="mt-4 flex sm:flex-row flex-col gap-3 sm:gap-0 w-full bg-white sm:p-4 p-3 rounded shadow-sm justify-between items-center">
          <button
            onClick={handleClearCheckedClick}
            className={`sm:px-4 sm:text-[15px] text-[14px] sm:text-base rounded ${productCheckeds.length > 0 ? "text-red-500 hover:text-red-600 cursor-pointer" : "text-gray-400 cursor-not-allowed"}`}
            disabled={productCheckeds.length === 0}
          >
            Xóa sản phẩm đã chọn
          </button>
          <div className="font-semibold sm:text-[15px] text-[14px] sm:text-base">
            Số lượng sản phẩm đã chọn: {productCheckeds.reduce((total, item) => total + item.quantity, 0)}
          </div>
        </div>
      )}

      <div className="p-4 mt-6 bg-white rounded shadow-sm sm:max-w-[400px] ml-auto space-y-2">
        <div className="flex justify-between font-semibold">
          <span>Tổng tiền:</span>
          <span>{formatVND(totalPrice)}</span>
        </div>
      </div>

      <div className="flex items-center flex-col gap-4 mt-6 sm:min-w-[400px] sm:w-fit ml-auto">
        <Link to={`${productCheckeds.length < 1 ? "" : "/checkout"}`} className={`${productCheckeds.length < 1 ? "cursor-not-allowed bg-blue-300" : "cursor-pointer bg-blue-500 hover:bg-blue-400"} text-white px-6 py-2 text-center block rounded w-full`}>
          Thanh toán
        </Link>
        <Link
          to="/"
          className="uppercase text-sm font-medium flex items-center gap-2"
        >
          <FaArrowLeftLong size={13} />
          Tiếp tục mua sắm
        </Link>
      </div>

      {showConfirmPopup && (
        <div className="fixed inset-0 bg-[#00000099] bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 font-medium rounded-lg shadow-lg max-w-sm w-full">
            <p className="mb-5">
              {isClearChecked 
                ? "Bạn có chắc chắn muốn xóa các sản phẩm đã chọn khỏi giỏ hàng?" 
                : "Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?"}
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={cancelRemove}
                className="px-4 py-2 cursor-pointer text-sm font-semibold bg-gray-300 rounded hover:bg-gray-400"
              >
                Hủy
              </button>
              <button
                onClick={confirmRemove}
                className="px-4 py-2 cursor-pointer text-sm font-semibold bg-red-500 text-white rounded hover:bg-red-600"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;