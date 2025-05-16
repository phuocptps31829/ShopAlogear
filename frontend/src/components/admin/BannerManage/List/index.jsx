import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import ReactPaginate from "react-paginate";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GrFormNext, GrFormPrevious } from "react-icons/gr";
import { FaPlus } from "react-icons/fa6";
import { bannerApi } from "../../../../services/bannerApi";
import LoadingSpin from "../../../ui/LoadingSpin";
import { toast } from "react-toastify";
import { Dialog, DialogBody, DialogFooter, Button } from "@material-tailwind/react";
import mediumZoom from "medium-zoom";
const URL_IMAGE = import.meta.env.VITE_URL_IMAGE;

export default function BannerList() {
  const userProfile = useSelector((state) => state.auth.userProfile);
  const [pageCount, setPageCount] = useState(1);
  const [page, setPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const limit = 3;
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBannerId, setSelectedBannerId] = useState(null);
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["bannersAdmin", { limit, page }],  
    queryFn: () => bannerApi.getAllBannerAdmin({
      limit,
      page,
    }),
    keepPreviousData: true,
  });
  const mutationDeleteBanner = useMutation({
    mutationFn: bannerApi.deleteBanner,
    onSuccess: () => {
      toast.success("Xóa ảnh thành công!");
      setOpenDialog(false);
      queryClient.invalidateQueries(["bannersAdmin", { limit, page }]);
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

  const handleOpenDialog = (bannerId) => {
    setSelectedBannerId(bannerId);
    setOpenDialog(true);
  };

  const handleConfirmDelete = () => {
    if (selectedBannerId) {
      mutationDeleteBanner.mutate(selectedBannerId);
    }
  };

  useEffect(() => {
    const images = document.querySelectorAll(".zoomable-image");
    mediumZoom(images, { margin: 20, background: "#000000A0" });
  }, [data]);

  return (
    <>
    <div className="w-full flex justify-between items-center mb-3 mt-1">
        <div className="w-full">
          <div className="relative flex justify-between w-full items-center">
            <div className="relative max-w-sm sm:min-w-[350px] w-full">
            </div>
            <Link to="/admin/banner/create" className="text-sm text-white whitespace-nowrap bg-blue-600 flex items-center font-medium px-4 py-2 rounded-md hover:bg-blue-800 transition duration-200 ease">
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
                  Hình ảnh
                </p>
              </th>
              <th className="p-4 border-b border-slate-200">
                <p className="text-sm font-medium leading-none text-center">
                  Vị trí
                </p>
              </th>
              <th className="p-4 border-b border-slate-200 text-center">
                <p className="text-sm font-medium leading-none">
                  Loại ảnh
                </p>
              </th>
              <th className="p-4 border-b border-slate-200 text-center">
                <p className="text-sm font-medium leading-none">
                  Trạng thái
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
              {data?.products?.length > 0 ? (
                data?.products?.map((banner, index) => (
                  <tr className="hover:bg-slate-50 border-b border-slate-200" key={index}>
                    <td className="p-4 py-5">
                      <p className="block font-medium text-sm text-center">
                        {(index + 1) + (page * limit - limit)}
                      </p>
                    </td>
                    <td className="p-4 py-5">
                      <div className="text-sm w-44 mx-auto">
                        <img src={`${URL_IMAGE}/${banner.image}`} alt="" className="rounded-sm zoomable-image cursor-pointer" />
                      </div>
                    </td>
                    <td className="p-4 py-5">
                      <p className="text-sm text-center text-black w-fit p-2 px-4 rounded-lg mx-auto">
                        {banner.number}
                      </p>
                    </td>
                    <td className="p-4 py-5">
                      <p className="text-sm text-center text-black w-fit p-2 px-4 rounded-lg mx-auto">
                        {banner.type == "1" ? "Banner chính" : banner.type == "2" ? "Banner phụ" : banner.type == "3" ? "Logo website" : "Logo tab"}
                      </p>
                    </td>
                    <td className="p-4 py-5">
                      <p className="text-sm text-center">
                        {banner.status == "1" ? "Hiện" : "Ẩn"}
                      </p>
                    </td>
                    {userProfile?.role != 3 && (
                      <td className="p-4 py-5 space-x-4 text-[15px] font-medium">
                        <Link to={`${`/admin/banner/edit/${banner.id}`}`} className="text-blue-500 hover:text-blue-700 cursor-pointer">
                          Sửa
                        </Link>
                        {(banner.type != 3 && banner.type != 4) && (
                          <button onClick={() => handleOpenDialog(banner.id)} className="text-red-500 hover:text-red-700 cursor-pointer">
                            Xóa 
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))
            ) : (
              <tr className="text-center">
                <td colSpan="5" className="p-4">
                  <div className="w-full text-center py-7 font-medium text-gray-700 flex flex-col items-center justify-center">
                    <span>Không có ảnh nào.</span>
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
          Bạn có chắc chắn muốn xóa banner này không? Hành động này không thể hoàn tác.
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
            disabled={mutationDeleteBanner.isPending}
            className="cursor-pointer"
          >
            {mutationDeleteBanner.isPending ? "Đang xóa..." : "Xóa"}
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
