import { axiosInstance } from "./axiosInstance";

export const imageApi = {
  createImages: async (formData) => {
    const res = await axiosInstance.post("/images/uploadImages", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },
};
