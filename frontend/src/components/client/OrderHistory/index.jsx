import { Link } from "react-router-dom";
import { FaRegFileAlt } from "react-icons/fa";
import { useSelector } from "react-redux";
import { formatVND } from "../../../utils/formatPrice";
import { checkImageUrl } from "../../../utils/checkImageUrl";
import Zoom from "react-medium-image-zoom";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { orderApi } from "../../../services/orderApi";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import empty from "../../../assets/images/empty.png";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { FaRegCopy } from "react-icons/fa6";
import { authApi } from "../../../services/authApi";
import { useQuery } from "@tanstack/react-query";
import { setUserProfile } from "../../../redux/authSlice";
import { useDispatch } from "react-redux";

export default function OrderHistory() {
  const dispatch = useDispatch();
  const profile = useSelector((state) => state.auth.userProfile);
  const [orders, setOrders] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderToCancel, setOrderToCancel] = useState(null);

  const { data: profileFetched, isLoading } = useQuery({
      queryKey: ["userProfile"],
      queryFn: authApi.getProfileInfo,
  });

  useEffect(() => {
    dispatch(setUserProfile(profileFetched?.data));
  }, [profileFetched, dispatch]);
  

  useEffect(() => {
    if (profile?.orders) {
      setOrders(profile.orders);
    }
  }, [profile]);

  const openPopup = (order) => {
    setSelectedOrder(order);
    setIsOpen(true);
  };

  const closePopup = () => {
    setIsOpen(false);
    setSelectedOrder(null);
  };

  const openConfirmPopup = (order) => {
    setOrderToCancel(order);
    setIsConfirmOpen(true);
  };

  const closeConfirmPopup = () => {
    setIsConfirmOpen(false);
    setOrderToCancel(null);
  };

  const mutationCancelOrder = useMutation({
    mutationFn: orderApi.cancelOrderUser,
    onSuccess: (data, orderId) => {
      toast.success("Hủy đơn hàng thành công!");
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: 0 } : order
        )
      );
      closeConfirmPopup();
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Đã xảy ra lỗi, vui lòng thử lại.";
      toast.error(errorMessage);
    },
  });

  const handleCancelOrder = () => {
    if (orderToCancel) {
      mutationCancelOrder.mutate(orderToCancel.id);
    }
  };

  const handleCopy = () => {
    toast.success("Đã sao chép mã vận đơn!");
  };

  const OrderSkeleton = () => (
    <div className="main-box border border-gray-200 rounded-xl pt-4 max-w-xl max-lg:mx-auto lg:max-w-full mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between px-6 pb-6 border-b border-gray-200">
        <div className="space-y-3 w-full">
          <Skeleton width={200} height={16} />
          <Skeleton width={150} height={16} />
          <Skeleton width={100} height={16} />
        </div>
        <Skeleton width={120} height={40} className="max-lg:mt-5" />
      </div>
      <div className="w-full px-3 min-[400px]:px-6">
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={index}
            className={`${index !== 0 && "border-b"} flex flex-col lg:flex-row items-center py-6 border-gray-200 gap-6 w-full`}
          >
            <Skeleton width={70} height={70} className="rounded-md" />
            <div className="flex flex-row items-center w-full">
              <div className="grid grid-cols-1 lg:grid-cols-2 w-full gap-y-3">
                <div className="flex items-center">
                  <div className="space-y-2">
                    <Skeleton width={200} height={20} />
                    <Skeleton width={150} height={16} />
                  </div>
                </div>
                <div className="grid grid-cols-5 gap-4">
                  <div className="col-span-5 lg:col-span-1">
                    <Skeleton width={80} height={16} />
                    <Skeleton width={60} height={16} />
                  </div>
                  <div className="col-span-5 lg:col-span-4 flex justify-end">
                    <Skeleton width={80} height={16} />
                    <Skeleton width={60} height={16} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="w-full border-t border-gray-200 px-6 py-6 justify-end flex">
        <Skeleton width={200} height={20} />
      </div>
    </div>
  );

  return (
    <section className="mx-auto max-w-screen-xl px-3 md:px-5 py-10 space-y-5 relative">
      <div className="w-full max-w-7xl px-4 md:px-5 lg-6 mx-auto">
        <h2 className="font-manrope font-bold text-2xl leading-10 text-black text-left mb-2 flex items-center">
          <FaRegFileAlt className="mr-2" /> Lịch sử đặt hàng của bạn
        </h2>

        { profile && !isLoading ? (
          orders.length > 0 ? (
            orders.map((order) => (
              <div
                key={order.id}
                className="main-box border border-gray-200 rounded-xl pt-4 max-w-xl max-lg:mx-auto lg:max-w-full mb-6"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between px-6 pb-6 border-b border-gray-200">
                  <div className="space-y-1">
                    <p className="font-bold text-sm text-black">
                      Mã đơn hàng:{" "}
                      <span className="text-indigo-600 font-medium">{order.code}</span>
                    </p>
                    <p className="font-bold text-sm text-black">
                      Trạng thái đơn hàng:{" "}
                      <span
                        className={`font-medium ${
                          order.status == 0
                            ? "text-red-500"
                            : order.status == 1
                            ? "text-yellow-500"
                            : order.status == 2
                            ? "text-blue-500"
                            : "text-green-500"
                        }`}
                      >
                        {order.status == 0
                          ? "Đã hủy"
                          : order.status == 1
                          ? "Chờ xử lý"
                          : order.status == 2
                          ? "Đang giao hàng"
                          : "Đã giao hàng"}
                      </span>
                    </p>
                    <p className="font-bold text-sm text-black">
                      Đơn vị vận chuyển:{" "}
                      <span className={`${order.unit ? "underline underline-offset-2" : ""} text-red-500 font-medium`}>
                        {order.unit ? <Link target="_blank" to={order.link}>{order.unit}</Link> : "Chưa cập nhật"}
                      </span>
                    </p>
                    <p className="font-bold text-sm text-black flex items-center gap-1">
                      Mã vận đơn:{" "}
                      {order.shippingCode ? (
                        <div className="flex items-center">
                          <span className="text-indigo-700 font-medium">
                            {order.shippingCode}
                          </span>
                          <CopyToClipboard text={order.shippingCode} onCopy={handleCopy}>
                            <FaRegCopy className="text-gray-500 ml-2 cursor-pointer" />
                          </CopyToClipboard>
                        </div>
                      ) : (
                        <span className="text-red-500 font-medium">Chưa cập nhật</span>
                      )}
                    </p>
                    <button
                      onClick={() => openPopup(order)}
                      className="text-sm text-blue-600 hover:underline cursor-pointer font-bold"
                    >
                      Xem chi tiết
                    </button>
                  </div>
                  {order.status == 1 && (
                    <button
                      disabled={mutationCancelOrder.isPending}
                      onClick={() => openConfirmPopup(order)}
                      className="rounded-full py-3 px-7 font-semibold text-sm leading-7 text-red-500 border border-red-400 max-lg:mt-5 shadow-sm shadow-transparent transition-all duration-500 hover:bg-red-300 hover:text-white cursor-pointer disabled:opacity-50"
                    >
                      {mutationCancelOrder.isPending ? (
                        <div className="w-5 h-5 mx-auto border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        "Hủy đơn hàng"
                      )}
                    </button>
                  )}
                </div>

                <div className="w-full px-3 min-[400px]:px-6">
                  {order.product_order.map((item, index) => (
                    <div
                      key={item.id}
                      className={`${index !== 0 && "border-b"} flex flex-col lg:flex-row items-center py-6 border-gray-200 gap-6 w-full`}
                    >
                      <div className="img-box max-lg:w-full lg:max-w-[70px] aspect-[1/1] border rounded-md border-gray-200">
                        <Zoom zoomMargin={50} transitionDuration={500}>
                          <img
                            src={`${checkImageUrl(item.product.image)}`}
                            className="aspect-square w-full rounded-xl object-contain"
                          />
                        </Zoom>
                      </div>
                      <div className="flex flex-row items-center w-full">
                        <div className="grid grid-cols-1 lg:grid-cols-2 w-full">
                          <div className="flex items-center">
                            <div>
                              <h2 className="font-semibold text-lg leading-8 text-black mb-1">
                                {item.product.name}
                              </h2>
                              <div className="flex items-center">
                                <p className="font-medium text-[15px] leading-7 text-black pr-4 mr-4 border-r-2 border-gray-400">
                                  Màu sắc: <span className="text-gray-700">{item.colorName || "Không có"}</span>
                                </p>
                                <p className="font-medium text-[15px] leading-7 text-black">
                                  Số lượng: <span className="text-gray-700">{item.quantity}</span>
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-5">
                            <div className="col-span-5 lg:col-span-1 flex items-center max                            lg:mt-3">
                              <div className="flex gap-3 lg:block">
                                <p className="font-semibold text-md leading-7 text-black">
                                  Giá sản phẩm:
                                </p>
                                <p className="lg:mt-1 font-medium text-[15px] leading-7">
                                  {formatVND(item.price)}
                                </p>
                              </div>
                            </div>
                            <div className="col-span-5 lg:col-span-4 flex items-center justify-end max-lg:mt-3">
                              <div className="flex gap-3 lg:block">
                                <p className="font-semibold text-md whitespace-nowrap leading-7 text-black">
                                  Tổng tiền:
                                </p>
                                <p className="font-medium text-[15px] whitespace-nowrap leading-7 lg:mt-1 text-red-500">
                                  {formatVND(item.price * item.quantity)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="w-full border-t border-gray-200 px-6 flex flex-col lg:flex-row items-center justify-between">
                  <p className="font-semibold text-lg text-black py-6 text-right w-full">
                    Tổng tiền thanh toán:{" "}
                    <span className="text-red-600">{formatVND(order.totalPrice)}</span>
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center space-y-5 my-10">
                <img src={empty} className="mx-auto max-w-52 opacity-50 w-full" alt="empty" />
                <p className="text-center text-gray-500">Bạn chưa có đơn hàng nào.</p>
            </div>
          )
        ) : (
          Array.from({ length: 2 }).map((_, index) => <OrderSkeleton key={index} />)
        )}

        {selectedOrder && (
          <Dialog open={isOpen} onClose={closePopup} className="relative z-50">
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
              <DialogPanel className="max-w-lg w-full bg-white rounded-lg p-6">
                <div className="flex justify-between items-center">
                  <DialogTitle className="text-lg font-bold text-black">
                    Thông tin chi tiết
                  </DialogTitle>
                  <button onClick={closePopup} className="cursor-pointer">
                    <XMarkIcon className="h-6 w-6 text-gray-500 hover:text-red-500" />
                  </button>
                </div>
                <div className="mt-4 space-y-2">
                  <p className="font-bold text-sm text-black">
                    Mã đơn hàng:{" "}
                    <span className="text-indigo-600 font-medium">{selectedOrder.code}</span>
                  </p>
                    <p className="font-bold text-sm text-black">
                      Đơn vị vận chuyển:{" "}
                      <span className={`${selectedOrder.unit ? "text-indigo-700 underline underline-offset-2" : "text-red-500"} font-medium`}>
                        {selectedOrder.unit ? <Link to={selectedOrder.link}>{selectedOrder.unit}</Link> : "Chưa cập nhật"}
                      </span>
                    </p>
                    <p className="font-bold text-sm text-black">
                      Mã vận đơn:{" "}
                      {selectedOrder.shippingCode ? (
                        <CopyToClipboard text={selectedOrder.shippingCode} onCopy={handleCopy}>
                          <span className="text-indigo-700 font-medium cursor-pointer hover:underline">
                            {selectedOrder.shippingCode}
                          </span>
                        </CopyToClipboard>
                      ) : (
                        <span className="text-red-500 font-medium">Chưa cập nhật</span>
                      )}
                    </p>
                  <p className="font-bold text-sm text-black">
                    Thời gian đặt hàng:{" "}
                    <span className="text-gray-700 font-medium">{selectedOrder.time}</span>
                  </p>
                  <p className="font-bold text-sm text-black">
                    Họ và tên:{" "}
                    <span className="text-gray-700 font-medium">{selectedOrder.fullName}</span>
                  </p>
                  <p className="font-bold text-sm text-black">
                    Số điện thoại:{" "}
                    <span className="text-gray-700 font-medium">{selectedOrder.phone}</span>
                  </p>
                  <p className="font-bold text-sm text-black">
                    Email:{" "}
                    <span className="text-gray-700 font-medium">{selectedOrder.email}</span>
                  </p>
                  <p className="font-bold text-sm text-black">
                    Địa chỉ:{" "}
                    <span className="text-gray-700 font-medium">{selectedOrder.address}</span>
                  </p>
                  <p className="font-bold text-sm text-black">
                    Hình thức thanh toán:{" "}
                    <span className="text-gray-700 font-medium">
                      {selectedOrder.type == 1 ? "Tại cửa hàng" : "Chuyển khoản"}
                    </span>
                  </p>
                  <p className="font-bold text-sm text-black">
                    Trạng thái đơn hàng:{" "}
                    <span
                      className={`font-medium ${
                        selectedOrder.status == 0
                          ? "text-red-500"
                          : selectedOrder.status == 1
                          ? "text-yellow-500"
                          : selectedOrder.status == 2
                          ? "text-blue-500"
                          : "text-green-500"
                      }`}
                    >
                      {selectedOrder.status == 0
                        ? "Đã hủy"
                        : selectedOrder.status == 1
                        ? "Chờ xử lý"
                        : selectedOrder.status == 2
                        ? "Đang giao hàng"
                        : "Đã giao hàng"}
                    </span>
                  </p>
                </div>
              </DialogPanel>
            </div>
          </Dialog>
        )}

        {orderToCancel && (
          <Dialog open={isConfirmOpen} onClose={closeConfirmPopup} className="relative z-50">
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
              <DialogPanel className="max-w-sm w-full bg-white rounded-lg p-6">
                <div className="flex justify-between items-center">
                  <DialogTitle className="text-lg font-bold text-black">
                    Xác nhận hủy đơn hàng
                  </DialogTitle>
                  <button onClick={closeConfirmPopup} className="cursor-pointer">
                    <XMarkIcon className="h-6 w-6 text-gray-500 hover:text-red-500" />
                  </button>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-700">
                    Bạn có chắc chắn muốn hủy đơn hàng{" "}
                    <span className="font-bold text-indigo-600">{orderToCancel.code}</span> không?
                  </p>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={closeConfirmPopup}
                    className="py-2 px-4 bg-gray-200 cursor-pointer text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    Không
                  </button>
                  <button
                    onClick={handleCancelOrder}
                    disabled={mutationCancelOrder.isPending}
                    className="py-2 px-4 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50"
                  >
                    {mutationCancelOrder.isPending ? (
                      <div className="w-5 h-5 cursor-pointer mx-auto border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      "Có"
                    )}
                  </button>
                </div>
              </DialogPanel>
            </div>
          </Dialog>
        )}
      </div>
    </section>
  );
}