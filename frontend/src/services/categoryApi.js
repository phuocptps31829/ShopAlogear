import { axiosInstance } from "./axiosInstance";

export const categoryApi = {
    getAllCategories: async (filters) => {
        const res = await axiosInstance.get(`/categories/getAll`, { params: filters });
        return res.data.data;
    },
    getAllCategoriesAdmin: async (filters) => {
        const res = await axiosInstance.get(`/admin/categories/getAll`, { params: filters });
        return res.data.data;
    },
    createCategoryAdmin: async (data) => {
        const res = await axiosInstance.post(`/admin/categories/create`, data);
        return res.data.data;
    },
    updateCategoryAdmin: async ({ id, data }) => {
        const res = await axiosInstance.put(`/admin/categories/update/${id}`, data);
        return res.data.data;
    },
    getCategoryById: async (id) => {
        const res = await axiosInstance.get(`/admin/categories/getOne/${id}`);
        return res.data.data;
    },
    deleteCategoryAdmin: async (id) => {
        const res = await axiosInstance.delete(`/admin/categories/delete/${id}`);
        return res.data.data;
    }
};