import type { PUBLIC_SHARE_LINK_UNLOCK_API } from "@fms/api-schemas/schemas/public-share-link-api-schemas";
import { type ApiSchema, typeOf } from "@fms/api-schemas/types/api-schema";
import type { ReqBody } from "@fms/api-schemas/types/api-schema-utils";
import type { ApiSuccessBody } from "@fms/common-utils/responses/api-response-body";

/** 비밀번호가 맞으면 잠금 해제 토큰을 그 링크 경로 한정 httpOnly 쿠키로 저장한다. (user-web route) */
export const SHARE_LINK_UNLOCK_ROUTE = {
  url: "/s/:token/unlock",
  method: "POST",
  request: {
    params: typeOf<{ token: string }>(),
    headers: typeOf<undefined>(),
    body: typeOf<ReqBody<typeof PUBLIC_SHARE_LINK_UNLOCK_API>>(),
    query: typeOf<undefined>(),
  },
  response: typeOf<ApiSuccessBody<{ isUnlocked: true }>>(),
  tags: ["share-link-routes"],
} as const satisfies ApiSchema;

/** 화면에 띄운 다운로드 실패 사유 쿠키를 지운다. (user-web route) */
export const SHARE_LINK_DOWNLOAD_ERROR_ROUTE = {
  url: "/s/:token/download-error",
  method: "DELETE",
  request: {
    params: typeOf<{ token: string }>(),
    headers: typeOf<undefined>(),
    body: typeOf<undefined>(),
    query: typeOf<undefined>(),
  },
  response: typeOf<null>(),
  tags: ["share-link-routes"],
} as const satisfies ApiSchema;
