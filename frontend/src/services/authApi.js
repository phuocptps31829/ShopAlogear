import { axiosInstance } from "./axiosInstance";

export const authApi = {
  googleCallback: async (code) => {
    const res = await axiosInstance.post(`/auth/google/callback`, {
      code,
    });
    return res.data.data;
  },
  googleLogin: async () => {
    const res = await axiosInstance.post(`/auth/google`);
    return res.data.data;
  },
  getProfileInfo: async () => {
    const res = await axiosInstance.get(`/auth/users/profile`);
    return res.data;
  },
  getAllUsersAdmin: async (filters) => {
    const res = await axiosInstance.get(`/admin/users/getAll`, { params: filters });
    return res.data.data;
  },
  refreshToken: async (refreshToken) => {
    const res = await axiosInstance.post(`/auth/refresh-token?refreshToken=${refreshToken}`);
    return res.data;
  },
  login: async (data) => {
    const res = await axiosInstance.post(`/auth/login`,data);
    return res.data.data;
  },
  register: async (data) => {
    const res = await axiosInstance.post(`/auth/register`, data);
    return res.data;
  },
  sendAuthCodeForgotPassword: async (email) => {
    const res = await axiosInstance.post(`/auth/forgot-password/send-otp`, {
      email,
    });
    return res.data;
  },
  checkOtpForgotPassword: async (data) => {
    const res = await axiosInstance.post(`/auth/forgot-password/check-otp`, data);
    return res.data;
  },
  resetPassword: async (data) => {
    const res = await axiosInstance.put(`/auth/forgot-password/reset-password`, data);
    return res.data;
  },
  userUpdate: async (data) => {
    const res = await axiosInstance.patch(`/auth/users/update`, data);
    return res.data;
  },
  userUpdateAdmin: async ({id, data}) => {
    const res = await axiosInstance.put(`/admin/users/update/${id}`, data);
    return res.data;
  },
  userCreateAdmin: async (data) => {
    const res = await axiosInstance.post(`/admin/users/create`, data);
    return res.data;
  },
  userDeleteAdmin: async (id) => {
    const res = await axiosInstance.delete(`/admin/users/delete/${id}`);
    return res.data;
  },
  getUserById: async (id) => {
    const res = await axiosInstance.get(`/admin/users/getOne/${id}`);
    return res.data.data;
  },
  updateUserRoleAdmin: async ({id, role}) => {
    const res = await axiosInstance.patch(`/admin/auth/setRole/${id}`, {
      role
    });
    return res.data.data;
  }
};
