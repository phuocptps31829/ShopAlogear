import { Helmet } from "react-helmet-async";
import HomeTopSection from "../../components/client/Home/HomeTopSection";
import ProductSection from "../../components/client/Home/ProductSection";
import useScrollToTop from "../../hooks/useScrollToTop";
const URL_DOMAIN = import.meta.env.VITE_URL_DOMAIN;

export default function HomePage() {
  useScrollToTop();
  return (
    <>
      <Helmet>
        <title>AloGear - Thiết bị âm thanh chuyên nghiệp</title>
        <meta
          name="description"
          content="Khám phá bộ sưu tập nhạc cụ cao cấp tại AloGear. Chất lượng tuyệt hảo, âm thanh đỉnh cao dành cho người yêu nhạc."
        />
        <link rel="canonical" href={URL_DOMAIN} />
      </Helmet>
      <HomeTopSection />
      <ProductSection />
    </>
  );
}
