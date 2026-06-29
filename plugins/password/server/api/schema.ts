import { z } from "zod";
import { UserValidation } from "@shared/validations";
import { BaseSchema } from "@server/routes/api/schema";

export const PasswordSetSchema = BaseSchema.extend({
  body: z.object({
    password: z
      .string()
      .min(UserValidation.minPasswordLength)
      .max(UserValidation.maxPasswordLength),
  }),
});

export type PasswordSetReq = z.infer<typeof PasswordSetSchema>;

export const PasswordUpdateSchema = BaseSchema.extend({
  body: z.object({
    currentPassword: z.string().min(1).max(UserValidation.maxPasswordLength),
    password: z
      .string()
      .min(UserValidation.minPasswordLength)
      .max(UserValidation.maxPasswordLength),
  }),
});

export type PasswordUpdateReq = z.infer<typeof PasswordUpdateSchema>;
