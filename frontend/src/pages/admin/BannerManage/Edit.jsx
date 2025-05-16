import { Helmet } from "react-helmet-async";
import BannerEdit from "../../../components/admin/BannerManage/Edit";

export default function BannerEditPage() {
    
    return (
        <>
            <Helmet>
                <title>Chỉnh sửa banner</title>
            </Helmet>
            <BannerEdit />
        </>
    )
}