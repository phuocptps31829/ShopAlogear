import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import PropTypes from "prop-types";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Hàm tạo danh sách các ngày từ startDay đến endDay
const getDaysArray = (start, end) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const days = [];
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d).toISOString().split("T")[0]); // Định dạng YYYY-MM-DD
  }
  return days;
};

export default function LineChart({ dataRevenue, timeRange, selectedYear, selectedMonth, startDay, endDay }) {
  const dayMap = {
    Monday: "Thứ 2",
    Tuesday: "Thứ 3",
    Wednesday: "Thứ 4",
    Thursday: "Thứ 5",
    Friday: "Thứ 6",
    Saturday: "Thứ 7",
    Sunday: "Chủ nhật",
  };

  const labels =
    timeRange === "week"
      ? ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(
          (day) => dayMap[day]
        )
      : timeRange === "year"
      ? Object.keys(dataRevenue.years[selectedYear] || {}).map((month) => `Tháng ${month}`)
      : timeRange === "month"
      ? Object.keys(dataRevenue.months[selectedMonth] || {}).map((day) => `Ngày ${day}`)
      : timeRange === "custom"
      ? getDaysArray(startDay, endDay) 
      : [];

  const data = {
    labels,
    datasets: [
      {
        label: "Doanh thu",
        data: labels.map((label) => {
          if (timeRange === "week") {
            const englishDay = Object.keys(dayMap).find((key) => dayMap[key] === label);
            return dataRevenue.weeks[englishDay] || 0;
          }
          if (timeRange === "year") {
            return dataRevenue.years[selectedYear]?.[label.replace("Tháng ", "")] || 0;
          }
          if (timeRange === "month") {
            return dataRevenue.months[selectedMonth]?.[label.replace("Ngày ", "")] || 0;
          }
          if (timeRange === "custom") {
            return dataRevenue.custom[label] || 0; 
          }
          return 0;
        }),
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgba(53, 162, 235, 0.5)",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: {
          maxTicksLimit: labels.length, // Hiển thị tất cả các nhãn
          callback: function (value, index) {
            // Định dạng nhãn trục X cho custom
            if (timeRange === "custom") {
              return labels[index]; // Hiển thị ngày YYYY-MM-DD
            }
            return labels[index]; // Giữ nguyên cho các trường hợp khác
          },
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 10000000,
        },
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.dataset.label || "";
            const value = context.raw;
            const formattedValue = new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(value); 
            return `${label}: ${formattedValue}`; 
          },
        },
      },
    },
  };

  return <Line data={data} options={options} />;
}

LineChart.propTypes = {
  dataRevenue: PropTypes.object.isRequired,
  timeRange: PropTypes.string.isRequired,
  selectedYear: PropTypes.number.isRequired,
  selectedMonth: PropTypes.number.isRequired,
  startDay: PropTypes.string.isRequired,
  endDay: PropTypes.string.isRequired,
};