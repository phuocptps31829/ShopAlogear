import { Helmet } from "react-helmet-async";
import OrderList from "../../../components/admin/OrderManage/List";

export default function OrderListPage() {
    
    return (
        <>
            <Helmet>
                <title>Danh sách đơn hàng</title>
            </Helmet>
            <OrderList />
        </>
    )
}