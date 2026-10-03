"use client";

import type { AdminMeResponse } from "@fms/api-schemas/responses/admin-auth-responses";
import type { PermissionCode } from "@fms/common-utils/permissions/permission-code-registry";
import { createContext, type ReactNode, useContext } from "react";

const AdminSessionContext = createContext<AdminMeResponse | null>(null);

export function AdminSessionProvider(props: { me: AdminMeResponse; children: ReactNode }) {
  return <AdminSessionContext.Provider value={props.me}>{props.children}</AdminSessionContext.Provider>;
}

export function useAdminSession() {
  const me = useContext(AdminSessionContext);
  if (!me) {
    throw new Error("AdminSessionProvider 안에서만 쓸 수 있습니다.");
  }
  const hasPermission = (code: PermissionCode) => me.permissionCodes.includes(code);
  return { me, hasPermission };
}
