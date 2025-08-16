// The "engine" that executes endpoint descriptors with:
// - Zod validation (request + response)
// - Cookies via credentials: "include"
// - Optional timeout/abort via AbortController
// - Optional simple retries (for transient failures)
// - FormData support (no Content-Type header set)
// - Query param building (incl. arrays)
// - Spring Boot error mapping into ApiError

import { API_URL, ApiError } from "./client";
import type { Endpoint } from "./createEndpoint";
import { SpringErrorSchema } from "@/schemas/common/spring-error";
import { z } from "zod";

// FormData is a special case where we don't want to JSON-encode the body
// and instead send it as multipart/form-data for file uploads.
function isFormData(x: unknown): x is FormData {
  return typeof FormData !== "undefined" && x instanceof FormData;
}

// Helper function to convert an object to a query string
// (e.g. { a: 1, b: "test" } => "?a=1&b=test")
function toQueryString(obj: Record<string, unknown>) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    p.append(k, String(v));
  }
  const s = p.toString();
  return s ? `?${s}` : "";
}

// Build a full URL from a path and optional query parameters
function buildUrl(path: string, query?: Record<string, unknown>) {
  const base = new URL(path, API_URL).toString();
  return query ? base + toQueryString(query) : base;
}

// Options to configure a client instance once (Factory pattern)
export type ClientOptions = {
  fetchFn?: typeof fetch;
  withCredentials?: boolean; // default: true
  extraHeaders?: Record<string, string>;
  timeoutMs?: number; // default: 0 (aus)
  retries?: number; // default: 0
};

/**
 * Factory: create a configured client with closure over options.
 * You call `createClient(...)` once and get a reusable `{ call }`.
 */
export function createClient(opts: ClientOptions = {}) {
  const fetchFn = opts.fetchFn ?? fetch;
  const withCreds = opts.withCredentials ?? true;
  const timeoutMs = opts.timeoutMs ?? 0;
  const retries = Math.max(0, opts.retries ?? 0);

  // Perform fetch with optional AbortController-based timeout
  async function doFetch(input: RequestInfo | URL, init: RequestInit) {
    const controller = timeoutMs ? new AbortController() : undefined;
    const timer = timeoutMs
      ? setTimeout(() => controller!.abort(), timeoutMs)
      : undefined;

    try {
      return await fetchFn(input, { ...init, signal: controller?.signal });
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  /**
   * The single internal "call" that does the actual work.
   *
   * Generics mirror `Endpoint`:
   * - TResSchema: response Zod schema → return type is z.infer<TResSchema>
   * - TPathArgs:  tuple for building the path (...args)
   * - TPayloadSchema: request body schema (or null)
   * - TQuerySchema:   query schema (or null)
   */
  async function call<
    TResSchema extends z.ZodTypeAny,
    TPathArgs extends unknown[],
    TPayloadSchema extends z.ZodTypeAny | null,
    TQuerySchema extends z.ZodTypeAny | null,
  >(
    ep: Endpoint<TResSchema, TPathArgs, TPayloadSchema, TQuerySchema>,
    payload: TPayloadSchema extends z.ZodTypeAny
      ? z.infer<TPayloadSchema>
      : undefined,
    pathArgs: TPathArgs,
    query?: TQuerySchema extends z.ZodTypeAny
      ? z.infer<TQuerySchema>
      : undefined,
  ): Promise<z.infer<TResSchema>> {
    // 1) Validate payload & query with Zod (runtime safety)
    const parsedBody = ep.payloadSchema
      ? ep.payloadSchema.parse(payload)
      : undefined;
    const parsedQuery = ep.querySchema
      ? ep.querySchema.parse(query)
      : undefined;

    // 2) Build URL & headers. FormData → let browser set Content-Type.
    const url = buildUrl(
      ep.getPath(...pathArgs),
      parsedQuery as Record<string, unknown>,
    );
    const headers: Record<string, string> = isFormData(parsedBody)
      ? { ...(opts.extraHeaders ?? {}) } // leave Content-Type unset for multipart
      : { "Content-Type": "application/json", ...(opts.extraHeaders ?? {}) };

    const init: RequestInit = {
      method: ep.method,
      credentials: withCreds ? "include" : "same-origin", // include cookies when talking to your API
      headers,
      body: parsedBody
        ? isFormData(parsedBody)
          ? parsedBody
          : JSON.stringify(parsedBody)
        : undefined,
    };

    // 3) Fetch with simple retry/backoff on transient failures.
    //    - AbortError (timeout) or 5xx → retry (if retries > 0)
    let lastErr: unknown;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const res = await doFetch(url, init);
        const text = await res.text().catch(() => "");

        if (!res.ok) {
          // Try to parse JSON error (e.g., Spring Boot format)
          let parsed: unknown;
          try {
            parsed = text ? JSON.parse(text) : undefined;
          } catch {
            /* empty */
          }
          const spring = SpringErrorSchema.safeParse(parsed);
          const msg = spring.success
            ? spring.data.message || `HTTP ${res.status}`
            : ((parsed as { message?: string })?.message ??
              (text || `HTTP ${res.status}`));
          throw new ApiError(msg, res.status, parsed);
        }

        // 4) Parse JSON and validate the response with Zod
        const json = text ? JSON.parse(text) : {};
        return ep.responseSchema.parse(json);
      } catch (e: any) {
        lastErr = e;
        lastErr = e;
        const transient =
          e?.name === "AbortError" ||
          (e instanceof ApiError && e.status >= 500);
        if (attempt < retries && transient) {
          await new Promise((r) => setTimeout(r, 300 * (attempt + 1))); // simple backoff
          continue;
        }
        throw e;
      }
    }
    throw lastErr;
  }

  /**
   * Public API:
   *   client.call(endpoint, payload, ...pathArgs)
   *     .exec()               // without query params
   *     .withQuery(queryObj)  // with validated & serialized query params
   *
   * Why return an object with `.exec()` and `.withQuery()`?
   * - Convenience: same entry-point for endpoints with/without query.
   * - You pass endpoint + payload + path args once, then choose to add query or not.
   */
  return {
    call: <
      TResSchema extends z.ZodTypeAny,
      TPathArgs extends unknown[],
      TPayloadSchema extends z.ZodTypeAny | null,
      TQuerySchema extends z.ZodTypeAny | null,
    >(
      ep: Endpoint<TResSchema, TPathArgs, TPayloadSchema, TQuerySchema>,
      payload: TPayloadSchema extends z.ZodTypeAny
        ? z.infer<TPayloadSchema>
        : undefined,
      ...pathArgs: TPathArgs
    ) => ({
      exec: () => call(ep, payload, pathArgs),
      withQuery: (
        query: TQuerySchema extends z.ZodTypeAny
          ? z.infer<TQuerySchema>
          : undefined,
      ) => call(ep, payload, pathArgs, query),
    }),
  };
}

// Standard-Client: 15s Timeout, no Retries
export const client = createClient({ timeoutMs: 15000, retries: 0 });
