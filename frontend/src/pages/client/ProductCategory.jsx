import { Helmet } from "react-helmet-async";
import useScrollToTop from "../../hooks/useScrollToTop";
import ProductCategory from '../../components/client/ProductCategory';
const URL_DOMAIN = import.meta.env.VITE_URL_DOMAIN;

export default function ProductCategoryPage() {
    useScrollToTop();
    return (
        <>
            <Helmet>
                <title>AloGear - Danh mục sản phẩm</title>
                <meta
                    name="description"
                    content="Khám phá bộ sưu tập sản phẩm tại AloGear."
                />
                <link rel="canonical" href={`${URL_DOMAIN}/category/products`} />
            </Helmet>
            <ProductCategory />
        </>
    )
}