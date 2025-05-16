import useScrollToTop from "../../hooks/useScrollToTop";
import ServiceDetails from '../../components/client/ServiceDetails';

export default function ServiceDetailsPage() {
    useScrollToTop();
    return (
        <ServiceDetails />
    )
}