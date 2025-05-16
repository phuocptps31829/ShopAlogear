import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const AdminPageSkeleton = () => {
  return (
    <div className="w-[100%] rounded-lg bg-white px-7 py-6 min-h-[calc(100vh-140px)] shadow-sm border border-gray-200">
      <Skeleton height={30} width={150} style={{ marginBottom: "20px" }} />

      {Array.from({ length: 7 }).map((_, index) => (
        <div key={index} style={{ marginBottom: "10px" }}>
          <Skeleton height={40} width="100%" />
        </div>
      ))}

      <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
        <Skeleton height={30} width={80} />
        <Skeleton height={30} width={100} />
      </div>
    </div>
  );
};

export default AdminPageSkeleton;
