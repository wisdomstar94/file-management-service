import type { ADMIN_ACCOUNT_LIST_API } from "@fms/api-schemas/schemas/admin-account-api-schemas";
import type { ReqQuery } from "@fms/api-schemas/types/api-schema-utils";
import { z } from "zod";

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  size: z.coerce.number().int().min(1).max(100).default(20),
}) satisfies z.ZodType<ReqQuery<typeof ADMIN_ACCOUNT_LIST_API>>;
