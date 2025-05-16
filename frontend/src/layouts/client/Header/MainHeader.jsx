import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { NavbarContext } from "../../../contexts/NavBarContext";
import PropTypes from "prop-types";
import { FaSearch } from "react-icons/fa";
import { FaRegUserCircle } from "react-icons/fa";
import { MdOutlineShoppingCart } from "react-icons/md";
import { HiMenuAlt2 } from "react-icons/hi";
import { GiAutoRepair } from "react-icons/gi";
import { LuPhone } from "react-icons/lu";
import { TbMenu3 } from "react-icons/tb";
import { IoClose } from "react-icons/io5";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import avt_default from "../../../assets/images/avt-default.png";
import { logoutAction } from "../../../redux/authSlice";
import { toast } from "react-toastify";
import { handleScrollToService } from "../../../utils/scrollToService";
import { checkImageUrl } from "../../../utils/checkImageUrl";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
export default function Header({ logoMain, loadingLogo }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const userProfile = useSelector((state) => state.auth.userProfile);
  const cartItems = useSelector((state) => state.cart.cart);
  const { toggleNavbar, isNavbarVisible, toggleVisibilityMenu } = useContext(NavbarContext);
  const [searchTerm, setSearchTerm] = useState("");
  const prevSearchTerm = useRef("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

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

  const handleSearchSubmit = (e) => {
    if (e.key === "Enter") {
      const trimmedTerm = searchTerm.trim();

      if (prevSearchTerm.current === "" && trimmedTerm === "") {
        return; 
      }

      prevSearchTerm.current = trimmedTerm; 
      navigate(`/category/products?search=${encodeURIComponent(trimmedTerm)}`);
    }
  };

  const handleLogout = () => {
    dispatch(logoutAction());
    toast.success("Đăng xuất thành công!");
    navigate("/account/login");
  };
  
  return (
    <>
      <div className="bg-gray-300 h-[70px] flex items-center fixed top-0 left-0 w-full z-40 shadow-sm">
        <header className="mx-auto max-w-screen-xl w-full px-3 md:px-5 flex items-center justify-between h-[42px] text-[13px]">
          <div className="lg:hidden flex ml-4 cursor-pointer" onClick={toggleNavbar}>
            {isNavbarVisible ? <IoClose className="text-[30px]" /> : <HiMenuAlt2 className="text-[30px]" />}
          </div>
          <Link
            to={"/"}
            className="relative inline-block sm:max-w-[150px] aspect-[3/1] max-w-[120px] items-center"
          >
            {loadingLogo ? (
                <div className="flex items-center justify-center">
                  <Skeleton height={35} width={120} />
                </div>
              ) : (
                <img
                  src={checkImageUrl(logoMain)}
                  className="w-full h-full object-contain"
                  alt="Logo"
                />
            )}
          </Link>
          <button onClick={toggleVisibilityMenu} className="bg-[#ffffff85] max-h-[38px] ml-4 px-2 h-full rounded-lg text-black cursor-pointer lg:flex hidden items-center">
            <TbMenu3 className="mr-2 text-[20px]" />
            Danh mục
          </button>
          <button 
            onClick={() => handleScrollToService(navigate, location)}
            className="bg-[#ffffff85] max-h-[38px] ml-4 px-2 h-full rounded-lg text-black cursor-pointer lg:flex hidden items-center"
          >
            <GiAutoRepair className="mr-2 text-[20px]" />
            Dịch vụ Setup
          </button>
          <div className="flex items-center grow bg-white rounded-xl relative ml-4 h-full max-h-[38px]">
            <span className="absolute left-3 text-gray-500 text-[16px]">
              <FaSearch />
            </span>
            <input
              type="text"
              placeholder="Bạn cần tìm gì?"
              className="p-2 rounded-l-m w-full h-full outline-none sm:text-[14px] text-[16px] ml-7"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearchSubmit}
            />
          </div>

          <div className="items-center h-full lg:flex hidden">
            <div className="flex items-center ml-4 rounded-lg px-2 h-full">
              <LuPhone className="mr-1 text-[23px]" />
              <a href="tel:0961779795" className="flex flex-col text-[12px]">
                <span className="ml-1">Gọi mua hàng</span>
                <span className="ml-1">096 177 97 95</span>
              </a>
            </div>
            <Link to="/cart" className="flex items-center ml-4 cursor-pointer px-2 h-full rounded-lg relative">
              <MdOutlineShoppingCart className="text-2xl" />
              <span className="absolute top-1 right-1 bg-red-500 text-white text-[11px] font-medium w-4 h-4 rounded-full flex items-center justify-center">
                {cartItems.length}
              </span>
            </Link>
            {userProfile ? (
              <div className="relative group flex items-center ml-4 h-full cursor-pointer rounded-full" ref={menuRef}>
                <div className="w-10 rounded-full">
                  <img
                    onClick={toggleMenu}
                    src={userProfile.avatar ? checkImageUrl(userProfile.avatar) : avt_default}
                    alt="Avatar"
                    className="rounded-full border border-gray-800 shadow-sm w-full aspect-[1/1] object-cover ring-2 ring-gray-300"
                  />
                </div>
                <div className="absolute w-32 h-3 -right-7 top-9 bg-transparent hidden group-hover:block"></div>
                <div className={`absolute overflow-hidden top-11.5 -right-7 border border-gray-300 w-36 bg-white shadow-sm rounded-md transition-opacity duration-200 ${
                    isMenuOpen ? "block opacity-100" : "hidden opacity-0"
                  } lg:group-hover:block lg:group-hover:opacity-100`}>
                  <Link to="/profile/information" className="block px-4 py-2 hover:bg-gray-200 font-medium text-center">
                    Thông tin
                  </Link>
                  <Link to="/profile/orderhistory" className="block px-4 py-2 hover:bg-gray-200 font-medium text-center">
                    Lịch sử đặt hàng
                  </Link>
                  {userProfile.role && (
                    <Link to="/admin" className="block px-4 py-2 hover:bg-gray-200 font-medium text-center">
                      Quản trị viên
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="block w-full px-4 py-2 hover:bg-gray-200 cursor-pointer font-medium text-center"
                  >
                    Đăng xuất
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/account/login" className="flex items-center ml-4 px-2 h-full cursor-pointer">
                <FaRegUserCircle className="text-2xl" />
              </Link>
            )}
          </div>

          <Link to="/cart" className="lg:hidden flex ml-4 cursor-pointer items-center px-2 h-full rounded-lg relative">
              <MdOutlineShoppingCart className="text-2xl" />
              <span className="absolute top-1 right-1 bg-red-500 text-white text-[11px] font-medium w-4 h-4 rounded-full flex items-center justify-center">
                {cartItems.length}
              </span>
          </Link>
        </header>
      </div>
      <div className="h-[70px]"></div>
    </>
  );
}

Header.propTypes = {
  data: PropTypes.array,
  isLoading: PropTypes.bool,
  logoMain: PropTypes.object,
  loadingLogo: PropTypes.bool,
};