import { Helmet } from "react-helmet-async";
import ProductList from "../../../components/admin/ProductManage/List";

export default function ProductListPage() {
    
    return (
        <>
            <Helmet>
                <title>Danh sách sản phẩm</title>
            </Helmet>
            <ProductList />
        </>
    )
}