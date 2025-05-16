import { Helmet } from "react-helmet-async";
import useScrollToTop from "../../hooks/useScrollToTop";
import Cart  from "../../components/client/Cart"
const URL_DOMAIN = import.meta.env.VITE_URL_DOMAIN;

export default function CartPage() {
    useScrollToTop();
    return (
        <>
            <Helmet>
                <title>AloGear - Giỏ hàng</title>
                <meta
                    name="description"
                    content="Kiểm tra và chỉnh sửa giỏ hàng của bạn tại AloGear."
                />
                <link rel="canonical" href={`${URL_DOMAIN}/cart`} />
            </Helmet>
            <Cart />
        </>
    )
}