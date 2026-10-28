import type { ApiSchema } from "@fms/api-schemas/types/api-schema";
import type { ApiRequest, ResBody } from "@fms/api-schemas/types/api-schema-utils";
import { buildApiUrl } from "../_utils/build-api-url";
import { createApiCommonError } from "../_utils/create-common-error";
import { toRequestBody } from "../_utils/to-request-body";

export type FetchClientWrapperOptions = {
  /** schema url 앞에 붙일 주소. api 를 직접 호출하면 `API_PUBLIC_URL`. 기본은 웹 자체 route 용 빈 문자열 */
  baseUrl?: string;
  /** api 가 심은 httpOnly 쿠키(공개 링크 잠금 해제)를 주고받으려면 `include` */
  credentials?: RequestCredentials;
};

/** 브라우저에서 바로 열 url (다운로드 링크 등) */
export function buildClientApiUrl<S extends ApiSchema>(
  schema: S,
  request: ApiRequest<S>,
  options: FetchClientWrapperOptions = {},
): string {
  const { params, query } = request as Partial<ApiSchema["request"]>;
  return `${options.baseUrl ?? ""}${buildApiUrl({ url: schema.url, params, query })}`;
}

/** 브라우저에서 api 를 직접 호출한다. 400~500 대 응답은 `CommonError` 로 throw 한다. */
export async function fetchClientWrapper<S extends ApiSchema>(
  schema: S,
  request: ApiRequest<S>,
  options: FetchClientWrapperOptions = {},
): Promise<ResBody<S>> {
  const { params, query, headers: requestHeaders, body } = request as Partial<ApiSchema["request"]>;
  const url = `${options.baseUrl ?? ""}${buildApiUrl({ url: schema.url, params, query })}`;
  const headers = new Headers(requestHeaders as Record<string, string> | undefined);

  const res = await fetch(url, {
    method: schema.method,
    headers,
    body: toRequestBody(body, headers),
    credentials: options.credentials,
  });
  if (res.ok) {
    if (schema.responseType === "stream") {
      return res as ResBody<S>;
    }
    return (res.status === 204 ? null : await res.json()) as ResBody<S>;
  }
  throw await createApiCommonError({ res, url, method: schema.method });
}
