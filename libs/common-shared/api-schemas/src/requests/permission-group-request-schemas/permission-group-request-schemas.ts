import { z } from "zod";

export const createPermissionGroupRequestSchema = z.object({
  name: z.string().trim().min(1, "권한 그룹명을 입력하세요.").max(100),
  permissionIds: z.array(z.uuid()).default([]),
});

export const updatePermissionGroupRequestSchema = createPermissionGroupRequestSchema.partial();

export type CreatePermissionGroupRequest = z.infer<typeof createPermissionGroupRequestSchema>;
export type UpdatePermissionGroupRequest = z.infer<typeof updatePermissionGroupRequestSchema>;
