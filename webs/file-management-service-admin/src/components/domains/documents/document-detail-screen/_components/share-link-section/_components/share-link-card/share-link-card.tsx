"use client";

import type { SHARE_LINK_LIST_API } from "@fms/api-schemas/schemas/share-link-api-schemas";
import type { ResBody } from "@fms/api-schemas/types/api-schema-utils";
import { Button } from "@fms/web-ui/components/button";
import { ProgressBar } from "@fms/web-ui/components/progress-bar";
import { formatDate } from "@fms/web-utils/formats/format-date-time";
import { useToast } from "@/providers/toast-provider";

const AVAILABILITY_LABELS: Record<
  ResBody<typeof SHARE_LINK_LIST_API>["data"][number]["availability"],
  { label: string; className: string }
> = {
  ACTIVE: { label: "활성", className: "bg-success-soft text-success" },
  SCHEDULED: { label: "시작 전", className: "bg-warn-soft text-warn" },
  EXPIRED: { label: "만료", className: "bg-chip text-muted" },
  EXHAUSTED: { label: "소진", className: "bg-chip text-muted" },
};

function readPeriod(link: ResBody<typeof SHARE_LINK_LIST_API>["data"][number]) {
  if (!link.availableFrom && !link.availableUntil) {
    return "제한 없음";
  }
  return `${link.availableFrom ? formatDate(link.availableFrom) : "제한 없음"} ~ ${link.availableUntil ? formatDate(link.availableUntil) : "제한 없음"}`;
}

function readOthers(link: ResBody<typeof SHARE_LINK_LIST_API>["data"][number]) {
  if (!link.isShowOtherVersions) {
    return "숨김";
  }
  return link.isAllowOtherVersionDownload ? "표시 · 다운로드 허용" : "표시 · 다운로드 불가";
}

export function ShareLinkCard(props: {
  link: ResBody<typeof SHARE_LINK_LIST_API>["data"][number];
  url: string;
  canUpdate: boolean;
  canDelete: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { link, url, canUpdate, canDelete, onEdit, onDelete } = props;
  const showToast = useToast();
  const availability = AVAILABILITY_LABELS[link.availability];
  const defaultVersionLabel =
    link.defaultVersionMode === "FIXED"
      ? `별도 지정 · ${link.effectiveDefaultVersion.versionName}`
      : `자료 설정 따름 (${link.effectiveDefaultVersion.versionName})`;
  const items: [string, string][] = [
    ["접근 정책 그룹", link.accessPolicyGroup?.name ?? "제한 없음"],
    ["다운로드 가능 기간", readPeriod(link)],
    ["기본 버전", defaultVersionLabel],
    ["다른 버전 표시 · 다운로드", readOthers(link)],
    ["다운로드 현황 표시", link.isShowDownloadStatus ? "표시" : "숨김"],
  ];

  async function copyUrl() {
    await navigator.clipboard.writeText(url);
    showToast("클립보드에 복사했습니다");
  }

  return (
    <div className="flex flex-col gap-3.5 border-b border-line-soft px-[22px] py-[18px] last:border-b-0">
      <div className="flex flex-wrap items-center gap-2.5">
        <span className={`rounded-full px-2 py-[3px] text-[11.5px] font-semibold ${availability.className}`}>
          {availability.label}
        </span>
        <span className="font-mono text-[13px] text-ink">{url}</span>
        <button type="button" aria-label="링크 복사" onClick={copyUrl} className="cursor-pointer text-faint">
          <i className="ti ti-copy text-[15px]" aria-hidden />
        </button>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-[3px] text-[12.5px] text-primary"
        >
          미리보기
          <i className="ti ti-external-link text-[13px]" aria-hidden />
        </a>
        <div className="flex-1" />
        <Button
          size="sm"
          disabled={!canUpdate}
          title={canUpdate ? undefined : "외부 공개 링크 수정 권한이 없습니다"}
          onClick={onEdit}
        >
          수정
        </Button>
        <Button
          size="sm"
          variant="danger"
          disabled={!canDelete}
          title={canDelete ? undefined : "외부 공개 링크 삭제 권한이 없습니다"}
          onClick={onDelete}
        >
          삭제
        </Button>
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(190px,1fr))] gap-x-6 gap-y-3.5">
        <div className="flex flex-col gap-1.5">
          <span className="text-[12px] text-faint">다운로드 수 / 허용 수</span>
          <span className="text-[13.5px] font-semibold">
            {link.downloadCount} <span className="font-normal text-faint">/ {link.maxDownloadCount ?? "무제한"}</span>
          </span>
          <ProgressBar value={link.downloadCount} max={link.maxDownloadCount} />
        </div>
        {items.map(([label, value]) => (
          <div key={label} className="flex flex-col gap-1">
            <span className="text-[12px] text-faint">{label}</span>
            <span className="text-[13.5px]">{value}</span>
          </div>
        ))}
        <div className="flex flex-col gap-1">
          <span className="text-[12px] text-faint">비밀번호</span>
          <span className="flex items-center gap-[5px] text-[13.5px]">
            <i className={`ti ${link.hasPassword ? "ti-lock" : "ti-lock-open"} text-[15px] text-muted`} aria-hidden />
            {link.hasPassword ? "설정됨" : "없음"}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[12px] text-faint">생성일 · 수정일</span>
          <span className="text-[13px] text-sub">
            {formatDate(link.createdAt)} · {formatDate(link.updatedAt)}
          </span>
        </div>
      </div>
    </div>
  );
}
