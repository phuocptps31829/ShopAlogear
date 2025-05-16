import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import PropTypes from "prop-types";

const ProductSkeleton = ({ typeProduct = 1 }) => {
  return (
    <>
      {typeProduct === 1 && (
        <div className="bg-white rounded-2xl shadow-md p-3">
          <Skeleton height={180} className="rounded-lg" />

          <div className="flex justify-center mt-2">
            <Skeleton width={150} height={20} className="mt-2" />
          </div>

          <div className="flex justify-center mt-2">
            <Skeleton width={100} height={20} className="mt-2" />
          </div>

          <div className="flex justify-center mt-2 space-x-2">
            <Skeleton width={80} height={18} />
            <Skeleton width={35} height={18} />
          </div>

          <div className="flex justify-center mt-1">
            <Skeleton width={150} height={30} className="mt-2" />
          </div>
        </div>
      )}
      {typeProduct === 2 && (
        <div className="bg-white rounded-2xl shadow-md p-3">
          <Skeleton height={180} className="rounded-lg" />

          <Skeleton width={170} height={18} className="mt-2 mb-5" />

          <div className="flex flex-col justify-center mt-2">
            <Skeleton width={130} height={15} className="mt-2" />
            <Skeleton width={130} height={15} className="mt-2" />
            <Skeleton width={130} height={15} className="mt-2" />
          </div>

          <div className="flex justify-center mt-1">
            <Skeleton width={150} height={30} className="mt-2" />
          </div>
        </div>
      )}
      {typeProduct === 3 && (
        <Skeleton className="rounded-lg aspect-[9/7] sm:min-h-[170px]" />
      )}
    </>
  );
};

ProductSkeleton.propTypes = {
  typeProduct: PropTypes.number,
};

export default ProductSkeleton;
