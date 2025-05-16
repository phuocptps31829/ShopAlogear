import { axiosInstance } from "./axiosInstance";

export const flashSaleApi = {
  getAllFlashSaleAdmin: async (filter) => {
    const res = await axiosInstance.get(`/admin/sales/getAll`, {
      params: filter,
    });
    return res.data.data;
  },
  getFlashSaleById: async (id) => {
    const res = await axiosInstance.get(`/admin/sales/getOne/${id}`);
    return res.data.data;
  },
  createFlashSale: async (data) => {
    const res = await axiosInstance.post(`/admin/sales/create`, data);
    return res.data.data;
  },
  updateFlashSale: async ({ id, data }) => {
    const res = await axiosInstance.put(`/admin/sales/update/${id}`, data);
    return res.data.data;
  },
  deleteFlashSale: async (id) => {
    const res = await axiosInstance.delete(`/admin/sales/delete/${id}`);
    return res.data.data;
  },
};
