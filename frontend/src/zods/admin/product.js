import { z } from "zod";

export const productHasPriceSchema = z.object({
  name: z.string().min(1, "Tên sản phẩm không được để trống"),
  price: z.preprocess((val) => {
    if (typeof val === "string") return Number(val);
    return val;
  }, z.number().nullable().optional()),  
  discount: z.preprocess((val) => {
    if (typeof val === "string") return Number(val);
    return val;
  }, z.number().min(1, "Giá sản phẩm không được để trống")),
  description: z.string().optional(),
  detail: z.string().optional(),
  status: z.string().min(1, "Trạng thái không được để trống"),
  quantity: z.union([z.number().nullable(), z.string().nullable()]).optional(),
  categoryID: z.array(z.number()).min(1, "Vui lòng chọn ít nhất một danh mục"),
  brandID: z.number().nullable().optional(),
}).refine((data) => data.discount === null || data.price === null || data.discount <= data.price, {
    message: "Giá giảm không được lớn hơn giá gốc",
    path: ["discount"],
  });

export const productNoPriceSchema = z.object({
  name: z.string().min(1, "Tên sản phẩm không được để trống"),
  description: z.string().optional(),
  detail: z.string().optional(),
  status: z.string().min(1, "Trạng thái không được để trống"),
  quantity: z.union([z.number().nullable(), z.string().nullable()]).optional(),
  categoryID: z.array(z.number()).min(1, "Vui lòng chọn ít nhất một danh mục"),
  brandID: z.number().nullable().optional(),
})
  
export const samplePackSchema = z.object({
  name: z.string().min(1, "Tên sản phẩm không được để trống"),
  price: z.preprocess((val) => {
    if (typeof val === "string") return Number(val);
    return val;
  }, z.number().nullable().optional()),  
  discount: z.preprocess((val) => {
    if (typeof val === "string") return Number(val);
    return val;
  }, z.number().nullable().optional()),
  iframe: z.string().min(1, "Iframe không được để trống"),
  detail: z.string().optional(),
  status: z.string().min(1, "Trạng thái không được để trống"),
  quantity: z.union([z.number().nullable(), z.string().nullable()]).optional(),
  categoryID: z.array(z.number()).min(1, "Vui lòng chọn ít nhất một danh mục"),
}).refine((data) => data.discount === null || data.price === null || data.discount <= data.price, {
    message: "Giá giảm không được lớn hơn giá gốc",
    path: ["discount"],
  });

  export const serviceSchema = z.object({
    name: z.string().min(1, "Tên sản phẩm không được để trống"),
    detail: z.string().optional(),
    status: z.string().min(1, "Trạng thái không được để trống"),
  })