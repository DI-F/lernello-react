// tiny helpers to tame 204 and nullable 204/200 patterns
import { z } from "zod";

// Accept anything (including `{}` from a 204) and return `undefined`
export const VoidFromAnything = z.any().transform(() => undefined);

// A strict empty object – what our client passes on 204 responses
export const EmptyObject = z.object({}).strict();

// Turn 204 `{}` into `null`, while passing through the real schema on 200
export const NullableFromEmpty = <T extends z.ZodTypeAny>(schema: T) =>
  z.union([schema, EmptyObject]).transform((val) =>
    // If it's an empty object, treat as null; otherwise it's the parsed T
    typeof val === "object" &&
    val !== null &&
    Object.keys(val as object).length === 0
      ? null
      : (val as z.infer<T>),
  );
