import { createEndpoint } from "@/api/createEndpoint.ts";
import { RequestCodeInputSchema } from "@/schemas/auth/request-code.input.ts";
import { VerifyCodeInputSchema } from "@/schemas/auth/verify-code.input";
import { EmptySchema } from "@/schemas/common/empty.ts";
import { UserSchema } from "@/schemas/user/user.ts";

export const AuthRequestCode = createEndpoint({
  method: "POST",
  getPath: () => "/auth/request" as const,
  payloadSchema: EmptySchema,
  responseSchema: RequestCodeInputSchema,
});

export const AuthVerifyCode = createEndpoint({
  method: "POST",
  getPath: () => "/auth/verify" as const,
  payloadSchema: EmptySchema,
  responseSchema: VerifyCodeInputSchema,
});

// This endpoint is used to get the current user information
export const AuthMe = createEndpoint({
  method: "GET",
  getPath: () => "/auth/me" as const,
  payloadSchema: null,
  responseSchema: UserSchema,
});

export const AuthLogout = createEndpoint({
  method: "POST",
  getPath: () => "/auth/logout" as const,
  payloadSchema: null,
  responseSchema: EmptySchema,
});
