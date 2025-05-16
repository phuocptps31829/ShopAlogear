import {
  HomeIcon,
  PhotoIcon,
  UserGroupIcon,
  TagIcon,
  ShoppingBagIcon,
  HandThumbUpIcon,
  TruckIcon,
  BoltIcon,
  BuildingStorefrontIcon,
} from "@heroicons/react/24/solid";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Button, Typography } from "@material-tailwind/react";
import PropTypes from "prop-types";
import { useQuery } from "@tanstack/react-query";
import { bannerApi } from "../../services/bannerApi";
import { checkImageUrl } from "../../utils/checkImageUrl";
import { useSelector, useDispatch } from "react-redux";
import { setActive } from "../../redux/menuSlice";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const ICON_STYLES = "w-5 h-5 text-inherit";

const NAV_ITEMS = [
  { icon: HomeIcon, label: "Thống kê", path: "/admin/dashboard" },
  { icon: PhotoIcon, label: "Quản lí ảnh", path: "/admin/banner" },
  { icon: UserGroupIcon, label: "Quản lí người dùng", path: "/admin/users" },
  { icon: TagIcon, label: "Quản lí danh mục", path: "/admin/categories" },
  { icon: BuildingStorefrontIcon, label: "Quản lí thương hiệu", path: "/admin/brands" },
  { icon: HandThumbUpIcon, label: "Dự án & khách hàng", path: "/admin/cooperates" },
  { icon: ShoppingBagIcon, label: "Quản lí sản phẩm", path: "/admin/products" },
  { icon: BoltIcon, label: "Quản lí giảm giá", path: "/admin/flashsale" },
  { icon: TruckIcon, label: "Quản lí đơn hàng", path: "/admin/orders" },
];

const NavItem = ({ item, handleSetActiveFalse }) => {
  const location = useLocation();
  const isActive = location.pathname.startsWith(item.path);

  return (
    <li>
      <NavLink to={item.path}>
        <Button
          variant="text"
          color="dark"
          className={`${isActive && "text-black bg-gray-400 hover:bg-gray-300"} flex cursor-pointer items-center gap-4 px-4 `}
          fullWidth
          onClick={handleSetActiveFalse}
        >
          <item.icon className={ICON_STYLES} />
          <Typography color="inherit" className="font-medium text-[15px] whitespace-nowrap">
            {item.label}
          </Typography>
        </Button>
      </NavLink>
    </li>
  );
};

NavItem.propTypes = {
  item: PropTypes.shape({
    icon: PropTypes.elementType.isRequired,
    label: PropTypes.string.isRequired,
    path: PropTypes.string.isRequired,
    home: PropTypes.bool.isRequired,
  }).isRequired,
  handleSetActiveFalse: PropTypes.func.isRequired,
};

export function Sidenav() {
  const dispatch = useDispatch();
  const menuActive = useSelector((state) => state.menuAdmin.active);
  const userProfile = useSelector((state) => state.auth.userProfile);
  const { data, isLoading } = useQuery({
    queryKey: ["bannersAdmin", { type: 3 }],  
    queryFn: () => bannerApi.getAllBanner({
      type: 3,
    }),
    keepPreviousData: true,
  });

  const filteredNavItems = NAV_ITEMS.filter((item) => {
    if (!userProfile?.role) return false;
    
    switch (userProfile.role) {
      case 1:
        return true;
      case 2: 
        return [
          "Thống kê",
          "Dự án & khách hàng",
          "Quản lí sản phẩm",
          "Quản lí thương hiệu",
          "Quản lí giảm giá",
          "Quản lí đơn hàng"
        ].includes(item.label);
      case 3:
        return ![
          "Quản lí người dùng",
          "Quản lí danh mục"
        ].includes(item.label);
      default:
        return false;
    }
  });

  const handleSetActiveFalse = () => {
    dispatch(setActive(false));
  };

  return (
    <>
      <div className={`fixed z-[1] bg-black/50 w-full ${menuActive ? "block h-screen" : "hidden"}`} onClick={() => dispatch(setActive(false))}></div>
      <aside className={`fixed -left-80 lg:left-0 my-4 ml-4 h-[calc(100vh-32px)] overflow-hidden flex flex-col w-72 rounded-xl transition-all duration-300 translate-x-0 border border-gray-300 bg-gradient-to-b from-[#9faeb1] to-white z-[2] ${menuActive ? "left-0" : ""}`}>
        {isLoading ? (
          <div className="flex items-center justify-center mt-1">
            <Skeleton height={69} width={200} />
          </div>
        ) : (
          <Link to="/" onClick={handleSetActiveFalse}>
            <img
              className="w-50 aspect-[3/1] mx-auto my-2 object-contain"
              loading="lazy"
              src={checkImageUrl(data?.products[0]?.image)}
            />
          </Link>
        )}
        <div className="mx-4 my-5 overflow-y-auto">
          <ul className="mb-4 flex flex-col gap-2">
            {filteredNavItems.map((item) => (
              <NavItem key={item.label} item={item} handleSetActiveFalse={handleSetActiveFalse} />
            ))}
          </ul>
        </div>
      </aside>
    </>
  );
}

export default Sidenav;
