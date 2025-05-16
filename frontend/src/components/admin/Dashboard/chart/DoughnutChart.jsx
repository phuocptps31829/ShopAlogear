import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import PropTypes from "prop-types";

ChartJS.register(ArcElement, Tooltip, Legend);

const DoughnutChart = ({ quarterlyData }) => {
  // Định dạng nhãn và dữ liệu từ API
  const labels = ["Quý 1", "Quý 2", "Quý 3", "Quý 4"];

  // Ánh xạ dữ liệu từ API vào mảng doanh thu (triệu đồng)
  const revenueData = labels.map((_, index) => {
    const quarterItem = quarterlyData?.[index];
    if (quarterItem) {
      return Number(quarterItem.totalRevenue) / 1000000; // Chuyển đổi sang triệu đồng
    }
    return 0; // Giá trị mặc định nếu không có dữ liệu cho quý này
  });

  // Dữ liệu cho biểu đồ
  const data = {
    labels: labels,
    datasets: [
      {
        label: "Doanh thu (triệu đồng)",
        data: revenueData,
        backgroundColor: [
          "rgba(255, 99, 132, 0.8)", // Màu cho Quý 1
          "rgba(54, 162, 235, 0.8)", // Màu cho Quý 2
          "rgba(255, 206, 86, 0.8)", // Màu cho Quý 3
          "rgba(75, 192, 192, 0.8)", // Màu cho Quý 4
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    cutout: "60%",
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed !== null) {
              label += new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(context.parsed * 1000000); // Chuyển đổi lại sang VND để hiển thị
            }
            return label;
          },
        },
      },
    },
  };

  return <Doughnut data={data} options={options} />;
};

// Kiểm tra kiểu dữ liệu cho props
DoughnutChart.propTypes = {
  quarterlyData: PropTypes.arrayOf(
    PropTypes.shape({
      quarter: PropTypes.string.isRequired,
      totalOrders: PropTypes.number.isRequired,
      totalRevenue: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    })
  ),
};

export default DoughnutChart;