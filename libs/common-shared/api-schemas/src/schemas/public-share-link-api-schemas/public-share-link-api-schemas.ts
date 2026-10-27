import type { ApiSuccessBody } from "@fms/common-utils/responses/api-response-body";
import { type ApiSchema, typeOf } from "../../types/api-schema/index.js";
import type { ResBody } from "../../types/api-schema-utils/index.js";
import type { SHARE_LINK_LIST_API } from "../share-link-api-schemas/index.js";

type PublicShareLinkVersion = { id: string; versionName: string; fileName: string; fileSize: number };

export const PUBLIC_SHARE_LINK_GATE_API = {
  url: "/api/public/share-links/:token",
  method: "GET",
  request: {
    params: typeOf<{ token: string }>(),
    headers: typeOf<undefined>(),
    body: typeOf<undefined>(),
    query: typeOf<undefined>(),
  },
  response: typeOf<ApiSuccessBody<{ state: "PASSWORD_REQUIRED" | "OPEN" }>>(),
  tags: ["public-share-links"],
} as const satisfies ApiSchema;

export const PUBLIC_SHARE_LINK_UNLOCK_API = {
  url: "/api/public/share-links/:token/unlock",
  method: "POST",
  request: {
    params: typeOf<{ token: string }>(),
    headers: typeOf<undefined>(),
    body: typeOf<{ password: string }>(),
    query: typeOf<undefined>(),
  },
  response: typeOf<ApiSuccessBody<{ unlockToken: string; expiresAt: string }>>(),
  tags: ["public-share-links"],
} as const satisfies ApiSchema;

export const PUBLIC_SHARE_LINK_DETAIL_API = {
  url: "/api/public/share-links/:token/detail",
  method: "GET",
  request: {
    params: typeOf<{ token: string }>(),
    headers: typeOf<undefined>(),
    body: typeOf<undefined>(),
    query: typeOf<undefined>(),
  },
  response:
    typeOf<
      ApiSuccessBody<{
        documentName: string;
        defaultVersion: PublicShareLinkVersion;
        /** 「기본 버전 외 다른 버전 표시」 가 꺼져 있으면 `null` */
        otherVersions: PublicShareLinkVersion[] | null;
        isAllowOtherVersionDownload: boolean;
        /** 「다운로드 현황 표시」 가 꺼져 있으면 `null` */
        downloadStatus: { downloadCount: number; maxDownloadCount: number | null } | null;
        availableFrom: string | null;
        availableUntil: string | null;
        availability: ResBody<typeof SHARE_LINK_LIST_API>["data"][number]["availability"];
      }>
    >(),
  tags: ["public-share-links"],
} as const satisfies ApiSchema;

export const PUBLIC_SHARE_LINK_DOWNLOAD_API = {
  url: "/api/public/share-links/:token/versions/:versionId/download",
  method: "GET",
  request: {
    params: typeOf<{ token: string; versionId: string }>(),
    headers: typeOf<undefined>(),
    body: typeOf<undefined>(),
    query: typeOf<undefined>(),
  },
  response: typeOf<Response>(),
  responseType: "stream",
  tags: ["public-share-links"],
} as const satisfies ApiSchema;
