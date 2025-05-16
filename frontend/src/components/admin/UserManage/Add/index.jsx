import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { userSchema } from "../../../../zods/admin/user";
import InputField from "../../../ui/InputField";
import { imageApi } from "../../../../services/imageApi";
import { authApi } from "../../../../services/authApi";
import { toast } from "react-toastify";
import { useMutation } from "@tanstack/react-query";
import { FaRegImage } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { checkImageUrl } from "../../../../utils/checkImageUrl";

export default function UserCreate() {
  const navigate = useNavigate();
  const {
    handleSubmit,
    formState: { errors },
    control,
    setValue,
    getValues,
  } = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: "",
      phone: "",
      email: "",
      address: "",
      avatar: "",
      password: "",
    },
  });
  
  const mutationCreateImages = useMutation({
    mutationFn: imageApi.createImages,
    onSuccess: (data) => {
      setValue("avatar", data?.data[0]);
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Đã xảy ra lỗi, vui lòng thử lại.";
      toast.error(errorMessage);
    },
  });

  const mutationCreateUser = useMutation({
    mutationFn: authApi.userCreateAdmin,
    onSuccess: () => {
      toast.success("Thêm mới người dùng thành công!");
      navigate("/admin/users");
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
    const formattedData = Object.fromEntries(
      Object.entries(data).map(([key, value]) => [key, value === "" ? null : value])
    );

    formattedData.isActive = 1;
  
    mutationCreateUser.mutate(formattedData);
  };

  return (
    <div className="w-[100%] rounded-lg bg-white px-7 py-6 min-h-[calc(100vh-140px)] shadow-sm border border-gray-200">
      <h1 className="mb-4 mr-2 h-fit bg-white text-2xl font-bold">
        Thêm mới người dùng
      </h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="w-full mb-5 mx-auto">
          <input
            onChange={handleFileChange}
            type="file"
            name="avatar"
            id="upload_profile"
            hidden
          />
          <label
            htmlFor="upload_profile"
            className="w-[15%] mx-auto aspect-[1/1] flex flex-col justify-center items-center cursor-pointer font-medium border text-[14px] border-dashed border-blue-700 text-gray-900 p-2 rounded-full"
          >
            {mutationCreateImages.isPending ? (
              <div className="w-5 h-5 mx-auto border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                {getValues("avatar") ? (
                  <img
                    src={checkImageUrl(getValues("avatar"))}
                    alt="Banner"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <>
                    <FaRegImage className="text-3xl mb-2" /> Chọn ảnh đại diện
                  </>
                )}
              </>
            )}
          </label>
        </div>
        <div className="grid-cols-1 gap-4 sm:grid md:grid-cols-2 mb-6">
          <InputField
            label="Họ và tên"
            name="username"
            control={control}
            placeholder="Nhập họ và tên"
            errors={errors}
          />
          <InputField
            label="Số điện thoại"
            name="phone"
            control={control}
            placeholder="Nhập số điện thoại"
            errors={errors}
          />
          <InputField
            label="Email"
            name="email"
            control={control}
            placeholder="Nhập email"
            errors={errors}
          />
          <InputField
            label="Mật khẩu"
            name="password"
            control={control}
            placeholder="Nhập mật khẩu"
            errors={errors}
          />
          <div className="col-span-2">
            <InputField
              label="Địa chỉ"
              name="address"
              control={control}
              placeholder="Nhập địa chỉ"
              errors={errors}
            />
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Link
            to="/admin/users"
            className="rounded-md bg-gray-200 px-6 py-2 text-gray-600 shadow-md transition-colors duration-200 hover:bg-gray-300 hover:text-gray-700"
          >
            Hủy
          </Link>
          <button
            disabled={
              mutationCreateImages.isPending || mutationCreateUser.isPending
            }
            type="submit"
            className="rounded-md bg-blue-500 px-6 py-2 text-white shadow-md transition-colors duration-200 hover:bg-blue-600 cursor-pointer"
          >
            {mutationCreateUser.isPending ? (
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
