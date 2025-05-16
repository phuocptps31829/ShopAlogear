import { Helmet } from "react-helmet-async";
import ProductCreate from "../../../components/admin/ProductManage/Add";

export default function ProductCreatePage() {
    
    return (
        <>
            <Helmet>
                <title>Thêm sản phẩm mới</title>
            </Helmet>
            <ProductCreate />
        </>
    )
}