import { Helmet } from "react-helmet-async";
import useScrollToTop from "../../hooks/useScrollToTop";
import Register from "../../components/client/Account/Register";
const URL_DOMAIN = import.meta.env.VITE_URL_DOMAIN;

export default function RegisterPage() {
  useScrollToTop();
  return (
    <>
      <Helmet>
        <title>AloGear - Đăng ký</title>
        <meta
          name="description"
          content="Đăng ký tài khoản tại AloGear."
        />
        <link rel="canonical" href={`${URL_DOMAIN}/account/register`} />
      </Helmet>
      <Register />
    </>
  );
}
