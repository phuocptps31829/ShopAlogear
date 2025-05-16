import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ReactPaginate from "react-paginate";
import { useQuery } from "@tanstack/react-query";
import { GrFormNext, GrFormPrevious } from "react-icons/gr";
import { FaPlus } from "react-icons/fa6";
import { Dialog, DialogBody, DialogFooter, Button } from "@material-tailwind/react";
import { toast } from "react-toastify";
import { categoryApi } from "../../../../services/categoryApi";
import LoadingSpin from "../../../ui/LoadingSpin";
import useDebounce from "../../../../hooks/useDebounce";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IoCloseCircle } from "react-icons/io5";

export default function CategoryList() {
  const queryClient = useQueryClient();
  const [pageCount, setPageCount] = useState(1);
  const [page, setPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [search, setSearch] = useState("");
  const debouncedSearchTerm = useDebounce(search, 300);
  const limit = 6;
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [openDialogDetail, setOpenDialogDetail] = useState(false);
  const [dataChildren, setDataChildren] = useState([]);
  const [nameCategory, setNameCategory] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["categoriesAdmin", { limit, page, search: debouncedSearchTerm }],  
    queryFn: () => categoryApi.getAllCategoriesAdmin({
      limit,
      page,
      search: debouncedSearchTerm,
    }),
    keepPreviousData: true,
  });

  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm]);

  const mutationDeleteCategory = useMutation({
    mutationFn: categoryApi.deleteCategoryAdmin,
    onSuccess: () => {
      toast.success("Xóa danh mục thành công!");
      setOpenDialog(false);
      setOpenDialogDetail(false);
      queryClient.invalidateQueries(["categoriesAdmin", { limit, page, search: debouncedSearchTerm }]);
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
    setPageCount(data?.totalPage)
    setTotalRecords(data?.totalRecords)
  }, [data]);

  const handleOpenDialog = (categoryId) => {
    setSelectedCategoryId(categoryId);
    setOpenDialog(true);
  };

  const handleConfirmDelete = () => {
    if (selectedCategoryId) {
      mutationDeleteCategory.mutate(selectedCategoryId);
    }
  };

  const handleOpenDialogDetail = ({ children, name }) => {
    setOpenDialogDetail(true);
    setDataChildren(children);
    setNameCategory(name);
  }

  return (
    <>
      <div className="w-full flex justify-between items-center mb-3 mt-1">
        <div className="w-full">
          <div className="relative flex justify-between w-full items-center gap-10">
            <div className="relative max-w-sm sm:min-w-[350px] w-full">
              <input
                className="bg-white w-full pr-11 h-10 pl-3 py-2 placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded transition duration-200 ease focus:outline-none focus:border-slate-400 hover:border-slate-400 shadow-sm focus:shadow-md"
                placeholder="Tìm kiếm theo tên danh mục"
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
            <Link to="/admin/categories/create" className="text-sm text-white whitespace-nowrap bg-blue-600 flex items-center font-medium px-4 py-2 rounded-md hover:bg-blue-800 transition duration-200 ease">
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
                  Tên danh mục
                </p>
              </th>
              <th className="p-4 border-b border-slate-200 text-center">
                <p className="text-sm font-medium leading-none">
                  Trạng thái
                </p>
              </th>
              <th className="p-4 border-b border-slate-200 text-center">
                <p className="text-sm font-medium leading-none">
                  Kiểu danh mục
                </p>
              </th>
              <th className="p-4 border-b border-slate-200 text-center">
                <p className="text-sm font-medium leading-none">
                  Danh mục con / Số lượng sản phẩm
                </p>
              </th>
              <th className="p-4 border-b border-slate-200">
                
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
              {data?.products?.length > 0 ? (
                data?.products?.map((category, index) => (
                  <tr className="hover:bg-slate-50 border-b border-slate-200" key={index}>
                    <td className="p-4 py-5">
                      <p className="block font-medium text-sm text-slate-800 text-center">
                        {(index + 1) + (page * limit - limit)}
                      </p>
                    </td>
                    <td className="p-4 py-5">
                      <p className="text-sm">
                        <span className="mr-2">{category.icon}</span> <button onClick={() => handleOpenDialogDetail({ children: category.children, name: category.name })} className="cursor-pointer text-blue-800 font-medium">{category.name}</button>
                      </p>
                    </td>
                    <td className="p-4 py-5">
                      <p className="text-sm text-center">
                        {category.status == "1" ? "Hiện" : "Ẩn"}
                      </p>
                    </td>
                    <td className="p-4 py-5">
                      <p className="text-sm text-center">
                        {category.type == "2" ? "Dịch vụ" : "Sản phẩm"}
                      </p>
                    </td>
                    <td className="p-4 py-5">
                      <p className="text-sm text-center">
                        {category.children.length} / {category.totalProducts}
                      </p>
                    </td>
                    <td className="p-4 py-5 space-x-4 text-[15px] font-medium">
                      <Link to={`/admin/categories/edit/${category.id}`} className="text-blue-500 hover:text-blue-700 cursor-pointer">
                        Sửa
                      </Link>
                      <button onClick={() => handleOpenDialog(category.id)} className="text-red-500 hover:text-red-700 cursor-pointer">
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))
            ) : (
              <tr className="text-center">
                <td colSpan="5" className="p-4">
                  <div className="w-full text-center py-7 font-medium text-gray-700 flex flex-col items-center justify-center">
                    <span>Không có danh mục nào.</span>
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
          Bạn có chắc chắn muốn xóa danh mục này không? Hành động này không thể hoàn tác.
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
            disabled={mutationDeleteCategory.isPending}
            className="cursor-pointer"
          >
            {mutationDeleteCategory.isPending ? "Đang xóa..." : "Xóa"}
          </Button>
        </DialogFooter>
      </Dialog>
      
      {openDialogDetail && (
        <div 
          className="fixed bg-black/70 top-0 left-0 z-50 w-full h-full"
          onClick={(e) => {
            if(e.target === e.currentTarget) {
              setOpenDialogDetail(false);
            }
          }}
        >
          <div className="w-[60%] min-h-[50%] max-h-[80%] overflow-y-auto bg-white rounded-lg shadow-md p-5 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <button className="absolute top-1 right-1 text-3xl text-red-500 cursor-pointer" onClick={() => setOpenDialogDetail(false)}><IoCloseCircle /></button>
            <h2 className="font-medium text-lg mb-2">
              {nameCategory}:
            </h2>
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
                      Tên danh mục
                    </p>
                  </th>
                  <th className="p-4 border-b border-slate-200 text-center">
                    <p className="text-sm font-medium leading-none">
                      Trạng thái
                    </p>
                  </th>
                  <th className="p-4 border-b border-slate-200 text-center">
                    <p className="text-sm font-medium leading-none">
                      Kiểu danh mục
                    </p>
                  </th>
                  <th className="p-4 border-b border-slate-200 text-center">
                    <p className="text-sm font-medium leading-none">
                      Số lượng sản phẩm
                    </p>
                  </th>
                  <th className="p-4 border-b border-slate-200">
                    
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
                    dataChildren?.map((category, index) => (
                      <tr className="hover:bg-slate-50 border-b border-slate-200" key={index}>
                        <td className="p-4 py-5">
                          <p className="block font-medium text-sm text-slate-800 text-center">
                            {(index + 1) + (page * limit - limit)}
                          </p>
                        </td>
                        <td className="p-4 py-5">
                          <p className="text-sm">
                            {category.name}
                          </p>
                        </td>
                        <td className="p-4 py-5">
                          <p className="text-sm text-center">
                            {category.status == "1" ? "Hiện" : "Ẩn"}
                          </p>
                        </td>
                        <td className="p-4 py-5">
                          <p className="text-sm text-center">
                            {category.type == "3" ? "Dịch vụ" : "Sản phẩm"}
                          </p>
                        </td>
                        <td className="p-4 py-5">
                          <p className="text-sm text-center">
                            {category.totalProducts}
                          </p>
                        </td>
                        <td className="p-4 py-5 space-x-4 text-[15px] font-medium">
                          <Link to={`/admin/categories/edit/${category.id}`} className="text-blue-500 hover:text-blue-700 cursor-pointer">
                            Sửa
                          </Link>
                          <button onClick={() => handleOpenDialog(category.id)} className="text-red-500 hover:text-red-700 cursor-pointer">
                            Xóa
                          </button>
                        </td>
                      </tr>
                    ))
                ) : (
                  <tr className="text-center">
                    <td colSpan="5" className="p-4">
                      <div className="w-full text-center py-7 font-medium text-gray-700 flex flex-col items-center justify-center">
                        <span>Không có danh mục con nào.</span>
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
