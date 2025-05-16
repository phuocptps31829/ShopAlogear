import useScrollToTop from "../../hooks/useScrollToTop";
import ProductDetails from '../../components/client/ProductDetails';

export default function ProductDetailsPage() {
    useScrollToTop();
    return (
        <ProductDetails />
    )
}