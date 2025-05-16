import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css"; 

const LoadingPage = () => {
  return (
    <div className="mx-auto max-w-screen-xl px-3 md:px-5 py-4">
      <Skeleton height={40} width="80%" className="mb-3"  />
      <Skeleton count={20} height={25} className="mb-1"  />
    </div>
  );
};

export default LoadingPage;