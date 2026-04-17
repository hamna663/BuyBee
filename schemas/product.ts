import z from "zod";

export const productSchema = z.object({
  name: z.string().min(1),
  price: z.number().positive(),
  description: z.string().min(1),
  stock: z.number().int().positive(),
});
