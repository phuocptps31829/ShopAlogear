import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { cooperateSchema } from "../../../../zods/admin/cooperate";
import InputField from "../../../ui/InputField";
import SelectField from "../../../ui/SelectField";
import { imageApi } from "../../../../services/imageApi";
import { CooperatesApi } from "../../../../services/cooperatesApi";
import { toast } from "react-toastify";
import { useMutation } from "@tanstack/react-query";
import { FaRegImage } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
const URL_IMAGE = import.meta.env.VITE_URL_IMAGE;

const typeOptions = [
  { value: "1", label: "Link xem popup" },
  { value: "2", label: "Link xem chuyển hướng" },
];

const statusOptions = [
  { value: "1", label: "Hiển thị" },
  { value: "0", label: "Ẩn" },
];

export default function CooperatesCreate() {
  const navigate = useNavigate();
  const {
    handleSubmit,
    formState: { errors },
    control,
    setValue,
    getValues,
  } = useForm({
    resolver: zodResolver(cooperateSchema),
    defaultValues: {
      name: "",
      image: "",
      description: "",
      status: "",
      type: "",
      link: "",
    },
  });

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

  const mutationCreateCooperate = useMutation({
    mutationFn: CooperatesApi.createCooperateAdmin,
    onSuccess: () => {
      toast.success("Thêm mới dự án thành công!");
      navigate("/admin/cooperates");
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
    const newCooperate = {
      name: data.name,
      image: data.image,
      description: data.description,
      status: Number(data.status),
      type: Number(data.type),
      link: data.link,
    };

    mutationCreateCooperate.mutate(newCooperate);
  };

  return (
    <div className="w-[100%] rounded-lg bg-white px-7 py-6 min-h-[calc(100vh-140px)] shadow-sm border border-gray-200">
      <h1 className="mb-4 mr-2 h-fit bg-white text-2xl font-bold">
        Thêm mới dự án
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
            className="w-[30%] mx-auto aspect-[1.6/1] flex flex-col justify-center items-center cursor-pointer font-medium border text-[16px] border-dashed border-blue-700 text-gray-900 p-2 rounded-sm"
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
                    <FaRegImage className="text-6xl mb-2" /> Chọn ảnh dự án
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
          <InputField
            label="Tên dự án"
            name="name"
            control={control}
            placeholder="Tên dự án"
            type="text"
            errors={errors}
          />
          <InputField
            label="Mô tả"
            name="description"
            control={control}
            placeholder="Tiêu đề dự án"
            type="text"
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
          <SelectField
            label="Loại link xem"
            name="type"
            control={control}
            placeholder="Loại link xem"
            options={typeOptions}
            errors={errors}
          />
          <div className="col-span-2">
            <InputField
              label="Link dự án"
              name="link"
              control={control}
              placeholder="Link dự án"
              type="text"
              errors={errors}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Link
            to="/admin/cooperates"
            className="rounded-md bg-gray-200 px-6 py-2 text-gray-600 shadow-md transition-colors duration-200 hover:bg-gray-300 hover:text-gray-700"
          >
            Hủy
          </Link>
          <button
            disabled={
              mutationCreateImages.isPending ||
              mutationCreateCooperate.isPending
            }
            type="submit"
            className="rounded-md bg-blue-500 px-6 py-2 text-white shadow-md transition-colors duration-200 hover:bg-blue-600 cursor-pointer"
          >
            {mutationCreateCooperate.isPending ? (
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
