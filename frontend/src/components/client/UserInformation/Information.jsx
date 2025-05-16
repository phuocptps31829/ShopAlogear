import { useSelector } from "react-redux";
import avt_default from "../../../assets/images/avt-default.png";
import bg_dark from "../../../assets/images/dark-image.webp";
import { useDispatch } from "react-redux";
import { setUserProfile } from "../../../redux/authSlice";
import { useEffect, useState } from "react";
import { authApi } from "../../../services/authApi";
import { imageApi } from "../../../services/imageApi";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userInfoSchema, changePasswordSchema } from "../../../zods/userInfo";
import InputFieldUser from "../../ui/InputFieldUser";
import { toast } from "react-toastify";
import { useMutation } from "@tanstack/react-query";
import mediumZoom from "medium-zoom";
import { checkImageUrl } from "../../../utils/checkImageUrl";

export default function Information() {
  const dispatch = useDispatch();
  const [isUpdateLoadImage, setIsUpdateLoadImage] = useState(false);
  const [isChanged, setIsChanged] = useState(false);
  const profile = useSelector((state) => state.auth.userProfile);
  const {
    handleSubmit: handleUserInfoSubmit,
    formState: { errors: userInfoErrors },
    control: controlUserInfo,
    setValue: setUserInfoValue,
  } = useForm({
    resolver: zodResolver(userInfoSchema),
    defaultValues: {
      username: "",
      phone: "",
      address: "",
    },
  });
  const {
    handleSubmit: handleChangePasswordSubmit,
    formState: { errors: changePasswordErrors },
    control: controlChangePassword,
    reset,
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      password: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  
  const watchedValuesUserInfo = useWatch({ control: controlUserInfo });
  const watchedPasswordValues = useWatch({ control: controlChangePassword });
  const isPasswordFilled = Object.values(watchedPasswordValues).every(
    (value) => value.trim() !== ""
  );

  useEffect(() => {
    if (profile) {
      const isFormChanged = Object.keys(watchedValuesUserInfo).some(
        (key) => watchedValuesUserInfo[key] !== (profile[key] || "")
      );
      setIsChanged(isFormChanged);
    }
  }, [watchedValuesUserInfo, profile]);

  const mutationUserInfo = useMutation({
    mutationFn: authApi.userUpdate,
    onSuccess: (data) => {
      dispatch(setUserProfile(data?.data));
      if(isUpdateLoadImage) {
        toast.success("Cập nhật ảnh đại diện thành công");
        setIsUpdateLoadImage(false);
      } else {
        toast.success("Cập nhật thông tin thành công");
      }
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Đã xảy ra lỗi, vui lòng thử lại.";
      toast.error(errorMessage);
    },
  });

  const mutationChangePassword = useMutation({
    mutationFn: authApi.userUpdate,
    onSuccess: () => {
      toast.success("Cập nhật mật khẩu thành công");
      reset();
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Đã xảy ra lỗi, vui lòng thử lại.";
      toast.error(errorMessage);
    },
  });

  const mutationCreateImages = useMutation({
    mutationFn: imageApi.createImages,
    onSuccess: (data) => {
      mutationUserInfo.mutate({ avatar: data?.data[0] });
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Đã xảy ra lỗi, vui lòng thử lại.";
      toast.error(errorMessage);
    },
  });

  useEffect(() => {
    if (profile) {
      setUserInfoValue("username", profile.username || "");
      setUserInfoValue("phone", profile.phone || "");
      setUserInfoValue("address", profile.address || "");
      setUserInfoValue("email", profile.email || "");
    }
  }, [profile, setUserInfoValue]);

  const onUserInfoSubmit = async (data) => {
    const filteredData = Object.fromEntries(
      Object.entries(data).filter(([, value]) => value !== "")
    );
    mutationUserInfo.mutate(filteredData);
  };

  const onPasswordSubmit = async (data) => {
    delete data.confirmPassword;
    mutationChangePassword.mutate(data);
  };

  const handleFileChange = (e) => {
    setIsUpdateLoadImage(true);
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file[]", file);
    mutationCreateImages.mutate(formData);
  };

  useEffect(() => {
    const images = document.querySelectorAll(".zoomable-image");
    mediumZoom(images, { margin: 20, background: "#000000A0" });
  }, [profile]);

  return (
    <section className="mx-auto max-w-screen-xl px-3 md:px-5 py-4 space-y-5">
      <div className="mb-10 w-full rounded-2xl overflow-hidden bg-white font-normal leading-relaxed text-gray-900 shadow-sm border border-gray-200">
        <div className="flex flex-col">
          <div className="flex flex-col justify-between items-center relative mb-25">
            <img src={bg_dark} alt="" className="w-full sm:h-64 h-44" />
            <div className="text-center absolute sm:top-[75%] top-[65%] left-1/2 transform -translate-x-1/2 ">
              <div>
                <div className="relative mx-auto w-32 h-32 mb-4">
                  <img
                    src={profile?.avatar ? checkImageUrl(profile?.avatar) : avt_default}
                    alt="Profile Picture"
                    className="rounded-full zoomable-image object-cover w-full aspect-[1/1] border-2 border-gray-800 transition-transform duration-300 hover:scale-105 ring-2 ring-gray-300"
                  />
                  {((mutationUserInfo.isPending && isUpdateLoadImage) || isUpdateLoadImage) && (
                    <div className="absolute bg-[#000000bf] top-0 left-0 w-full h-full flex justify-center items-center rounded-full" >
                      <div className="w-5 h-5 mx-auto border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                <input
                  onChange={handleFileChange}
                  type="file"
                  name="profile"
                  id="upload_profile"
                  hidden
                  required
                />
                <label
                  htmlFor="upload_profile"
                  className="inline-flex text-sm items-center cursor-pointer font-medium border text-[13px] border-dashed border-blue-700 text-gray-900 px-4 py-2 rounded-sm"
                >
                  Thay đổi ảnh đại diện
                </label>
              </div>
            </div>
          </div>
          <div className="grid md:grid-cols-2 grid-cols-1 p-5 mt-3 sm:p-8 md:divide-x-2 divide-y-2 md:divide-y-0 divide-dashed divide-gray-500">
            <form
              className="space-y-4 md:pr-10 pb-10 md:pb-0"
              onSubmit={handleUserInfoSubmit(onUserInfoSubmit)}
            >
              <h2 className="text-center font-semibold text-xl">
                Thông tin người dùng
              </h2>
              <InputFieldUser
                control={controlUserInfo}
                name="username"
                label="Họ và tên:"
                errors={userInfoErrors}
                placeholder="Họ và tên"
              />
              <InputFieldUser
                control={controlUserInfo}
                name="email"
                label="Email:"
                errors={userInfoErrors}
                placeholder="Email"
                disabled
              />
              <InputFieldUser
                control={controlUserInfo}
                name="phone"
                label="Số điện thoại:"
                errors={userInfoErrors}
                placeholder="Số điện thoại"
              />
              <InputFieldUser
                control={controlUserInfo}
                name="address"
                label="Địa chỉ:"
                errors={userInfoErrors}
                placeholder="Địa chỉ"
              />
              <div className="flex justify-end space-x-4 cursor-pointer">
                <button
                  type="submit"
                  disabled={!isChanged || mutationUserInfo.isLoading}
                  className={`px-4 py-2 min-w-30 rounded-lg text-sm font-medium ${
                    isChanged
                      ? "bg-blue-500 text-white hover:bg-blue-700 cursor-pointer"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {(mutationUserInfo.isPending && !isUpdateLoadImage) ? (
                    <div className="w-5 h-5 mx-auto border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    "Lưu thay đổi"
                  )}
                </button>
              </div>
            </form>
            <form
              className="space-y-4 md:space-y-5 md:pl-10 pt-10 md:pt-0"
              onSubmit={handleChangePasswordSubmit(onPasswordSubmit)}
            >
              <h2 className="text-center font-semibold text-xl">
                Thay đổi mật khẩu
              </h2>
              <InputFieldUser
                control={controlChangePassword}
                name="password"
                label="Mật khẩu cũ:"
                errors={changePasswordErrors}
                placeholder="Mật khẩu cũ"
                type="password"
              />
              <InputFieldUser
                control={controlChangePassword}
                name="newPassword"
                label="Mật khẩu mới:"
                errors={changePasswordErrors}
                placeholder="Mật khẩu mới"
                type="password"
              />
              <InputFieldUser
                control={controlChangePassword}
                name="confirmPassword"
                label="Nhập lại mật khẩu mới:"
                errors={changePasswordErrors}
                placeholder="Nhập lại mật khẩu mới"
                type="password"
              />
              <button
                disabled={!isPasswordFilled || mutationChangePassword.isPending}
                type="submit"
                className={`px-4 py-2 block ml-auto min-w-30 rounded-lg text-sm font-medium 
                  ${
                    isPasswordFilled
                      ? "bg-blue-500 text-white hover:bg-blue-700 cursor-pointer"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
              >
                {mutationChangePassword.isPending ? (
                  <div className="w-5 h-5 mx-auto border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "Đổi mật khẩu"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
