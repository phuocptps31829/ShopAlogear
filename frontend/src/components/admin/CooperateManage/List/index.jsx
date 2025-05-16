import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ReactPaginate from "react-paginate";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GrFormNext, GrFormPrevious } from "react-icons/gr";
import { FaPlus } from "react-icons/fa6";
import { CooperatesApi } from "../../../../services/cooperatesApi";
import LoadingSpin from "../../../ui/LoadingSpin";
import useDebounce from "../../../../hooks/useDebounce";
import mediumZoom from "medium-zoom";
import { toast } from "react-toastify";
import { Dialog, DialogBody, DialogFooter, Button } from "@material-tailwind/react";
import { checkImageUrl } from "../../../../utils/checkImageUrl";
import { useSelector } from "react-redux";

export default function CooperateList() {
  const userProfile = useSelector((state) => state.auth.userProfile);
  const queryClient = useQueryClient();
  const [pageCount, setPageCount] = useState(1);
  const [page, setPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [search, setSearch] = useState("");
  const debouncedSearchTerm = useDebounce(search, 300);
  const limit = 6;
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const { data, isLoading } = useQuery({
    queryKey: ["cooperatesAdmin", { limit, page, search: debouncedSearchTerm }],  
    queryFn: () => CooperatesApi.getAllCooperatesAdmin({
      limit,
      page,
      search: debouncedSearchTerm,
    }),
    keepPreviousData: true,
  });

  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm]);

  const mutationDeleteCooperates = useMutation({
    mutationFn: CooperatesApi.deleteCooperateAdmin,
    onSuccess: () => {
      toast.success("Xóa dự án thành công!");
      setOpenDialog(false);
      queryClient.invalidateQueries(["cooperatesAdmin", { limit, page, search: debouncedSearchTerm }]);
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Đã xảy ra lỗi, vui lòng thử lại.";
      toast.error(errorMessage);
      setOpenDialog(false);
    }
  });

  useEffect(() => {
    if(!data) return;
    setPageCount(data?.page)
    setTotalRecords(data?.totalRecords)
  }, [data]);

  const handleOpenDialog = (categoryId) => {
    setSelectedCategoryId(categoryId);
    setOpenDialog(true);
  };

  const handleConfirmDelete = () => {
    if (selectedCategoryId) {
      mutationDeleteCooperates.mutate(selectedCategoryId);
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
          <div className="relative flex justify-between w-full items-center gap-10">
            <div className="relative max-w-sm sm:min-w-[350px] w-full">
              <input
                className="bg-white w-full pr-11 h-10 pl-3 py-2 placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded transition duration-200 ease focus:outline-none focus:border-slate-400 hover:border-slate-400 shadow-sm focus:shadow-md"
                placeholder="Tìm kiếm theo tên dự án"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button
                className="absolute h-8 w-8 right-1 top-1 my-auto px-2 flex items-center bg-white rounded "
                type="button"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="3"
                  stroke="currentColor"
                  className="w-8 h-8 text-slate-600"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                  />
                </svg>
              </button>
            </div>
            <Link to="/admin/cooperates/create" className="text-sm whitespace-nowrap text-white bg-blue-600 flex items-center font-medium px-4 py-2 rounded-md hover:bg-blue-800 transition duration-200 ease">
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
                <p className="text-sm font-medium leading-none">
                  Tên dự án
                </p>
              </th>
              <th className="p-4 border-b border-slate-200 text-center">
                <p className="text-sm font-medium leading-none">
                  Tiêu đề
                </p>
              </th>
              <th className="p-4 border-b border-slate-200 text-center">
                <p className="text-sm font-medium leading-none">
                  Trạng thái
                </p>
              </th>
              <th className="p-4 border-b border-slate-200 text-center">
                <p className="text-sm font-medium leading-none">
                  Link dự án
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
                data?.products?.map((product, index) => (
                  <tr className="hover:bg-slate-50 border-b border-slate-200" key={index}>
                    <td className="p-4 py-5">
                      <p className="block font-medium text-sm text-slate-800 text-center">
                        {(index + 1) + (page * limit - limit)}
                      </p>
                    </td>
                    <td className="p-4 py-5">
                      <p className="text-sm flex items-center">
                        <img src={checkImageUrl(product?.image)} className="w-9 mr-3 zoomable-image cursor-pointer" alt="" />
                        {product.name}
                      </p>
                    </td>
                    <td className="p-4 py-5">
                      <p className="text-sm text-center">
                        {product.description}
                      </p>
                    </td>
                    <td className="p-4 py-5">
                      <p className="text-sm text-center">
                        {product.status == 1 ? "Hiện" : "Ẩn"}
                      </p>
                    </td>
                    <td className="p-4 py-5">
                      <p className="text-sm text-center">
                        <Link to={product.link} target="_blank" className="text-blue-500 hover:text-blue-700">
                          Xem ngay
                        </Link>
                      </p>
                    </td>
                    {userProfile?.role != 3 && (
                      <td className="p-4 py-5 space-x-4 text-[15px] font-medium">
                        <Link to={`/admin/cooperates/edit/${product.id}`} className="text-blue-500 hover:text-blue-700 cursor-pointer">
                          Sửa
                        </Link>
                        <button onClick={() => handleOpenDialog(product.id)} className="text-red-500 hover:text-red-700 cursor-pointer">
                          Xóa
                        </button>
                      </td>
                    )}
                  </tr>
                ))
            ) : (
              <tr className="text-center">
                <td colSpan="5" className="p-4">
                  <div className="w-full text-center py-7 font-medium text-gray-700 flex flex-col items-center justify-center">
                    <span>Không có dự án nào.</span>
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
          Bạn có chắc chắn muốn xóa dự án này không? Hành động này không thể hoàn tác.
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
            disabled={mutationDeleteCooperates.isPending}
            className="cursor-pointer"
          >
            {mutationDeleteCooperates.isPending ? "Đang xóa..." : "Xóa"}
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
