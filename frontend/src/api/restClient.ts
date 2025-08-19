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
    if (Array.isArray(v)) {
      for (const item of v) p.append(k, String(item));
    } else {
      p.append(k, String(v));
    }
  }
  const s = p.toString();
  return s ? `?${s}` : "";
}

function buildUrl(path: string, query?: Record<string, unknown>) {
  const base = new URL(path, API_URL).toString();
  return query ? base + toQueryString(query) : base;
}

export type ClientOptions = {
  fetchFn?: typeof fetch;
  withCredentials?: boolean; // default: true
  extraHeaders?: Record<string, string>;
  timeoutMs?: number; // default: 0 (aus)
  retries?: number; // default: 0
};

export function createClient(opts: ClientOptions = {}) {
  const fetchFn = opts.fetchFn ?? fetch;
  const withCreds = opts.withCredentials ?? true;
  const timeoutMs = opts.timeoutMs ?? 0;
  const retries = Math.max(0, opts.retries ?? 0);

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
    // 1) Zod-Validation
    const parsedBody = ep.payloadSchema
      ? ep.payloadSchema.parse(payload)
      : undefined;
    const parsedQuery = ep.querySchema
      ? ep.querySchema.parse(query)
      : undefined;

    // 2) URL/Headers
    const url = buildUrl(
      ep.getPath(...pathArgs),
      parsedQuery as Record<string, unknown>,
    );
    const headers: Record<string, string> = isFormData(parsedBody)
      ? { ...(opts.extraHeaders ?? {}) }
      : { "Content-Type": "application/json", ...(opts.extraHeaders ?? {}) };

    const init: RequestInit = {
      method: ep.method,
      credentials: withCreds ? "include" : "same-origin",
      headers,
      body: parsedBody
        ? isFormData(parsedBody)
          ? parsedBody
          : JSON.stringify(parsedBody)
        : undefined,
    };

    let lastErr: unknown;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const res = await doFetch(url, init);
        const text = await res.text().catch(() => "");
        if (!res.ok) {
          // Auto-Refresh on 401 (once), except if we are already calling /auth/refresh
          const isRefreshCall = url.includes("/api/auth/refresh");
          if (res.status === 401 && withCreds && !isRefreshCall) {
            try {
              const rf = await doFetch(
                new URL("/api/auth/refresh", API_URL).toString(),
                {
                  method: "POST",
                  credentials: "include",
                },
              );
              if (rf.ok) {
                const res2 = await doFetch(url, init);
                const text2 = await res2.text().catch(() => "");
                if (!res2.ok) {
                  throw new ApiError(
                    text2 || `HTTP ${res2.status}`,
                    res2.status,
                    text2 ? JSON.parse(text2) : undefined,
                  );
                }
                const json2 = text2 ? JSON.parse(text2) : {};
                return ep.responseSchema.parse(json2);
              }
            } catch {
              // Ignore errors during refresh attempt
              /* noop */
            }
          }

          let parsed: unknown;
          try {
            parsed = text ? JSON.parse(text) : undefined;
          } catch {
            /* noop */
          }
          const spring = SpringErrorSchema.safeParse(parsed);
          const msg = spring.success
            ? spring.data.message || `HTTP ${res.status}`
            : ((parsed as { message?: string })?.message ??
              (text || `HTTP ${res.status}`));
          throw new ApiError(msg, res.status, parsed);
        }

        const json = text ? JSON.parse(text) : {};
        return ep.responseSchema.parse(json);
      } catch (e: any) {
        lastErr = e;
        const transient =
          e?.name === "AbortError" ||
          (e instanceof ApiError && e.status >= 500);
        if (attempt < retries && transient) {
          await new Promise((r) => setTimeout(r, 300 * (attempt + 1)));
          continue;
        }
        throw e;
      }
    }

    throw lastErr;
  }

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

// Standard-Client: 15s Timeout, no retries
export const client = createClient({ timeoutMs: 15000, retries: 0 });
