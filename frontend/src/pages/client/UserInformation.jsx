import { Helmet } from "react-helmet-async";
import useScrollToTop from "../../hooks/useScrollToTop";
import UserInformation from "../../components/client/UserInformation";
const URL_DOMAIN = import.meta.env.VITE_URL_DOMAIN;

export default function UserInformationPage() {
  useScrollToTop();
  return (
    <>
      <Helmet>
        <title>AloGear - Thông tin người dùng</title>
        <meta
          name="description"
          content="Thông tin cá nhân của bạn tại AloGear."
        />
        <link rel="canonical" href={`${URL_DOMAIN}/profile/information`} />
      </Helmet>
      <UserInformation />
    </>
  );
}
