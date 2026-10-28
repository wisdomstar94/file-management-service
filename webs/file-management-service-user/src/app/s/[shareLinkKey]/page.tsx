import { PUBLIC_SHARE_LINK_GATE_API } from "@fms/api-schemas/schemas/public-share-link-api-schemas";
import { ShareBlockedNotice } from "@/components/domains/share-links/share-blocked-notice";
import { ShareLinkScreen } from "@/components/domains/share-links/share-link-screen";
import { ShareNotFoundNotice } from "@/components/domains/share-links/share-not-found-notice";
import { SharePageFrame } from "@/components/domains/share-links/share-page-frame";
import { readAccessPolicyDeniedDetails } from "@/utils/read-access-policy-denied-details";
import { fetchServerWrapper } from "@/wrappers/fetch-server-wrapper";

/** 접근 정책만 서버에서 확인한다. 비밀번호 · 자료 정보는 api 의 잠금 해제 쿠키가 필요해 브라우저가 직접 받는다. */
async function readGateState(shareLinkKey: string) {
  return fetchServerWrapper(PUBLIC_SHARE_LINK_GATE_API, { params: { shareLinkKey } })
    .then((gate) => ({ kind: "PASSED" as const, isPasswordRequired: gate.data.state === "PASSWORD_REQUIRED" }))
    .catch((error: unknown) => {
      const details = readAccessPolicyDeniedDetails(error);
      return details ? { kind: "BLOCKED" as const, details } : { kind: "NOT_FOUND" as const };
    });
}

/** 다운로드에 실패하면 api 가 `downloadError` · `timestamp` 쿼리를 붙여 이 화면으로 돌려보낸다. */
const readQueryValue = (value: string | string[] | undefined) => (typeof value === "string" ? value : undefined);

export default async function SharePage(props: PageProps<"/s/[shareLinkKey]">) {
  const { shareLinkKey } = await props.params;
  const searchParams = await props.searchParams;
  const gate = await readGateState(shareLinkKey);

  return (
    <SharePageFrame>
      {gate.kind === "BLOCKED" && <ShareBlockedNotice details={gate.details} />}
      {gate.kind === "NOT_FOUND" && <ShareNotFoundNotice />}
      {gate.kind === "PASSED" && (
        <ShareLinkScreen
          shareLinkKey={shareLinkKey}
          isPasswordRequired={gate.isPasswordRequired}
          downloadError={readQueryValue(searchParams.downloadError)}
          downloadErrorTimestamp={readQueryValue(searchParams.timestamp)}
        />
      )}
    </SharePageFrame>
  );
}
