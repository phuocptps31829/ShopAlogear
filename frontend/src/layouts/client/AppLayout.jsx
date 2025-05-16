import { useState, useContext, useEffect } from "react";
import { IoIosArrowUp } from "react-icons/io";
import { IoChatbubbleEllipsesOutline, IoCloseCircleOutline } from "react-icons/io5";
import ScrollToTop from "react-scroll-to-top";
import BalloonMessage from "../../components/ui/BalloonMessage";
import SidebarMenu from "../../components/client/Home/HomeTopSection/SidebarMenu";
import PopupYoutube from "../../components/ui/PopupYoutube";
import Header from "./Header";
import Footer from "./Footer";
import { Outlet, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUserProfile } from "../../redux/authSlice";
import { NavbarContext } from "../../contexts/NavBarContext";
import { authApi } from "../../services/authApi";
import { useQuery } from "@tanstack/react-query";
import { bannerApi } from "../../services/bannerApi";
import { checkImageUrl } from "../../utils/checkImageUrl";
import LoadingClient from "../../components/ui/LoadingClient";
import { setlogoMain } from "../../redux/logoSlice";

export default function AppLayout() {
  const dispatch = useDispatch();
  const location = useLocation();
  const [showLoading, setShowLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const hideHeaderFooter = location.pathname === "/not-found";
  const { isVisibilityMenu, toggleVisibilityMenu, isPopupOpen, closePopup } = useContext(NavbarContext);
  const [isBalloonVisible, setBalloonVisible] = useState(false);

  const { data: profileFetched, isLoading } = useQuery({
    queryKey: ["userProfile"],
    queryFn: authApi.getProfileInfo,
  });

  const { data: logoTab } = useQuery({
    queryKey: ["bannersAdminType4", { type: 4 }],  
    queryFn: () => bannerApi.getAllBanner({ type: 4 }),
    keepPreviousData: true,
  });

  const { data: logoMain, isLoading: loadingLogo } = useQuery({
    queryKey: ["bannersAdminType3", { type: 3 }],  
    queryFn: () => bannerApi.getAllBanner({ type: 3 }),
    keepPreviousData: true,
  });

  useEffect(() => {
    if(loadingLogo) return;
    dispatch(setlogoMain(logoMain?.products[0]?.image));
  }, [logoMain, dispatch, loadingLogo]);

  useEffect(() => {
    if (!logoTab) return;
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
    if (isVisibilityMenu) {
      toggleVisibilityMenu();
    }
  }, [location]);

    useEffect(() => {
      if (!isLoading) {
        setFadeOut(true);
        const timer = setTimeout(() => {
          setShowLoading(false);
        }, 2000);
  
        return () => clearTimeout(timer);
      }
    }, [isLoading]);

  return (
    <>
      {showLoading && <LoadingClient className={fadeOut ? "fadeOut" : ""} />}
        <>
          <ScrollToTop
            smooth
            component={
              <div className="flex flex-col items-center justify-center px-2 w-12 h-12 bg-gray-400 text-white rounded-xl shadow-lg z-50">
                <IoIosArrowUp size={20} />
                <span className="text-[10px] font-bold whitespace-nowrap">
                  Lên đầu
                </span>
              </div>
            }
            style={{
              backgroundColor: "transparent",
              bottom: isBalloonVisible ? "319px" : "201px",
            }}
            className="fixed !right-5.5 sm:!right-10"
          />

          <button
            onClick={() => setBalloonVisible(!isBalloonVisible)}
            className={`fixed bottom-[76px] cursor-pointer duration-500 sm:right-8.5 right-4 w-11 h-11 flex items-center justify-center text-white rounded-full shadow-lg z-50 ${isBalloonVisible ? "bg-red-500" : "bg-blue-500"}`}
          >
            {isBalloonVisible ? <IoCloseCircleOutline size={20} /> : <IoChatbubbleEllipsesOutline size={20} />}
          </button>
          <BalloonMessage CallPhone={true} isBalloonVisible={isBalloonVisible} />
          {isBalloonVisible && (
            <div className="balloon-item-visible fixed z-50">
              <BalloonMessage ZaloChat={false} />
              <BalloonMessage closePopup={closePopup} />
            </div>
          )}

          {isVisibilityMenu && (
            <div className="mx-auto max-w-screen-xl px-3 md:px-5">
              <div
                onClick={toggleVisibilityMenu}
                className="fixed w-full h-screen bg-[#00000084] top-0 left-0 z-20"
              ></div>
              <SidebarMenu menuFixed={true} />
            </div>
          )}

          {isPopupOpen.status && <PopupYoutube link={isPopupOpen.link} closePopup={closePopup} />}
          {!hideHeaderFooter && <Header />}
          <div className="min-h-[335px] bg-white">
            <Outlet />
          </div>
          {!hideHeaderFooter && <Footer />}
        </>
    </>
  );
}
