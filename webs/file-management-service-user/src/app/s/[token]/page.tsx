import {
  PUBLIC_SHARE_LINK_DETAIL_API,
  PUBLIC_SHARE_LINK_GATE_API,
} from "@fms/api-schemas/schemas/public-share-link-api-schemas";
import { type AccessPolicyDeniedDetails, API_ERROR_CODE } from "@fms/common-utils/errors/api-error-code";
import type { ApiFailBody } from "@fms/common-utils/responses/api-response-body";
import { isCommonError } from "@fms/error-provider/errors/is-common-error";
import { formatDateTime } from "@fms/web-utils/formats/format-date-time";
import { cookies } from "next/headers";
import { ShareDocumentView } from "@/components/domains/share-links/share-document-view";
import { ShareNoticeCard } from "@/components/domains/share-links/share-notice-card";
import { SharePageFrame } from "@/components/domains/share-links/share-page-frame";
import { SharePasswordForm } from "@/components/domains/share-links/share-password-form";
import { readDownloadErrorCookieName } from "@/utils/share-link-download-error-cookie";
import { fetchServerWrapper } from "@/wrappers/fetch-server-wrapper";

/** 접근 정책 → 비밀번호 → 자료 순서로 확인한다. 앞 단계를 통과하기 전에는 자료 정보를 받지 않는다. */
async function readShareState(token: string) {
  const params = { token };
  const gate = await fetchServerWrapper(PUBLIC_SHARE_LINK_GATE_API, { params }).catch((error: unknown) => {
    if (isCommonError(error) && error.errorCode === API_ERROR_CODE.ACCESS_POLICY_DENIED) {
      const body = error.apiError?.resPayload as ApiFailBody;
      return { kind: "BLOCKED" as const, details: body.error.details as AccessPolicyDeniedDetails };
    }
    return { kind: "NOT_FOUND" as const };
  });
  if ("kind" in gate) {
    return gate;
  }

  return fetchServerWrapper(PUBLIC_SHARE_LINK_DETAIL_API, { params })
    .then((detail) => ({ kind: "OPEN" as const, detail: detail.data }))
    .catch((error: unknown) => {
      const isPasswordRequired = isCommonError(error) && error.errorCode === API_ERROR_CODE.UNAUTHORIZED;
      return isPasswordRequired && gate.data.state === "PASSWORD_REQUIRED"
        ? { kind: "PASSWORD_REQUIRED" as const }
        : { kind: "NOT_FOUND" as const };
    });
}

export default async function SharePage(props: PageProps<"/s/[token]">) {
  const { token } = await props.params;
  const downloadError = (await cookies()).get(readDownloadErrorCookieName(token))?.value;
  const state = await readShareState(token);

  return (
    <SharePageFrame>
      {state.kind === "BLOCKED" && (
        <ShareNoticeCard icon="ti-ban" tone="danger" title="접근이 차단된 링크입니다">
          <p className="m-0 text-[14px] leading-relaxed text-sub">
            이 링크에 설정된 접근 정책에 의해 현재 네트워크에서는 자료를 열 수 없습니다. 링크를 공유한 담당자에게
            문의하세요.
          </p>
          <div className="mt-1.5 font-mono text-[12px] text-faint">
            요청 IP {state.details.requestIp} · {formatDateTime(state.details.requestedAt)}
          </div>
        </ShareNoticeCard>
      )}
      {state.kind === "NOT_FOUND" && (
        <ShareNoticeCard icon="ti-link-off" tone="neutral" title="찾을 수 없는 링크입니다">
          <p className="m-0 text-[14px] leading-relaxed text-sub">링크가 삭제되었거나 주소가 올바르지 않습니다.</p>
        </ShareNoticeCard>
      )}
      {state.kind === "PASSWORD_REQUIRED" && <SharePasswordForm token={token} />}
      {state.kind === "OPEN" && <ShareDocumentView token={token} detail={state.detail} downloadError={downloadError} />}
    </SharePageFrame>
  );
}
