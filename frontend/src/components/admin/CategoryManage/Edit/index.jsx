import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { useMutation, useQuery } from "@tanstack/react-query";
import { categoryEditSchema } from "../../../../zods/admin/category";
import InputField from "../../../ui/InputField";
import SelectField from "../../../ui/SelectField";
import { categoryApi } from "../../../../services/categoryApi";
import BannerFormSkeleton from "../../../ui/SkeletonLoadingAdmin";

const typeOptions = [
  { value: "1", label: "Sản phẩm" },
  { value: "2", label: "Dịch vụ" },
];

const statusOptions = [
  { value: "1", label: "Hiển thị" },
  { value: "0", label: "Ẩn" },
];

const displayOptions = [
  { value: "1", label: "Hiển thị" },
  { value: "0", label: "Ẩn" },
];

export default function CategoryEdit() {
  const { id } = useParams();
  const [disabledCategory, setDisabledCategory] = useState(false);
  const [typeCategory, setTypeCategory] = useState(null);
  const [numberOptions, setNumberOptions] = useState([]);
  const [parentOptions, setParentOptions] = useState([]);
  const { data: dataCategory, isLoading: isLoadingCategory } = useQuery({
    queryKey: ["categoryById", id],
    queryFn: () => categoryApi.getCategoryById(id),
    keepPreviousData: true,
  });
  const { data, isLoading } = useQuery({
    queryKey: ["categoriesAdmin", { all: 1, type: typeCategory }],
    queryFn: () =>
      categoryApi.getAllCategoriesAdmin({
        all: 1,
        type: typeCategory,
      }),
      enabled: !!typeCategory,
    keepPreviousData: true,
  });

  const {
    handleSubmit,
    formState: { errors },
    control,
    setValue,
    watch
  } = useForm({
    resolver: zodResolver(categoryEditSchema),
    defaultValues: {
      name: "",
      icon: "",
      type: "",
      status: "",
      parent: "",
      display: "",
      number: "",
    },
  });

  const watchType = watch("type");
  
  useEffect(() => {
    if (watchType) {
      setTypeCategory(watchType);
    }
  }, [watchType]);

  useEffect(() => {
    if (isLoadingCategory) return;
    setValue("name", dataCategory?.name || "");
    setValue("icon", dataCategory?.icon || "");
    setValue(
      "type",
      dataCategory?.type != null ? dataCategory?.type.toString() : ""
    );
    setValue(
      "status",
      dataCategory?.status != null ? dataCategory?.status.toString() : ""
    );
    setValue(
      "parent",
      dataCategory?.parent != null ? dataCategory?.parent : 0
    );
    setValue(
      "display",
      dataCategory?.display != null ? dataCategory?.display.toString() : ""
    );
    setValue(
      "number",
      dataCategory?.number != null ? dataCategory?.number : null
    );
    setNumberOptions(
      dataCategory.listNumber.map((item) => ({
        value: item == 0 ? 9999 : item, 
        label: "Số thứ tự " + item,
      }))
    );
    setDisabledCategory((dataCategory?.parent == null && dataCategory?.type == 2));
  }, [dataCategory, isLoadingCategory, setValue]);

  useEffect(() => {
    if (!data) return;
    const formattedData = data?.products?.map((item) => ({
      value: item.id,
      label: item.icon + " " + item.name,
    }));
    if(typeCategory == "1") {
      formattedData.unshift({ value: 0, label: "Danh mục cha" });
    }
    setParentOptions(formattedData);
  }, [data, typeCategory]);

  const mutationEditCategory = useMutation({
    mutationFn: categoryApi.updateCategoryAdmin,
    onSuccess: () => {
      toast.success("Chỉnh sửa danh mục thành công!");
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Đã xảy ra lỗi, vui lòng thử lại.";
      toast.error(errorMessage);
    },
  });

  const onSubmit = (data) => {
    const formattedData = {
      ...data,
      parent: data.parent == 0 ? null : Number(data.parent),
      type: Number(data.type),
      status: Number(data.status),
      display: Number(data.display),
      number: (data.number == 9999 || !data.number) ? 0 : Number(data.number),
    };

    mutationEditCategory.mutate({ id, data: formattedData });
  };

  if (isLoadingCategory) return <BannerFormSkeleton />;

  return (
    <div className="w-[100%] rounded-lg bg-white px-7 py-6 min-h-[calc(100vh-140px)] shadow-sm border border-gray-200">
      <h1 className="mb-4 mr-2 h-fit bg-white text-2xl font-bold">
        Chỉnh sửa danh mục
      </h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid-cols-1 gap-4 sm:grid md:grid-cols-2 mb-6">
          <InputField
            label="Tên danh mục"
            name="name"
            control={control}
            placeholder="Nhập tên danh mục"
            errors={errors}
          />
          <InputField
            label="Biểu tượng"
            name="icon"
            control={control}
            placeholder="Nhập biểu tượng danh mục"
            errors={errors}
          />
          <SelectField
            label="Kiểu danh mục"
            name="type"
            control={control}
            placeholder="Chọn kiểu danh mục"
            options={typeOptions}
            errors={errors}
            disabled={true}
          />
          <SelectField
            disabled={isLoading || disabledCategory}
            label="Danh mục cha"
            name="parent"
            control={control}
            placeholder="Chọn danh mục cha"
            options={parentOptions}
            errors={errors}
            isLoading={isLoading}
          />
          <SelectField
            label="Trạng thái"
            name="status"
            control={control}
            placeholder="Chọn trạng thái"
            options={statusOptions}
            errors={errors}
          />
          <SelectField
            label="Số thứ tự hiển thị"
            name="number"
            control={control}
            placeholder="Chọn số thứ tự hiển thị"
            options={numberOptions}
            errors={errors}
          />
          <SelectField
            label="Hiển thị ở trang chủ"
            name="display"
            control={control}
            placeholder="Chọn hiển thị ở trang chủ"
            options={displayOptions}
            errors={errors}
          />
        </div>
        <div className="flex justify-end gap-3">
          <Link
            to="/admin/categories"
            className="rounded-md bg-gray-200 px-6 py-2 text-gray-600 shadow-md transition-colors duration-200 hover:bg-gray-300 hover:text-gray-700"
          >
            Hủy
          </Link>
          <button
            disabled={mutationEditCategory.isPending}
            type="submit"
            className="rounded-md bg-blue-500 px-6 py-2 text-white shadow-md transition-colors duration-200 hover:bg-blue-600 cursor-pointer"
          >
            {mutationEditCategory.isPending ? (
              <div className="w-5 h-5 mx-auto border-3 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "Xác nhận"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
