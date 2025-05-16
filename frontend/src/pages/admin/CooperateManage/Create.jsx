import { Helmet } from "react-helmet-async";
import CooperatesCreate from "../../../components/admin/CooperateManage/Add";

export default function CooperateCreatePage() {
    
    return (
        <>
            <Helmet>
                <title>Thêm dự án mới</title>
            </Helmet>
            <CooperatesCreate />   
        </>
    )
}