import { randomUUID } from "node:crypto";
import { type APIRequestContext, expect } from "@playwright/test";

const API_BASE_URL = process.env.API_BASE_URL ?? `http://127.0.0.1:${process.env.API_PORT ?? 4000}`;

const DEFAULT_LINK = {
  accessPolicyGroupId: null,
  password: null,
  maxDownloadCount: null,
  availableFrom: null,
  availableUntil: null,
  defaultVersionMode: "FOLLOW_DOCUMENT",
  fixedVersionId: null,
  isShowOtherVersions: false,
  isAllowOtherVersionDownload: false,
  isShowDownloadStatus: true,
};

async function loginAsInitialAdmin(request: APIRequestContext) {
  const res = await request.post(`${API_BASE_URL}/api/admin/auth/login`, {
    data: {
      loginId: process.env.INITIAL_ADMIN_ID ?? "admin",
      password: process.env.INITIAL_ADMIN_PASSWORD ?? "admin1234!",
    },
  });
  expect(res.status()).toBe(200);
  // 로그인 응답은 토큰을 본문 대신 쿠키로 내려준다.
  const accessTokenCookie = res
    .headersArray()
    .find((header) => header.name.toLowerCase() === "set-cookie" && header.value.startsWith("fms_admin_at="));
  const accessToken = decodeURIComponent(accessTokenCookie?.value.slice("fms_admin_at=".length).split(";")[0] ?? "");
  return { Authorization: `Bearer ${accessToken}` };
}

/**
 * api 로 「v1 · v2 두 버전을 가진 자료 + 공개 링크」 를 만든다.
 * `accessPolicyCidrs` 를 주면 그 IP 만 허용하는 접근 정책을 링크에 건다.
 */
export async function createSharedDocument(
  request: APIRequestContext,
  props: { link?: Partial<typeof DEFAULT_LINK> & { password?: string | null }; accessPolicyCidrs?: string[] } = {},
) {
  const headers = await loginAsInitialAdmin(request);
  const name = `공유 자료 ${randomUUID().slice(0, 8)}`;
  const created = await request.post(`${API_BASE_URL}/api/admin/documents`, {
    headers,
    multipart: {
      name,
      versionName: "v1",
      file: { name: "안내서 v1.txt", mimeType: "text/plain", buffer: Buffer.from("version-1") },
    },
  });
  expect(created.status()).toBe(201);
  const documentId = (await created.json()).data.id as string;
  const withV2 = await request.post(`${API_BASE_URL}/api/admin/documents/${documentId}/versions`, {
    headers,
    multipart: {
      versionName: "v2",
      file: { name: "안내서 v2.txt", mimeType: "text/plain", buffer: Buffer.from("version-2") },
    },
  });
  expect(withV2.status()).toBe(201);

  let accessPolicyGroupId: string | null = null;
  if (props.accessPolicyCidrs) {
    const policy = await request.post(`${API_BASE_URL}/api/admin/access-policy-groups`, {
      headers,
      data: {
        name: `링크 정책 ${randomUUID().slice(0, 8)}`,
        ruleTree: { type: "IP", mode: "DENY_ALL_EXCEPT", cidrs: props.accessPolicyCidrs },
      },
    });
    accessPolicyGroupId = (await policy.json()).data.id;
  }

  const link = await request.post(`${API_BASE_URL}/api/admin/documents/${documentId}/share-links`, {
    headers,
    data: { ...DEFAULT_LINK, accessPolicyGroupId, ...props.link },
  });
  expect(link.status()).toBe(201);
  return { name, token: (await link.json()).data.token as string };
}
