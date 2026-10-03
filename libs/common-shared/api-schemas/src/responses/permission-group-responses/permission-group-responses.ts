import type { PermissionResponse } from "../permission-responses/index.js";

export type PermissionGroupSummaryResponse = {
  id: string;
  name: string;
  permissionCount: number;
  createdAt: string;
  updatedAt: string;
};

export type PermissionGroupDetailResponse = PermissionGroupSummaryResponse & {
  permissions: PermissionResponse[];
};
