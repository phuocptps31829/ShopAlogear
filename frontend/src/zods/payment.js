import { z } from "zod";

export const paymentSchema = z.object({
  fullName: z.string().min(1, "Tên không được để trống!"),
  email: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((val) => val === "" || z.string().email().safeParse(val).success, {
      message: "Email không hợp lệ!",
    }),
  phone: z
    .string()
    .min(1, "Số điện thoại không được để trống!")
    .regex(/^0[1-9][0-9]{8}$/, "Số điện thoại không hợp lệ!"),
  address: z.string().min(1, "Địa chỉ không được để trống!"),
});
