import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(1, "Tên danh mục không được để trống!"),
  icon: z.string().optional(),
  type: z.string().min(1, "Kiểu danh mục không được để trống!"),
  status: z.string().min(1, "Trạng thái không được để trống!"), 
  parent: z.string().min(1, "Danh mục cha không được để trống!"),
  display: z.string().min(1, "Trạng thái không được để trống!"),
});

export const categoryEditSchema = z.object({
  name: z.string().min(1, "Tên danh mục không được để trống!"),
  icon: z.string().optional(),
  type: z.string().min(1, "Kiểu danh mục không được để trống!"),
  status: z.string().min(1, "Trạng thái không được để trống!"), 
  parent: z.number().optional(),
  number: z
    .number()
    .min(0, "Số thứ tự phải lớn hơn hoặc bằng 0")
    .default(0),
  display: z.string().min(1, "Trạng thái không được để trống!"),
});
  