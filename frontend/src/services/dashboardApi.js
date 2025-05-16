import { axiosInstance } from "./axiosInstance";

export const dashBoardApi = {
  getAlltotalTopStats: async () => {
    const res = await axiosInstance.get(`/admin/dashboard/getAll`);
    return res.data.data;
  },
  getViewTopProduct: async () => {
    const res = await axiosInstance.get(`/admin/dashboard/getView?option=1`);
    return res.data.data;
  },
  getNewOrder: async () => {
    const res = await axiosInstance.get(`/admin/dashboard/getNewOrder`);
    return res.data.data;
  },
  getAddNewProduct: async () => {
    const res = await axiosInstance.get(`/admin/dashboard/getNewProduct`);
    return res.data.data;
  },
  getDataRevenue: async (filters) => {
    const res = await axiosInstance.get(`/admin/dashboard/getChartYear`, {
      params: filters,
    });
    return res.data.data;
  },
  getChartDayToDay: async (filters) => {
    const res = await axiosInstance.get(`/admin/dashboard/getChartDayToDay`, {
      params: filters,
    });
    return res.data.data;
  },
  getChartQuarterly: async (filters) => {
    const res = await axiosInstance.get(`/admin/dashboard/getChartQuarterly`, {
      params: filters,
    });
    return res.data.data;
  },
};
