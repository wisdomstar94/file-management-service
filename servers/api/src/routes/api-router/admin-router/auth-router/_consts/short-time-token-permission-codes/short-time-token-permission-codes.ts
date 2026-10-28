import type { PERMISSION_CODE_REGISTRY } from "@fms/consts/permissions/permission-code-registry";
import type { AdminShortTimeTokenTarget } from "@fms/jwt-handler/types/admin-short-time-token-target";

/** short-time token 으로 할 동작에 필요한 권한. 실제 업로드 · 다운로드 요청에서도 다시 확인한다. */
export const SHORT_TIME_TOKEN_PERMISSION_CODES: Record<
  AdminShortTimeTokenTarget["purpose"],
  keyof typeof PERMISSION_CODE_REGISTRY
> = {
  UPLOAD_DOCUMENT: "file.list.create",
  UPLOAD_DOCUMENT_VERSION: "file.detail.version.create",
  DOWNLOAD_DOCUMENT_VERSION: "file.detail.access",
};
