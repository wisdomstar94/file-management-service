"use client";

import type { ADMIN_ME_API } from "@fms/api-schemas/schemas/admin-auth-api-schemas";
import type { ResBody } from "@fms/api-schemas/types/api-schema-utils";
import type { PermissionCode } from "@fms/common-utils/permissions/permission-code-registry";
import { createContext, type ReactNode, useContext } from "react";

const AdminSessionContext = createContext<ResBody<typeof ADMIN_ME_API>["data"] | null>(null);

export function AdminSessionProvider(props: { me: ResBody<typeof ADMIN_ME_API>["data"]; children: ReactNode }) {
  return <AdminSessionContext value={props.me}>{props.children}</AdminSessionContext>;
}

export function useAdminSession() {
  const me = useContext(AdminSessionContext);
  if (!me) {
    throw new Error("AdminSessionProvider 안에서만 쓸 수 있습니다.");
  }
  const hasPermission = (code: PermissionCode) => me.permissionCodes.includes(code);
  return { me, hasPermission };
}
