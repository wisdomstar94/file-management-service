"use client";

import {
  PUBLIC_SHARE_LINK_DETAIL_API,
  PUBLIC_SHARE_LINK_DOWNLOAD_API,
} from "@fms/api-schemas/schemas/public-share-link-api-schemas";
import type { ResBody } from "@fms/api-schemas/types/api-schema-utils";
import type { AccessPolicyDeniedDetails } from "@fms/common-utils/errors/api-error-code";
import { API_ERROR_CODE } from "@fms/common-utils/errors/api-error-code";
import type { CommonError } from "@fms/error-provider/errors/common-error";
import { isCommonError } from "@fms/error-provider/errors/is-common-error";
import { useEffect, useState } from "react";
import { usePublicEnv } from "@/providers/public-env-provider";
import { readAccessPolicyDeniedDetails } from "@/utils/read-access-policy-denied-details";
import { buildClientApiUrl } from "@/wrappers/fetch-client-wrapper";
import { useCallApiWrapper } from "@/wrappers/use-call-api-wrapper";
import { ShareBlockedNotice } from "../share-blocked-notice";
import { ShareDocumentView } from "../share-document-view";
import { ShareNotFoundNotice } from "../share-not-found-notice";
import { SharePasswordForm } from "../share-password-form";

/** 다운로드 실패 문구를 띄우는 시간(ms). 이 시간이 지난 뒤 새로고침하면 문구가 보이지 않는다. */
const DOWNLOAD_ERROR_VISIBLE_MS = 5000;

type ShareDetailState =
  | { kind: "LOADING" }
  | { kind: "OPEN"; detail: ResBody<typeof PUBLIC_SHARE_LINK_DETAIL_API>["data"] }
  | { kind: "PASSWORD_REQUIRED" }
  | { kind: "BLOCKED"; details: AccessPolicyDeniedDetails }
  | { kind: "NOT_FOUND" };

function toShareDetailState(
  result: ResBody<typeof PUBLIC_SHARE_LINK_DETAIL_API> | CommonError,
  isPasswordRequired: boolean,
): ShareDetailState {
  if (!isCommonError(result)) {
    return { kind: "OPEN", detail: result.data };
  }
  if (isPasswordRequired && result.errorCode === API_ERROR_CODE.UNAUTHORIZED) {
    return { kind: "PASSWORD_REQUIRED" };
  }
  const details = readAccessPolicyDeniedDetails(result);
  return details ? { kind: "BLOCKED", details } : { kind: "NOT_FOUND" };
}

/**
 * 비밀번호 → 자료 순서로 확인한다. 잠금 해제 토큰은 api 의 httpOnly 쿠키에 있어 브라우저가 api 를 직접 호출한다.
 * 다운로드 실패 사유는 api 가 붙인 `timestamp` 로부터 5초 안일 때만 보여준다.
 */
export function ShareLinkScreen(props: {
  shareLinkKey: string;
  isPasswordRequired: boolean;
  downloadError?: string;
  downloadErrorTimestamp?: string;
}) {
  const { shareLinkKey, isPasswordRequired } = props;
  const { apiPublicUrl } = usePublicEnv();
  const detailApi = useCallApiWrapper(PUBLIC_SHARE_LINK_DETAIL_API, { via: "client", refreshOnSuccess: false });
  const [state, setState] = useState<ShareDetailState>({ kind: "LOADING" });
  const [downloadError, setDownloadError] = useState<string>();

  async function loadDetail() {
    setState(toShareDetailState(await detailApi.fetchApi({ params: { shareLinkKey } }), isPasswordRequired));
  }

  // 서버 렌더링과 시각이 달라 화면이 어긋나지 않도록 브라우저에서 한 번만 판단한다.
  // biome-ignore lint/correctness/useExhaustiveDependencies: 링크마다 한 번만 불러온다.
  useEffect(() => {
    const elapsedMs = Date.now() - Number(props.downloadErrorTimestamp);
    if (props.downloadError && elapsedMs >= 0 && elapsedMs <= DOWNLOAD_ERROR_VISIBLE_MS) {
      setDownloadError(props.downloadError);
    }
    loadDetail();
  }, [shareLinkKey]);

  if (state.kind === "LOADING") {
    return null;
  }
  if (state.kind === "PASSWORD_REQUIRED") {
    return <SharePasswordForm shareLinkKey={shareLinkKey} onUnlocked={loadDetail} />;
  }
  if (state.kind === "BLOCKED") {
    return <ShareBlockedNotice details={state.details} />;
  }
  if (state.kind === "NOT_FOUND") {
    return <ShareNotFoundNotice />;
  }
  return (
    <ShareDocumentView
      detail={state.detail}
      downloadError={downloadError}
      downloadHref={(versionId) =>
        buildClientApiUrl(
          PUBLIC_SHARE_LINK_DOWNLOAD_API,
          { params: { shareLinkKey, versionId } },
          { baseUrl: apiPublicUrl },
        )
      }
      onDownload={loadDetail}
    />
  );
}
