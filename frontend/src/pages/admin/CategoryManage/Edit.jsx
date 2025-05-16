import { Helmet } from "react-helmet-async";
import CategoryEdit from "../../../components/admin/CategoryManage/Edit"

export default function CategoryEditPage() {
    
    return (
        <>
            <Helmet>
                <title>Chỉnh sửa danh mục</title>
            </Helmet>
            <CategoryEdit />
        </>
    )
}