import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import avt_default from "../../assets/images/avt-default.png";
import { logoutAction } from "../../redux/authSlice";
import { checkImageUrl } from "../../utils/checkImageUrl";
import { AiOutlineMenuUnfold } from "react-icons/ai";
import { setActive } from "../../redux/menuSlice";

export default function Header() {
  const dispatch = useDispatch();
  const userProfile = useSelector((state) => state.auth.userProfile);
  const [isDaytime, setIsDaytime] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
 
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const hours = String(currentTime.getHours()).padStart(2, "0");
  const minutes = String(currentTime.getMinutes()).padStart(2, "0");
  const seconds = String(currentTime.getSeconds()).padStart(2, "0");

  const daysOfWeek = [
    "Chủ Nhật",
    "Thứ Hai",
    "Thứ Ba",
    "Thứ Tư",
    "Thứ Năm",
    "Thứ Sáu",
    "Thứ Bảy",
  ];
  const dayOfWeek = daysOfWeek[currentTime.getDay()];
  const day = currentTime.getDate();
  const month = currentTime.getMonth() + 1;
  const year = currentTime.getFullYear();

  useEffect(() => {
    const currentHour = new Date().getHours();
    setIsDaytime(currentHour >= 6 && currentHour < 18);
  }, []);

  const handleLogout = () => {
    window.location.href = "/account/login";
    dispatch(logoutAction());
  };

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="flex justify-between items-center min-h-[80px] mb-7 bg-gradient-to-r from-[#141E30] to-[#89e2e3] rounded-full px-5 ">
      <div className="flex items-center">
        <AiOutlineMenuUnfold size={32} className="text-white mr-7 md:hidden block cursor-pointer" onClick={() => dispatch(setActive(true))} />
        {isDaytime ? (
          <div className="cloud-loading sm:flex hidden">
            <div className="cloud front">
              <span className="left-front"></span>
              <span className="right-front"></span>
            </div>
            <span className="sun sunshine"></span>
            <span className="sun"></span>
            <div className="cloud back">
              <span className="left-back"></span>
              <span className="right-back"></span>
            </div>
          </div>
        ) : (
          <div className="moon-loading sm:flex hidden">
            <div style={{ "--i": 10, "--j": 2 }} className="blub"></div>
            <div style={{ "--i": 12, "--j": 1.8 }} className="blub"></div>
            <div style={{ "--i": 16, "--j": 2.2 }} className="blub"></div>
            <div style={{ "--i": 9, "--j": 1.5 }} className="blub"></div>
            <div style={{ "--i": 7, "--j": 1.7 }} className="blub"></div>
            <div style={{ "--i": 18, "--j": 2.5 }} className="blub"></div>
            <div style={{ "--i": 20, "--j": 2 }} className="blub"></div>
            <div style={{ "--i": 16, "--j": 1.9 }} className="blub"></div>
            <div style={{ "--i": 21, "--j": 2.1 }} className="blub"></div>
            <div style={{ "--i": 5, "--j": 1.6 }} className="blub"></div>
            <div className="moon">
              <div className="crater cr1"></div>
              <div className="crater cr2"></div>
              <div className="crater cr3"></div>
            </div>
          </div>
        )}
      </div>
      <div className="text-white font-medium text-md text-center rounded-md p-2 px-3 md:block hidden">
        <div className="text-3xl">
          <span>{hours}</span>:<span>{minutes}</span>:<span>{seconds}</span>
        </div>
        <div>
          {dayOfWeek}, Ngày {day} tháng {month} năm {year}
        </div>
      </div>
      <div className="flex items-center">
        <span className="font-medium text-white">
          Xin chào, {userProfile?.username}
        </span>
        <div className="relative group flex items-center ml-4 h-full cursor-pointer rounded-full" ref={menuRef}>
          <div className="w-10 rounded-full">
            <img
              onClick={toggleMenu}
              src={userProfile?.avatar ? checkImageUrl(userProfile.avatar) : avt_default}
              alt="Avatar"
              className="rounded-full border border-gray-800 shadow-sm w-full aspect-[1/1] object-cover ring-2 ring-gray-300"
            />
          </div>
          <div className="absolute w-32 h-3 -right-7 top-9 hidden group-hover:block"></div>
          <div className={`absolute z-50 text-sm overflow-hidden top-11.5 -right-7 border border-gray-300 w-36 bg-white shadow-sm rounded-md transition-opacity duration-200 ${
                    isMenuOpen ? "block opacity-100" : "hidden opacity-0"
                  } lg:group-hover:block lg:group-hover:opacity-100`}>
            <Link
              to="/profile/information"
              className="block py-2 hover:bg-gray-200 font-medium text-center whitespace-nowrap"
            >
              Thông tin
            </Link>
            <Link
              to="/"
              className="block py-2 hover:bg-gray-200 font-medium text-center whitespace-nowrap"
            >
              Trang người dùng
            </Link>
            <button
              onClick={handleLogout}
              className="block w-full py-2 hover:bg-gray-200 cursor-pointer font-medium text-center whitespace-nowrap"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
