import { Helmet } from "react-helmet-async";
import ProductEdit from "../../../components/admin/ProductManage/Edit";

export default function ProductEditPage() {
    
    return (
        <>
            <Helmet>
                <title>Chỉnh sửa sản phẩm</title>
            </Helmet>
            <ProductEdit />
        </>
    )
}