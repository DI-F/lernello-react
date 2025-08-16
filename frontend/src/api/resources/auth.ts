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

export function requestCode(input: RequestCodeInput): Promise<void> {
  return client.call(AuthRequestCode, input).exec();
}

// This function sets the cookie with the user session after verifying the code.
export function verifyCode(input: VerifyCodeInput): Promise<void> {
  return client.call(AuthVerifyCode, input).exec();
}

// This function retrieves the current authenticated user if cookies are set.
export function me(): Promise<User | null> {
  return client.call(AuthMe, undefined).exec();
}

export function logout(): Promise<void> {
  return client.call(AuthLogout, undefined).exec();
}
