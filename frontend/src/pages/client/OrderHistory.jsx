import { Helmet } from "react-helmet-async";
import OrderHistory from "../../components/client/OrderHistory";
import useScrollToTop from "../../hooks/useScrollToTop";
const URL_DOMAIN = import.meta.env.VITE_URL_DOMAIN;

export default function OrderHistoryPage() {
  useScrollToTop();
  return (
    <>
      <Helmet>
        <title>AloGear - Đơn hàng của bạn</title>
        <meta
          name="description"
          content="Xem thông tin chi tiết về đơn hàng của bạn tại AloGear."
        />
        <link rel="canonical" href={`${URL_DOMAIN}/profile/orderhistory`} />
      </Helmet>
      <OrderHistory />
    </>
  );
}
