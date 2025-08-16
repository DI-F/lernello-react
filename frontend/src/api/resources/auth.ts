import { client } from "../restClient";
import {
  AuthLogout,
  AuthMe,
  AuthRequestCode,
  AuthVerifyCode,
} from "@/api/resources/auth.endpoints.ts";
import type { RequestCodeInput } from "@/schemas/auth/request-code.input.ts";
import type { VerifyCodeInput } from "@/schemas/auth/verify-code.input";
import type { User } from "@/schemas/user/user.ts";

export function requestCode(input: RequestCodeInput) {
  return client.call(AuthRequestCode, input).exec();
}

export function verifyCode(input: VerifyCodeInput) {
  return client.call(AuthVerifyCode, input).exec();
}

// This endpoint is used to get the current user information
export function me(): Promise<User | null> {
  return client.call(AuthMe, undefined).exec();
}

export function logout() {
  return client.call(AuthLogout, undefined).exec();
}
