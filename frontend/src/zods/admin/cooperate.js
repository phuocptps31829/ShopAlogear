import { z } from "zod";

export const cooperateSchema = z.object({
  name: z.string().min(1, "Tên không được để trống"),
  image: z.string().min(1, "Ảnh không được để trống"),
  description: z.string().min(1, "Mô tả không được để trống"),
  status: z.string().min(1, "Trạng thái không hợp lệ"),
  type: z.string().min(0, "Loại không hợp lệ"),
  link: z.string().url("Liên kết không hợp lệ"),
});
