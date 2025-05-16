import { Helmet } from "react-helmet-async";
import CooperateList from "../../../components/admin/CooperateManage/List";

export default function CooperateListPage() {
    
    return (
        <>
            <Helmet>
                <title>Danh sách dự án</title>
            </Helmet>   
            <CooperateList />
        </>
    )
}