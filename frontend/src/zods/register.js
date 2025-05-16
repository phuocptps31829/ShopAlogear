import { z } from "zod";

export const registerSchema = z
  .object({
    email: z.string().email("Email không hợp lệ!"),
    password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự!"),
    confirmPassword: z
      .string()
      .min(6, "Nhập lại mật khẩu phải có ít nhất 6 ký tự!"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu không khớp!",
    path: ["confirmPassword"],
  });
