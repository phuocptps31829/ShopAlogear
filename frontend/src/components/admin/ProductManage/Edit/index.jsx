import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ProductApi } from "../../../../services/productApi";
import ProductHasPrice from "./ProductHasPrice";
import ProductNoPrice from "./ProductNoPrice";
import Service from "./Service";
import SamplePack from "./SamplePack";
import AdminPageSkeleton from "../../../ui/SkeletonLoadingAdmin";

const switchPagesByType = (data) => {
  switch (data?.type) {
    case 1:
      return <ProductHasPrice data={data} />;
    case 2:
      return <ProductNoPrice data={data} />;
    case 3:
      return <Service data={data} />;
    case 4:
      return <SamplePack data={data} />;
    default:
      return null;
  }
};

export default function ProductEdit() {
  const { id } = useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["productAdmin", id],
    queryFn: () => ProductApi.getOneProductAdmin(id),
    keepPreviousData: true,
  });
  if (isLoading) return <AdminPageSkeleton />;
  return (
    <div className="w-full rounded-lg bg-white px-7 py-6 min-h-[calc(100vh-140px)] shadow-sm border border-gray-200">
      <h1 className="mb-4 text-2xl font-bold">Chỉnh sửa sản phẩm</h1>
      {switchPagesByType(data)}
    </div>
  );
}
