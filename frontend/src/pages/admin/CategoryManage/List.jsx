import { Helmet } from "react-helmet-async";
import CategoryList from "../../../components/admin/CategoryManage/List";

export default function CategoryListPage() {
    
    return (
        <>
            <Helmet>
                <title>Danh sách danh mục</title>
            </Helmet>
            <CategoryList />
        </>
    )
}