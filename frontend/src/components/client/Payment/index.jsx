import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { zodResolver } from "@hookform/resolvers/zod";
import { paymentSchema } from "../../../zods/payment";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ProductApi } from "../../../services/productApi";
import { BanknotesIcon, CreditCardIcon } from "@heroicons/react/24/outline";
import { useState, useEffect, useMemo } from "react";
import { formatVND } from "../../../utils/formatPrice";
import empty_product from "../../../assets/images/shopping.png";
import LoadingSpin from "../../ui/LoadingSpin";
import InputField from "../../ui/InputField";
import { orderApi } from "../../../services/orderApi";
import { toast } from "react-toastify";
import { clearCheckedItems, removeFromCart, updateQuantity } from "../../../redux/cartSlice";
import { checkImageUrl } from "../../../utils/checkImageUrl";

export default function Payment() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    handleSubmit,
    formState: { errors },
    control,
    getValues,
    setValue,
    watch
  } = useForm({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      address: "",
      products: [],
    },
  });
  const watchedFields = watch(["fullName", "phone", "address"]);
  const [isFormComplete, setIsFormComplete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [contentBanking, setContentBanking] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [dataCart, setDataCart] = useState([]);
  const [renderFirstTime, setRenderFirstTime] = useState(true);
  const cartItemsChecked = useSelector((state) => state.cart.cart).filter((item) => item.checked);
  const cartItemsFromRedux = useSelector((state) => state.cart.cart);
  const profile = useSelector((state) => state.auth.userProfile);
  const productIDs = cartItemsFromRedux.map((item) => item.id) || [];
  const { data: productsData, isLoading } = useQuery({
    queryKey: [
      "allProducts",
      {
        productIDs: productIDs,
        limit: productIDs.length,
      },
    ],
    queryFn: () =>
      ProductApi.getAllProducts({
        productIDs: productIDs,
        limit: productIDs.length,
      }),
    enabled: productIDs.length > 0 && renderFirstTime,
    keepPreviousData: true,
  });

  useEffect(() => {
    const [fullName, phone, address] = watchedFields;
    const isComplete = 
      fullName?.trim() !== "" &&
        phone?.trim() !== "" &&
      address?.trim() !== "";
    setIsFormComplete(isComplete);
  }, [watchedFields]);

  useEffect(() => {
    if (profile) {
      setValue("fullName", profile.username || "");
      setValue("phone", profile.phone || "");
      setValue("address", profile.address || "");
      setValue("email", profile.email || "");
    }
  }, [profile, setValue]);
 
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
    }, [productsData, cartItemsFromRedux, dispatch])

  const totalPrice = useMemo(() => {
    return dataCart.reduce(
      (total, item) => total + item.discount * item.quantity,
      0
    );
  }, [dataCart]);
  const handleCreateOrder = async () => {
    setLoading(true);
    try {
      const formData = getValues() || {};
      const order = {
        userID: profile?.id || null,
        fullName: formData.fullName.trim() === "" ? null : formData.fullName,
        phone: formData.phone.trim() === "" ? null : formData.phone,
        email: formData.email.trim() === "" ? null : formData.email,
        address: formData.address.trim() === "" ? null : formData.address,
        products: dataCart.map((item) => ({
          productID: item.id,
          quantity: item.quantity,
          colorID: item.colorIdActive,
        })),
      };
      order.id = sessionStorage.getItem("orderId");
      order.type = paymentMethod === "cash" ? 1 : 2;
      await orderApi.createOrder(order);
      sessionStorage.removeItem("orderCode");
      sessionStorage.removeItem("orderId");
      dispatch(clearCheckedItems());
      navigate("/payment-success");
    } catch (error) {
      toast.error("Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại!");
      console.error("Lỗi đặt hàng:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleCreateOrderFirstTime = async () => {
    const orderId = sessionStorage.getItem("orderId");
    if(orderId) {
      setContentBanking(sessionStorage.getItem("orderCode"));
    } else {
      const formData = getValues();
      const order = {
        userID: profile?.id || null,
        fullName: formData.fullName.trim() === "" ? null : formData.fullName,
        phone: formData.phone.trim() === "" ? null : formData.phone,
        email: formData.email.trim() === "" ? null : formData.email,
        address: formData.address.trim() === "" ? null : formData.address,
        products: dataCart.map((item) => ({
          productID: item.id,
          quantity: item.quantity,
          colorID: item.colorID,
        })),
      };
      const response = await orderApi.createOrder(order);
      sessionStorage.setItem("orderCode", response.order.code);
      sessionStorage.setItem("orderId", response.order.id);
      setContentBanking(sessionStorage.getItem("orderCode"));
    }
  };

  useEffect(() => {
    if(renderFirstTime) return;
    handleCreateOrderFirstTime();
  }, [renderFirstTime]);

  const onSubmit = () => {
    handleCreateOrder();
  };

  return (
    <>
      {cartItemsChecked.length > 0 ? (
        <div className="mx-auto max-w-screen-xl px-3 md:px-5 py-4 space-y-5">
          <div className="bg-white">
            <div className="flex max-sm:flex-col gap-7 h-full">
              <div className="bg-gray-100 h-fit sm:sticky sm:top-20 lg:min-w-[400px] sm:min-w-[300px] rounded-md overflow-hidden">
                <div className="relative h-fit">
                  <div className="p-4 sm:overflow-auto max-h-[77vh] custom-scrollbar-checkout sm:pb-16">
                    {isLoading ? (
                      <div className="w-full text-center py-10 font-medium text-gray-700 flex flex-col items-center justify-center">
                        <LoadingSpin />
                        <span className="mt-4">Đang tải sản phẩm...</span>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {dataCart.map((item, idx) => (
                          <div className="flex items-start gap-4" key={idx}>
                            <div className="w-28 aspect-[1/1] flex shrink-0 rounded-md bg-white">
                              <img
                                src={checkImageUrl(item.image)}
                                className="w-full rounded-md h-full object-contain"
                              />
                            </div>
                            <div className="w-full">
                              <h3 className="text-sm lg:text-base text-gray-800 font-medium">
                                {item.name}
                              </h3>
                              <ul className="text-[13px] text-gray-800 space-y-1 mt-1">
                                <li className="flex flex-wrap gap-4">
                                  Màu:{" "}
                                  <span className="ml-auto">
                                    {item.colorName || "Không có"}
                                  </span>
                                </li>
                                <li className="flex flex-wrap gap-4">
                                  Số lượng:{" "}
                                  <span className="ml-auto">
                                    {item.quantity}
                                  </span>
                                </li>
                                <li className="flex flex-wrap gap-4">
                                  Tổng tiền{" "}
                                  <span className="ml-auto">
                                    {formatVND(item.discount * item.quantity)}
                                  </span>
                                </li>
                              </ul>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="md:absolute md:left-0 md:bottom-0 bg-gray-200 w-full p-4">
                    <h4 className="flex flex-wrap gap-4 text-sm lg:text-base text-gray-800">
                      Tổng tiền thanh toán:{" "}
                      <span className="ml-auto font-medium">
                        {formatVND(totalPrice)}
                      </span>
                    </h4>
                  </div>
                </div>
              </div>

              <div className="max-w-4xl w-full h-max rounded-md sticky top-0 py-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  Hoàn tất đơn hàng của bạn
                </h2>
                <form className="mt-4" onSubmit={handleSubmit(onSubmit)}>
                  <div>
                    <h3 className="text-sm lg:text-base text-gray-800 mb-4">
                      Thông tin người nhận
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <InputField
                        name="fullName"
                        control={control}
                        placeholder="Họ và tên"
                        type="text"
                        errors={errors}
                        className="col-span-2"
                      />
                      <InputField
                        name="email"
                        control={control}
                        placeholder="Email"
                        type="email"
                        errors={errors}
                        className="sm:col-span-1 col-span-2"
                      />
                      <InputField
                        name="phone"
                        control={control}
                        placeholder="Số điện thoại"
                        type="number"
                        errors={errors}
                        className="sm:col-span-1 col-span-2"
                      />
                      <InputField
                        name="address"
                        control={control}
                        placeholder="Địa chỉ"
                        type="text"
                        errors={errors}
                        className="col-span-2"
                      />
                    </div>
                  </div>
                  <div className="mt-5">
                    <h3 className="text-sm lg:text-base text-gray-800 mb-4">
                      Phương thức thanh toán
                    </h3>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <label
                        className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all 
                          ${
                            paymentMethod === "cash"
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-300 hover:border-gray-400"
                          }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value="cash"
                          checked={paymentMethod === "cash"}
                          onChange={() => setPaymentMethod("cash")}
                          className="hidden"
                        />
                        <div
                          className={`w-4 h-4 flex items-center justify-center border-2 rounded-full 
                          ${
                            paymentMethod === "cash"
                              ? "border-blue-500 bg-blue-500"
                              : "border-gray-400"
                          }`}
                        >
                          {paymentMethod === "cash" && (
                            <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                          )}
                        </div>
                        <BanknotesIcon className="w-5 text-gray-700 ml-3" />
                        <span className="text-gray-800 ml-1 text-sm">
                          Thanh toán tại cửa hàng
                        </span>
                      </label>

                      <label
                        className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all 
                          ${
                            paymentMethod === "banking"
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-300 hover:border-gray-400"
                          }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value="banking"
                          checked={paymentMethod === "banking"}
                          onChange={() => setPaymentMethod("banking")}
                          className="hidden"
                        />
                        <div
                          className={`w-4 h-4 flex items-center justify-center border-2 rounded-full 
                          ${
                            paymentMethod === "banking"
                              ? "border-blue-500 bg-blue-500"
                              : "border-gray-400"
                          }`}
                        >
                          {paymentMethod === "banking" && (
                            <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                          )}
                        </div>
                        <CreditCardIcon className="w-5 text-gray-700 ml-3" />
                        <span className="text-gray-800 ml-1 text-sm">
                          Thanh toán chuyển khoản
                        </span>
                      </label>
                    </div>
                    {paymentMethod === "banking" && (
                      <div className="mt-4 p-4 bg-gray-100 rounded-md grid grid-cols-1 md:grid-cols-3">
                        <div className="space-y-2 text-gray-800 col-span-2 text-sm flex flex-col">
                          <h4 className="font-semibold">
                            Thông tin chuyển khoản:
                          </h4>
                          <p>
                            <strong>Chủ tài khoản:</strong> DANG VAN HIEU
                          </p>
                          <p>
                            <strong>Số tài khoản:</strong> 9961779795
                          </p>
                          <p>
                            <strong>Ngân hàng:</strong> Vietcombank
                          </p>
                          <p>
                            <strong>Số tiền:</strong> {formatVND(totalPrice)}
                          </p>
                          <p className="text-sm text-gray-600">
                            * Vui lòng nhập nội dung chuyển khoản:{" "}
                            <strong>{contentBanking}</strong>
                          </p>
                          <p className="grow-1 flex gap-1 items-end flex-wrap">
                            <strong className="text-red-500">Chú ý:</strong> Nhấn nút <strong className="text-red-500">“Hoàn tất đơn hàng”</strong> sau khi chuyển khoản thành công.
                          </p>
                        </div>
                        <div className="w-[77%]">
                          <img
                            className="w-full md:mt-0 mt-5"
                            src={`https://qrcode.io.vn/api/generate/970436/9961779795/${totalPrice}/${contentBanking}?is_mask=1`}
                            alt="QR Code"
                          />
                        </div>
                      </div>
                    )}
                    {paymentMethod === "cash" && (
                      <div className="mt-4 p-4 bg-gray-100 rounded-md grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2 text-gray-800 col-span-2 text-sm">
                          <h4 className="font-semibold">Địa chỉ cửa hàng:</h4>
                          <p>
                            351/6 ấp Long Thành, Long Trì, Châu Thành, Long An
                            82200, Việt Nam
                          </p>
                        </div>
                        <div className="w-full">
                          <iframe
                            src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3944.4970534570302!2d106.4444294!3d10.4168695!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x310ab3ee9541ca11%3A0x7d362d92ce9c2dd2!2sAloGear.vn!5e1!3m2!1svi!2s!4v1739966167857!5m2!1svi!2s"
                            width="240"
                            height="200"
                            allowFullScreen={true}
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                          ></iframe>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-4 max-md:flex-col mt-6">
                    <Link
                      to="/cart"
                      type="button"
                      className="cursor-pointer block text-center rounded-md px-4 py-2.5 w-full text-sm tracking-wide bg-transparent hover:bg-gray-100 border border-gray-300 text-gray-800 max-md:order-1"
                    >
                      Quay lại giỏ hàng
                    </Link>
                    <button
                      disabled={loading}
                      type="submit"
                      className={`${loading 
                        ? "cursor-default bg-gray-500" 
                        : "cursor-pointer bg-gray-600 hover:bg-gray-700"} 
                        rounded-md px-4 py-2.5 w-full text-sm tracking-wide text-white 
                        ${isFormComplete && !loading ? "animate-blink" : ""}`}
                    >
                      {loading ? (
                        <div className="w-5 h-5 mx-auto border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        "Hoàn tất đơn hàng"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col w-full mx-auto max-w-screen-xl px-3 md:px-5 py-4 space-y-5 justify-center items-center">
          <img
            src={empty_product}
            className="max-w-80 w-full"
            alt="Không có sản phẩm"
          />
          <p className="sm:text-lg text-md font-medium text-gray-800">
            Không có sản phẩm nào cần thanh toán.
          </p>
          <div className="flex sm:space-x-4 space-x-2 mb-5 font-medium">
            <Link
              to="/"
              className="px-4 py-2 bg-blue-500 text-white rounded-sm hover:bg-blue-600 transition text-sm"
            >
              Tiếp tục mua hàng
            </Link>
            <Link
              to="/cart"
              className="px-4 py-2 bg-gray-500 text-white rounded-sm hover:bg-gray-600 transition text-sm"
            >
              Quay lại giỏ hàng
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
