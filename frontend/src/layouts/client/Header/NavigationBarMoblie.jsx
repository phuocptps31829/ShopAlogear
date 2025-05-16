import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { NavbarContext } from "../../../contexts/NavBarContext";
import { TbMenu3 } from "react-icons/tb";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutAction } from "../../../redux/authSlice";
import { toast } from "react-toastify";
import avt_default from "../../../assets/images/avt-default.png";
import { FaShoppingBasket } from "react-icons/fa";
import { GiAutoRepair } from "react-icons/gi";
import { handleScrollToService } from "../../../utils/scrollToService";
import gmail from "../../../assets/images/gmail.png";
import contact from "../../../assets/images/customer-service.png";
import facebook from "../../../assets/images/facebook.png";
import tiktok from "../../../assets/images/social-media.png";
import { checkImageUrl } from "../../../utils/checkImageUrl";
import PropTypes from "prop-types";
import "react-loading-skeleton/dist/skeleton.css";
import { useQuery } from "@tanstack/react-query";
import { categoryApi } from "../../../services/categoryApi";
import { FaRegFileAlt } from "react-icons/fa";
import { MdManageAccounts } from "react-icons/md";

export default function NavigationBarMobile() {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userProfile = useSelector((state) => state.auth.userProfile);
  const { isNavbarVisible, setIsNavbarVisible } = useContext(NavbarContext);
  const { data, isLoading } = useQuery({
    queryKey: ["categories", { type: 1, all: 1 }],
    queryFn: () => categoryApi.getAllCategories({ type: 1, all: 1 }),
    keepPreviousData: true,
  });

  // State để kiểm soát hiển thị danh mục
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logoutAction());
    toast.success("Đăng xuất thành công!");
    navigate("/account/login");
    setIsNavbarVisible(false);
  };

  return (
    <>
      {isNavbarVisible && (
        <div
          className="fixed z-30 h-screen w-screen bg-black opacity-80 top-0"
          onClick={() => setIsNavbarVisible(false)}
        ></div>
      )}
      <nav
        className={`${
          isNavbarVisible && "navBarMoblie"
        } fixed -left-[1000px] top-0 z-30 h-full w-full bg-white duration-450 sm:w-[500px]`}
      >
        <div id="mobile-menu" className="mt-17">
          <div className="h-[calc(100vh-100px)] overflow-y-auto bg-white py-5">
            {userProfile ? (
              <div className="flex flex-col justify-center items-center w-full px-4">
                <div className="w-14 rounded-full mb-3">
                  <img
                    src={userProfile.avatar ? checkImageUrl(userProfile.avatar) : avt_default}
                    alt="Avatar"
                    className="rounded-full border border-gray-800 shadow-sm w-full aspect-[1/1] object-cover ring-2 ring-gray-300"
                  />
                </div>
                <p className="text-md font-semibold mb-3">
                  Xin chào, {userProfile?.username}
                </p>
                <div className="m-4 mt-0 flex items-center justify-between space-x-3 w-full">
                  <Link
                    onClick={() => setIsNavbarVisible(false)}
                    to="/profile/information"
                    className="w-full rounded px-4 py-2 text-center text-yellow-500 shadow-sm shadow-zinc-300"
                  >
                    Thông tin
                  </Link>
                  <button
                    onClick={() => handleLogout()}
                    className="w-full rounded bg-yellow-400 px-4 py-2 text-center text-white cursor-pointer"
                  >
                    Đăng xuất
                  </button>
                </div>
              </div>
            ) : (
              <div className="m-4 mt-0 flex items-center justify-between space-x-3">
                <Link
                  onClick={() => setIsNavbarVisible(false)}
                  to="/account/register"
                  className="w-full rounded px-4 py-2 text-center text-yellow-500 shadow-sm shadow-zinc-300"
                >
                  Đăng ký
                </Link>
                <Link
                  onClick={() => setIsNavbarVisible(false)}
                  to="/account/login"
                  className="w-full rounded bg-yellow-400 px-4 py-2 text-center text-white"
                >
                  Đăng nhập
                </Link>
              </div>
            )}
            <ul className="my-1 divide-y divide-slate-200 sm:my-4 mb-14">
              {userProfile?.role && (
                <li className="py-4">
                  <Link
                      to="/admin"
                      className="ml-4 cursor-pointer flex items-center space-x-4"
                      onClick={() => setIsNavbarVisible(false)}
                    >
                      <MdManageAccounts className="h-6 w-6" />
                      <span>Trang quản trị</span>
                    </Link>
                </li>
              )}
              <li className="py-4">
                
                <button
                  onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                  className="ml-4 cursor-pointer flex items-center space-x-4"
                >
                  <TbMenu3 className="h-6 w-6" />
                  <span>Danh mục sản phẩm</span>
                </button>
                <div
                  className={`ml-6 transition-all duration-300 ease-in-out overflow-hidden ${
                    isCategoryOpen ? "max-h-[500px] opacity-100 mt-3" : "max-h-0 opacity-0"
                  }`}
                >
                  {isLoading ? (
                    <span className="text-gray-500">Đang tải dữ liệu...</span>
                  ) : (
                    <>
                      <li className="relative group">
                        <Link
                          onClick={() => setIsNavbarVisible(false)}
                          to={`/category/products`}
                          className="flex items-center space-x-2 px-2 py-[8.5px] hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
                        >
                          <span className="w-6">🔥</span>
                          <span className="text-[12.5px] font-semibold uppercase">Sản phẩm</span>
                        </Link>
                      </li>
                    {data.map((item, index) => (
                      <li key={index} className="relative group">
                        <Link
                          onClick={() => setIsNavbarVisible(false)}
                          to={`/category/products?categoryID=${item.id}`}
                          className="flex items-center space-x-2 px-2 py-[8.5px] hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
                        >
                          <span className="w-6">{item.icon}</span>
                          <span className="text-[12.5px] font-semibold">{item.name}</span>
                        </Link>
                      </li>
                    ))}
                    </>
                  )}
                </div>
              </li>
              {userProfile && (
                <li className="py-4">
                  <Link
                    onClick={() => setIsNavbarVisible(false)}
                    to="/profile/orderhistory"
                    className="ml-4 flex items-center space-x-4"
                  >
                    <FaRegFileAlt className="h-6 w-6" />
                    <span>Lịch sử đặt hàng</span>
                  </Link>
                </li>
              )}
              <li className="py-4">
                <button
                  onClick={() => {
                    handleScrollToService(navigate, location);
                    setIsNavbarVisible(false);
                  }}
                  className="ml-4 flex items-center space-x-4 cursor-pointer"
                >
                  <GiAutoRepair className="h-6 w-6" />
                  <span>Dịch vụ Setup</span>
                </button>
              </li>
              <li className="py-4">
                <Link
                  onClick={() => setIsNavbarVisible(false)}
                  to="/cart"
                  className="ml-4 flex items-center space-x-4"
                >
                  <FaShoppingBasket className="h-6 w-6" />
                  <span>Giỏ hàng</span>
                </Link>
              </li>
              <li className="py-4">
                <div className="ml-4 flex items-center space-x-4">
                  <img src={contact} alt="" className="w-6" />
                  <span>Hỗ trợ đặt hàng: 096 177 97 95</span>
                </div>
              </li>
              <li className="py-4">
                <div className="ml-4 flex items-center space-x-4">
                  <img src={gmail} alt="" className="w-6" />
                  <span>Email: alogear.vn@gmail.com</span>
                </div>
              </li>
              <li className="py-4">
                <Link
                  to="https://www.facebook.com/alogear.vn"
                  target="blank"
                  className="ml-4 flex items-center space-x-4"
                >
                  <img src={facebook} alt="" className="w-6" />
                  <span>Fanpage Alogear</span>
                </Link>
              </li>
              <li className="py-4">
                <Link
                  to="https://www.tiktok.com/@alogear.vn"
                  target="blank"
                  className="ml-4 flex items-center space-x-4"
                >
                  <img src={tiktok} alt="" className="w-6" />
                  <span>Tiktok Alogear</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
}

NavigationBarMobile.propTypes = {
  logoMain: PropTypes.object,
  loadingLogo: PropTypes.bool,
};