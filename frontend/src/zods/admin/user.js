import { z } from "zod";

export const userSchema = z.object({
  username: z.string().min(1, "Tên người dùng không được để trống!"),
  phone: z.string().optional().refine((value) => !value || /^[0-9]{10,11}$/.test(value), {
    message: "Số điện thoại không hợp lệ!",
  }),
  email: z.string().min(1, "Email không được để trống!").email("Email không hợp lệ!"),
  address: z.string().optional(),
  avatar: z.string().optional(),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự")
});

export const userUpdateSchema = z.object({
  username: z.string().min(1, "Tên người dùng không được để trống!"),
  phone: z.string().optional().refine((value) => !value || /^[0-9]{10,11}$/.test(value), {
    message: "Số điện thoại không hợp lệ!",
  }),
  email: z.string().min(1, "Email không được để trống!").email("Email không hợp lệ!"),
  address: z.string().optional(),
  avatar: z.string().optional(),
  password: z.string()
});