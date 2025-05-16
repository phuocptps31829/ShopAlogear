import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { productHasPriceSchema } from "../../../../zods/admin/product";
import InputField from "../../../ui/InputField";
import SelectField from "../../../ui/SelectField";
import { categoryApi } from "../../../../services/categoryApi";
import { ProductApi } from "../../../../services/productApi";
import { brandApi } from "../../../../services/brandApi";
import { toast } from "react-toastify";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import Skeditor from "../../../ui/Skeditor";
import { FaPlus } from "react-icons/fa";
import { imageApi } from "../../../../services/imageApi";
const URL_IMAGE = import.meta.env.VITE_URL_IMAGE;
import mediumZoom from "medium-zoom";
import { TiDelete } from "react-icons/ti";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const statusOptions = [
  { value: "1", label: "Hiển thị" },
  { value: "0", label: "Ẩn" },
];

export default function ProductHasPrice() {
  const [colors, setColors] = useState([]);
  const [images, setImages] = useState([]);
  const [colorKey, setColorKey] = useState("0");
  const [tempColor, setTempColor] = useState({
    name: "",
    code: "#000000",
  });
  const [brandsptions, setBrandsOptions] = useState([]);
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
  const { data: dataBrands, isLoading: isLoadingBrands } = useQuery({
    queryKey: ["brandsAdmin", { all: 1 }],
    queryFn: () =>
      brandApi.getAllBrandsAdmin({ all: 1 }),
    keepPreviousData: true,
  });
  const navigate = useNavigate();
  const {
    handleSubmit,
    formState: { errors },
    control,
  } = useForm({
    resolver: zodResolver(productHasPriceSchema),
    defaultValues: {
      name: "",
      price: null,
      discount: 0,
      description: "",
      detail: "",
      status: "",
      quantity: 0,
      categoryID: [],
      brandID: null,
    },
  });
  const mutationCreateImages = useMutation({
    mutationFn: imageApi.createImages,
    onSuccess: (data) => {
      const newImages = data?.data.map((image, index) => ({
        image: image,
        key: colorKey == 0 ? null : Number(colorKey),
        status: 1,
        number: images.length + index + 1,
      }));
      setImages([...images, ...newImages]);
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Đã xảy ra lỗi, vui lòng thử lại.";
      toast.error(errorMessage);
    },
  });

  const handleAddImage = (e) => {
    if (colorKey === "") {
      toast.error("Vui lòng chọn màu sắc cho ảnh");
      return;
    }
    const files = Array.from(e.target.files); 
    if (files.length === 0) return;

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("file[]", file);
    });

    mutationCreateImages.mutate(formData);
  };

  const handleColorChange = (e) => {
    setTempColor({
      ...tempColor,
      code: e.target.value,
    });
  };

  const handleDeleteColor = (key) => {
    if (images.find((image) => image.key == key)) {
      toast.error("Màu sắc này đang được sử dụng cho ảnh, không thể xóa.");
      return;
    }
    const newColors = colors.filter((color) => color.key !== key);
    setColors(newColors);
  };

  const handleDeleteImage = (index) => {
    const newImages = images.filter((_, idx) => idx !== index);
    setImages(newImages);
  };

  const handleNameChange = (e) => {
    setTempColor({
      ...tempColor,
      name: e.target.value,
    });
  };

  const handleAddColor = () => {
    if (tempColor.name.trim() === "") {
      toast.error("Vui lòng nhập tên màu sắc");
      return;
    }

    const newColor = {
      name: tempColor.name,
      code: tempColor.code,
      key: colors.length + 1,
      status: 1,
    };

    setColors([...colors, newColor]);
    setTempColor({
      name: "",
      code: "#000000",
    });
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

  useEffect(() => {
    if (!dataBrands) return;

    const formattedData = dataBrands?.products?.map((item) => ({
      value: item.id,
      label: item.name,
    }));

    setBrandsOptions(formattedData);
  }, [dataBrands]);

  const mutationCreateProduct = useMutation({
    mutationFn: ProductApi.createProductAdmin,
    onSuccess: () => {
      toast.success("Thêm mới sản phẩm thành công!");
      navigate("/admin/products");
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
    const colorsWithoutImages = colors.filter(
      (color) => !images.some((image) => image.key === color.key)
    );
  
    if (colorsWithoutImages.length > 0) {
      toast.error("Có màu sắc chưa được chọn ảnh.");
      return;
    }
    const formattedData = {
      ...data,
      status: Number(data.status),
      quantity: Number(data.quantity),
      colors: colors,
      images: images,
      categories: data.categoryID.map(categoryId => ({
        categoryID: Number(categoryId)
      })),
      type: 1,
      brandID: data.brandID ? Number(data.brandID) : null,
    };

    delete formattedData.categoryID;

    mutationCreateProduct.mutate(formattedData);
  };

  useEffect(() => {
    const images = document.querySelectorAll(".zoomable-image");
    mediumZoom(images, { margin: 20, background: "#000000A0" });
  }, [images]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid-cols-1 gap-4 sm:grid md:grid-cols-2 mb-6">
        <InputField
          label="Tên sản phẩm"
          name="name"
          control={control}
          placeholder="Nhập tên sản phẩm"
          errors={errors}
        />
        <SelectField
          label="Thương hiệu"
          name="brandID"
          control={control}
          placeholder="Chọn thương hiệu"
          options={brandsptions}
          errors={errors}
          isLoading={isLoadingBrands}
        />
        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Màu sắc:
          </label>
          <div className="flex gap-2 flex-wrap mb-2">
            {colors.length === 0 && (
              <div className="text-sm text-gray-400">Chưa có màu sắc nào.</div>
            )}
            {colors.map((color) => (
              <div
                key={color.key}
                className="flex border border-gray-300 rounded-md p-2 gap-2 w-fit items-center text-sm relative"
              >
                <button
                  type="button"
                  onClick={() => handleDeleteColor(color.key)}
                  className="text-red-500 cursor-pointer absolute -right-2 -top-2"
                >
                  <TiDelete size={20} />
                </button>
                <div
                  className="w-5 h-5 rounded"
                  style={{ backgroundColor: color.code }}
                />
                <span>{color.name}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-4 items-center">
            <div className="flex border border-gray-300 bg-gray-100 rounded-md p-1 px-2 gap-2 w-fit">
              <input
                type="color"
                value={tempColor.code}
                onChange={handleColorChange}
                className="w-8 h-8"
              />
              <input
                type="text"
                placeholder="Tên màu sắc"
                value={tempColor.name}
                onChange={handleNameChange}
                className="outline-0 bg-transparent text-sm"
              />
            </div>
            <button
              type="button"
              onClick={handleAddColor}
              className="flex items-center gap-2 text-blue-500 cursor-pointer text-sm"
            >
              <FaPlus />
              <span>Thêm màu sắc</span>
            </button>
          </div>
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
                              src={URL_IMAGE + "/" + image.image}
                              alt={image.key}
                              className="w-8 aspect-[1.1] object-cover rounded-md zoomable-image"
                            />
                            {image.key !== null && (
                              <span>
                                {
                                  colors.find((color) => color.key == image.key)
                                    ?.name
                                }
                              </span>
                            )}
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
          <select
            className="w-full rounded-md border border-gray-300 p-2 text-sm"
            onChange={(e) => setColorKey(e.target.value)}
            value={colorKey}
          >
            <option value="0">Ảnh không có màu sắc</option>
            {colors.map((color, index) => (
              <option key={index} value={color.key}>
                {color.name}
              </option>
            ))}
          </select>
          <div className="mt-2">
            <input
              disabled={mutationCreateImages.isPending}
              onChange={handleAddImage}
              id="fileImage"
              type="file"
              className="w-full rounded-md border border-gray-300 p-2 mt-2 hidden"
              multiple
            />
            <label htmlFor="fileImage">
              <div className="flex items-center gap-2 text-blue-500 cursor-pointer text-sm w-fit">
                <FaPlus />
                <span>Chọn ảnh</span>
              </div>
            </label>
          </div>
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
            Mô tả:
          </label>
          <Skeditor control={control} name="description" errors={errors} />
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
          disabled={mutationCreateProduct.isPending}
          type="submit"
          className="rounded-md bg-blue-500 px-6 py-2 text-white shadow-md transition-colors duration-200 hover:bg-blue-600 cursor-pointer"
        >
          {mutationCreateProduct.isPending ? (
            <div className="w-5 h-5 mx-auto border-3 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            "Thêm mới"
          )}
        </button>
      </div>
    </form>
  );
}
