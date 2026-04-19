import z from "zod";

export const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  price: z.number().positive("Price must be a positive number"),
  description: z.string().min(1, "Description is required"),
  images: z
    .array(z.url("Invalid image URL"))
    .min(1, "At least one image is required")
    .max(5, "No more than 5 images allowed"),
  stock: z.number().int().positive("Stock must be a positive integer"),
  category: z.string().min(1, "Category is required"),
});

const safeString = z
  .string()
  .trim()
  .min(1)
  .max(100)
  .regex(/^[a-zA-Z0-9\s_\-.'&(),%+]+$/, "Invalid characters");

const optionalString = z.preprocess(
  (val) => (val === "" || val === null ? undefined : val),
  safeString.optional(),
);

export const productQuerySchema = z.object({
  search: optionalString,
  category: optionalString,
  offset: z.number().int().nonnegative().max(1000).optional(),
  limit: z.number().int().positive().max(100).optional(),
  rating: z.number().min(0).max(5).optional(),
  minPrice: z.number().nonnegative().optional(),
  maxPrice: z.number().nonnegative().optional(),
  sortBy: z
    .enum(["name", "price", "createdAt", "averageRating"])
    .optional()
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});
