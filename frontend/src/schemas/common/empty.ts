import { z } from "zod";

export const EmptySchema = z
  .union([z.object({}).strict(), z.undefined(), z.null()])
  .optional();
