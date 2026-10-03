import type { PermissionCode } from "@fms/common-utils/permissions/permission-code-registry";
import { redirect } from "next/navigation";
import { getAdminMe } from "../get-admin-me";

/** 페이지 접근 권한이 없으면 권한 없음 화면으로 보낸다. */
export async function requirePagePermission(code: PermissionCode) {
  const me = await getAdminMe();
  if (!me.permissionCodes.includes(code)) {
    redirect("/forbidden");
  }
  return me;
}
