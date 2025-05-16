import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PropTypes from "prop-types";
import InstallationService from "../../../components/client/Home/ProductSection/InstallationService";

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
        <InstallationService
          title="Dịch vụ khác"
          categoryID={categoryID}
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
