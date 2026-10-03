import type { PublicShareLinkDetailResponse } from "@fms/api-schemas/responses/share-link-responses";
import { ProgressBar } from "@fms/web-ui/components/progress-bar";

export function DownloadStatus(props: {
  downloadStatus: PublicShareLinkDetailResponse["downloadStatus"];
  period: string | null;
}) {
  const { downloadStatus, period } = props;

  return (
    <div className="flex flex-col gap-2">
      {downloadStatus && (
        <>
          <div className="flex justify-between text-[13px]">
            <span className="flex items-baseline gap-1.5">
              <span className="text-muted">다운로드 현황</span>
              <span className="text-[12px] text-faint">모든 버전 합산</span>
            </span>
            <span>
              <b>{downloadStatus.downloadCount}</b>
              <span className="text-faint"> / {downloadStatus.maxDownloadCount ?? "무제한"}</span>
            </span>
          </div>
          <ProgressBar value={downloadStatus.downloadCount} max={downloadStatus.maxDownloadCount} />
        </>
      )}
      {period && <div className="text-[12px] text-faint">{period}</div>}
    </div>
  );
}
