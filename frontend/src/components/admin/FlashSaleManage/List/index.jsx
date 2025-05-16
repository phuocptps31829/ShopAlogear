import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ReactPaginate from "react-paginate";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GrFormNext, GrFormPrevious } from "react-icons/gr";
import { FaPlus } from "react-icons/fa6";
import { flashSaleApi } from "../../../../services/flashSaleApi";
import LoadingSpin from "../../../ui/LoadingSpin";
import { toast } from "react-toastify";
import { Dialog, DialogBody, DialogFooter, Button } from "@material-tailwind/react";
import { formatVND } from "../../../../utils/formatPrice";
import { IoCloseCircle } from "react-icons/io5";
import mediumZoom from "medium-zoom";
import { checkImageUrl } from "../../../../utils/checkImageUrl";
import { useSelector } from "react-redux";

export default function FlashSaleList() {
  const userProfile = useSelector((state) => state.auth.userProfile);
  const [openDialogDetail, setOpenDialogDetail] = useState(false);
  const [dataChildren, setDataChildren] = useState([]);
  const [nameSale, setNameSale] = useState("");
  const [pageCount, setPageCount] = useState(1);
  const [page, setPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const limit = 4;
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSaleId, setSelectedSaleId] = useState(null);
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["flashSaleListAdmin", { limit, page }],  
    queryFn: () => flashSaleApi.getAllFlashSaleAdmin({
      limit,
      page,
    }),
    keepPreviousData: true,
  });

  const mutationDeleteFlashSale = useMutation({
    mutationFn: flashSaleApi.deleteFlashSale,
    onSuccess: () => {
      toast.success("Xóa chương trình giảm giá thành công!");
      setOpenDialog(false);
      queryClient.invalidateQueries(["flashSaleListAdmin", { limit, page }]);
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Đã xảy ra lỗi, vui lòng thử lại.";
      toast.error(errorMessage);
      setOpenDialog(false);
    },
  });

  useEffect(() => {
    if(!data) return;
    setPageCount(data?.page)
    setTotalRecords(data?.totalRecords)
  }, [data]);

  const handleOpenDialog = (saleId) => {
    setSelectedSaleId(saleId);
    setOpenDialog(true);
  };

  const handleConfirmDelete = () => {
    if (selectedSaleId) {
      mutationDeleteFlashSale.mutate(selectedSaleId);
    }
  };

  const handleOpenDialogDetail = (sale) => {
    setOpenDialogDetail(true);
    setDataChildren(sale?.product_sales);
    setNameSale(sale?.name);
  }

  useEffect(() => {
    const images = document.querySelectorAll(".zoomable-image");
    mediumZoom(images, { margin: 20, background: "#000000A0" });
  }, [data]);

  return (
    <>
    <div className="w-full flex justify-between items-center mb-3 mt-1">
        <div className="w-full">
          <div className="relative flex justify-between w-full items-center gap-10">
            <div className="relative max-w-sm sm:min-w-[350px] w-full">
            </div>
            <Link to="/admin/flashsale/create" className="text-sm whitespace-nowrap text-white bg-blue-600 flex items-center font-medium px-4 py-2 rounded-md hover:bg-blue-800 transition duration-200 ease">
              Thêm mới <FaPlus className="inline-block ml-2" />
            </Link>
          </div>
        </div>
      </div>
      <div className="relative flex flex-col w-full h-full overflow-scroll text-gray-700 bg-white shadow-md rounded-lg bg-clip-border">
        <table className="w-full text-left table-auto min-w-max">
          <thead className="text-white bg-gradient-to-r from-[#141E30] to-[#89e2e3]">
            <tr>
              <th className="p-4 border-b border-slate-200">
                <p className="text-sm font-medium leading-none text-center">
                  STT
                </p>
              </th>
              <th className="p-4 border-b border-slate-200">
                <p className="text-sm font-medium leading-none text-center">
                  Tên chương trình
                </p>
              </th>
              <th className="p-4 border-b border-slate-200 text-center">
                <p className="text-sm font-medium leading-none">
                  Thời gian
                </p>
              </th>
              <th className="p-4 border-b border-slate-200 text-center">
                <p className="text-sm font-medium leading-none">
                  Trạng thái
                </p>
              </th>
              <th className="p-4 border-b border-slate-200 text-center">
                <p className="text-sm font-medium leading-none">
                  Loại chương trình
                </p>
              </th>
              <th className="p-4 border-b border-slate-200 text-center">
                <p className="text-sm font-medium leading-none">
                  Sản phẩm áp dụng
                </p>
              </th>
              {userProfile?.role != 3 && (
                <th className="p-4 border-b border-slate-200">
                  
                </th>
              )}
            </tr>
          </thead>
          {isLoading ? (
            <tbody>
              <tr className="text-center">
                <td colSpan="10" className="p-4 py-5">
                  <div className="w-full text-center py-7 font-medium text-gray-700 flex flex-col items-center justify-center">
                    <LoadingSpin />
                    <span className="mt-4">Đang tải dữ liệu...</span>
                  </div>
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody>
              {data?.sale?.length > 0 ? (
                data?.sale?.map((sale, index) => (
                  <tr className={`hover:bg-slate-50 border-b border-slate-100 ${
                    sale.start === 1 ? "bg-green-100" : ""
                  }`} key={index}>
                    <td className="p-4 py-5">
                      <p className="block font-medium text-sm text-center">
                        {(index + 1) + (page * limit - limit)}
                      </p>
                    </td>
                    <td className="p-4 py-5">
                    <p className="text-sm text-center">
                        {sale?.name}
                      </p>
                    </td>
                    <td className="p-4 py-5">
                      <p className="text-sm text-center flex flex-col space-y-1">
                        <span>Từ: <b>{sale?.startTime}</b></span> 
                        <span>Đến: <b>{sale?.endTime}</b></span>
                      </p>
                    </td>
                    <td className="p-4 py-5">
                      <p className="text-sm text-center">
                        {sale.status == 1 ? "Hiển thị" : "Ẩn"}
                      </p>
                    </td>
                    <td className="p-4 py-5">
                      <p className="text-sm text-center">
                        {sale.type == 1 ? "Flash Sale" : "Giảm giá thường"}
                      </p>
                    </td>
                    <td className="p-4 py-5">
                      <button className="text-sm block w-full text-center cursor-pointer text-blue-500 underline font-medium" onClick={() => handleOpenDialogDetail(sale)}>
                        Xem ngay
                      </button>
                    </td>
                    {userProfile?.role != 3 && (
                      <td className="p-4 py-5 space-x-4 text-[15px] font-medium">
                        <Link to={`${`/admin/flashsale/edit/${sale.id}`}`} className="text-blue-500 hover:text-blue-700 cursor-pointer">
                          Sửa
                        </Link>
                        <button onClick={() => handleOpenDialog(sale.id)} className="text-red-500 hover:text-red-700 cursor-pointer">
                          Xóa 
                        </button>
                      </td>
                    )}
                  </tr>
                ))
            ) : (
              <tr className="text-center">
                <td colSpan="10" className="p-4">
                  <div className="w-full text-center py-7 font-medium text-gray-700 flex flex-col items-center justify-center">
                    <span>Không có chương trình giảm giá nào.</span>
                  </div>
                </td>
              </tr>
            )}
            </tbody>
          )}
        </table>
        {totalRecords > 0 && (
          <div className="flex sm:flex-row flex-col justify-between items-center px-4 py-3">
              <div className="text-sm text-slate-500 sm:mb-0 mb-5">
                Hiển thị từ {page * limit - limit + 1 || 0} đến {(page < pageCount ? page * limit : totalRecords) || 0} trong tổng số {data?.totalRecords || 0} bản ghi
              </div>
            {pageCount > 1 && (
              <ReactPaginate 
                pageCount={pageCount}
                forcePage={page - 1}
                containerClassName="flex justify-center space-x-2 items-center"
                pageLinkClassName="text-gray-700 w-8 h-8 flex items-center cursor-pointer justify-center rounded-lg"
                activeLinkClassName="bg-gray-700 text-white"
                nextLabel={<GrFormNext className="cursor-pointer text-3xl" />}
                previousLabel={<GrFormPrevious className="cursor-pointer text-3xl" />}
                onPageChange={({ selected }) => setPage(selected + 1)}
              />
            )}
          </div>
        )}
      </div>

      <Dialog open={openDialog} handler={() => setOpenDialog(!openDialog)}>
        <DialogBody className="font-medium text-md">
          Bạn có chắc chắn muốn xóa chương trình giảm giá này không? Hành động này không thể hoàn tác.
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="gray"
            onClick={() => setOpenDialog(false)}
            className="mr-1 cursor-pointer"
          >
            Hủy
          </Button>
          <Button
            variant="gradient"
            color="red"
            onClick={handleConfirmDelete}
            disabled={mutationDeleteFlashSale.isPending}
            className="cursor-pointer"
          >
            {mutationDeleteFlashSale.isPending ? "Đang xóa..." : "Xóa"}
          </Button>
        </DialogFooter>
      </Dialog>

      {openDialogDetail && (
        <div className="fixed bg-black/70 top-0 left-0 z-50 w-full h-full">
          <div className="w-[60%] min-h-[50%] max-h-[80%] overflow-y-auto bg-white rounded-lg shadow-md p-5 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <button
              className="absolute top-1 right-1 text-3xl text-red-500 cursor-pointer"
              onClick={() => setOpenDialogDetail(false)}
            >
              <IoCloseCircle />
            </button>
            <h2 className="font-medium text-lg mb-2">Sản phẩm áp dụng giảm giá: <span className="text-red-600 underline font-semibold">{nameSale}</span></h2>
            <table className="w-full text-left table-auto min-w-max">
              <thead className="text-white bg-gray-700">
                <tr>
                  <th className="p-4 border-b border-slate-200">
                    <p className="text-sm font-medium leading-none text-center">
                      STT
                    </p>
                  </th>
                  <th className="p-4 border-b border-slate-200">
                    <p className="text-sm font-medium leading-none">
                      Tên sản phẩm
                    </p>
                  </th>
                  <th className="p-4 border-b border-slate-200 text-center">
                    <p className="text-sm font-medium leading-none">
                      Giá hiện tại
                    </p>
                  </th>
                  <th className="p-4 border-b border-slate-200 text-center">
                    <p className="text-sm font-medium leading-none">
                      Giá được áp dụng giảm giá
                    </p>
                  </th>
                </tr>
              </thead>
              {isLoading ? (
                <tbody>
                  <tr className="text-center">
                    <td colSpan="5" className="p-4 py-5">
                      <div className="w-full text-center py-7 font-medium text-gray-700 flex flex-col items-center justify-center">
                        <LoadingSpin />
                        <span className="mt-4">Đang tải dữ liệu...</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              ) : (
                <tbody>
                  {dataChildren?.length > 0 ? (
                    dataChildren?.map((product, index) => (
                      <tr
                        className="hover:bg-slate-50 border-b border-slate-200"
                        key={index}
                      >
                        <td className="p-4 py-5">
                          <p className="block font-medium text-sm text-slate-800 text-center">
                            {index + 1 + (page * limit - limit)}
                          </p>
                        </td>
                        <td className="py-2">
                          <div className="flex items-center">
                            <img src={checkImageUrl(product?.product?.image)} alt="" className="w-16 aspect-[1/1] object-contain zoomable-image cursor-pointer" />
                            <p className="text-sm text-left ml-2">
                              {product?.product?.name}
                            </p>
                          </div>
                        </td>
                        <td className="p-4 py-5">
                          <p className="text-sm text-center">
                            {formatVND(product?.product?.discount)}
                          </p>
                        </td>
                        <td className="p-4 py-5">
                          <p className="text-sm text-center">
                            {formatVND(product?.discount)}
                          </p>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr className="text-center">
                      <td colSpan="5" className="p-4">
                        <div className="w-full text-center py-7 font-medium text-gray-700 flex flex-col items-center justify-center">
                          <span>Không có sản phẩm nào.</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              )}
            </table>
          </div>
        </div>
      )}
    </>
  );
}
