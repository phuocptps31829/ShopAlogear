import PropTypes from "prop-types";
import { useQuery } from "@tanstack/react-query";
import { authApi } from "../../services/authApi";
import { Navigate, Outlet } from "react-router-dom";

const RoleProtectedRoute = ({ allowedRoles, children }) => {
  const { data, isLoading } = useQuery({
    queryKey: ["userProfile"],
    queryFn: authApi.getProfileInfo,
  });

  if (isLoading) {
    return null;
  }
  
  if (!data?.data?.role) {
    return <Navigate to="/" replace />;
  }

  if (!allowedRoles.includes(data?.data?.role)) {
    return <Navigate to="/not-found" replace />;
  }

  return children || <Outlet />;
};

RoleProtectedRoute.propTypes = {
  allowedRoles: PropTypes.array.isRequired,
  children: PropTypes.element,
};

export default RoleProtectedRoute;