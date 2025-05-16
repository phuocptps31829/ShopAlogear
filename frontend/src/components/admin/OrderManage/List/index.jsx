import { useState, useEffect } from "react";
import ReactPaginate from "react-paginate";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GrFormNext, GrFormPrevious } from "react-icons/gr";
import { orderApi } from "../../../../services/orderApi";
import LoadingSpin from "../../../ui/LoadingSpin";
import { toast } from "react-toastify";
import useDebounce from "../../../../hooks/useDebounce";
import {
  Dialog,
  DialogBody,
  DialogFooter,
  Button,
} from "@material-tailwind/react";
import { IoCloseCircle } from "react-icons/io5";
import { formatVND } from "../../../../utils/formatPrice";
import mediumZoom from "medium-zoom";
import { checkImageUrl } from "../../../../utils/checkImageUrl";
import { useSearchParams  } from "react-router-dom";
import { useSelector } from "react-redux";
import { FaShippingFast } from "react-icons/fa";

export default function OrderList() {
  const userProfile = useSelector((state) => state.auth.userProfile);
  const [searchParams] = useSearchParams();
  const [openDialogDetail, setOpenDialogDetail] = useState(false);
  const [dataChildren, setDataChildren] = useState([]);
  const [nameCategory, setNameCategory] = useState("");
  const [search, setSearch] = useState(searchParams.get("orderCode") || "");
  const debouncedSearchTerm = useDebounce(search, 300);
  const [pageCount, setPageCount] = useState(1);
  const [page, setPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const limit = 3;
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editData, setEditData] = useState({ unit: "", shippingCode: "", link: "" });
  const [errors, setErrors] = useState({ unit: "", shippingCode: "", link: "" });
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["ordersAll", { limit, page, search: debouncedSearchTerm }],
    queryFn: () =>
      orderApi.getAllOrdersAdmin({
        limit,
        page,
        search: debouncedSearchTerm,
      }),
    keepPreviousData: true,
  });

  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm]);

  const mutationDeleteOrder = useMutation({
    mutationFn: orderApi.deleteOrderAdmin,
    onSuccess: () => {
      toast.success("Xóa đơn hàng thành công!");
      setOpenDialog(false);
      queryClient.invalidateQueries(["ordersAll", { limit, page }]);
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Đã xảy ra lỗi, vui lòng thử lại.";
      toast.error(errorMessage);
      setOpenDialog(false);
    },
  });

  const mutationUpdateStatusOrder = useMutation({
    mutationFn: orderApi.updateStatusOrderAdmin,
    onSuccess: () => {
      toast.success("Cập nhật trạng thái đơn hàng thành công!");
      queryClient.invalidateQueries(["ordersAll", { limit, page }]);
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

  const handleOpenDialog = (orderId) => {
    setSelectedOrderId(orderId);
    setOpenDialog(true);
  };

  const handleConfirmDelete = () => {
    if (selectedOrderId) {
      mutationDeleteOrder.mutate(selectedOrderId);
    }
  };

  const handleOpenDialogDetail = (order) => {
    setOpenDialogDetail(true);
    setDataChildren(order?.product_order);
    setNameCategory(order?.code);
  }

  const handleChangeStatus = (orderId, newStatus) => {
    mutationUpdateStatusOrder.mutate({ id: orderId, status: Number(newStatus) });
  };

  const handleOpenEditDialog = (order) => {
    setSelectedOrderId(order.id);
    setEditData({
      unit: order.unit || "",
      shippingCode: order.shippingCode || "",
      link: order.link || "",
    }); 
    setErrors({ unit: "", shippingCode: "", link: "" });
    setOpenEditDialog(true);
  };

  const mutationUpdateShipping = useMutation({
    mutationFn: orderApi.updateShipping,
    onSuccess: () => {
      toast.success("Cập nhật thông tin vận chuyển thành công!");
      setOpenEditDialog(false);
      queryClient.invalidateQueries(["ordersAll", { limit, page }]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Đã xảy ra lỗi, vui lòng thử lại.");
    },
  });

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { unit: "", shippingCode: "", link: "" };

    if (!editData.unit.trim()) {
      newErrors.unit = "Đơn vị vận chuyển không được để trống.";
      isValid = false;
    }

    if (!editData.shippingCode.trim()) {
      newErrors.shippingCode = "Mã vận chuyển không được để trống.";
      isValid = false;
    }

    if (!editData.link.trim()) {
      newErrors.link = "Link theo dõi không được để trống.";
      isValid = false;
    } else if (!/^https?:\/\/[^\s$.?#].[^\s]*$/.test(editData.link)) {
      newErrors.link = "Link theo dõi không hợp lệ.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleConfirmEdit = () => {
    if (validateForm() && selectedOrderId) {
      mutationUpdateShipping.mutate({ id: selectedOrderId, data: editData });
    };
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
            <div className="relative max-w-sm min-w-[350px] w-full">
              <input
                className="bg-white w-full pr-11 h-10 pl-3 py-2 placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded transition duration-200 ease focus:outline-none focus:border-slate-400 hover:border-slate-400 shadow-sm focus:shadow-md"
                placeholder="Tìm kiếm đơn hàng theo mã đơn hàng, tên, email, số điện thoại"
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
          </div>
        </div>
      </div>
      <div className="relative flex flex-col w-full h-full overflow-scroll text-gray-700 bg-white shadow-md rounded-lg bg-clip-border">
        <table className="w-full text-left table-auto min-w-max">
          <thead className="text-white bg-gradient-to-r from-[#141E30] to-[#89e2e3]">
            <tr>
              <th className="p-4 border-b border-slate-200">
                <p className="text-sm font-medium leading-none text-center">
                  Mã đơn hàng
                </p>
              </th>
              <th className="p-4 border-b border-slate-200">
                <p className="text-sm font-medium leading-none text-left">
                  Thông tin khách hàng
                </p>
              </th>
              <th className="p-4 border-b border-slate-200 text-center">
                <p className="text-sm font-medium leading-none">
                  Loại thanh toán
                </p>
              </th>
              <th className="p-4 border-b border-slate-200 text-center">
                <p className="text-sm font-medium leading-none">Trạng thái</p>
              </th>
              <th className="p-4 border-b border-slate-200 text-center">
                <p className="text-sm font-medium leading-none">Sản phẩm</p>
              </th>
              {userProfile?.role != 3 && (
                <th className="p-4 border-b border-slate-200"></th>
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
              {data?.orders?.length > 0 ? (
                data?.orders?.map((order, index) => (
                  <tr
                    className="hover:bg-slate-50 border-b border-slate-200"
                    key={index}
                  >
                    <td className="p-4 py-5">
                      <p className="block text-sm text-center text-blue-500 font-semibold">
                        {order.code}
                      </p>
                    </td>
                    <td className="p-4 py-5 cursor-pointer" onClick={() => handleOpenDialogDetail(order)}>
                      <div>
                        <p className="text-sm text-left">
                          <b className="mr-1">Họ và tên:</b>
                          {order.fullName || (
                            <span className="text-red-500">Trống</span>
                          )}
                        </p>
                        <p className="text-sm text-left">
                          <b className="mr-1">Email:</b>
                          {order.email || (
                            <span className="text-red-500">Trống</span>
                          )}
                        </p>
                        <p className="text-sm text-left">
                          <b className="mr-1">Số điện thoại:</b>
                          {order.phone || (
                            <span className="text-red-500">Trống</span>
                          )}
                        </p>
                        <p className="text-sm text-left">
                          <b className="mr-1">Địa chỉ:</b>
                          {order.address || (
                            <span className="text-red-500">Trống</span>
                          )}
                        </p>
                        <p className="text-sm text-left">
                          <b className="mr-1">Thời gian đặt hàng:</b>
                          {order.time || (
                            <span className="text-red-500">Trống</span>
                          )}
                        </p>
                      </div>
                    </td>
                    <td className="p-4 py-5">
                      <p
                        className={`text-sm text-center font-medium ${
                          order.type == 1 ? "text-green-700" : "text-blue-500"
                        }`}
                      >
                        {order.type == 1 ? "Tại cửa hàng" : "Chuyển khoản"}
                      </p>
                    </td>
                    <td className="p-4 py-5">
                      <div className="flex justify-center items-center">
                        <select
                          disabled={mutationUpdateStatusOrder.isPending}
                          className={`text-sm px-3 py-1 rounded-xl font-semibold border text-center border-black ${order.status == 0 ? "text-red-500" : order.status == 1 ? "text-pink-500" : order.status == 2 ? "text-blue-500" : "text-green-500"}`}
                          value={order.status}
                          onChange={(e) => handleChangeStatus(order.id, e.target.value)}
                        >
                          <option value="0" className="bg-white text-black">Đã hủy</option>
                          <option value="1" className="bg-white text-black">Đang xử lí</option>
                          <option value="2" className="bg-white text-black">Đang giao hàng</option>
                          <option value="3" className="bg-white text-black">Đã giao hàng</option>
                        </select>
                      </div>
                    </td>
                    <td className="p-4 py-5">
                      <button className="text-sm block w-full text-center cursor-pointer text-blue-500 underline" onClick={() => handleOpenDialogDetail(order)}>
                        Xem chi tiết
                      </button>
                    </td>
                    {userProfile?.role != 3 && (
                      <td>
                        <div className="p-4 py-5 space-x-4 text-[15px] font-medium flex items-center">
                          <button
                            onClick={() => handleOpenEditDialog(order)}
                            className="text-blue-500 hover:text-blue-700 cursor-pointer"
                          >
                            <FaShippingFast size={20} />
                          </button>
                          <button
                            onClick={() => handleOpenDialog(order.id)}
                            className="text-red-500 hover:text-red-700 cursor-pointer"
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr className="text-center">
                  <td colSpan="5" className="p-4">
                    <div className="w-full text-center py-7 font-medium text-gray-700 flex flex-col items-center justify-center">
                      <span>Không có đơn hàng nào.</span>
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
          Bạn có chắc chắn muốn xóa đơn hàng này không? Hành động này không thể
          hoàn tác.
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
            disabled={mutationDeleteOrder.isPending}
            className="cursor-pointer"
          >
            {mutationDeleteOrder.isPending ? "Đang xóa..." : "Xóa"}
          </Button>
        </DialogFooter>
      </Dialog>

      {openDialogDetail && (
        <div 
          className="fixed bg-black/70 top-0 left-0 z-50 w-full h-full" 
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setOpenDialogDetail(false);
            }
          }}
        >
          <div className="w-[60%] min-h-[50%] max-h-[80%] overflow-y-auto bg-white rounded-lg shadow-md p-5 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <button
              className="absolute top-1 right-1 text-3xl text-red-500 cursor-pointer"
              onClick={() => setOpenDialogDetail(false)}
            >
              <IoCloseCircle />
            </button>
            <h2 className="font-medium text-lg mb-2">Sản phẩm đơn hàng <span className="text-red-600 underline font-semibold">{nameCategory}</span>:</h2>
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
                      Màu
                    </p>
                  </th>
                  <th className="p-4 border-b border-slate-200 text-center">
                    <p className="text-sm font-medium leading-none">
                      Số lượng
                    </p>
                  </th>
                  <th className="p-4 border-b border-slate-200 text-center">
                    <p className="text-sm font-medium leading-none">
                      Giá
                    </p>
                  </th>
                  <th className="p-4 border-b border-slate-200 text-center">
                    <p className="text-sm font-medium leading-none">
                      Tổng tiền
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
                        <td className="p-4 py-5">
                          <div className="flex items-center">
                            <img src={checkImageUrl(product?.product?.image)} alt="" className="w-9 h-9 aspect-[1/1] object-cover zoomable-image cursor-pointer" />
                            <p className="text-sm text-left ml-2">
                              {product?.product?.name}
                            </p>
                          </div>
                        </td>
                        <td className="p-4 py-5">
                          <p className="text-sm text-center">
                            {product?.colorName}
                          </p>
                        </td>
                        <td className="p-4 py-5">
                          <p className="text-sm text-center">
                            {product?.quantity}
                          </p>
                        </td>
                        <td className="p-4 py-5">
                          <p className="text-sm text-center">
                            {formatVND(product?.price)}
                          </p>
                        </td>
                        <td className="p-4 py-5">
                          <p className="text-sm text-center">
                            {formatVND(product?.price * product?.quantity)}
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

      <Dialog open={openEditDialog} handler={() => setOpenEditDialog(!openEditDialog)}>
        <DialogBody className="font-medium text-md">
          <h2 className="text-lg font-semibold mb-4">Cập nhật thông tin vận chuyển</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Đơn vị vận chuyển
              </label>
              <input
                type="text"
                name="unit"
                value={editData.unit}
                onChange={handleEditChange}
                className={`w-full p-2 border text-sm ${errors.unit ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none`}
                placeholder="Nhập đơn vị vận chuyển"
              />
              {errors.unit && <p className="text-red-500 text-sm mt-1">{errors.unit}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mã vận chuyển
              </label>
              <input
                type="text"
                name="shippingCode"
                value={editData.shippingCode}
                onChange={handleEditChange}
                className={`w-full p-2 border text-sm ${errors.shippingCode ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none`}
                placeholder="Nhập mã vận chuyển"
              />
              {errors.shippingCode && <p className="text-red-500 text-sm mt-1">{errors.shippingCode}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Link theo dõi
              </label>
              <input
                type="text"
                name="link"
                value={editData.link}
                onChange={handleEditChange}
                className={`w-full p-2 border text-sm ${errors.link ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none`}
                placeholder="Nhập link theo dõi (http:// hoặc https://)"
              />
              {errors.link && <p className="text-red-500 text-sm mt-1">{errors.link}</p>}
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="gray"
            onClick={() => setOpenEditDialog(false)}
            className="mr-1 cursor-pointer"
          >
            Hủy
          </Button>
          <Button
            variant="gradient"
            color="blue"
            onClick={handleConfirmEdit}
            disabled={mutationUpdateShipping.isPending}
            className="cursor-pointer"
          >
            {mutationUpdateShipping.isPending ? "Đang cập nhật..." : "Cập nhật"}
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
