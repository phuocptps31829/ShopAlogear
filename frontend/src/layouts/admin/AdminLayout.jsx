import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidenav from "./sidenav";
import Header from "./header";
import { useEffect } from "react";
import { setUserProfile } from "../../redux/authSlice";
import { useDispatch } from "react-redux";
import { authApi } from "../../services/authApi";
import { useQuery } from "@tanstack/react-query";
import { bannerApi } from "../../services/bannerApi";
import LoadingClient from "../../components/ui/LoadingClient";
import { checkImageUrl } from "../../utils/checkImageUrl";

export default function AdminLayout() {
  const dispatch = useDispatch();
  const [showLoading, setShowLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const { data: profileFetched, error, isLoading } = useQuery({
    queryKey: ["userProfile"],
    queryFn: authApi.getProfileInfo,
  });
  
   const { data: logoTab } = useQuery({
    queryKey: ["bannersAdmin", { type: 4 }],  
      queryFn: () => bannerApi.getAllBanner({
        type: 4,
      }),
      keepPreviousData: true,
    });
  
    useEffect(() => {
      if(!logoTab) return;
      const link = document.querySelector("link[rel*='icon']") || document.createElement("link");
      link.type = "image/x-icon";
      link.rel = "shortcut icon";
      link.href = checkImageUrl(logoTab?.products[0]?.image);
      document.getElementsByTagName("head")[0].appendChild(link);
    }, [logoTab]);

  useEffect(() => {
      dispatch(setUserProfile(profileFetched?.data));
  }, [profileFetched, dispatch]);

  useEffect(() => {
    if (!isLoading) {
      setFadeOut(true);
      const timer = setTimeout(() => {
        setShowLoading(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  useEffect(() => {
    if (!isLoading && !profileFetched?.data?.role) {
      window.location.href = "/";
    }
  }, [isLoading, profileFetched]);

  if (isLoading) return <LoadingClient />;

  if (error) return <div>{error.message}</div>;

  return (
    <>
      {showLoading && <LoadingClient className={fadeOut ? "fadeOut" : ""} />}
      {!isLoading && (
        <div className="min-h-screen">
          <Sidenav />
          <div className="p-4 lg:ml-80 lg:mr-5">
            <Header />
            <Outlet />
          </div>
        </div>
      )}
    </>
  );
}
