import z from "zod";

export const signUpSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.email("Invalid email address"),
    password: z
      .string()
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/,
        "Password must contain at least one uppercase letter, one lowercase letter, one number, one special character and be at least 8 characters long",
      ),
    confirmPassword: z.string(),
  })
  .refine(
    (data) => data.password === data.confirmPassword,
    "Passwords do not match",
  );

export const signInSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const passwordResetSchema = z
  .object({
    email: z.email("Invalid email address"),
    otp: z.string().length(6, "OTP must be 6 characters long"),
    password: z
      .string()
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/,
        "Password must contain at least one uppercase letter, one lowercase letter, one number, one special character and be at least 8 characters long",
      ),
    confirmPassword: z.string(),
  })
  .refine(
    (data) => data.password === data.confirmPassword,
    "Passwords do not match",
  );

export const changePasswordSchema = z
  .object({
    email: z.email("Invalid email address"),
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/,
        "Password must contain at least one uppercase letter, one lowercase letter, one number, one special character and be at least 8 characters long",
      ),
    confirmNewPassword: z.string(),
  })
  .refine(
    (data) => data.newPassword === data.confirmNewPassword,
    "Passwords do not match",
  );