import { Helmet } from "react-helmet-async";
import BannerList from "../../../components/admin/BannerManage/List";

export default function BannerListPage() {
    
    return (
        <>
            <Helmet>
                <title>Danh sách banner</title>
            </Helmet>
            <BannerList />
        </>
    )
}