import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PropTypes from "prop-types";
import OtherProducts from "../../../components/client/Home/ProductSection/OtherProducts";

export default function BottomRelated({ data, isLoading }) {
  const { slug } = useParams();
  const [categoryID, setCategoryID] = useState(null);

  useEffect(() => {
    if (isLoading) return;
    setCategoryID(data.categories[0].id);
  }, [data, isLoading]);

  return (
    <section className="my-8">
      {isLoading ? (
        "Đang tải dữ liệu..."
      ) : (
        <OtherProducts
          title="Sản phẩm liên quan"
          categoryID={categoryID}
          removeViewAll={true}
          excludeSlugs={[slug]}
          limit={999}
        />
      )}
    </section>
  );
}

BottomRelated.propTypes = {
  data: PropTypes.object,
  isLoading: PropTypes.bool,
};
