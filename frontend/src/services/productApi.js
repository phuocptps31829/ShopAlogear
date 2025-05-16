import { axiosInstance } from "./axiosInstance";

export const ProductApi = {
  getAllProducts: async (filters) => {
    const res = await axiosInstance.get(`/products/getAllProduct`, {
      params: filters,
    });
    return res.data.data;
  },

  getFlashSaleProducts: async () => {
    const res = await axiosInstance.get(`/sales/getFlashSale`);
    return res.data.data;
  },

  getProductBySlug: async (slug) => {
    const res = await axiosInstance.get(`/products/getOneProduct/${slug}`);
    return res.data.data;
  },

  increaseView: async (slug) => {
    const res = await axiosInstance.patch(`/products/updateView/${slug}`);
    return res.data.data;
  },

  getAllProductsAdmin: async (filters) => {
    const res = await axiosInstance.get(`/admin/products/getAll`, {
      params: filters,
    });
    return res.data.data;
  },

  getOneProductAdmin: async (id) => {
    const res = await axiosInstance.get(`/admin/products/getOne/${id}`);
    return res.data.data;
  },

  createProductAdmin: async (data) => {
    const res = await axiosInstance.post(`/admin/products/create`, data);
    return res.data.data;
  },

  updateProductAdmin: async ({ id, data }) => {
    const res = await axiosInstance.put(`/admin/products/update/${id}`, data);
    return res.data.data;
  },

  updateQuantity: async ({ id, quantity }) => {
    const res = await axiosInstance.patch(`/admin/products/updateQuantity/${id}`, {
      quantity,
    });
    return res.data.data;
  },

  deleteProductAdmin: async (id) => {
    const res = await axiosInstance.delete(`/admin/products/delete/${id}`);
    return res.data.data;
  },
};
