import { axiosInstance } from "./axiosInstance";

export const brandApi = {
    getAllBrands: async (filters) => {
        const res = await axiosInstance.get(`/brands/getAll`, { params: filters });
        return res.data.data;
    },
    getAllBrandsAdmin: async (filters) => {
        const res = await axiosInstance.get(`/admin/brands/getAll`, { params: filters });
        return res.data.data;
    },
    createBrand: async (brand) => {
        const res = await axiosInstance.post(`/admin/brands/create`, brand);
        return res.data.data;
    },
    updateBrand: async ({ id, brand }) => {
        const res = await axiosInstance.put(`/admin/brands/update/${id}`, brand);
        return res.data.data;
    },
    deleteBrand: async (brandId) => {
        const res = await axiosInstance.delete(`/admin/brands/delete/${brandId}`);
        return res.data.data;
    }
};  