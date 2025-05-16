import { Helmet } from "react-helmet-async";
import UserCreate from "../../../components/admin/UserManage/Add"

export default function UserCreatePage() {
    
    return (
        <>
            <Helmet>
                <title>Thêm người dùng mới</title>
            </Helmet>
            <UserCreate />
        </>
    )
}