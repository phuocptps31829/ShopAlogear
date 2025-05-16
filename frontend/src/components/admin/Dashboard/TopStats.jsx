import { useState, useEffect } from "react";
import { FaUser, FaShippingFast } from "react-icons/fa";
import AnimatedValue from "../../../components/ui/AnimatedNumberCounter";
import { AiFillProduct, AiOutlineProduct } from "react-icons/ai";
import { useQuery } from "@tanstack/react-query";
import { dashBoardApi } from "../../../services/dashboardApi";
import "react-loading-skeleton/dist/skeleton.css";
import Skeleton from "react-loading-skeleton";
import { useNavigate } from "react-router-dom"; // Thêm useNavigate

const ICONS = {
  calendar: <AiFillProduct color="white" size={22} />,
  hospitalUser: <AiOutlineProduct color="white" size={22} />,
  newspaper: <FaUser color="white" size={22} />,
  moneyCheck: <FaShippingFast color="white" size={22} />,
};

export default function TopStats() {
  const navigate = useNavigate(); // Khởi tạo useNavigate
  const { data, isLoading } = useQuery({
    queryKey: ["dashboardTotalStats"],
    queryFn: () => dashBoardApi.getAlltotalTopStats(),
    keepPreviousData: true,
  });

  const [statsData, setStatsData] = useState([
    {
      id: 1,
      icon: ICONS.calendar,
      title: "Sản phẩm",
      value: 0,
      nameData: "totalProducts",
      link: "/admin/products",
    },
    {
      id: 2,
      icon: ICONS.hospitalUser,
      title: "Dịch vụ",
      value: 0,
      nameData: "totalServices",
      link: "/admin/products", 
    },
    {
      id: 3,
      icon: ICONS.newspaper,
      title: "Members",
      value: 0,
      nameData: "totalUser",
      link: "/admin/users",
    },
    {
      id: 4,
      icon: ICONS.moneyCheck,
      title: "Số đơn hàng",
      value: 0,
      nameData: "totalOrder",
      link: "/admin/orders",
    }
  ]);

  useEffect(() => {
    if (data) {
      setStatsData((prev) => {
        return prev.map((stat) => {
          return {
            ...stat,
            value: data[stat.nameData],
          };
        });
      });
    }
  }, [data]);

  // Hàm xử lý nhấp chuột để điều hướng
  const handleStatClick = (link) => {
    navigate(link);
  };

  return (
    <div className="w-full">
      <div className="grid sm:grid-cols-4 grid-cols-2 gap-4">
        {statsData.map((stat) => (
          <div
            key={stat.id}
            className="rounded-md p-4 shadow-sm border border-gray-300"
          >
            <div className="flex flex-col">
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[#3b7f89]">
                {stat.icon}
              </div>
              <div className="mt-2 font-semibold">{stat.title}</div>
              <div
                className="text-[30px] text-gray-700 cursor-pointer hover:text-blue-500"
                onClick={() => handleStatClick(stat.link)}
              >
                {isLoading ? (
                  <Skeleton height={32} width={100} />
                ) : (
                  <AnimatedValue value={stat.value} />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}