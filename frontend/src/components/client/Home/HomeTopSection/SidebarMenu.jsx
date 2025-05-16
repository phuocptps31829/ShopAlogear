import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { FaChevronRight } from "react-icons/fa6";
import { categoryApi } from "../../../../services/categoryApi";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { brandApi } from "../../../../services/brandApi";

const SidebarMenu = ({ menuFixed = false }) => {
  const { data, error, isLoading } = useQuery({
    queryKey: ["categories", { type: 1, all: 1, option: 1 }],
    queryFn: () => categoryApi.getAllCategories(
      { type: 1, all: 1, option: 1 }
    ),
    keepPreviousData: true,
  });
  const { data: dataBrands, error: errorBranchs } = useQuery({
    queryKey: ["brandAll", { all: 1, sort: 1 }],
    queryFn: () => brandApi.getAllBrands(
      { all: 1, sort: 1 }
    ),
    keepPreviousData: true,
  });
  const [activeCategoryId, setActiveCategoryId] = useState(null);

  if (error || errorBranchs) return <div>{error.message || errorBranchs.message}</div>;

  return (
    <div
      className={`${
        menuFixed ? "fixed z-20 top-22 min-w-[235px]" : "relative"
      } lg:block hidden`}
      onMouseLeave={() => setActiveCategoryId(null)}
    >
      {isLoading ? (
        <div className="custom-scrollbar max-h-[340px] h-full bg-white shadow-sm border border-gray-200 rounded-2xl">
          {[...Array(10)].map((_, index) => (
            <div key={index} className="flex items-center space-x-2 px-2 py-[8.5px] hover:text-gray-700 hover:bg-gray-100 cursor-pointer">
              <Skeleton width={25} height={25} circle />
              <Skeleton className="ml-1" width={170} height={18} />
            </div>
          ))}
        </div>
      ) : (
        <>
          <ul className="custom-scrollbar max-h-[340px] h-full bg-white shadow-sm border border-gray-200 rounded-xl">
              <li
                className="relative group"
                onMouseEnter={() => setActiveCategoryId(999)}
              >
                <Link
                  to={`/category/products`}
                  className="flex items-center space-x-2 px-2 py-[8.5px] hover:text-gray-700 hover:bg-gray-100"
                >
                  <span className="w-6">🔥</span>
                  <span className="text-[12.5px] font-semibold uppercase">Sản phẩm</span>
                  {dataBrands && dataBrands.totalRecords > 0 && (
                    <span className="ml-auto opacity-50">
                      <FaChevronRight size={13} />
                    </span>
                  )}
                </Link>
              </li>
            {data.map((item, index) => (
              <li
                key={index}
                className="relative group"
                onMouseEnter={() => setActiveCategoryId(item.id)}
              >
                <Link
                  to={`/category/products?categoryID=${item.id}`}
                  className="flex items-center space-x-2 px-2 py-[8.5px] hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
                >
                  <span className="w-6">{item.icon}</span>
                  <span className="text-[12.5px] font-semibold">{item.name}</span>
                  {item.children.length > 0 && (
                    <span className="ml-auto opacity-50">
                      <FaChevronRight size={13} />
                    </span>
                  )}
                </Link>
              </li>
            ))}
            <li
                className="relative group"
                onMouseEnter={() => setActiveCategoryId(null)}
              >
                <Link
                  to=""
                  className="flex items-center space-x-2 px-2 py-[8.5px] hover:text-gray-700 hover:bg-gray-100"
                >
                  <span className="w-6">📢</span>
                  <span className="text-[12.5px] font-semibold">Tin Tức & Khuyến Mãi</span>
                </Link>
              </li>
          </ul>
          {(activeCategoryId == 999 && dataBrands && dataBrands.totalRecords > 0) &&
            <div className="menu-tree-child">
              <span className="font-bold text-md underline underline-offset-4 mb-2 block">Thương hiệu</span>
              <ul className="grid grid-cols-4 gap-2">
                {dataBrands?.products?.map((item, index) => (
                  <li
                    key={index}
                    className="py-1 hover:text-gray-500 cursor-pointer w-fit text-[14px]"
                  >
                    <Link to={`/category/products?brandID=${item.id}`} className="font-medium title-link">
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          }
          {activeCategoryId &&
            data.some((item) => item.id === activeCategoryId && item.children.length > 0) && (
              <div className="menu-tree-child">
                <ul className="grid grid-cols-4 gap-2">
                  {data
                    .filter((item) => item.id === activeCategoryId && item.children.length > 0)
                    .flatMap((item) =>
                      item.children.map((subItem, index) => (
                        <li
                          key={index}
                          className="py-1 hover:text-gray-500 cursor-pointer w-fit text-[14px]"
                        >
                          <Link to={`/category/products?categoryID=${subItem.id}`} className="font-medium title-link">
                            {subItem.name}
                          </Link>
                        </li>
                      ))
                    )}
                </ul>
              </div>
            )}
        </>
      )}
    </div>
  );
};

SidebarMenu.propTypes = {
  menuFixed: PropTypes.bool,
};

export default SidebarMenu;
