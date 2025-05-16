import { Helmet } from "react-helmet-async";
import FlashSaleEdit from "../../../components/admin/FlashSaleManage/Edit";

export default function FlashSaleEditPage() {
    
    return (
        <>
            <Helmet>
                <title>Chỉnh sửa giảm giá</title>
            </Helmet>
            <FlashSaleEdit />
        </>
    )
}