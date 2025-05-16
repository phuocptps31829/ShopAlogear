import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import { authApi } from "../../../services/authApi";
import { useMutation } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { setUserProfile } from "../../../redux/authSlice";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function LoginGoogle() {
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [signalFlag, setSignalFlag] = useState(false);

  const { data: profileFetched, isLoadingProfile } = useQuery({
    queryKey: ["userProfile"],
    queryFn: authApi.getProfileInfo,
    enabled: signalFlag,
  });

  const mutationLoginGoogle = useMutation({
    mutationFn: authApi.googleLogin,
    onSuccess: (data) => {
      window.location.href = data.url;
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Đã xảy ra lỗi, vui lòng thử lại.";
      toast.error(errorMessage);
    },
  });

  const mutationGoogleCallback = useMutation({
    mutationFn: authApi.googleCallback,
    onSuccess: (data) => {
      Cookies.set("accessToken", data.accessToken.token, {
        expires: new Date(data.accessToken.expires * 1000),
      });
      Cookies.set("refreshToken", data.refreshToken.token, {
        expires: new Date(data.refreshToken.expires * 1000),
      });
      toast.success("Đăng nhập thành công");
      setSignalFlag(true);
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Đã xảy ra lỗi, vui lòng thử lại.";
      toast.error(errorMessage);
    },
  });

  useEffect(() => {
    if (!code) return;
    mutationGoogleCallback.mutate(code);
  }, [code]);

  useEffect(() => {
    if (!signalFlag) return;
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
  }, [profileFetched, dispatch, navigate, isLoadingProfile, signalFlag]);

  const handleLoginGoogle = () => {
    mutationLoginGoogle.mutate();
  };

  return (
    <div className="flex flex-col items-center">
      <button
        disabled={
          mutationLoginGoogle.isPending || mutationGoogleCallback.isPending
        }
        onClick={handleLoginGoogle}
        className="cursor-pointer w-full max-w-xs font-bold shadow-sm rounded-lg py-3 bg-gray-100 text-gray-800 flex items-center justify-center transition-all duration-300 ease-in-out focus:outline-none hover:shadow focus:shadow-sm focus:shadow-outline"
      >
        <div className="bg-white p-2 rounded-full">
          <svg className="w-4" viewBox="0 0 533.5 544.3">
            <path
              d="M533.5 278.4c0-18.5-1.5-37.1-4.7-55.3H272.1v104.8h147c-6.1 33.8-25.7 63.7-54.4 82.7v68h87.7c51.5-47.4 81.1-117.4 81.1-200.2z"
              fill="#4285f4"
            />
            <path
              d="M272.1 544.3c73.4 0 135.3-24.1 180.4-65.7l-87.7-68c-24.4 16.6-55.9 26-92.6 26-71 0-131.2-47.9-152.8-112.3H28.9v70.1c46.2 91.9 140.3 149.9 243.2 149.9z"
              fill="#34a853"
            />
            <path
              d="M119.3 324.3c-11.4-33.8-11.4-70.4 0-104.2V150H28.9c-38.6 76.9-38.6 167.5 0 244.4l90.4-70.1z"
              fill="#fbbc04"
            />
            <path
              d="M272.1 107.7c38.8-.6 76.3 14 104.4 40.8l77.7-77.7C405 24.6 339.7-.8 272.1 0 169.2 0 75.1 58 28.9 150l90.4 70.1c21.5-64.5 81.8-112.4 152.8-112.4z"
              fill="#ea4335"
            />
          </svg>
        </div>
        <span className="ml-4">Tiếp tục với Google</span>
        {mutationLoginGoogle.isPending ||
          (mutationGoogleCallback.isPending && (
            <div className="w-5 h-5 ml-3 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          ))}
      </button>
    </div>
  );
}
