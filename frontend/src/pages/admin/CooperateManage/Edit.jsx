import { Helmet } from "react-helmet-async";
import CooperatesEdit from "../../../components/admin/CooperateManage/Edit";

export default function CooperateEdit() {
    
    return (
        <>
            <Helmet>
                <title>Chỉnh sửa dự án</title>
            </Helmet>
            <CooperatesEdit />
        </>
    )
}