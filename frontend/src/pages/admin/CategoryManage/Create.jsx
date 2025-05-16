import { Helmet } from "react-helmet-async";
import CategoryCreate from "../../../components/admin/CategoryManage/Add"

export default function CategoryCreatePage() {
    
    return (
        <>
            <Helmet>
                <title>Thêm danh mục mới</title>
            </Helmet>
            <CategoryCreate />
        </>
    )
}