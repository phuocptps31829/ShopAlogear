import { z } from "zod";

export const userInfoSchema = z.object({
  username: z.string().min(1, "Tên không được để trống"),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || (val.length >= 10 && /^\d+$/.test(val)),
      "Số điện thoại không hợp lệ"
    ),
  address: z.string().optional(),
});

export const changePasswordSchema = z.object({
  password: z.string().min(1, "Mật khẩu không được để trống"),
  newPassword: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  confirmPassword: z.string().min(1, "Mật khẩu không được để trống"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Mật khẩu không khớp!",
  path: ["confirmPassword"],
});