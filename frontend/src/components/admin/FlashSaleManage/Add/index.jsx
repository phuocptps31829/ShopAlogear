import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { flashSaleSchema } from "../../../../zods/admin/flashsale";
import InputField from "../../../ui/InputField";
import SelectField from "../../../ui/SelectField";
import { flashSaleApi } from "../../../../services/flashSaleApi";
import { toast } from "react-toastify";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ProductApi } from "../../../../services/productApi";
import { formatVND } from "../../../../utils/formatPrice";
import Select from "react-select";
import { FaPlus } from "react-icons/fa";
import { TiDelete } from "react-icons/ti";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const typeOptions = [
  { value: "1", label: "Flash Sale" },
  { value: "2", label: "Giảm giá thường" },
];

const statusOptions = [
  { value: "1", label: "Hiển thị" },
  { value: "0", label: "Ẩn" },
];

const formatDateWithSeconds = (dateString) => {
  if (!dateString) return "";
  return dateString.replace("T", " ") + ":00";
};

export default function FlashSaleCreate() {
  const [dataProductSale, setDataProductSale] = useState([]);
  const [displayValue, setDisplayValue] = useState("");
  const [priceSale, setPriceSale] = useState(0);
  const [productSelected, setProductSelected] = useState(null);
  const [productOptions, setProductOptions] = useState([]);
  const navigate = useNavigate();
  const {
    handleSubmit,
    formState: { errors },
    control,
    watch
  } = useForm({
    resolver: zodResolver(flashSaleSchema),
    defaultValues: {
      name: "",
      startTime: "",
      endTime: "",
      type: "",
      status: "",
    },
  });

  const startTime = watch("startTime");
  const endTime = watch("endTime");
  const option = watch("type")

  const handlePriceChange = (e) => {
    const inputValue = e.target.value;
    const numericValue = inputValue.replace(/[^\d]/g, "");
    
    setPriceSale(numericValue ? Number(numericValue) : "");
    
    if (!numericValue) {
      setDisplayValue("");
      return;
    }
    
    const formattedValue = Number(numericValue).toLocaleString("vi-VN");
    setDisplayValue(formattedValue);
  };

  const { data: listProducts, isLoading: isLoadingProducts } = useQuery({
    queryKey: ["productsAllAdmin", { all: 1, type: 1, option, startTime, endTime }],
    queryFn: () =>
      ProductApi.getAllProductsAdmin({
        all: 1,
        type: 1,
        startTime: formatDateWithSeconds(startTime),
        endTime: formatDateWithSeconds(endTime),
        option: option,
      }),
      enabled: !!startTime && !!endTime && !!option,
    keepPreviousData: true,
  });

  useEffect(() => {
    setDataProductSale([]);
  }, [startTime, endTime, option]);

  useEffect(() => {
    if (!listProducts) return;

    const formattedData = listProducts.products
      .filter((item) => 
        !dataProductSale.some((saleItem) => saleItem.productID === item.id) 
      )
      .map((item) => ({
        value: item.id,
        label: item.name + " - " + (item.discount ? formatVND(item.discount) : "Không có giá"),
      }));

    setProductOptions(formattedData);
  }, [listProducts, dataProductSale]);

  const mutationCreateFlashSale = useMutation({
    mutationFn: flashSaleApi.createFlashSale,
    onSuccess: () => {
      toast.success("Thêm mới chương trình thành công!");
      navigate("/admin/flashsale");
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Đã xảy ra lỗi, vui lòng thử lại.";
      toast.error(errorMessage);
    },
  });

  const handleAddProductSale = () => {
    if (!productSelected) {
      toast.error("Vui lòng chọn sản phẩm.");
      return;
    } else if (!priceSale) {
      toast.error("Vui lòng nhập giá áp dụng giảm giá.");
      return;
    }
    setDataProductSale((prev) => [
      ...prev,
      {
        number: prev.length + 1,
        productID: productSelected.value,
        discount: priceSale,
        name: productSelected.label,
      },
    ]);
    setProductSelected(null);
    setDisplayValue("");
    setPriceSale(0);
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const reorderedProducts = [...dataProductSale];
    const [movedItem] = reorderedProducts.splice(result.source.index, 1);
    reorderedProducts.splice(result.destination.index, 0, movedItem);

    // Cập nhật lại number cho tất cả sản phẩm
    const updatedProducts = reorderedProducts.map((item, index) => ({
      ...item,
      number: index + 1,
    }));

    setDataProductSale(updatedProducts);
  };

  const onSubmit = (data) => {
    if(dataProductSale.length < 1) {
      toast.error("Vui lòng chọn ít nhất một sản phẩm.");
      return;
    }
    const newSale = {
      name: data.name,
      startTime: formatDateWithSeconds(data.startTime),
      endTime: formatDateWithSeconds(data.endTime),
      type: Number(data.type),
      status: Number(data.status),
      products: dataProductSale.map((item) => ({
        number: item.number,
        productID: item.productID,
        discount: item.discount,
      })),
    };
    mutationCreateFlashSale.mutate(newSale);
  };

  return (
    <div className="w-[100%] rounded-lg bg-white px-7 py-6 min-h-[calc(100vh-140px)] shadow-sm border border-gray-200">
      <h1 className="mb-4 mr-2 h-fit bg-white text-2xl font-bold">
        Thêm mới chương trình giảm giá
      </h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid-cols-1 gap-4 sm:grid md:grid-cols-2 mb-6">
          <InputField
            label="Tên chương trình"
            name="name"
            control={control}
            placeholder="Tên chương trình"
            type="text"
            errors={errors}
          />
          <InputField
            label="Thời gian bắt đầu"
            name="startTime"
            control={control}
            placeholder="Thời gian bắt đầu"
            type="datetime-local"
            errors={errors}
          />
          <InputField
            label="Thời gian kết thúc"
            name="endTime"
            control={control}
            placeholder="Thời gian kết thúc"
            type="datetime-local"
            errors={errors}
          />
          <SelectField
            label="Loại chương trình"
            name="type"
            control={control}
            placeholder="Chọn loại chương trình"
            options={typeOptions}
            errors={errors}
          />
          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Sản phẩm:
            </label>
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="product-sale-list">
                {(provided) => (
                  <div
                    className="space-y-3 p-3 border border-gray-300 rounded-sm mb-3"
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
                    {dataProductSale.length < 1 && (
                      <div className="text-center text-gray-500">Chưa có sản phẩm nào.</div>
                    )}
                    {dataProductSale.map((item, index) => (
                      <Draggable
                        key={item.productID}
                        draggableId={item.productID.toString()} 
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="bg-gray-50 p-2 px-3 rounded-sm space-y-3 border border-gray-400"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span>{item.number}.</span>
                                <span>{item.name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-blue-600">
                                  {formatVND(item.discount)}
                                </span>
                                <button
                                  onClick={() => {
                                    setDataProductSale((prev) =>
                                      prev
                                        .filter((prevItem) => prevItem.number !== item.number)
                                        .map((prevItem, idx) => ({
                                          ...prevItem,
                                          number: idx + 1, 
                                        }))
                                    );
                                  }}
                                  type="button"
                                  className="text-red-500 cursor-pointer"
                                >
                                  <TiDelete size={20} />
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
            <div className="bg-gray-100 p-5 rounded-sm space-y-3">
              <Select
                isDisabled={isLoadingProducts || !startTime || !endTime || !option}
                isLoading={isLoadingProducts}
                options={productOptions}
                placeholder={
                  isLoadingProducts
                    ? "Đang tải dữ liệu..."
                    : !startTime || !endTime || !option
                    ? "Vui lòng chọn thời gian và loại chương trình trước"
                    : "Chọn sản phẩm"
                }
                value={productSelected}
                onChange={(selected) => setProductSelected(selected)}
                className="basic-single"
                classNamePrefix="select"
              />
              <input 
                type="text" 
                min={0} 
                placeholder="Giá áp dụng giảm giá" 
                className="outline-0 w-full rounded-sm px-2 p-1 border border-gray-400" 
                value={displayValue}
                onChange={handlePriceChange}
              />
              <button
                type="button"
                onClick={handleAddProductSale}
                className="flex items-center gap-2 text-blue-500 cursor-pointer text-sm"
              >
                <FaPlus />
                <span>Thêm sản phẩm</span>
              </button>
            </div>
          </div>
          <SelectField
            label="Trạng thái"
            name="status"
            control={control}
            placeholder="Chọn trạng thái"
            options={statusOptions}
            errors={errors}
          />
        </div>
        <div className="flex justify-end gap-3">
          <Link
            to="/admin/flashsale"
            className="rounded-md bg-gray-200 px-6 py-2 text-gray-600 shadow-md transition-colors duration-200 hover:bg-gray-300 hover:text-gray-700"
          >
            Hủy
          </Link>
          <button
            disabled={mutationCreateFlashSale.isPending}
            type="submit"
            className="rounded-md bg-blue-500 px-6 py-2 text-white shadow-md transition-colors duration-200 hover:bg-blue-600 cursor-pointer"
          >
            {mutationCreateFlashSale.isPending ? (
              <div className="w-5 h-5 mx-auto border-3 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "Thêm mới"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
