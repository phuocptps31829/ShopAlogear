import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { bannerSchema } from "../../../../zods/admin/banner";
import InputField from "../../../ui/InputField";
import SelectField from "../../../ui/SelectField";
import { imageApi } from "../../../../services/imageApi";
import { bannerApi } from "../../../../services/bannerApi";
import { toast } from "react-toastify";
import { useQuery, useMutation } from "@tanstack/react-query";
import { FaRegImage } from "react-icons/fa";
import { useParams } from "react-router-dom";
const URL_IMAGE = import.meta.env.VITE_URL_IMAGE;
import BannerFormSkeleton from "../../../ui/SkeletonLoadingAdmin";

const typeOptions = [
  { value: "1", label: "Banner chính" },
  { value: "2", label: "Banner phụ" },
];

const statusOptions = [
  { value: "1", label: "Hiển thị" },
  { value: "0", label: "Ẩn" },
];

export default function BannerEdit() {
  const [numberOptions, setNumberOptions] = useState([]);
  const [image, setImage] = useState("");
  const { id } = useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["bannersAdmin", id],
    queryFn: () => bannerApi.getBannerById(id),
    keepPreviousData: true,
  });

  const {
    handleSubmit,
    formState: { errors },
    control,
    setValue,
    getValues,
  } = useForm({
    resolver: zodResolver(bannerSchema),
    defaultValues: {
      image: "",
      type: "",
      status: "",
      link: "",
      number: "",
    },
  });

  useEffect(() => {
    if (isLoading) return;
    setImage(data?.image);
    setValue("image", data?.image);
    setValue("type", data?.type != null ? data?.type.toString() : "");
    setValue("status", data?.status != null ? data?.status.toString() : "");
    setValue(
      "number",
      data?.number != null ? data?.number : 1
    );
    setValue("link", data?.link || "");
    setNumberOptions(
      data.listNumber.map((item) => ({
        value: item,
        label: "Số thứ tự " + item,
      }))
    );
  }, [data, isLoading, setValue]);

  const mutationCreateImages = useMutation({
    mutationFn: imageApi.createImages,
    onSuccess: (data) => {
      setValue("image", data?.data[0]);
      setImage(data?.data[0]);
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Đã xảy ra lỗi, vui lòng thử lại.";
      toast.error(errorMessage);
    },
  });

  const mutationEditBanner = useMutation({
    mutationFn: bannerApi.updateBanner,
    onSuccess: () => {
      toast.success("Chỉnh sửa ảnh thành công!");
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Đã xảy ra lỗi, vui lòng thử lại.";
      toast.error(errorMessage);
    },
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file[]", file);
    mutationCreateImages.mutate(formData);
  };

  const onSubmit = (data) => {
    const newBanner = {
      image: data.image,
      type: Number(data.type),
      status: Number(data.status),
      link: data.link,
      number: data.number ? Number(data.number) : 1,
    };

    mutationEditBanner.mutate({ id, data: newBanner });
  };

  if(isLoading) return <BannerFormSkeleton />;

  return (
    <div className="w-[100%] rounded-lg bg-white px-7 py-6 min-h-[calc(100vh-140px)] shadow-sm border border-gray-200">
      <h1 className="mb-4 mr-2 h-fit bg-white text-2xl font-bold">
        Chỉnh sửa ảnh
      </h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="w-full mb-4 mx-auto">
          <input
            onChange={handleFileChange}
            type="file"
            name="image"
            id="upload_profile"
            hidden
          />
          <label
            htmlFor="upload_profile"
            className="w-[40%] mx-auto aspect-[2/1] flex flex-col justify-center items-center cursor-pointer font-medium border text-[16px] border-dashed border-blue-700 text-gray-900 p-2 rounded-sm"
          >
            {mutationCreateImages.isPending ? (
                <div className="w-5 h-5 mx-auto border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            ) : ( 
                <>
                    {getValues("image") ? (
                    <img
                        src={`${URL_IMAGE}/${image}`}
                        alt="Banner"
                        className="w-full h-full object-cover rounded-sm"
                    />
                    ) : (
                        <>
                            <FaRegImage className="text-6xl mb-2" /> Chọn ảnh
                        </>
                    )}
                </>
            )}
          </label>
          {errors["image"] && (
            <p className="mt-3 text-center text-sm text-red-500">
              {errors["image"].message}
            </p>
          )}
        </div>
        {data?.type != 3 && data?.type != 4  && (
          <div className="grid-cols-1 gap-4 sm:grid md:grid-cols-2 mb-6">
            <SelectField
              label="Loại ảnh"
              name="type"
              control={control}
              placeholder="Chọn loại ảnh"
              options={typeOptions}
              errors={errors}
            />
            <SelectField
              label="Trạng thái"
              name="status"
              control={control}
              placeholder="Chọn trạng thái"
              options={statusOptions}
              errors={errors}
            />
            <div className="col-span-2">
              <InputField
                label="Link ảnh"
                name="link"
                control={control}
                placeholder="Link ảnh"
                type="text"
                errors={errors}
              />
            </div>
            <SelectField
              label="Số thứ tự hiển thị"
              name="number"
              control={control}
              placeholder="Chọn số thứ tự hiển thị"
              options={numberOptions}
              errors={errors}
            />
          </div>
        )}
        <div className="flex justify-end gap-3">
          <Link
            to="/admin/banner"
            className="rounded-md bg-gray-200 px-6 py-2 text-gray-600 shadow-md transition-colors duration-200 hover:bg-gray-300 hover:text-gray-700"
          >
            Hủy
          </Link>
          <button
            disabled={
              mutationCreateImages.isPending || mutationEditBanner.isPending
            }
            type="submit"
            className="rounded-md bg-blue-500 px-6 py-2 text-white shadow-md transition-colors duration-200 hover:bg-blue-600 cursor-pointer"
          >
            {mutationEditBanner.isPending ? (
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
