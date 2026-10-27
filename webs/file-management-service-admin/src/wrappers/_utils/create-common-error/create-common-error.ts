import type { ApiFailBody } from "@fms/common-utils/responses/api-response-body";
import { COMMON_ERROR_IDENTIFIER, type CommonError } from "@fms/error-provider/errors/common-error";

export const DEFAULT_ERROR_MESSAGE = "에러가 발생하였습니다. 잠시 후 다시 시도해주세요.";

/** api 에러 응답이 아닌 에러. `errorCode` 가 없으면 uuid 를 쓴다. */
export function createOtherCommonError(props: { errorCode?: string; message: string }): CommonError {
  return {
    errorIdentifier: COMMON_ERROR_IDENTIFIER,
    errorCode: props.errorCode ?? crypto.randomUUID(),
    otherError: { message: props.message },
    timestamp: Date.now(),
  };
}

/** api 의 400~500 대 응답. 응답 본문이 JSON 이면 해석한 값을, 아니면 텍스트를 그대로 담는다. */
export async function createApiCommonError(props: {
  res: Response;
  url: string;
  method: string;
}): Promise<CommonError> {
  const { res, url, method } = props;
  const text = await res.text().catch(() => "");
  let resPayload: unknown = text || undefined;
  try {
    resPayload = text ? JSON.parse(text) : undefined;
  } catch {
    // JSON 이 아니면 텍스트 그대로 둔다.
  }
  const code = (resPayload as Partial<ApiFailBody> | undefined)?.error?.code;
  return {
    errorIdentifier: COMMON_ERROR_IDENTIFIER,
    errorCode: typeof code === "string" ? code : crypto.randomUUID(),
    apiError: { url, method, resPayload },
    timestamp: Date.now(),
  };
}
