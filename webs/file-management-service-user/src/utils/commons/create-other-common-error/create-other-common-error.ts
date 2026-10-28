import { COMMON_ERROR_IDENTIFIER, type CommonError } from "@fms/error-provider/errors/common-error";

/** api 에러 응답이 아닌 에러. `errorCode` 가 없으면 uuid 를 쓴다. */
export function createOtherCommonError(props: { errorCode?: string; message: string }): CommonError {
  return {
    errorIdentifier: COMMON_ERROR_IDENTIFIER,
    errorCode: props.errorCode ?? crypto.randomUUID(),
    otherError: { message: props.message },
    timestamp: Date.now(),
  };
}
