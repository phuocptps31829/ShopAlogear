import { axiosInstance } from "./axiosInstance";

export const bannerApi = {
    getAllBanner: async (filters) => {
        const res = await axiosInstance.get(`/banners/getAllBanner`, { params: filters });
        return res.data.data;
    },
    getAllBannerAdmin: async (filters) => {
        const res = await axiosInstance.get(`/admin/banners/getAll`, { params: filters });
        return res.data.data;
    },
    getBannerById: async (id) => {
        const res = await axiosInstance.get(`/admin/banners/getOne/${id}`);
        return res.data.data;
    },
    createBanner: async (data) => {
        const res = await axiosInstance.post(`/admin/banners/create`, data);
        return res.data.data;
    },
    updateBanner: async ({ id, data }) => {
        const res = await axiosInstance.put(`/admin/banners/update/${id}`, data);
        return res.data.data;
    },
    deleteBanner: async (id) => {
        const res = await axiosInstance.delete(`/admin/banners/delete/${id}`);
        return res.data.data;
    },
};