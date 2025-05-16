import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useParams, Navigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ProductApi } from "../../../services/productApi";
import TopInfo from "./TopInfo";
import BottomRelated from "./BottomRelated";

export default function ProductDetails() {
  const [searchParams, setSearchParams] = useSearchParams();
  const view = searchParams.get("view");
  const { slug } = useParams();

  const { data, error, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: () => ProductApi.getProductBySlug(slug),
    keepPreviousData: true,
  });

  const mutationIncreaseView = useMutation({
    mutationFn: ProductApi.increaseView,
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Đã xảy ra lỗi, vui lòng thử lại.";
      console.log(errorMessage);
    },
  });

  useEffect(() => {
    if (view == "1") {
      mutationIncreaseView.mutate(slug);
      searchParams.delete("view");
      setSearchParams(searchParams, { replace: true });
    }
  }, [view, mutationIncreaseView, slug, searchParams, setSearchParams]);

  const queryProps = { data, isLoading };

  if (error) return <Navigate to="/not-found" />;

  return (
    <div className="mx-auto max-w-screen-xl px-3 md:px-5 py-4 space-y-5">
      <TopInfo {...queryProps} />
      <BottomRelated {...queryProps} />
    </div>
  );
}
