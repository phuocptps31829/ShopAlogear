import { createRoot } from "react-dom/client";
import ReactDOM from "react-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NavbarProvider } from "./contexts/NavBarContext.jsx";
import { HelmetProvider } from "react-helmet-async";
import { ToastContainer } from "react-toastify";
import { Toaster } from "react-hot-toast";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";
import App from "./App.jsx";

if (!ReactDOM.findDOMNode) {
  ReactDOM.findDOMNode = function (component) {
    console.warn("findDOMNode is deprecated in React 18");
    return component;
  };
}

const queryClient = new QueryClient({
  keepPreviousData: true,
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

createRoot(document.getElementById("root")).render(
  <>
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <NavbarProvider>
          <App />
        </NavbarProvider>
      </HelmetProvider>
    </QueryClientProvider>
    <ToastContainer
      limit={1}
    />
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={10}
      containerClassName="mt-[90px]"
      containerStyle={{}}
      toastOptions={{
        className: "custom-hot-toast min-w-[250px] px-5 py-3 text-base",
        duration: 2000,
      }}
    />
  </>
);