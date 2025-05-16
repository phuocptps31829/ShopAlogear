import {
  createBrowserRouter,
  RouterProvider,
  Navigate
} from "react-router-dom";
import { store } from "./redux/store";
import { Provider } from "react-redux";
import { lazy, Suspense } from "react";
import LoadingPage from "./components/ui/LoadingPage";

// Layouts
import AppLayout from "./layouts/client/AppLayout";
import AdminLayout from "./layouts/admin/AdminLayout";
import ProtectContainer from "./layouts/protect/ProtectContainer";
import IsAuthenticated from "./layouts/protect/IsAuthenticated";
import RoleProtectedRoute from "./layouts/protect/RoleProtectedRout";

// Lazy-loaded client pages
const HomePage = lazy(() => import("./pages/client/Home"));
const ProductDetailsPage = lazy(() => import("./pages/client/ProductDetails"));
const ServiceDetailsPage = lazy(() => import("./pages/client/ServiceDetails"));
const ProductCategoryPage = lazy(() => import("./pages/client/ProductCategory"));
const CartPage = lazy(() => import("./pages/client/Cart"));
const PaymentPage = lazy(() => import("./pages/client/Payment"));
const LoginPage = lazy(() => import("./pages/client/Login"));
const RegisterPage = lazy(() => import("./pages/client/Register"));
const ForgotPage = lazy(() => import("./pages/client/Forgot"));
const NotFound = lazy(() => import("./pages/client/NotFound"));
const PaymentSuccess = lazy(() => import("./pages/client/PaymentSuccess"));
const UserInformationPage = lazy(() => import("./pages/client/UserInformation"));
const OrderHistoryPage = lazy(() => import("./pages/client/OrderHistory"));

// Lazy-loaded admin pages
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const FlashSaleList = lazy(() => import("./pages/admin/FlashSaleManage").then(module => ({ default: module.FlashSaleList })));
const FlashSaleCreate = lazy(() => import("./pages/admin/FlashSaleManage").then(module => ({ default: module.FlashSaleCreate })));
const FlashSaleEdit = lazy(() => import("./pages/admin/FlashSaleManage").then(module => ({ default: module.FlashSaleEdit })));
const BannerList = lazy(() => import("./pages/admin/BannerManage").then(module => ({ default: module.BannerList })));
const BannerCreate = lazy(() => import("./pages/admin/BannerManage").then(module => ({ default: module.BannerCreate })));
const BannerEdit = lazy(() => import("./pages/admin/BannerManage").then(module => ({ default: module.BannerEdit })));
const CooperateList = lazy(() => import("./pages/admin/CooperateManage").then(module => ({ default: module.CooperateList })));
const CooperateCreate = lazy(() => import("./pages/admin/CooperateManage").then(module => ({ default: module.CooperateCreate })));
const CooperateEdit = lazy(() => import("./pages/admin/CooperateManage").then(module => ({ default: module.CooperateEdit })));
const OrderList = lazy(() => import("./pages/admin/OrderManage").then(module => ({ default: module.OrderList })));
const CategoryList = lazy(() => import("./pages/admin/CategoryManage").then(module => ({ default: module.CategoryList })));
const CategoryCreate = lazy(() => import("./pages/admin/CategoryManage").then(module => ({ default: module.CategoryCreate })));
const CategoryEdit = lazy(() => import("./pages/admin/CategoryManage").then(module => ({ default: module.CategoryEdit })));
const BrandList = lazy(() => import("./pages/admin/BrandManage").then(module => ({ default: module.BrandList })));
const ProductList = lazy(() => import("./pages/admin/ProductManage").then(module => ({ default: module.ProductList })));
const ProductCreate = lazy(() => import("./pages/admin/ProductManage").then(module => ({ default: module.ProductCreate })));
const ProductEdit = lazy(() => import("./pages/admin/ProductManage").then(module => ({ default: module.ProductEdit })));
const UserList = lazy(() => import("./pages/admin/UserManage").then(module => ({ default: module.UserList })));
const UserCreate = lazy(() => import("./pages/admin/UserManage").then(module => ({ default: module.UserCreate })));
const UserEdit = lazy(() => import("./pages/admin/UserManage").then(module => ({ default: module.UserEdit })));

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        path: "",
        element: <Suspense fallback={<LoadingPage />}><HomePage /></Suspense>,
      },
      { 
        path: "/profile/information", 
        element: (
          <ProtectContainer>
            <Suspense fallback={<LoadingPage />}>
              <UserInformationPage />
            </Suspense>
          </ProtectContainer>
        )
      },
      { 
        path: "/profile/orderhistory", 
        element: (
          <ProtectContainer>
            <Suspense fallback={<LoadingPage />}>
              <OrderHistoryPage />
            </Suspense>
          </ProtectContainer>
        )
      },
      { 
        path: "/account/forgot", 
        element: (
          <IsAuthenticated>
            <Suspense fallback={<LoadingPage />}>
              <ForgotPage />
            </Suspense>
          </IsAuthenticated>
        )
      },
      { 
        path: "/account/login", 
        element: (
          <IsAuthenticated>
            <Suspense fallback={<LoadingPage />}>
              <LoginPage />
            </Suspense>
          </IsAuthenticated>
        )
      },
      { 
        path: "/account/register", 
        element: (
          <IsAuthenticated>
            <Suspense fallback={<LoadingPage />}>
              <RegisterPage />
            </Suspense>
          </IsAuthenticated>
        )
      },
      { 
        path: "/cart",
        element: <Suspense fallback={<LoadingPage />}><CartPage /></Suspense>,
      },
      { 
        path: "/checkout",
        element: <Suspense fallback={<LoadingPage />}><PaymentPage /></Suspense>,
      },
      {
        path: "products/:slug",
        element: <Suspense fallback={<LoadingPage />}><ProductDetailsPage /></Suspense>
      },
      {
        path: "services/:slug",
        element: <Suspense fallback={<LoadingPage />}><ServiceDetailsPage /></Suspense>
      },
      {
        path: "category/products",
        element: <Suspense fallback={<LoadingPage />}><ProductCategoryPage /></Suspense>
      },
      {
        path: "payment-success",
        element: <Suspense fallback={<LoadingPage />}><PaymentSuccess /></Suspense>
      },
      {
        path: "/not-found",
        element: <Suspense fallback={<LoadingPage />}><NotFound /></Suspense>,
      },
      {
        path: "*",
        element: <Navigate to="/not-found" />,
      },
    ]
  },
  {
    path: "/admin",
    element: (
      <ProtectContainer>
        <AdminLayout />
      </ProtectContainer>
    ),
    children: [
      {
        path: "",
        element: <Navigate to="/admin/dashboard" />,
      },
      {
        path: "dashboard",
        element: (
          <RoleProtectedRoute allowedRoles={[1, 2, 3]}>
            <Suspense fallback={<LoadingPage />}>
              <Dashboard />
            </Suspense>
          </RoleProtectedRoute>
        ),
      },
      {
        path: "banner",
        element: (
          <RoleProtectedRoute allowedRoles={[1, 3]}>
            <Suspense fallback={<LoadingPage />}>
              <BannerList />
            </Suspense>
          </RoleProtectedRoute>
        ),
      },
      {
        path: "banner/create",
        element: (
          <RoleProtectedRoute allowedRoles={[1]}>
            <Suspense fallback={<LoadingPage />}>
              <BannerCreate />
            </Suspense>
          </RoleProtectedRoute>
        ),
      },
      {
        path: "banner/edit/:id",
        element: (
          <RoleProtectedRoute allowedRoles={[1]}>
            <Suspense fallback={<LoadingPage />}>
              <BannerEdit />
            </Suspense>
          </RoleProtectedRoute>
        ),
      },
      {
        path: "flashsale",
        element: (
          <RoleProtectedRoute allowedRoles={[1, 2, 3]}>
            <Suspense fallback={<LoadingPage />}>
              <FlashSaleList />
            </Suspense>
          </RoleProtectedRoute>
        ),
      },
      {
        path: "flashsale/create",
        element: (
          <RoleProtectedRoute allowedRoles={[1, 2]}>
            <Suspense fallback={<LoadingPage />}>
              <FlashSaleCreate />
            </Suspense>
          </RoleProtectedRoute>
        ),
      },
      {
        path: "flashsale/edit/:id",
        element: (
          <RoleProtectedRoute allowedRoles={[1, 2]}>
            <Suspense fallback={<LoadingPage />}>
              <FlashSaleEdit />
            </Suspense>
          </RoleProtectedRoute>
        ),
      },
      {
        path: "cooperates",
        element: (
          <RoleProtectedRoute allowedRoles={[1, 2, 3]}>
            <Suspense fallback={<LoadingPage />}>
              <CooperateList />
            </Suspense>
          </RoleProtectedRoute>
        ),
      },
      {
        path: "cooperates/create",
        element: (
          <RoleProtectedRoute allowedRoles={[1, 2]}>
            <Suspense fallback={<LoadingPage />}>
              <CooperateCreate />
            </Suspense>
          </RoleProtectedRoute>
        ),
      },
      {
        path: "cooperates/edit/:id",
        element: (
          <RoleProtectedRoute allowedRoles={[1, 2]}>
            <Suspense fallback={<LoadingPage />}>
              <CooperateEdit />
            </Suspense>
          </RoleProtectedRoute>
        ),
      },
      {
        path: "orders",
        element: (
          <RoleProtectedRoute allowedRoles={[1, 2, 3]}>
            <Suspense fallback={<LoadingPage />}>
              <OrderList />
            </Suspense>
          </RoleProtectedRoute>
        ),
      },
      {
        path: "categories",
        element: (
          <RoleProtectedRoute allowedRoles={[1]}>
            <Suspense fallback={<LoadingPage />}>
              <CategoryList />
            </Suspense>
          </RoleProtectedRoute>
        ),
      },
      {
        path: "categories/create",
        element: (
          <RoleProtectedRoute allowedRoles={[1]}>
            <Suspense fallback={<LoadingPage />}>
              <CategoryCreate />
            </Suspense>
          </RoleProtectedRoute>
        ),
      },
      {
        path: "categories/edit/:id",
        element: (
          <RoleProtectedRoute allowedRoles={[1]}>
            <Suspense fallback={<LoadingPage />}>
              <CategoryEdit />
            </Suspense>
          </RoleProtectedRoute>
        ),
      },
      {
        path: "brands",
        element: (
          <RoleProtectedRoute allowedRoles={[1, 2]}>
            <Suspense fallback={<LoadingPage />}>
              <BrandList />
            </Suspense>
          </RoleProtectedRoute>
        ),
      },
      {
        path: "products",
        element: (
          <RoleProtectedRoute allowedRoles={[1, 2, 3]}>
            <Suspense fallback={<LoadingPage />}>
              <ProductList />
            </Suspense>
          </RoleProtectedRoute>
        ),
      },
      {
        path: "products/create",
        element: (
          <RoleProtectedRoute allowedRoles={[1, 2]}>
            <Suspense fallback={<LoadingPage />}>
              <ProductCreate />
            </Suspense>
          </RoleProtectedRoute>
        ),
      },
      {
        path: "products/edit/:id",
        element: (
          <RoleProtectedRoute allowedRoles={[1, 2]}>
            <Suspense fallback={<LoadingPage />}>
              <ProductEdit />
            </Suspense>
          </RoleProtectedRoute>
        ),
      },
      {
        path: "users",
        element: (
          <RoleProtectedRoute allowedRoles={[1]}>
            <Suspense fallback={<LoadingPage />}>
              <UserList />
            </Suspense>
          </RoleProtectedRoute>
        ),
      },
      {
        path: "users/create",
        element: (
          <RoleProtectedRoute allowedRoles={[1]}>
            <Suspense fallback={<LoadingPage />}>
              <UserCreate />
            </Suspense>
          </RoleProtectedRoute>
        ),
      },
      {
        path: "users/edit/:id",
        element: (
          <RoleProtectedRoute allowedRoles={[1]}>
            <Suspense fallback={<LoadingPage />}>
              <UserEdit />
            </Suspense>
          </RoleProtectedRoute>
        ),
      }
    ]
  }
]);

function App() {
  return (
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  );
}

export default App;