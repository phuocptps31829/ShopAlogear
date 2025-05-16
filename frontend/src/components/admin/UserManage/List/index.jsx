import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import ReactPaginate from "react-paginate";
import { useQuery } from "@tanstack/react-query";
import { GrFormNext, GrFormPrevious } from "react-icons/gr";
import { FaPlus } from "react-icons/fa6";
import { authApi } from "../../../../services/authApi";
import LoadingSpin from "../../../ui/LoadingSpin";
import useDebounce from "../../../../hooks/useDebounce";
import mediumZoom from "medium-zoom";
import avt_default from "../../../../assets/images/avt-default.png";
import { toast } from "react-toastify";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogBody, DialogFooter, Button } from "@material-tailwind/react";
import { checkImageUrl } from "../../../../utils/checkImageUrl";

export default function UsersList() {
  const userProfile = useSelector((state) => state.auth.userProfile);
  const queryClient = useQueryClient();
  const [pageCount, setPageCount] = useState(1);
  const [page, setPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [search, setSearch] = useState("");
  const debouncedSearchTerm = useDebounce(search, 300);
  const limit = 5;
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const { data, isLoading } = useQuery({
    queryKey: ["usersAdmin", { limit, page, search: debouncedSearchTerm }],  
    queryFn: () => authApi.getAllUsersAdmin({
      limit,
      page,
      search: debouncedSearchTerm,
    }),
    keepPreviousData: true,
  });
  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm]);

  const mutationDeleteUser = useMutation({
    mutationFn: authApi.userDeleteAdmin,
    onSuccess: () => {
      toast.success("Xóa người dùng thành công!");
      setOpenDialog(false);
      queryClient.invalidateQueries(["usersAdmin", { limit, page, search: debouncedSearchTerm }]);
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

  const handleOpenDialog = (UserId) => {
    setSelectedUserId(UserId);
    setOpenDialog(true);
  };

  const handleConfirmDelete = () => {
    if (selectedUserId) {
      mutationDeleteUser.mutate(selectedUserId);
    }
  };

  const mutationUpdateUserRole = useMutation({
    mutationFn: authApi.updateUserRoleAdmin,
    onSuccess: () => {
      toast.success("Cập nhật vai trò người dùng thành công!");
      queryClient.invalidateQueries(["ordersAll", { limit, page }]);
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Đã xảy ra lỗi, vui lòng thử lại.";
      toast.error(errorMessage);
    },
  });

  const handleChangeRole = (userID, newRole) => {
    mutationUpdateUserRole.mutate({ id: userID, role: Number(newRole) });
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
                placeholder="Tìm kiếm theo tên người dùng"
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
            <Link to="/admin/users/create" className="text-sm whitespace-nowrap text-white bg-blue-600 flex items-center font-medium px-4 py-2 rounded-md hover:bg-blue-800 transition duration-200 ease">
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
                  Tên người dùng
                </p>
              </th>
              <th className="p-4 border-b border-slate-200">
                <p className="text-sm font-medium leading-none text-center">
                  Vai trò
                </p>
              </th>
              <th className="p-4 border-b border-slate-200 text-center">
                <p className="text-sm font-medium leading-none">
                  Email
                </p>
              </th>
              <th className="p-4 border-b border-slate-200 text-center">
                <p className="text-sm font-medium leading-none">
                  Số điện thoại
                </p>
              </th>
              <th className="p-4 border-b border-slate-200 text-center">
                <p className="text-sm font-medium leading-none">
                  Trạng thái
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
              {data?.users?.length > 0 ? (
                data?.users?.map((users, index) => (
                  <tr className="hover:bg-slate-50 border-b border-slate-200" key={index}>
                    <td className="p-4 py-5">
                      <p className="block font-medium text-sm text-slate-800 text-center">
                        {(index + 1) + (page * limit - limit)}
                      </p>
                    </td>
                    <td className="p-4 py-5">
                      <p className="text-sm flex items-center">
                        <img src={`${users?.avatar ? checkImageUrl(users?.avatar) : avt_default}`} className="w-9 mr-3 aspect-[1/1] object-cover rounded-full zoomable-image" alt="" />
                        {users.username}
                      </p>
                    </td>
                    <td className="p-4 py-5">
                      <p className="text-sm flex items-center">
                        <div className="flex justify-center items-center">
                          <select
                            disabled={users.id == userProfile.id || mutationUpdateUserRole.isPending}
                            className={`text-sm px-3 py-1 rounded-xl border text-center font-semibold border-black ${users.role == 1 ? "text-red-500" : users.role == 2 ? "text-blue-400" : users.role == 3 ? "text-green-400" : "text-gray-800"}`}
                            value={users.role}
                            onChange={(e) => handleChangeRole(users.id, e.target.value)}
                          >
                            <option value="0" className="bg-white text-black">Khách hàng</option>
                            <option value="1" className="bg-white text-black">Quản trị cấp 1</option>
                            <option value="2" className="bg-white text-black">Quản trị cấp 2</option>
                            <option value="3" className="bg-white text-black">Quản trị cấp 3</option>
                          </select>
                        </div>
                      </p>
                    </td>
                    <td className="p-4 py-5">
                      <p className="text-sm text-center">
                        {users.email || <span className="text-red-500">Chưa cập nhật</span>}
                      </p>
                    </td>
                    <td className="p-4 py-5">
                      <p className="text-sm text-center">
                        {users.phone || <span className="text-red-500">Chưa cập nhật</span>}
                      </p>
                    </td>
                    <td className="p-4 py-5">
                      <p className="text-sm text-center">
                        {users.isActive == "1" ? <span className="text-green-500">Đã kích hoạt</span> : <span className="text-red-500">Chưa kích hoạt</span>}
                      </p>
                    </td>
                    <td className="p-4 py-5 space-x-4 text-[15px] font-medium">
                      <Link to={`/admin/users/edit/${users.id}`} className="text-blue-500 hover:text-blue-700 cursor-pointer">
                        Sửa
                      </Link>
                      <button onClick={() => handleOpenDialog(users.id)} className="text-red-500 hover:text-red-700 cursor-pointer">
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))
            ) : (
              <tr className="text-center">
                <td colSpan="5" className="p-4">
                  <div className="w-full text-center py-7 font-medium text-gray-700 flex flex-col items-center justify-center">
                    <span>Không có người dùng nào.</span>
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
          Bạn có chắc chắn muốn xóa người dùng này không? Hành động này không thể hoàn tác.
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
            disabled={mutationDeleteUser.isPending}
            className="cursor-pointer"
          >
            {mutationDeleteUser.isPending ? "Đang xóa..." : "Xóa"}
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
