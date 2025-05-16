import { Helmet } from "react-helmet-async";
import BrandList from "../../../components/admin/BrandManage/List";

export default function BrandListPage() {
    
    return (
        <>
            <Helmet>
                <title>Danh sách thương hiệu</title>
            </Helmet>
            <BrandList />
        </>
    )
}