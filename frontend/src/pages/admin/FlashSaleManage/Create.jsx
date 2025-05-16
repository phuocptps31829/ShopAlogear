import { Helmet } from "react-helmet-async";
import FlashSaleCreate from "../../../components/admin/FlashSaleManage/Add";

export default function FlashSaleCreatePage() {
  return (
    <>
      <Helmet>
        <title>Thêm giảm giá mới</title>
      </Helmet>
      <FlashSaleCreate />
    </>
  );
}
