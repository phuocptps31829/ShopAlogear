import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authApi } from "../../../../services/authApi";
import { registerSchema } from "../../../../zods/register";
import { toast } from "react-toastify";
import InputField from "../../../ui/InputField";
import LoginGoogle from "../LoginGoogle";
import { useSelector } from "react-redux";
import { checkImageUrl } from "../../../../utils/checkImageUrl";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function Register() {
  const logoMainState = useSelector((state) => state.logo.logoMain);
  const loadingLogoState = useSelector((state) => state.logo.loading);
  const navigate = useNavigate();
  const {
    handleSubmit,
    formState: { errors },
    control,
    reset,
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const mutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: () => {
      toast.success(
        "Đăng ký thành công, vui lòng kiểm tra email để xác thực tài khoản."
      );
      reset();
      navigate("/account/login");
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Đã xảy ra lỗi, vui lòng thử lại.";
      toast.error(errorMessage || "Đã xảy ra lỗi, vui lòng thử lại.");
    },
  });

  const onSubmit = (data) => {
    const { email, password } = data;
    const newUser = {
      email,
      password,
    };
    mutation.mutate(newUser);
  };

  return (
    <section className="mx-auto max-w-screen-xl px-3 md:px-5 py-4">
      <div className="max-w-screen-xl m-0 sm:m-10 bg-white lg:shadow sm:rounded-lg flex justify-center flex-1 overflow-hidden">
        <div className="flex-1 bg-gray-100 text-center hidden lg:flex ">
          <div
            className="m-12 xl:m-16 w-full bg-contain bg-center bg-no-repeat"
            style={{
              backgroundImage:
                "url('https://storage.googleapis.com/devitary-image-host.appspot.com/15848031292911696601-undraw_designer_life_w96d.svg')",
            }}
          ></div>
        </div>
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
            <h1 className="text-2xl xl:text-3xl font-extrabold">Đăng ký</h1>
            <div className="w-full flex-1 mt-8">
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="mx-auto max-w-xs space-y-4">
                  <InputField
                    name="email"
                    control={control}
                    placeholder="Email"
                    type="email"
                    errors={errors}
                  />
                  <InputField
                    name="password"
                    control={control}
                    placeholder="Mật khẩu"
                    type="password"
                    errors={errors}
                  />
                  <InputField
                    name="confirmPassword"
                    control={control}
                    placeholder="Nhập lại mật khẩu"
                    type="password"
                    errors={errors}
                  />
                  <button
                    type="submit"
                    className="cursor-pointer mt-5 tracking-wide font-semibold bg-gray-500 text-gray-100 w-full py-3 rounded-lg hover:bg-gray-700 transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none disabled:bg-gray-400"
                    disabled={mutation.isPending}
                  >
                    {mutation.isPending ? (
                      <div className="w-5 h-5 mx-auto border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    ) : "Đăng ký"}
                  </button>
                </div>
              </form>
              <div className="my-7 mb-10 border-b text-center max-w-xs mx-auto">
                <div className="leading-none px-2 inline-block text-sm text-gray-600 tracking-wide font-medium bg-white transform translate-y-[75%]">
                  Hoặc tiếp tục với
                </div>
              </div>
              <LoginGoogle />
              <div className="mt-6">
                <p className="text-center text-sm">
                  Bạn đã có tài khoản?{" "}
                  <Link
                    to="/account/login"
                    className="text-gray-500 hover:text-gray-700 underline"
                  >
                    Đăng nhập
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
