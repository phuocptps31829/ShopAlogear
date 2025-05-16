import { z } from "zod";

export const bannerSchema = z.object({
  image: z.string().min(1, "Hình ảnh không được để trống!"),
  type: z.string().min(1, "Loại không được để trống!"),
  status: z.string().min(1, "Trạng thái không được để trống!"),
  number: z.number().nullable(),
  link: z
    .string()
    .optional()
    .refine((value) => !value || /^https?:\/\/.+\..+/.test(value), {
      message: "Link không đúng định dạng!",
    }),
});