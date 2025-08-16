import { createEndpoint } from "@/api/createEndpoint.ts";
import { RequestCodeInputSchema } from "@/schemas/auth/request-code.input.ts";
import { VerifyCodeInputSchema } from "@/schemas/auth/verify-code.input";
import { UserSchema } from "@/schemas/user/user.ts";
import { NullableFromEmpty, VoidFromAnything } from "@/schemas/common/http.ts";

export const AuthRequestCode = createEndpoint({
  method: "POST",
  getPath: () => "/api/auth/request" as const,
  payloadSchema: RequestCodeInputSchema,
  responseSchema: VoidFromAnything, // 204 → undefined (typed as void)
});

export const AuthVerifyCode = createEndpoint({
  method: "POST",
  getPath: () => "/api/auth/verify" as const,
  payloadSchema: VerifyCodeInputSchema,
  responseSchema: VoidFromAnything, // 204 → undefined
});

export const AuthMe = createEndpoint({
  method: "GET",
  getPath: () => "/api/auth/me" as const,
  payloadSchema: null,
  responseSchema: NullableFromEmpty(UserSchema), // User | null
});

export const AuthLogout = createEndpoint({
  method: "POST",
  getPath: () => "/api/auth/logout" as const,
  payloadSchema: null,
  responseSchema: VoidFromAnything, // 204 → undefined
});
