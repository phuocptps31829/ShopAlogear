import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "../../../../services/authApi";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import LoginGoogle from "../LoginGoogle";
import { useSelector } from "react-redux";
import { checkImageUrl } from "../../../../utils/checkImageUrl";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function Forgot() {
  const logoMainState = useSelector((state) => state.logo.logoMain);
    const loadingLogoState = useSelector((state) => state.logo.loading);
  const navigate = useNavigate();
  const [typeSubmit, setTypeSubmit] = useState("sendAuthCode");
  const [email, setEmail] = useState("");
  const [authCode, setAuthCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const mutationSendAuthCode
   = useMutation({
    mutationFn: authApi.sendAuthCodeForgotPassword,
    onSuccess: (data) => {
      toast.success("Mã xác thực đã gửi qua email của bạn.");
      sessionStorage.setItem("tokenForgot", data.data.otpToken);
      setTypeSubmit("verifyAuthCode");
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message ||
        "Đã xảy ra lỗi, vui lòng thử lại.";
      toast.error(errorMessage);
    },
  });

  const mutationResendAuthCode 
   = useMutation({
    mutationFn: authApi.sendAuthCodeForgotPassword,
    onSuccess: (data) => {
      toast.success("Mã xác thực đã được gửi lại qua email.");
      sessionStorage.setItem("tokenForgot", data.data.otpToken);
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Đã xảy ra lỗi, vui lòng thử lại.";
      toast.error(errorMessage);
    },
  });

  const mutationCheckOtpForgot
   = useMutation({
    mutationFn: authApi.checkOtpForgotPassword,
    onSuccess: (data) => {
      toast.success("Xác thực thành công!");
      sessionStorage.setItem("codeAuth", data.data.OTP);
      sessionStorage.setItem("tokenForgot", data.data.otpToken);
      setTypeSubmit("resetPassword");
    },
    onError: (error) => {
      console.log(error);
      const errorMessage =
        error.response?.data?.message ||
        "Đã xảy ra lỗi, vui lòng thử lại.";
      toast.error(errorMessage);
    },
  });

  const mutationResetPassword
   = useMutation({
    mutationFn: authApi.resetPassword,
    onSuccess: () => {
      toast.success("Đặt lại mật khẩu thành công!");
      sessionStorage.removeItem("codeAuth");
      sessionStorage.removeItem("tokenForgot");
      navigate("/account/login");
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message ||
        "Đã xảy ra lỗi, vui lòng thử lại.";
      toast.error(errorMessage);
    },
  });

  const handleSendAuthCode = () => {
    if (typeSubmit == "sendAuthCode") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        toast.error("Vui lòng nhập địa chỉ email hợp lệ.");
        return;
      }
      mutationSendAuthCode.mutate(email);
    } else if (typeSubmit == "verifyAuthCode") {
      if (authCode.trim() == "") {
        toast.error("Vui lòng nhập mã xác thực.");
        return;
      }
      const tokenForgot = sessionStorage.getItem("tokenForgot");
      const data = {
        OTP: authCode,
        otpToken: tokenForgot
      }
      mutationCheckOtpForgot.mutate(data);
    } else if (typeSubmit == "resetPassword") {
      if (password.trim() == "") {
        toast.error("Vui lòng nhập mật khẩu mới.");
        return;
      }
      if (confirmPassword.trim() == "") {
        toast.error("Vui lòng nhập lại mật khẩu mới.");
        return;
      }
      if (password !== confirmPassword) {
        toast.error("Mật khẩu không khớp.");
        return;
      }
      if (password.length < 6) {
        toast.error("Mật khẩu phải có ít nhất 6 ký tự.");
        return;
      }
      const tokenForgot = sessionStorage.getItem("tokenForgot");
      const codeAuth = sessionStorage.getItem("codeAuth");
      const data = {
        password,
        OTP: codeAuth,
        otpToken: tokenForgot
      }
      mutationResetPassword.mutate(data);
    }
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
            <h1 className="text-2xl xl:text-3xl font-extrabold">
              Quên mật khẩu
            </h1>
            <div className="w-full flex-1 mt-8">
              <div className="mx-auto max-w-xs">
                {(typeSubmit == "verifyAuthCode" || typeSubmit == "sendAuthCode") ? (
                  <>
                    <input
                      className={`${
                        typeSubmit == "verifyAuthCode" ? "bg-green-100" : ""
                      } w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white`}
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={typeSubmit == "verifyAuthCode"}
                    />
                    {typeSubmit == "verifyAuthCode" && (
                      <>
                        <input
                          className="w-full mt-3 px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                          type="text"
                          placeholder="Mã xác thực"
                          value={authCode}
                          onChange={(e) => setAuthCode(e.target.value)}
                        />
                        <div className="flex items-center mt-2 justify-between">
                          <span className="text-[12px] block text-red-500">* Kiểm tra email để lấy mã xác thực.</span>
                          <button 
                            disabled={mutationResendAuthCode.isPending}
                            onClick={() => mutationResendAuthCode.mutate(email)}
                            className="text-[13px] cursor-pointer font-semibold underline text-blue-500 flex items-center"
                          >
                            {mutationResendAuthCode.isPending ? (
                              <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            ) : "Gửi lại mã"}
                          </button>
                        </div>
                    </>
                    )}
                  </>
                ) : (
                  <>
                    <input
                      className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                      type="password"
                      placeholder="Mật khẩu mới"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <input
                      className="w-full mt-3 px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                      type="password"
                      placeholder="Nhập lại mật khẩu mới"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </>
                )}
                <button
                  disabled={mutationSendAuthCode.isPending || mutationCheckOtpForgot.isPending || mutationResetPassword.isPending}
                  onClick={() => handleSendAuthCode()}
                  className="cursor-pointer mt-5 tracking-wide font-semibold bg-gray-500 text-gray-100 w-full py-3 rounded-lg hover:bg-gray-700 transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none"
                >
                  {mutationSendAuthCode.isPending || mutationCheckOtpForgot.isPending || mutationResetPassword.isPending ? (
                    <div className="w-5 h-5 mx-auto border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  ) : "Xác nhận"}
                </button>
              </div>

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
