"use client";

import type { ApiSchema } from "@fms/api-schemas/types/api-schema";
import type { ApiRequest, ResBody } from "@fms/api-schemas/types/api-schema-utils";
import type { CommonError } from "@fms/error-provider/errors/common-error";
import { isCommonError } from "@fms/error-provider/errors/is-common-error";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { usePublicEnv } from "@/providers/public-env-provider";
import { useToast } from "@/providers/toast-provider";
import { readCommonErrorMessage } from "@/utils/read-common-error-message";
import { createOtherCommonError, DEFAULT_ERROR_MESSAGE } from "../_utils/create-common-error";
import { callApiActionWrapper } from "../call-api-action-wrapper";
import { fetchClientWrapper } from "../fetch-client-wrapper";

export type UseCallApiWrapperOptions = {
  /** `action` 은 서버 액션(`callApiActionWrapper`), `client` 는 브라우저에서 api 직접 호출(`fetchClientWrapper`). 기본 `action` */
  via?: "action" | "client";
  /** 성공하면 띄울 토스트 문구 */
  successMessage?: string;
  /** 성공하면 서버 컴포넌트를 다시 불러온다. 기본 `true` */
  refreshOnSuccess?: boolean;
  /** 실패하면 오류 토스트를 띄운다. 기본 `true` */
  showErrorToast?: boolean;
  /** `via: "client"` 에서 api 가 심는 쿠키(로그인 토큰)를 주고받으려면 `include` */
  credentials?: RequestCredentials;
};

/** 클라이언트 컴포넌트에서 api schema 로 api 를 호출한다. `fetchApi` 는 throw 하지 않고 `CommonError` 를 돌려준다. */
export function useCallApiWrapper<S extends ApiSchema>(schema: S, options: UseCallApiWrapperOptions = {}) {
  const { via = "action", successMessage, refreshOnSuccess = true, showErrorToast = true, credentials } = options;
  const router = useRouter();
  const showToast = useToast();
  const { apiPublicUrl } = usePublicEnv();
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<ResBody<S> | null>(null);
  const [error, setError] = useState<CommonError | null>(null);

  async function fetchApi(request: ApiRequest<S>): Promise<ResBody<S> | CommonError> {
    setIsLoading(true);
    setError(null);
    const result = await (via === "client"
      ? fetchClientWrapper(schema, request, { baseUrl: apiPublicUrl, credentials })
      : callApiActionWrapper(schema, request)
    ).catch((caught: unknown) =>
      isCommonError(caught)
        ? caught
        : createOtherCommonError({ message: caught instanceof Error ? caught.message : DEFAULT_ERROR_MESSAGE }),
    );
    setIsLoading(false);

    if (isCommonError(result)) {
      setError(result);
      if (showErrorToast) {
        showToast(readCommonErrorMessage(result), "error");
      }
      return result;
    }
    setData(result);
    if (successMessage) {
      showToast(successMessage);
    }
    if (refreshOnSuccess) {
      router.refresh();
    }
    return result;
  }

  return { fetchApi, isLoading, data, error };
}
