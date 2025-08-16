import type { z } from "zod";

export type AllowedMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type Endpoint<
  TResSchema extends z.ZodTypeAny,
  TPathArgs extends unknown[],
  TPayloadSchema extends z.ZodTypeAny | null = null,
  TQuerySchema extends z.ZodTypeAny | null = null,
> = {
  method: AllowedMethod;
  getPath: (...args: TPathArgs) => `/${string}`;
  responseSchema: TResSchema;
  payloadSchema: TPayloadSchema; // null = no body
  querySchema?: TQuerySchema; // optional = no Query-Params
};

export function createEndpoint<
  TResSchema extends z.ZodTypeAny,
  TPathArgs extends unknown[],
  TPayloadSchema extends z.ZodTypeAny | null = null,
  TQuerySchema extends z.ZodTypeAny | null = null,
>(cfg: Endpoint<TResSchema, TPathArgs, TPayloadSchema, TQuerySchema>) {
  return cfg;
}
