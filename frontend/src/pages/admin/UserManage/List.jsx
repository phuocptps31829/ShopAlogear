import { Helmet } from "react-helmet-async";
import UsersList from "../../../components/admin/UserManage/List";

export default function UserListPage() {
    
    return (
        <>
            <Helmet>
                <title>Danh sách người dùng</title>
            </Helmet>
            <UsersList />
        </>
    )
}