import { z } from "zod";
import { Client } from "@shared/types";
import { UserValidation } from "@shared/validations";
import { BaseSchema } from "@server/routes/api/schema";

export const PasswordLoginSchema = BaseSchema.extend({
  body: z.object({
    email: z.email().max(UserValidation.maxEmailLength),
    password: z.string().min(1).max(UserValidation.maxPasswordLength),
    client: z.enum(Client).prefault(Client.Web),
  }),
});

export type PasswordLoginReq = z.infer<typeof PasswordLoginSchema>;

export const PasswordRegisterSchema = BaseSchema.extend({
  body: z.object({
    teamName: z.string().trim().min(1).max(UserValidation.maxNameLength),
    name: z.string().trim().min(1).max(UserValidation.maxNameLength),
    email: z.email().max(UserValidation.maxEmailLength),
    password: z
      .string()
      .min(UserValidation.minPasswordLength)
      .max(UserValidation.maxPasswordLength),
    client: z.enum(Client).prefault(Client.Web),
  }),
});

export type PasswordRegisterReq = z.infer<typeof PasswordRegisterSchema>;

export const PasswordResetSchema = BaseSchema.extend({
  body: z.object({
    email: z.email().max(UserValidation.maxEmailLength),
    client: z.enum(Client).prefault(Client.Web),
  }),
});

export type PasswordResetReq = z.infer<typeof PasswordResetSchema>;

export const PasswordResetCallbackSchema = BaseSchema.extend({
  body: z.object({
    token: z.string(),
    password: z
      .string()
      .min(UserValidation.minPasswordLength)
      .max(UserValidation.maxPasswordLength),
    client: z.enum(Client).prefault(Client.Web),
  }),
});

export type PasswordResetCallbackReq = z.infer<
  typeof PasswordResetCallbackSchema
>;
