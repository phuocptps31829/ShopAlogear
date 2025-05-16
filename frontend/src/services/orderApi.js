import { axiosInstance } from "./axiosInstance";

export const orderApi = {
  createOrder: async (data) => {
    const res = await axiosInstance.post(`/orders/create`, data);
    return res.data.data;
  },
  getAllOrdersAdmin: async (filter) => {
    const res = await axiosInstance.get(`/admin/orders/getAll`, {
      params: filter,
    });
    return res.data.data;
  },
  getOneOrderAdmin: async (id) => {
    const res = await axiosInstance.get(`/admin/orders/getOne/${id}`);
    return res.data.data;
  },
  createOrderAdmin: async (data) => {
    const res = await axiosInstance.post(`/admin/orders/create`, data);
    return res.data.data;
  },
  updateOrderAdmin: async ({ id, data }) => {
    const res = await axiosInstance.put(`/admin/orders/update/${id}`, data);
    return res.data.data;
  },
  updateStatusOrderAdmin: async ({ id, status }) => {
    const res = await axiosInstance.patch(`/admin/orders/updateStatus/${id}`, {
      status,
    });
    return res.data.data;
  },
  deleteOrderAdmin: async (id) => {
    const res = await axiosInstance.delete(`/admin/orders/delete/${id}`);
    return res.data.data;
  },
  cancelOrderUser: async (id) => {
    const res = await axiosInstance.patch(`/orders/cancel/${id}`);
    return res.data.data;
  },
  updateShipping: async ({ id, data }) => {
    const res = await axiosInstance.patch(`/admin/orders/updateShipping/${id}`, data);
    return res.data.data;
  }
};
