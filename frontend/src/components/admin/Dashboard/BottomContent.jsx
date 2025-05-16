import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { dashBoardApi } from "../../../services/dashboardApi";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { ProductApi } from "../../../services/productApi";
import {
  Dialog,
  DialogBody,
  DialogFooter,
  Button,
} from "@material-tailwind/react";
import { checkImageUrl } from "../../../utils/checkImageUrl";
import { formatVND } from "../../../utils/formatPrice";

export default function BottomContent() {
  const [timeCreatedProduct, setTimeCreatedProduct] = useState({
    startTime: null,
    endTime: null,
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false); // Trạng thái để mở/đóng popup
  const [selectedDate, setSelectedDate] = useState(null); // Lưu ngày được chọn để hiển thị trong popup

  const { data: dataProducts, isLoading: loadingProducts } = useQuery({
    queryKey: ["productsByTime", { all: 1, startTime: timeCreatedProduct.startTime, endTime: timeCreatedProduct.endTime }],
    queryFn: () => ProductApi.getAllProductsAdmin({
      all: 1,
      startTime: timeCreatedProduct.startTime,
      endTime: timeCreatedProduct.endTime,
    }),
    enabled: !!timeCreatedProduct.startTime && !!timeCreatedProduct.endTime,
    keepPreviousData: true,
  });

  const { data: topView, isLoading: loadingTopView } = useQuery({
    queryKey: ["dashboardTopView"],
    queryFn: () => dashBoardApi.getViewTopProduct(),
    keepPreviousData: true,
  });
  const { data: newOrders, isLoading: loadingNewOrders } = useQuery({
    queryKey: ["dashboardNewOrders"],
    queryFn: () => dashBoardApi.getNewOrder(),
    keepPreviousData: true,
  });
  const { data: newProduct, isLoading: loadingNewProduct } = useQuery({
    queryKey: ["dashboardNewProduct"],
    queryFn: () => dashBoardApi.getAddNewProduct(),
    keepPreviousData: true,
  });

  // Hàm xử lý khi click vào div
  const handleProductClick = (addDate) => {
    const date = new Date(addDate);
    // Set startTime và endTime là cùng ngày
    const startTime = new Date(date.setHours(0, 0, 0, 0)).toISOString();
    const endTime = new Date(date.setHours(23, 59, 59, 999)).toISOString();
    setTimeCreatedProduct({ startTime, endTime });
    setSelectedDate(addDate); // Lưu ngày để hiển thị trong popup
    setIsDialogOpen(true); // Mở popup
  };

  // Hàm đóng popup
  const closeDialog = () => {
    setIsDialogOpen(false);
    setTimeCreatedProduct({ startTime: null, endTime: null }); // Reset khi đóng
  };

  return (
    <div className="mt-4 w-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
        <div className="border rounded-lg shadow-md w-full overflow-hidden" style={{ height: "calc(100vh - 315px)", backgroundColor: "oklch(0.94 0 0)" }}>
          <h2 className="text-lg font-semibold p-3 px-4 underline underline-offset-10">
            Sản phẩm đang được chú ý
          </h2>
          <div className="overflow-y-auto px-4 mr-2 custom-scrollbar-admin" style={{ height: "calc(100vh - 390px)" }}>
            {loadingTopView ? (
              <Skeleton count={7} height={28} className="mb-2" />
            ) : (
              topView?.length > 0 ? (
                topView?.map((product, index) => (
                  <div className="flex justify-between items-center hover:bg-gray-500 py-2 px-1 rounded-md cursor-pointer hover:text-white group" key={index}>
                    <Link to={`/products/${product?.slug}`} target="_blank" className="text-gray-800 max-w-[60%] group-hover:text-white line-clamp-1">{product?.name}</Link>
                    <span className="font-medium">{product?.totalView || 0} lượt xem</span>
                  </div>
                ))
              ) : (
                <span className="block text-center text-gray-700">Không có sản phẩm nào.</span>
              )
            )}
          </div>
        </div>

        <div className="border rounded-lg shadow-md w-full overflow-hidden" style={{ height: "calc(100vh - 315px)", backgroundColor: "oklch(0.94 0 0)" }}>
          <h2 className="text-lg font-semibold p-3 px-4 underline underline-offset-10">
            Đơn hàng mới
          </h2>
          <div className="overflow-y-auto px-4 mr-2 custom-scrollbar-admin" style={{ height: "calc(100vh - 390px)" }}>
            {loadingNewOrders ? (
              <Skeleton count={7} height={28} className="mb-2" />
            ) : (
              newOrders?.length > 0 ? (
                newOrders?.map((order, index) => (
                  <Link to={`/admin/orders?orderCode=${order?.code}`} className="flex rounded-md py-2 px-1 hover:bg-gray-500 justify-between items-center group" key={index}>
                    <span className="text-gray-900 group-hover:text-white">{order?.code}</span>
                    <span className="text-green-600 font-medium group-hover:text-green-300">{order?.time}</span>
                  </Link>
                ))
              ) : (
                <span className="block text-center text-gray-700">Không có đơn hàng nào.</span>
              )
            )}
          </div>
        </div>

        <div className="border rounded-lg shadow-md w-full overflow-hidden" style={{ height: "calc(100vh - 315px)", backgroundColor: "oklch(0.94 0 0)" }}>
          <h2 className="text-lg font-semibold p-3 px-4 underline underline-offset-10">
            Sản phẩm đã thêm gần đây
          </h2>
          <div className="overflow-y-auto px-4 mr-2 custom-scrollbar-admin" style={{ height: "calc(100vh - 390px)" }}>
            {loadingNewProduct ? (
              <Skeleton count={7} height={28} className="mb-2" />
            ) : (
              newProduct?.length > 0 ? (
                newProduct?.map((product, index) => (
                  <div
                    className="flex justify-between items-center text-green-600 hover:bg-gray-500 py-2 px-1 rounded-md cursor-pointer group"
                    key={index}
                    onClick={() => handleProductClick(product?.addDate)}
                  >
                    <span className="text-gray-900 group-hover:text-white">{product?.addDate}</span>
                    <span className="font-medium group-hover:text-green-300">{product?.totalProducts} sản phẩm</span>
                  </div>
                ))
              ) : (
                <span className="block text-center text-gray-700">Không có sản phẩm nào.</span>
              )
            )}
          </div>
        </div>
      </div>

      <Dialog open={isDialogOpen} handler={closeDialog} className="max-w-lg">
        <DialogBody className="max-h-[60vh] overflow-y-auto">
          <h2 className="text-lg font-semibold mb-4">Sản phẩm thêm vào ngày {selectedDate}</h2>
          {loadingProducts ? (
            <Skeleton count={4} height={30} className="mb-2" />
          ) : dataProducts?.totalRecords > 0 ? (
            <ul className="space-y-2 divide-y divide-gray-300">
              {dataProducts?.products?.map((product, index) => (
                <li key={index} className="py-2">
                  <div className="flex items-center gap-3">
                    <img src={checkImageUrl(product?.image)} alt="" className="w-7 aspect-[1/1] object-cover" />
                    <Link to={`/products/${product?.slug}`} target="_blank" className="font-semibold text-sm hover:text-blue-500">
                      {product?.name}
                    </Link>
                    {product?.discount > 0 ? (
                      <div className="grow text-sm font-medium gap-3 flex justify-end">
                        <div>{formatVND(product?.discount)}</div>
                        <div className="text-gray-400 line-through">{formatVND(product?.price)}</div>
                      </div>
                    ) : (
                      <div className="text-sm font-medium text-red-500 grow text-right">Không có giá</div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <span className="block text-center text-gray-700">Không có sản phẩm nào.</span>
          )}
        </DialogBody>
        <DialogFooter>
          <Button variant="gradient" color="red" onClick={closeDialog} className="cursor-pointer">
            Đóng
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}