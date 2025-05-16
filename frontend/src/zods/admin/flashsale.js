import { z } from "zod";

export const flashSaleSchema = z
  .object({
    name: z.string().min(1, "Tên không được để trống"),
    startTime: z.string().min(1, "Thời gian bắt đầu không được để trống"),
    endTime: z.string().min(1, "Thời gian kết thúc không được để trống"),
    type: z.string().min(1, "Loại không được để trống"),
    status: z.string().min(1, "Trạng thái không được để trống"),
  })
  .refine((data) => new Date(data.endTime) > new Date(data.startTime), {
    message: "Thời gian kết thúc phải lớn hơn thời gian bắt đầu",
    path: ["endTime"],
  });
