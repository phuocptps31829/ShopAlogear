import { axiosInstance } from "./axiosInstance";

export const CooperatesApi = {
  getAllCooperates: async () => {
    const res = await axiosInstance.get(`/cooperates/getCooperate`);
    return res.data.data;
  },
  getAllCooperatesAdmin: async (filters) => {
    const res = await axiosInstance.get(`/admin/cooperates/getAll`, {
      params: filters,
    });
    return res.data.data;
  },
  getCooperateById: async (id) => {
    const res = await axiosInstance.get(`/admin/cooperates/getOne/${id}`);
    return res.data.data;
  },
  createCooperateAdmin: async (data) => {
    const res = await axiosInstance.post(`/admin/cooperates/create`, data);
    return res.data.data;
  },
  updateCooperateAdmin: async ({ id, data }) => {
    const res = await axiosInstance.put(`/admin/cooperates/update/${id}`, data);
    return res.data.data;
  },
  deleteCooperateAdmin: async (id) => {
    const res = await axiosInstance.delete(`/admin/cooperates/delete/${id}`);
    return res.data.data;
  },
};
