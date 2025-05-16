import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { bannerSchema } from "../../../../zods/admin/banner";
import InputField from "../../../ui/InputField";
import SelectField from "../../../ui/SelectField";
import { imageApi } from "../../../../services/imageApi";
import { bannerApi } from "../../../../services/bannerApi";
import { toast } from "react-toastify";
import { useMutation } from "@tanstack/react-query";
import { FaRegImage } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
const URL_IMAGE = import.meta.env.VITE_URL_IMAGE;

const typeOptions = [
  { value: "1", label: "Banner chính (2 : 1)" },
  { value: "2", label: "Banner phụ (235 x 104)" },
];

const statusOptions = [
  { value: "1", label: "Hiển thị" },
  { value: "0", label: "Ẩn" },
];

export default function BannerCreate() {
  const navigate = useNavigate();
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
      number: null,
    },
  });
  console.log(errors);
  const mutationCreateImages = useMutation({
    mutationFn: imageApi.createImages,
    onSuccess: (data) => {
      setValue("image", data?.data[0]);
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Đã xảy ra lỗi, vui lòng thử lại.";
      toast.error(errorMessage);
    },
  });

  const mutationCreateBanner = useMutation({
    mutationFn: bannerApi.createBanner,
    onSuccess: () => {
      toast.success("Thêm mới ảnh thành công!");
      navigate("/admin/banner");
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
    };
    mutationCreateBanner.mutate(newBanner);
  };

  return (
    <div className="w-[100%] rounded-lg bg-white px-7 py-6 min-h-[calc(100vh-140px)] shadow-sm border border-gray-200">
      <h1 className="mb-4 mr-2 h-fit bg-white text-2xl font-bold">
        Thêm mới ảnh
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
                    src={`${URL_IMAGE}/${getValues("image")}`}
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
        </div>

        <div className="flex justify-end gap-3">
          <Link
            to="/admin/banner"
            className="rounded-md bg-gray-200 px-6 py-2 text-gray-600 shadow-md transition-colors duration-200 hover:bg-gray-300 hover:text-gray-700"
          >
            Hủy
          </Link>
          <button
            disabled={
              mutationCreateImages.isPending || mutationCreateBanner.isPending
            }
            type="submit"
            className="rounded-md bg-blue-500 px-6 py-2 text-white shadow-md transition-colors duration-200 hover:bg-blue-600 cursor-pointer"
          >
            {mutationCreateBanner.isPending ? (
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
