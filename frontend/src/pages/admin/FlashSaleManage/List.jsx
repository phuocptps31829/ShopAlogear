import { Helmet } from "react-helmet-async";
import FlashSaleList from "../../../components/admin/FlashSaleManage/List";

export default function FlashSaleListPage() {
    
    return (
        <>
            <Helmet>
                <title>Danh sách giảm giá</title>
            </Helmet>
            <FlashSaleList />
        </>
    )
}