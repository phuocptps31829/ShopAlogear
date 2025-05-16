import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ReactPaginate from "react-paginate";
import { useQuery } from "@tanstack/react-query";
import { GrFormNext, GrFormPrevious } from "react-icons/gr";
import { FaPlus } from "react-icons/fa6";
import { FaPlusCircle, FaMinusCircle } from "react-icons/fa";
import { LuWarehouse } from "react-icons/lu";
import { ProductApi } from "../../../../services/productApi";
import LoadingSpin from "../../../ui/LoadingSpin";
import useDebounce from "../../../../hooks/useDebounce";
import { formatVND } from "../../../../utils/formatPrice"
import mediumZoom from "medium-zoom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogBody,
  DialogFooter,
  Button,
} from "@material-tailwind/react";
import { checkImageUrl } from "../../../../utils/checkImageUrl";
import { useSelector } from "react-redux";

export default function ProductList() {
  const userProfile = useSelector((state) => state.auth.userProfile);
  const [pageCount, setPageCount] = useState(1);
  const [page, setPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [search, setSearch] = useState("");
  const debouncedSearchTerm = useDebounce(search, 300);
  const limit = 5;
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [typeProduct, setTypeProduct] = useState(null);
  const [loadingChangeType, setLoadingChangeType] = useState(false);
  const [editQuantity, setEditQuantity] = useState({});
  const [loadingProductId, setLoadingProductId] = useState(null);
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["productsAllAdmin", { typeProduct, limit, page, search: debouncedSearchTerm }],  
    queryFn: () => ProductApi.getAllProductsAdmin({
      sort: typeProduct == 1 ? 10 : null,
      type: typeProduct,
      limit,
      page,
      search: debouncedSearchTerm,
    }),
    keepPreviousData: true,
  });

  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    if (data?.products?.length > 0) {
      const initialQuantities = {};
      data.products.forEach((product) => {
        initialQuantities[product.id] = 0; 
      });
      setEditQuantity(initialQuantities);
    }
  }, [data]);

  const mutationDeleteProduct = useMutation({
    mutationFn: ProductApi.deleteProductAdmin,
    onSuccess: () => {
      toast.success("Xóa sản phẩm thành công!");
      setOpenDialog(false);
      queryClient.invalidateQueries(["productsAllAdmin", { limit, page }]);
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Đã xảy ra lỗi, vui lòng thử lại.";
      toast.error(errorMessage);
      setOpenDialog(false);
    },
  });

  const mutationUpdateQuantity = useMutation({
    mutationFn: ProductApi.updateQuantity,
    onSuccess: () => {
      toast.success("Cập nhật số lượng thành công!");
      queryClient.invalidateQueries(["productsAllAdmin", { typeProduct, limit, page, search: debouncedSearchTerm }]);
      setLoadingProductId(null);
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || "Đã xảy ra lỗi, vui lòng thử lại.";
      toast.error(errorMessage);
      setLoadingProductId(null);
    },
  });

  const handleOpenDialog = (orderId) => {
    setSelectedProductId(orderId);
    setOpenDialog(true);
  };

  const handleConfirmDelete = () => {
    if (selectedProductId) {
      mutationDeleteProduct.mutate(selectedProductId);
    }
  };

  useEffect(() => {
    if(!data) return;
    setPageCount(data?.page)
    setTotalRecords(data?.totalRecords)
  }, [data]);

  useEffect(() => {
    const attachZoom = () => {
      const images = document.querySelectorAll(".zoomable-image");
      if (images.length > 0) {
        mediumZoom(images, { margin: 20, background: "#000000A0" });
      }
    };

    attachZoom();
    const timeout = setTimeout(attachZoom, 100); 

    return () => clearTimeout(timeout); 
  }, [data, typeProduct, loadingChangeType]);

  const handleFilterType = (type) => {
    setTypeProduct(type);
    setLoadingChangeType(true);
    setPage(1);
    setTimeout(() => {
      setLoadingChangeType(false);
    }, 500);
  }

  const handleQuantityChange = (productId, value) => {
    setEditQuantity((prev) => ({
      ...prev,
      [productId]: value, 
    }));
  };

  const handleSaveQuantity = (productId) => {
    setLoadingProductId(productId);
    const quantity = editQuantity[productId];
    mutationUpdateQuantity.mutate({ id: productId, quantity });
  };

  return (
    <>
      <div className="w-full flex justify-between items-center mb-3 mt-1">
        <div className="w-full">
          <div className="relative flex justify-between w-full items-center gap-10">
            <div className="relative max-w-sm sm:min-w-[350px] w-full">
              <input
                className="bg-white w-full pr-11 h-10 pl-3 py-2 placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded transition duration-200 ease focus:outline-none focus:border-slate-400 hover:border-slate-400 shadow-sm focus:shadow-md"
                placeholder="Tìm kiếm theo tên sản phẩm"
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
            <div className="flex items-center gap-3">
              <button 
              disabled={loadingChangeType}
              onClick={() => {
                const type = typeProduct == 1 ? null : 1;
                handleFilterType(type);
              }} className="text-sm whitespace-nowrap text-white bg-green-600 flex items-center font-medium px-4 py-2 rounded-md hover:bg-green-800 cursor-pointer transition duration-200 ease">
                {typeProduct == null ? (
                  <>
                    Quản lí kho <LuWarehouse className="inline-block ml-2" />
                  </>
                ) : (
                  <>
                    Tất cả sản phẩm
                  </>
                )} 
              </button>
              <Link to="/admin/products/create" className="text-sm whitespace-nowrap text-white bg-blue-600 flex items-center font-medium px-4 py-2 rounded-md hover:bg-blue-800 transition duration-200 ease">
                Thêm mới <FaPlus className="inline-block ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="relative flex flex-col w-full h-full overflow-scroll text-gray-700 bg-white shadow-md rounded-lg bg-clip-border">
      <table className="w-full text-left table-auto min-w-max">
        <thead className="text-white bg-gradient-to-r from-[#141E30] to-[#89e2e3]">
          <tr>
            <th className="p-4 border-b border-slate-200">
              <p className="text-sm font-medium leading-none text-center">STT</p>
            </th>
            <th className="p-4 border-b border-slate-200">
              <p className="text-sm font-medium leading-none">Tên sản phẩm</p>
            </th>
            {typeProduct == 1 ? (
              <>
                <th className="p-4 border-b border-slate-200 text-center">
                  <p className="text-sm font-medium leading-none">Số lượng</p>
                </th>
                <th className="p-4 border-b border-slate-200 text-center">
                  <p className="text-sm font-medium leading-none">
                    Cập nhật số lượng
                  </p>
                </th>
              </>
            ) : (
              <>
                <th className="p-4 border-b border-slate-200 text-center">
                  <p className="text-sm font-medium leading-none">Giá</p>
                </th>
                <th className="p-4 border-b border-slate-200 text-center">
                  <p className="text-sm font-medium leading-none">Loại sản phẩm</p>
                </th>
                <th className="p-4 border-b border-slate-200 text-center">
                  <p className="text-sm font-medium leading-none">Trạng thái</p>
                </th>
                {userProfile?.role != 3 && (
                  <th className="p-4 border-b border-slate-200"></th>
                )}
              </>
            )}
          </tr>
        </thead>
        {isLoading || loadingChangeType ? (
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
                      <img src={checkImageUrl(product?.image)} className="w-9 mr-3 zoomable-image" alt="" />
                      <Link to={`/admin/products/edit/${product.id}`} className="text-blue-500 cursor-pointer font-medium">
                        {product.name}
                      </Link>
                    </p>
                  </td>
                  {typeProduct == 1 ? (
                    <>
                      <td className="p-4 py-5">
                        <p className={`${!product.quantity && "text-red-600"} font-semibold text-sm text-center`}>{!product.quantity ? "Hết hàng" : product.quantity}</p>
                      </td>
                      <td className="p-4 py-5">
                        <div className="flex items-center justify-center gap-2">
                          <input
                            type="number"
                            value={editQuantity[product.id]}
                            onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                            className="w-16 text-center border border-slate-300 rounded-md p-1"
                          />
                          <button
                            onClick={() => handleSaveQuantity(product.id)}
                            className={`${editQuantity[product.id] >= 0 ? "hover:bg-green-600 bg-green-500" : "hover:bg-red-600 bg-red-500"} ${editQuantity[product.id] == 0 ? "opacity-50" : "cursor-pointer"} text-white text-sm text-whitefont-semibold  px-2 py-1 rounded`}
                            disabled={mutationUpdateQuantity.isPending && loadingProductId == product.id || editQuantity[product.id] == 0}
                          >
                            {mutationUpdateQuantity.isPending && loadingProductId == product.id ? <div className="w-5 h-5 mx-auto border-3 border-white border-t-transparent rounded-full animate-spin"></div> : editQuantity[product.id] >= 0 ? <FaPlusCircle className="inline-block" size={15} /> : <FaMinusCircle className="inline-block" size={15} />}
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="p-4 py-5">
                        <p className="text-sm text-center">
                          {formatVND(product.discount) || formatVND(product.price)}
                        </p>
                      </td>
                      <td className="p-4 py-5">
                        <p className="text-sm text-center">
                          {product.type == 3 ? "Dịch vụ" : product.type == 4 ? "Sample packs" : "Sản phẩm"}
                        </p>
                      </td>
                      <td className="p-4 py-5">
                        <p className="text-sm text-center">
                          {product.status == "1" ? "Hiện" : "Ẩn"}
                        </p>
                      </td>
                      {userProfile?.role != 3 && (
                        <td className="p-4 py-5 space-x-4 text-[15px] font-medium">
                          <Link to={`/admin/products/edit/${product.id}`} className="text-blue-500 hover:text-blue-700 cursor-pointer">
                            Sửa
                          </Link>
                          <button onClick={() => handleOpenDialog(product.id)} className="text-red-500 hover:text-red-700 cursor-pointer">
                            Xóa
                          </button>
                        </td>
                      )}
                    </>
                  )}
                </tr>
              ))
            ) : (
              <tr className="text-center">
                <td colSpan={typeProduct == 1 ? 3 : userProfile?.role != 3 ? 6 : 5} className="p-4">
                  <div className="w-full text-center py-7 font-medium text-gray-700 flex flex-col items-center justify-center">
                    <span>Không có sản phẩm nào.</span>
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
            disabled={mutationDeleteProduct.isPending}
            className="cursor-pointer"
          >
            {mutationDeleteProduct.isPending ? "Đang xóa..." : "Xóa"}
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
