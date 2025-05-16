import Dashboard from "../../components/admin/Dashboard";
import { Helmet } from "react-helmet-async";

export default function DashboardPage() {
  return (
    <>
      <Helmet>
        <title>Thống kê</title>
      </Helmet>
      <Dashboard />
    </>
  );
}
