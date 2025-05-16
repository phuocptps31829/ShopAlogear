import { useState, useEffect } from "react";
import ReactPaginate from "react-paginate";
import { useQuery } from "@tanstack/react-query";
import { GrFormNext, GrFormPrevious } from "react-icons/gr";
import { FaPlus } from "react-icons/fa6";
import {
  Dialog,
  DialogBody,
  DialogFooter,
  Button,
} from "@material-tailwind/react";
import { toast } from "react-toastify";
import { brandApi } from "../../../../services/brandApi";
import LoadingSpin from "../../../ui/LoadingSpin";
import useDebounce from "../../../../hooks/useDebounce";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IoCloseCircle } from "react-icons/io5";

export default function BrandList() {
  const queryClient = useQueryClient();
  const [openDialogEdit, setOpenDialogEdit] = useState(false);
  const [brandEdit, setBrandEdit] = useState({
    id: null,
    name: "",
  });
  const [openDialogCreate, setOpenDialogCreate] = useState(false);
  const [brandName, setBrandName] = useState("")
  const [pageCount, setPageCount] = useState(1);
  const [page, setPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [search, setSearch] = useState("");
  const debouncedSearchTerm = useDebounce(search, 300);
  const limit = 6;
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const { data, isLoading } = useQuery({
    queryKey: ["brandsAdmin", { limit, page, search: debouncedSearchTerm }],
    queryFn: () =>
      brandApi.getAllBrandsAdmin({
        limit,
        page,
        search: debouncedSearchTerm,
      }),
    keepPreviousData: true,
  });

  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm]);

  const mutationDeleteBrand = useMutation({
    mutationFn: brandApi.deleteBrand,
    onSuccess: () => {
      toast.success("Xóa thương hiệu thành công!");
      setOpenDialog(false);
      queryClient.invalidateQueries([
        "brandsAdmin",
        { limit, page, search: debouncedSearchTerm },
      ]);
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Đã xảy ra lỗi, vui lòng thử lại.";
      toast.error(errorMessage);
      setOpenDialog(false);
    },
  });

  const mutationEditBrand = useMutation({
    mutationFn: brandApi.updateBrand,
    onSuccess: () => {
      toast.success("Chỉnh sửa thương hiệu thành công!");
      setOpenDialogEdit(false);
      queryClient.invalidateQueries([
        "brandsAdmin",
        { limit, page, search: debouncedSearchTerm },
      ]);
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Đã xảy ra lỗi, vui lòng thử lại.";
      toast.error(errorMessage);
    },
  });

  const mutationAddBrand = useMutation({
    mutationFn: brandApi.createBrand,
    onSuccess: () => {
      toast.success("Thêm mới thương hiệu thành công!");
      setOpenDialogCreate(false);
      queryClient.invalidateQueries([
        "brandsAdmin",
        { limit, page, search: debouncedSearchTerm },
      ]);
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Đã xảy ra lỗi, vui lòng thử lại.";
      toast.error(errorMessage);
    },
  });

  useEffect(() => {
    if (!data) return;
    setPageCount(data?.page);
    setTotalRecords(data?.totalRecords);
  }, [data]);

  const handleOpenDialog = (categoryId) => {
    setSelectedCategoryId(categoryId);
    setOpenDialog(true);
  };

  const handleConfirmDelete = () => {
    if (selectedCategoryId) {
      mutationDeleteBrand.mutate(selectedCategoryId);
    }
  };

  const handleOpenDialogEdit = ({ id, name }) => {
    setOpenDialogEdit(true);
    setBrandEdit({ id, name });
  };

  return (
    <>
      <div className="w-full flex justify-between items-center mb-3 mt-1">
        <div className="w-full">
          <div className="relative flex justify-between w-full items-center gap-10">
            <div className="relative max-w-sm sm:min-w-[350px] w-full">
              <input
                className="bg-white w-full pr-11 h-10 pl-3 py-2 placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded transition duration-200 ease focus:outline-none focus:border-slate-400 hover:border-slate-400 shadow-sm focus:shadow-md"
                placeholder="Tìm kiếm theo tên thương hiệu"
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
            <button
              onClick={() => setOpenDialogCreate(true)}
              className="text-sm text-white bg-blue-600 whitespace-nowrap cursor-pointer flex items-center font-medium px-4 py-2 rounded-md hover:bg-blue-800 transition duration-200 ease"
            >
              Thêm mới <FaPlus className="inline-block ml-2" />
            </button>
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
                  Tên thương hiệu
                </p>
              </th>
              <th className="p-4 border-b border-slate-200"></th>
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
                data?.products?.map((brand, index) => (
                  <tr
                    className="hover:bg-slate-50 border-b border-slate-200"
                    key={index}
                  >
                    <td className="p-4 py-5">
                      <p className="block font-medium text-sm text-slate-800 text-center">
                        {index + 1 + (page * limit - limit)}
                      </p>
                    </td>
                    <td className="p-4 py-5">
                      <p className="text-sm">{brand.name}</p>
                    </td>
                    <td className="p-4 py-5 space-x-4 text-[15px] font-medium">
                      <button
                        onClick={() =>
                          handleOpenDialogEdit({
                            id: brand.id,
                            name: brand.name,
                          })
                        }
                        className="text-blue-500 hover:text-blue-700 cursor-pointer"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleOpenDialog(brand.id)}
                        className="text-red-500 hover:text-red-700 cursor-pointer"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="text-center">
                  <td colSpan="5" className="p-4">
                    <div className="w-full text-center py-7 font-medium text-gray-700 flex flex-col items-center justify-center">
                      <span>Không có thương hiệu nào.</span>
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
              Hiển thị từ {page * limit - limit + 1 || 0} đến{" "}
              {(page < pageCount ? page * limit : totalRecords) || 0} trong tổng
              số {data?.totalRecords || 0} bản ghi
            </div>
            {pageCount > 1 && (
              <ReactPaginate
                pageCount={pageCount}
                forcePage={page - 1}
                containerClassName="flex justify-center space-x-2 items-center"
                pageLinkClassName="text-gray-700 w-8 h-8 flex items-center cursor-pointer justify-center rounded-lg"
                activeLinkClassName="bg-gray-700 text-white"
                nextLabel={<GrFormNext className="cursor-pointer text-3xl" />}
                previousLabel={
                  <GrFormPrevious className="cursor-pointer text-3xl" />
                }
                onPageChange={({ selected }) => setPage(selected + 1)}
              />
            )}
          </div>
        )}
      </div>

      <Dialog open={openDialog} handler={() => setOpenDialog(!openDialog)}>
        <DialogBody className="font-medium text-md">
          Bạn có chắc chắn muốn xóa thương hiệu này không? Hành động này không
          thể hoàn tác.
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
            disabled={mutationDeleteBrand.isPending}
            className="cursor-pointer"
          >
            {mutationDeleteBrand.isPending ? "Đang xóa..." : "Xóa"}
          </Button>
        </DialogFooter>
      </Dialog>

      {openDialogEdit && (
        <div 
          className="fixed bg-black/70 top-0 left-0 z-50 w-full h-full" 
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setOpenDialogEdit(false);
            }
          }}
        >
          <div className="w-[60%] min-h-[20%] max-h-[80%] overflow-y-auto bg-white rounded-lg shadow-md p-5 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <button
              className="absolute top-1 right-1 text-3xl text-red-500 cursor-pointer"
              onClick={() => setOpenDialogEdit(false)}
            >
              <IoCloseCircle />
            </button>
            <h2 className="font-medium text-lg mb-2">Chỉnh sửa thương hiệu:</h2>
            <input
              type="text"
              className="w-full h-10 px-3 py-2 border border-slate-200 rounded-md mb-3"
              value={brandEdit.name}
              onChange={(e) =>
                setBrandEdit({ ...brandEdit, name: e.target.value })
              }
            />
            <div className="flex items-center justify-end">
              <button
                disabled={mutationEditBrand.isPending}
                onClick={() => setOpenDialogEdit(false)}
                className="bg-gray-500 text-white px-4 py-2 cursor-pointer text-sm rounded-md hover:bg-gray-700 transition duration-200 ease"
              >
                Hủy
              </button>
              <button
                disabled={mutationEditBrand.isPending}
                onClick={() => mutationEditBrand.mutate({ id: brandEdit.id, brand: brandEdit })}
                className="bg-blue-500 text-white px-4 py-2 cursor-pointer text-sm rounded-md hover:bg-blue-700 transition duration-200 ease ml-3"
              >
                {mutationEditBrand.isPending ? (
                  <div className="w-5 h-5 mx-auto border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "Lưu"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {openDialogCreate && (
        <div 
          className="fixed bg-black/70 top-0 left-0 z-50 w-full h-full" onClick={(e) => {
          if (e.target === e.currentTarget) {
            setOpenDialogCreate(false);
          }
        }}>
          <div className="w-[60%] min-h-[20%] max-h-[80%] overflow-y-auto bg-white rounded-lg shadow-md p-5 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <button
              className="absolute top-1 right-1 text-3xl text-red-500 cursor-pointer"
              onClick={() => setOpenDialogCreate(false)}
            >
              <IoCloseCircle />
            </button>
            <h2 className="font-medium text-lg mb-2">Thêm mới thương hiệu:</h2>
            <input
              placeholder="Nhập tên thương hiệu"
              type="text"
              className="w-full h-10 px-3 py-2 border border-slate-200 rounded-md mb-3"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
            />
            <div className="flex items-center justify-end">
              <button
                disabled={mutationAddBrand.isPending}
                onClick={() => setOpenDialogCreate(false)}
                className="bg-gray-500 text-white px-4 py-2 cursor-pointer text-sm rounded-md hover:bg-gray-700 transition duration-200 ease"
              >
                Hủy
              </button>
              <button
                disabled={mutationAddBrand.isPending}
                onClick={() => {
                  const newBrand = {
                    name: brandName,
                  }
                  mutationAddBrand.mutate(newBrand)
                }}
                className="bg-blue-500 text-white px-4 py-2 cursor-pointer text-sm rounded-md hover:bg-blue-700 transition duration-200 ease ml-3"
              >
                {mutationAddBrand.isPending ? (
                  <div className="w-5 h-5 mx-auto border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "Thêm"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
