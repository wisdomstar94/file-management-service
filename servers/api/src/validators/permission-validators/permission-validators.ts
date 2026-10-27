import type { UPDATE_PERMISSION_API } from "@fms/api-schemas/schemas/permission-api-schemas";
import type { ReqBody } from "@fms/api-schemas/types/api-schema-utils";
import { z } from "zod";

export const updatePermissionRequestSchema = z
  .object({
    category: z.string().trim().min(1, "분류를 입력하세요.").max(100),
    name: z.string().trim().min(1, "권한명을 입력하세요.").max(200),
    description: z.string().max(2000),
  })
  .partial() satisfies z.ZodType<ReqBody<typeof UPDATE_PERMISSION_API>>;
