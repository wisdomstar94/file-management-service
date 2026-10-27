import type {
  CREATE_PERMISSION_GROUP_API,
  UPDATE_PERMISSION_GROUP_API,
} from "@fms/api-schemas/schemas/permission-group-api-schemas";
import type { ReqBody } from "@fms/api-schemas/types/api-schema-utils";
import { z } from "zod";

export const createPermissionGroupRequestSchema = z.object({
  name: z.string().trim().min(1, "권한 그룹명을 입력하세요.").max(100),
  permissionIds: z.array(z.uuid()).default([]),
}) satisfies z.ZodType<ReqBody<typeof CREATE_PERMISSION_GROUP_API>>;

export const updatePermissionGroupRequestSchema = createPermissionGroupRequestSchema.partial() satisfies z.ZodType<
  ReqBody<typeof UPDATE_PERMISSION_GROUP_API>
>;
