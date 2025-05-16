import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { samplePackSchema } from "../../../../zods/admin/product";
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

export default function SamplePack({ data: dataProduct }) {
  const [images, setImages] = useState([]);
  const [parentOptions, setParentOptions] = useState([]);
  const { data, isLoading } = useQuery({
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
    watch,
    setValue
  } = useForm({
    resolver: zodResolver(samplePackSchema),
    defaultValues: {
      name: "",
      price: null,
      discount: null,
      iframe: "",
      detail: "",
      status: "",
      quantity: 0,
      categoryID: [],
    },
  });

  useEffect(() => {
      if (!dataProduct) return;
      setValue("name", dataProduct?.name);
      setValue("price", dataProduct?.price);
      setValue("discount", dataProduct?.discount);
      setValue("detail", dataProduct?.detail || "");
      setValue("status", dataProduct?.status.toString());
      setValue("quantity", dataProduct?.quantity);
      setValue("categoryID", dataProduct?.categories.map(category => category.id));
      setValue("iframe", dataProduct?.iframe);
      setImages(
        dataProduct?.images?.map(({ colorID, ...rest }) => ({ 
          ...rest, 
          colorID,
          key: colorID
        }))
      );
    }, [dataProduct, setValue]);

  const iframeValue = watch("iframe");
  const iframeRegex = /<iframe.*?src=["'](.*?)["'].*?>.*?<\/iframe>/i;
  const isValidIframe = iframeRegex.test(iframeValue);

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
    if (!data) return;

    const formattedData = data.products.flatMap((item) => {
      const parent = {
        value: item.id,
        label: (item.icon || "") + " " + item.name,
      };

      const children =
        item.children?.map((child) => ({
          value: child.id,
          label: "— " + (child.icon || "") + " " + child.name,
        })) || [];

      return [parent, ...children];
    });

    setParentOptions(formattedData);
  }, [data]);

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

  const onSubmit = (data) => {
    const formattedData = {
      ...data,
      description: "",
      status: Number(data.status),
      quantity: Number(data.quantity),
      images: images,
      categories: data.categoryID.map(categoryId => ({
        categoryID: Number(categoryId)
      })),
      type: 4,
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
          <InputField
            format={true}
            label="Iframe"
            name="iframe"
            type="text"
            control={control}
            placeholder="Nhập iframe"
            errors={errors}
          />
          {iframeValue !== "" && (
            isValidIframe ? (
                <div className="mt-3 rounded-sm overflow-hidden"
                    dangerouslySetInnerHTML={{ __html: iframeValue }}>
                </div>
                ) : (
                <p className="text-red-500 mt-3 text-sm text-center"><span className="text-[11px]">❌</span> Định dạng iframe không hợp lệ!</p>
            )
           )}
        </div>
        <InputField
          format={true}
          label="Giá gốc"
          name="price"
          type="number"
          control={control}
          placeholder="Nhập giá sản phẩm"
          errors={errors}
        />
        <InputField
          format={true}
          label="Giá giảm"
          name="discount"
          type="number"
          control={control}
          placeholder="Nhập giá giảm"
          errors={errors}
        />
        <InputField
          label="Số lượng"
          type="number"
          name="quantity"
          control={control}
          placeholder="Nhập số lượng"
          errors={errors}
        />
        <SelectField
          label="Danh mục"
          name="categoryID"
          control={control}
          placeholder="Chọn danh mục"
          options={parentOptions}
          errors={errors}
          isLoading={isLoading}
          isMulti={true}
        />
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

SamplePack.propTypes = {
  data: PropTypes.object,
};