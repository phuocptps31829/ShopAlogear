import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { serviceSchema } from "../../../../zods/admin/product";
import InputField from "../../../ui/InputField";
import SelectField from "../../../ui/SelectField";
import { categoryApi } from "../../../../services/categoryApi";
import { ProductApi } from "../../../../services/productApi";
import { toast } from "react-toastify";
import { useMutation, useQuery } from "@tanstack/react-query";
import Skeditor from "../../../ui/Skeditor";
import { FaPlus } from "react-icons/fa";
import { imageApi } from "../../../../services/imageApi";
import mediumZoom from "medium-zoom";
import { TiDelete } from "react-icons/ti";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import PropTypes from "prop-types";
import { checkImageUrl } from "../../../../utils/checkImageUrl";

const statusOptions = [
  { value: "1", label: "Hiển thị" },
  { value: "0", label: "Ẩn" },
];

export default function Service({ data: dataProduct }) {
  const [optionIcon, setOptionIcon] = useState("");
  const [optionName, setOptionName] = useState("");
  const [options, setOptions] = useState([]);
  const [dataCategories, setDataCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [images, setImages] = useState([]);
  const { data: dataCategoryType2 } = useQuery({
    queryKey: ["categoriesAdmin", { all: 1, type: 2 }],
    queryFn: () =>
      categoryApi.getAllCategoriesAdmin({
        all: 1,
        type: 2,
      }),
    keepPreviousData: true,
  });
  const { data: categoriesType1, isLoading: isLoadingCategoriesType1 } =
    useQuery({
      queryKey: ["categoriesAdmin", { all: 1, type: 1 }],
      queryFn: () =>
        categoryApi.getAllCategoriesAdmin({
          all: 1,
          type: 1,
        }),
      keepPreviousData: true,
    });
  const {
    handleSubmit,
    formState: { errors },
    control,
    setValue
  } = useForm({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: "",
      detail: "",
      status: "",
    },
  });

  useEffect(() => {
        if (!dataProduct) return;
        setValue("name", dataProduct?.name);
        setValue("detail", dataProduct?.detail || "");
        setValue("status", dataProduct?.status.toString());
        setOptions(dataProduct?.options)
        setImages(
          dataProduct?.images?.map(({ colorID, ...rest }) => ({ 
            ...rest, 
            colorID,
            key: colorID,
            image: rest.image
          }))
        );
      }, [dataProduct, setValue]);

  const handleAddOption = () => {
    if (!optionName) {
      toast.error("Vui lòng nhập tên và chọn danh mục!");
      return;
    }

    const newOption = {
      name: optionName,
      categoryID: categoryId == "" ? null : Number(categoryId),
      number: options.length + 1,
      image: optionIcon,
    };
    setOptions([...options, newOption]);
    setOptionName("");
    setCategoryId("");
    setOptionIcon("");
  };

  const mutationCreateImages = useMutation({
    mutationFn: imageApi.createImages,
    onSuccess: (data) => {
      const newImages = data.data.map((item, index) => ({
        image: item,
        key: null,
        status: 1,
        number: images.length + index + 1,
      }));
      console.log(newImages);
      setImages([...images, ...newImages]);
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Đã xảy ra lỗi, vui lòng thử lại.";
      toast.error(errorMessage);
    },
  });

  const handleAddImage = (e) => {
    const files = e.target.files;
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("file[]", files[i]);
    }
    mutationCreateImages.mutate(formData);
  };

  const handleDeleteImage = (index) => {
    const newImages = images.filter((_, idx) => idx !== index);
    setImages(newImages);
  };

  useEffect(() => {
    if (!categoriesType1) return;

    const formattedDataType1 = categoriesType1?.products?.flatMap((item) => {
      const parent = {
        value: item.id,
        label: (item.icon || "") + " " + item.name,
      };

      const children =
        item.children?.map((child) => ({
          value: child.id,
          label: "----- " + (child.icon || "") + " " + child.name,
        })) || [];

      return [parent, ...children];
    }) || [];

    setDataCategories(formattedDataType1);
  }, [isLoadingCategoriesType1, categoriesType1]);

  const mutationEditProduct = useMutation({
    mutationFn: ProductApi.updateProductAdmin,
    onSuccess: () => {
      toast.success("Chỉnh sửa sản phẩm thành công!");
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Đã xảy ra lỗi, vui lòng thử lại.";
      toast.error(errorMessage);
    },
  });

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const reorderedImages = [...images];
    const [movedItem] = reorderedImages.splice(result.source.index, 1);
    reorderedImages.splice(result.destination.index, 0, movedItem);

    const updatedImages = reorderedImages.map((img, index) => ({
      ...img,
      number: index + 1,
    }));

    setImages(updatedImages);
  };

  const handleOptionDragEnd = (result) => {
    if (!result.destination) return;

    const reorderedOptions = [...options];
    const [movedItem] = reorderedOptions.splice(result.source.index, 1);
    reorderedOptions.splice(result.destination.index, 0, movedItem);

    const updatedOptions = reorderedOptions.map((option, index) => ({
      ...option,
      number: index + 1,
    }));

    setOptions(updatedOptions);
  };

  const onSubmit = (data) => {
    const formattedData = {
      ...data,
      description: "",
      status: Number(data.status),
      quantity: 1,
      images: images,
      options: options,
      categories: [
        { categoryID: dataCategoryType2.products[0]?.id }
      ],
      type: 3,
      discount: null,
      price: null,
    };

    delete formattedData.categoryID;

    mutationEditProduct.mutate({ id: dataProduct.id, data: formattedData });
  };

  useEffect(() => {
    const images = document.querySelectorAll(".zoomable-image");
    mediumZoom(images, { margin: 20, background: "#000000A0" });
  }, [images]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid-cols-1 gap-4 sm:grid md:grid-cols-2 mb-6">
        <div className="col-span-2">
          <InputField
            label="Tên sản phẩm"
            name="name"
            control={control}
            placeholder="Nhập tên sản phẩm"
            errors={errors}
          />
        </div>
        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hình ảnh:
          </label>
          {mutationCreateImages.isPending ? (
            <div className="w-6 h-6 my-5 border-3 border-t-blue-500 border-gray-300 rounded-full animate-spin" ></div>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="images-list">
                {(provided) => (
                  <div
                    className="flex gap-2 flex-wrap mb-2"
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
                    {images.length === 0 && (
                      <div className="text-sm text-gray-400">
                        Chưa có ảnh nào.
                      </div>
                    )}

                    {images.map((image, index) => (
                      <Draggable
                        key={image.image}
                        draggableId={image.image}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="flex border border-gray-300 rounded-md p-2 gap-2 w-fit items-center text-sm relative"
                          >
                            <button
                              type="button"
                              onClick={() => handleDeleteImage(index)}
                              className="text-red-500 cursor-pointer absolute -right-2 -top-2"
                            >
                              <TiDelete size={20} />
                            </button>
                              <img
                                src={checkImageUrl(image.image)}
                                alt={image.key}
                                className="w-12 aspect-[1.1] object-cover rounded-sm zoomable-image"
                              />
                          </div>
                        )}
                      </Draggable>
                    ))}

                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
          <div className="mt-2">
            <input  
              disabled={mutationCreateImages.isPending}
              multiple
              onChange={handleAddImage}
              id="fileImage"
              type="file"
              className="w-full rounded-md border border-gray-300 p-2 mt-2 hidden"
            />
            <label htmlFor="fileImage" className="w-fit">
              <div className="flex items-center gap-2 text-blue-500 cursor-pointer text-sm w-fit">
                <FaPlus />
                <span>Chọn ảnh</span>
              </div>
            </label>
          </div>
        </div>
        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Danh mục sản phẩm thuộc dịch vụ:
          </label>
          <div className="flex flex-col gap-4">
            {options.length > 0 && (
              <DragDropContext onDragEnd={handleOptionDragEnd}>
                <Droppable droppableId="options-list">
                  {(provided) => (
                    <div
                      className="mt-2 space-y-2"
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                    >
                      {options.map((cat, index) => (
                        <Draggable
                          key={`${cat.name}-${index}`}
                          draggableId={`${cat.name}-${index}`}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="p-3 w-full bg-gray-100 max-w-[500px] rounded-sm flex justify-between items-center border-2 border-gray-200"
                            > 
                              <div className="flex items-center sm:text-sm text-[13px]">
                                <span className="mr-2 text-md">{cat.image}</span>
                                <span className="font-medium max-w-[300px] line-clamp-1">
                                  {cat.name}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                {cat.categoryID && (
                                  <Link
                                    className="sm:text-sm text-[12px] font-medium bg-red-600 sm:px-4 px-2 py-1 text-white rounded cursor-pointer"
                                    to={`/category/products?categoryID=${cat.categoryID}`}
                                    target="_blank"
                                  >
                                    Xem
                                  </Link>
                                )}
                                <button
                                  type="button"
                                  onClick={() =>
                                    setOptions(options.filter((_, i) => i !== index))
                                  }
                                  className="text-red-500"
                                >
                                  <TiDelete size={20} />
                                </button>
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
            )}

            <div className="flex border border-gray-300 bg-gray-100 rounded-md p-1 px-2 gap-2 w-fit">
              <input
                type="text"
                placeholder="Biểu tượng"
                className="outline-0 bg-transparent text-sm px-2 py-1 max-w-25"
                value={optionIcon}
                onChange={(e) => setOptionIcon(e.target.value)}
              />
              <input
                type="text"
                placeholder="Tên lựa chọn"
                className="outline-0 bg-transparent text-sm px-2 py-1"
                value={optionName}
                onChange={(e) => setOptionName(e.target.value)}
              />
              <select
                className="w-full rounded-md border border-gray-300 p-2 text-sm outline-0"
                onChange={(e) => setCategoryId(e.target.value)}
                value={categoryId}
              >
                {isLoadingCategoriesType1 ? (
                  <option value="" disabled>
                    Đang tải dữ liệu...
                  </option>
                ) : (
                  <>
                    <option value="">Không thuộc danh mục nào</option>
                    {dataCategories.map((item, index) => (
                      <option key={index} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </>
                )}
              </select>
            </div>
            <button
              type="button"
              onClick={handleAddOption}
              className="flex items-center gap-2 text-blue-500 cursor-pointer text-sm w-fit"
            >
              <FaPlus />
              <span>Thêm lựa chọn</span>
            </button>
          </div>
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Chi tiết:
          </label>
          <Skeditor control={control} name="detail" errors={errors} />
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
          to="/admin/products"
          className="rounded-md bg-gray-200 px-6 py-2 text-gray-600 shadow-md transition-colors duration-200 hover:bg-gray-300 hover:text-gray-700"
        >
          Hủy
        </Link>
        <button
          disabled={mutationEditProduct.isPending}
          type="submit"
          className="rounded-md bg-blue-500 px-6 py-2 text-white shadow-md transition-colors duration-200 hover:bg-blue-600 cursor-pointer"
        >
          {mutationEditProduct.isPending ? (
            <div className="w-5 h-5 mx-auto border-3 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            "Chỉnh sửa"
          )}
        </button>
      </div>
    </form>
  );
}

Service.propTypes = {
  data: PropTypes.object,
};