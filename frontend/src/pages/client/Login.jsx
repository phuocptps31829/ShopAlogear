import { Helmet } from "react-helmet-async";
import useScrollToTop from "../../hooks/useScrollToTop";
import Login from "../../components/client/Account/Login";
const URL_DOMAIN = import.meta.env.VITE_URL_DOMAIN;

export default function LoginPage() {
  useScrollToTop();
  return (
    <>
      <Helmet>
        <title>AloGear - Đăng nhập</title>
        <meta
          name="description"
          content="Đăng nhập tài khoản để trải nghiệm mua sắm tốt nhất tại AloGear."
        />
        <link rel="canonical" href={`${URL_DOMAIN}/account/login`} />
      </Helmet>
      <Login />
    </>
  )
}
