import Cookies from "js-cookie";
import { authApi } from "../authApi";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const axiosInstance = axios.create({
  baseURL: API_URL,
});

const interceptors = (axiosInstance) => {
  let isRefreshing = false;
  let refreshSubscribers = [];

  function onRefreshed(token) {
    refreshSubscribers.map(callback => callback(token));
  }

  function addRefreshSubscriber(callback) {
    refreshSubscribers.push(callback);
  }

  axiosInstance.interceptors.request.use((config) => {
    const accessToken = Cookies.get("accessToken");

    if (accessToken && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  }, (err) => {
    return Promise.reject(err);
  });

  axiosInstance.interceptors.response.use(res => res, async err => {
    const originalRequest = err.config;
    const refreshToken = Cookies.get("refreshToken");

    if (refreshToken) {
      if (err.response && err.response.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise((resolve) => {
            addRefreshSubscriber(token => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(axiosInstance(originalRequest));
            });
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const response = await authApi.refreshToken(refreshToken);
          const newAccessToken = response.data.accessToken.token;
          const newRefreshToken = response.data.refreshToken.token;

          Cookies.set("accessToken", newAccessToken, {
            expires: new Date(response.data.accessToken.expires * 1000)
          });
          Cookies.set("refreshToken", newRefreshToken, {
            expires: new Date(response.data.refreshToken.expires * 1000)
          });

          axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          isRefreshing = false;
          onRefreshed(newAccessToken);
          refreshSubscribers = [];

          return axiosInstance(originalRequest);
        } catch (refreshError) {
          isRefreshing = false;
          refreshSubscribers = [];
          Cookies.remove("accessToken");
          Cookies.remove("refreshToken");
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(err);
  });
};

interceptors(axiosInstance);