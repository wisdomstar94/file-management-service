import type { DocumentVersionSummary } from "../document-responses/index.js";

/** `SCHEDULED` 시작 전 · `EXPIRED` 기간 종료 · `EXHAUSTED` 허용 수 소진 */
export type ShareLinkAvailability = "ACTIVE" | "SCHEDULED" | "EXPIRED" | "EXHAUSTED";

export type ShareLinkResponse = {
  id: string;
  token: string;
  accessPolicyGroup: { id: string; name: string } | null;
  hasPassword: boolean;
  downloadCount: number;
  maxDownloadCount: number | null;
  availableFrom: string | null;
  availableUntil: string | null;
  defaultVersionMode: "FOLLOW_DOCUMENT" | "FIXED";
  fixedVersion: DocumentVersionSummary | null;
  /** 이 링크에서 실제로 기본으로 보여질 버전 */
  effectiveDefaultVersion: DocumentVersionSummary;
  isShowOtherVersions: boolean;
  isAllowOtherVersionDownload: boolean;
  isShowDownloadStatus: boolean;
  availability: ShareLinkAvailability;
  createdAt: string;
  updatedAt: string;
};

export type PublicShareLinkGateResponse = { state: "PASSWORD_REQUIRED" | "OPEN" };

export type PublicShareLinkUnlockResponse = { unlockToken: string; expiresAt: string };

export type PublicShareLinkVersion = { id: string; versionName: string; fileName: string; fileSize: number };

export type PublicShareLinkDetailResponse = {
  documentName: string;
  defaultVersion: PublicShareLinkVersion;
  /** 「기본 버전 외 다른 버전 표시」 가 꺼져 있으면 `null` */
  otherVersions: PublicShareLinkVersion[] | null;
  isAllowOtherVersionDownload: boolean;
  /** 「다운로드 현황 표시」 가 꺼져 있으면 `null` */
  downloadStatus: { downloadCount: number; maxDownloadCount: number | null } | null;
  availableFrom: string | null;
  availableUntil: string | null;
  availability: ShareLinkAvailability;
};
