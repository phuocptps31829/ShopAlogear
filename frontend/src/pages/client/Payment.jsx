import { Helmet } from "react-helmet-async";
import useScrollToTop from "../../hooks/useScrollToTop";
import Payment  from "../../components/client/Payment";
const URL_DOMAIN = import.meta.env.VITE_URL_DOMAIN;

export default function PaymentPage() {
    useScrollToTop();
    return (
        <>
            <Helmet>
                <title>AloGear - Thanh toán</title>
                <meta
                    name="description"
                    content="Thanh toán đơn hàng của bạn tại AloGear."
                />
                <link rel="canonical" href={`${URL_DOMAIN}/checkout`} />
            </Helmet>
            <Payment />
        </>
    )
}