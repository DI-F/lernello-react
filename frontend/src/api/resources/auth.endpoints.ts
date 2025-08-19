import { createEndpoint } from "@/api/createEndpoint.ts";
import { RequestCodeInputSchema } from "@/schemas/auth/request-code.input.ts";
import { VerifyCodeInputSchema } from "@/schemas/auth/verify-code.input";
import { UserSchema } from "@/schemas/user/user.ts";
import { EmptySchema } from "@/schemas/common/empty.ts";
import z from "zod";

export const AuthRequestCode = createEndpoint({
  method: "POST",
  getPath: () => "/api/auth/request" as const,
  payloadSchema: RequestCodeInputSchema,
  responseSchema: EmptySchema,
});

export const AuthVerifyCode = createEndpoint({
  method: "POST",
  getPath: () => "/api/auth/verify" as const,
  payloadSchema: VerifyCodeInputSchema,
  querySchema: z.object({ remember: z.boolean().optional() }),
  responseSchema: EmptySchema,
});

export const AuthRefresh = createEndpoint({
  method: "POST",
  getPath: () => "/api/auth/refresh" as const,
  payloadSchema: null,
  responseSchema: EmptySchema,
});

export const AuthMe = createEndpoint({
  method: "GET",
  getPath: () => "/api/auth/me" as const,
  payloadSchema: null,
  responseSchema: UserSchema.nullable(),
});

export const AuthLogout = createEndpoint({
  method: "POST",
  getPath: () => "/api/auth/logout" as const,
  payloadSchema: null,
  responseSchema: EmptySchema,
});
