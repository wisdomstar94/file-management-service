import type { AdminShortTimeTokenTarget } from "@fms/jwt-handler/tokens/admin-short-time-token";
import type { Request } from "express";

/** short-time token 은 발급받을 때 지정한 동작 · 대상 요청에만 쓸 수 있다. */
export function isShortTimeTokenTargetRequest(req: Request, target: AdminShortTimeTokenTarget): boolean {
  const path = req.originalUrl.split("?")[0].replace(/\/+$/, "");
  switch (target.purpose) {
    case "UPLOAD_DOCUMENT":
      return req.method === "POST" && path === "/api/admin/documents";
    case "UPLOAD_DOCUMENT_VERSION":
      return req.method === "POST" && path === `/api/admin/documents/${target.documentId}/versions`;
    case "DOWNLOAD_DOCUMENT_VERSION":
      return (
        req.method === "GET" &&
        path === `/api/admin/documents/${target.documentId}/versions/${target.versionId}/download`
      );
  }
}
