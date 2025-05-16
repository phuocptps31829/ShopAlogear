import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import paymentGif from "../../assets/images/payment.gif";
import useScrollToTop from "../../hooks/useScrollToTop";
const URL_DOMAIN = import.meta.env.VITE_URL_DOMAIN;

export default function PaymentSuccess() {
    useScrollToTop();
    return (
        <>
            <Helmet>
                <title>AloGear - Thanh toán thành công</title>
                <meta
                    name="description"
                    content="Thanh toán đơn hàng của bạn tại AloGear."
                />
                <link rel="canonical" href={`${URL_DOMAIN}/payment-success`} />
            </Helmet>
            <div className="flex items-center justify-center">
                <div className="px-10 py-5 text-center bg-white my-10 ">
                    <div className="flex items-center justify-center mb-3">
                        <img
                            src={ paymentGif }
                            alt="success"
                            className="w-36 h-36"
                        />
                    </div>
                    <div>
                        <h1 className="text-xl md:text-[22px] font-semibold">
                            Đặt hàng thành công !
                        </h1>
                        <p className="sm:text-[16px] text-[14px] mt-2 w-[60]% text-[#707982]">Chúng tôi sẽ sớm liên hệ tới bạn. <br /> Cảm ơn bạn đã tin tưởng và chọn lựa sản phẩm của <span className="font-semibold text-gray-700 italic">AloGear</span>.
                        </p>
                    </div>
                    <div className="mt-5 flex justify-center pb-4">
                        <Link className="border-gray-500 whitespace-nowrap border px-4 py-2 rounded-lg mr-4 text-gray-500 block text-[14px]" to="/">
                            Quay về trang chủ
                        </Link>
                        <Link className="bg-gray-500 px-4 py-2 whitespace-nowrap rounded-lg text-white block text-[14px]" to="/profile/orderhistory">
                            Xem lịch sử đặt
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
