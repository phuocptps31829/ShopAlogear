import { Helmet } from "react-helmet-async";
import useScrollToTop from "../../hooks/useScrollToTop";
import Forgot from "../../components/client/Account/Forgot";
const URL_DOMAIN = import.meta.env.VITE_URL_DOMAIN;

export default function ForgotPage() {
  useScrollToTop();
  return (
    <>
      <Helmet>
        <title>AloGear - Quên mật khẩu</title>
        <meta
          name="description"
          content="Khôi phục mật khẩu của bạn tại AloGear."
        />
        <link rel="canonical" href={`${URL_DOMAIN}/account/forgot`} />
      </Helmet>
      <Forgot />
    </>
  );
}
