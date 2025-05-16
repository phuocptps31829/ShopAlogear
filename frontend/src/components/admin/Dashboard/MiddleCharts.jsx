import { useState } from "react";
import LineChart from "./chart/LineChart";
import DoughnutChart from "./chart/DoughnutChart";
import { useQuery } from "@tanstack/react-query";
import { dashBoardApi } from "../../../services/dashboardApi";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function MiddleCharts() {
  const [timeRange, setTimeRange] = useState("year");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(1);
  const [startDay, setStartDay] = useState("2025-03-10"); 
  const [endDay, setEndDay] = useState("2025-03-30");
  const [loadingChart, setLoadingChart] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["dashboardRevenue", timeRange, selectedYear, selectedMonth, startDay, endDay],
    queryFn: () => {
      if (timeRange === "custom") {
        return dashBoardApi.getChartDayToDay({
          startDay,
          endDay,
        });
      }
      return dashBoardApi.getDataRevenue({
        year: selectedYear,
        month: selectedMonth,
      });
    },
    keepPreviousData: true,
  });

  const { data: quarterlyData, isLoading: isQuarterlyLoading } = useQuery({
    queryKey: ["dashboardQuarterly", selectedYear],
    queryFn: () => dashBoardApi.getChartQuarterly({ year: selectedYear }),
    enabled: timeRange === "year",
    keepPreviousData: true,
  });

  const formattedData = {
    years: {},
    months: {},
    weeks: {},
    custom: {}, // Thêm dữ liệu cho khoảng ngày tùy chọn
  };

  if (data) {
    if (timeRange === "custom") {
      formattedData.custom = (data || []).reduce((acc, item) => {
        acc[item.day] = Number(item.totalRevenue) || 0;
        return acc;
      }, {});
    } else {
      formattedData.years[selectedYear] = Object.keys(data.dataYear || {}).reduce(
        (acc, key) => {
          acc[key] = Number(data.dataYear[key].totalRevenue) || 0;
          return acc;
        },
        {}
      );

      formattedData.months[selectedMonth] = Object.keys(data.dataMonth || {}).reduce(
        (acc, key) => {
          acc[key] = Number(data.dataMonth[key].totalRevenue) || 0;
          return acc;
        },
        {}
      );

      formattedData.weeks = Object.keys(data.dataWeek || {}).reduce((acc, key) => {
        acc[data.dataWeek[key].day] = Number(data.dataWeek[key].totalRevenue) || 0;
        return acc;
      }, {});
    }
  }

  const handleChangeTimeRange = (range) => {
    setTimeRange(range);
    setLoadingChart(true);
    setTimeout(() => {
      setLoadingChart(false);
    }, 700);
  }

  return (
    <div className="p-5 bg-white rounded-md shadow-sm w-full mt-4 border border-gray-300">
      <h2 className="text-xl font-semibold">Thống kê doanh thu</h2>
      <div className="mb-4 flex flex-wrap gap-2 justify-center">
        <button
          className={`px-4 py-2 rounded-md text-sm cursor-pointer ${
            timeRange === "year" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"
          }`}
          onClick={() => handleChangeTimeRange("year")}
        >
          Theo năm
        </button>
        <button
          className={`px-4 py-2 rounded-md text-sm cursor-pointer ${
            timeRange === "month" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"
          }`}
          onClick={() => handleChangeTimeRange("month")}
        >
          Theo tháng
        </button>
        <button
          className={`px-4 py-2 rounded-md text-sm cursor-pointer ${
            timeRange === "week" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"
          }`}
          onClick={() => handleChangeTimeRange("week")}
        >
          Theo tuần (hiện tại)
        </button>
        <button
          className={`px-4 py-2 rounded-md text-sm cursor-pointer ${
            timeRange === "custom" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"
          }`}
          onClick={() => handleChangeTimeRange("custom")}
        >
          Theo ngày tùy chọn
        </button>
      </div>

      {timeRange === "year" && (
        <div className="mb-4 mx-auto flex justify-center">
          <label className="mr-2 text-gray-700">Chọn năm:</label>
          <select
            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            {[2024, 2025, 2026].map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      )}

      {timeRange === "month" && (
        <div className="mb-4 flex items-center gap-5 justify-center">
          <div>
            <label className="mr-2 text-gray-700">Chọn năm:</label>
            <select
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
            >
              {[2024, 2025, 2026].map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mr-2 text-gray-700">Chọn tháng:</label>
            <select
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                <option key={month} value={month}>
                  Tháng {month}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {timeRange === "custom" && (
        <div className="mb-4 flex items-center gap-5 justify-center">
          <div>
            <label className="mr-2 text-gray-700">Từ ngày:</label>
            <input
              type="date"
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
              value={startDay}
              onChange={(e) => setStartDay(e.target.value)}
            />
          </div>
          <div>
            <label className="mr-2 text-gray-700">Đến ngày:</label>
            <input
              type="date"
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
              value={endDay}
              onChange={(e) => setEndDay(e.target.value)}
            />
          </div>
        </div>
      )}

      <div className={`grid grid-cols-1 gap-5 ${timeRange === "year" && "lg:grid-cols-[3fr_1fr]"}`}>
        <div className="w-full flex flex-col">
          {isLoading || loadingChart ? (
            <Skeleton height={350} />
          ) : (
            <LineChart
              dataRevenue={formattedData}
              timeRange={timeRange}
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
              startDay={startDay}
              endDay={endDay}
            />
          )}
        </div>
        {timeRange === "year" && (
          <div className="w-full flex flex-col justify-center items-center">
            {isQuarterlyLoading || loadingChart ? (
              <div className="w-full">
                <Skeleton height={350} className="w-full" />
              </div>
            ) : (
              <DoughnutChart quarterlyData={quarterlyData} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}