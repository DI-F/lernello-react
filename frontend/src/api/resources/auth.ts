import { client } from "../restClient";
import {
  AuthLogout,
  AuthMe,
  AuthRefresh,
  AuthRequestCode,
  AuthVerifyCode,
} from "@/api/resources/auth.endpoints.ts";
import type { RequestCodeInput } from "@/schemas/auth/request-code.input.ts";
import type { VerifyCodeInput } from "@/schemas/auth/verify-code.input";
import type { User } from "@/schemas/user/user.ts";

export function requestCode(input: RequestCodeInput) {
  return client.call(AuthRequestCode, input).exec();
}

export function verifyCode(input: VerifyCodeInput, remember?: boolean) {
  return remember === undefined
    ? client.call(AuthVerifyCode, input).exec()
    : client.call(AuthVerifyCode, input).withQuery({ remember });
}

export function refresh() {
  return client.call(AuthRefresh, undefined).exec();
}

export function me(): Promise<User | null> {
  return client.call(AuthMe, undefined).exec();
}

export function logout() {
  return client.call(AuthLogout, undefined).exec();
}
