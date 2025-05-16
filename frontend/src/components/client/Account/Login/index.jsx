import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setUserProfile } from "../../../../redux/authSlice";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import { authApi } from "../../../../services/authApi";
import { loginSchema } from "../../../../zods/login";
import { useMutation } from "@tanstack/react-query";
import InputField from "../../../ui/InputField";
import LoginGoogle from "../LoginGoogle";
import { useSelector } from "react-redux";
import { checkImageUrl } from "../../../../utils/checkImageUrl";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function Login() {
  const logoMainState = useSelector((state) => state.logo.logoMain);
  const loadingLogoState = useSelector((state) => state.logo.loading);
  const [flag, setFlag] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    handleSubmit,
    formState: { errors },
    control,
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const mutationLogin = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      Cookies.set("accessToken", data.accessToken.token, {
        expires: new Date(data.accessToken.expires * 1000),
      });
      Cookies.set("refreshToken", data.refreshToken.token, {
        expires: new Date(data.refreshToken.expires * 1000),
      });
      toast.success("Đăng nhập thành công");
      setFlag(true);
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Đã xảy ra lỗi, vui lòng thử lại.";
      toast.error(errorMessage);
    },
  });

  const { data: profileFetched, isLoadingProfile } = useQuery({
    queryKey: ["userProfile"],
    queryFn: authApi.getProfileInfo,
    enabled: flag,
  });

  useEffect(() => {
    if (!flag) return;
    if (isLoadingProfile) return;
    dispatch(setUserProfile(profileFetched?.data));
    if(!profileFetched?.data) return;
    setTimeout(() => {
      if(profileFetched?.data?.role) {
        navigate("/admin");
      } else {
        navigate("/profile/information");
      }
    }, 300);
  }, [profileFetched, dispatch, navigate, isLoadingProfile, flag]);

  const onSubmit = (data) => {
    mutationLogin.mutate(data);
  };


  return (
    <section className="mx-auto max-w-screen-xl px-3 md:px-5 py-4">
      <div className="max-w-screen-xl m-0 sm:m-10 bg-white lg:shadow sm:rounded-lg flex justify-center flex-1 overflow-hidden">
        <div className="lg:w-1/2 xl:w-5/12 p-6 sm:px-12 sm:py-7 lg:min-w-[600px] w-full">
          {loadingLogoState ? (
            <div className="flex justify-center">
              <Skeleton height={42} width={120} />
            </div>
          ) : (
            <img
              src={checkImageUrl(logoMainState)}
              className="w-32 mx-auto"
            />
          )}
          <div className="lg:mt-10 mt-8 flex flex-col items-center">
            <h1 className="text-2xl xl:text-3xl font-extrabold">Đăng nhập</h1>
            <div className="w-full flex-1 mt-8">
              <div className="mx-auto max-w-xs">
                <form onSubmit={handleSubmit(onSubmit)}>
                  <InputField
                    name="email"
                    control={control}
                    placeholder="Email"
                    type="email"
                    errors={errors}
                  />
                  <InputField
                    className="mt-4"
                    name="password"
                    control={control}
                    placeholder="Mật khẩu"
                    type="password"
                    errors={errors}
                  />
                  <button
                    disabled={mutationLogin.isLoading}
                    type="submit"
                    className="cursor-pointer mt-5 tracking-wide font-semibold bg-gray-500 text-gray-100 w-full py-3 rounded-lg hover:bg-gray-700 transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none"
                  >
                    {mutationLogin.isPending || isLoadingProfile ? (
                      <div className="w-5 h-5 mx-auto border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      "Đăng nhập"
                    )}
                  </button>
                </form>
                <Link
                  to="/account/forgot"
                  className="ml-auto cursor-pointer block text-gray-500 hover:text-gray-700 underline text-sm mt-2 w-fit"
                >
                  Quên mật khẩu?
                </Link>
              </div>

              <div className="my-7 mb-10 border-b text-center max-w-xs mx-auto">
                <div className="leading-none px-2 inline-block text-sm text-gray-600 tracking-wide font-medium bg-white transform translate-y-[75%]">
                  Hoặc tiếp tục với
                </div>
              </div>
              <LoginGoogle />
              <div className="mt-6">
                <p className="text-center text-sm">
                  Bạn chưa có tài khoản?{" "}
                  <Link
                    to="/account/register"
                    className="text-gray-500 hover:text-gray-700 underline"
                  >
                    Đăng ký
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 bg-gray-100 text-center hidden lg:flex">
          <div
            className="m-12 xl:m-16 w-full bg-contain bg-center bg-no-repeat"
            style={{
              backgroundImage:
                "url('https://storage.googleapis.com/devitary-image-host.appspot.com/15848031292911696601-undraw_designer_life_w96d.svg')",
            }}
          ></div>
        </div>
      </div>
    </section>
  );
}
