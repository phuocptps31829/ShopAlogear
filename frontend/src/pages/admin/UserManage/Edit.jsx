import { Helmet } from "react-helmet-async";
import UserEdit from "../../../components/admin/UserManage/Edit"

export default function UserEditPage() {
    
    return (
        <>
            <Helmet>
                <title>Chỉnh sửa người dùng</title>
            </Helmet>
            <UserEdit />
        </>
    )
}