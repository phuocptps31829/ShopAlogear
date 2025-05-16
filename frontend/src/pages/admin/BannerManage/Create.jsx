import { Helmet } from "react-helmet-async";
import BannerCreate from "../../../components/admin/BannerManage/Add";

export default function BannerCreatePage() {
  return <>
    <Helmet>
      <title>Thêm banner mới</title>
    </Helmet>
    <BannerCreate />
  </>;
}
