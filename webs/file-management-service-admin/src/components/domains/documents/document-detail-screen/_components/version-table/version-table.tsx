"use client";

import type { DocumentDetailResponse, DocumentVersionResponse } from "@fms/api-schemas/responses/document-responses";
import { Button } from "@fms/web-ui/components/button";
import { readFileIcon } from "@fms/web-utils/files/read-file-icon";
import { formatDateTime } from "@fms/web-utils/formats/format-date-time";
import { formatFileSize } from "@fms/web-utils/formats/format-file-size";
import { useState } from "react";
import { Card } from "@/components/commons/card";
import { ConfirmDialog } from "@/components/commons/confirm-dialog";
import { BodyCell, DataTable, HeadCell } from "@/components/commons/data-table";
import { useAsyncAction } from "@/hooks/use-async-action";
import { useAdminSession } from "@/providers/admin-session-provider";
import { bffFetch } from "@/utils/bff-fetch";
import { VersionUploadModal, type VersionUploadMode } from "../../../version-upload-modal";

export function VersionTable(props: { document: DocumentDetailResponse }) {
  const { document } = props;
  const { hasPermission } = useAdminSession();
  const canCreate = hasPermission("file.detail.version.create");
  const canUpdate = hasPermission("file.detail.version.update");
  const [uploadMode, setUploadMode] = useState<VersionUploadMode | null>(null);
  const [deleting, setDeleting] = useState<DocumentVersionResponse | null>(null);
  const { isPending, run } = useAsyncAction();
  const isLastVersion = document.versions.length === 1;

  async function deleteVersion(version: DocumentVersionResponse) {
    await run(() => bffFetch(`documents/${document.id}/versions/${version.id}`, { method: "DELETE" }), {
      successMessage: "삭제했습니다",
    });
    setDeleting(null);
  }

  return (
    <Card>
      <div className="flex items-center gap-3 border-b border-line-soft px-[22px] py-4">
        <div className="flex-1">
          <div className="text-[15px] font-bold">버전 관리</div>
          <div className="mt-0.5 text-[12.5px] text-faint">새 파일을 올리면 기존 버전은 이력으로 남습니다.</div>
        </div>
        <Button
          variant="primary"
          icon="ti ti-upload"
          className="!h-9"
          disabled={!canCreate}
          title={canCreate ? undefined : "새 버전 등록 권한이 없습니다"}
          onClick={() => setUploadMode({ kind: "new-version", documentId: document.id })}
        >
          새 버전 등록
        </Button>
      </div>
      <DataTable>
        <thead>
          <tr>
            <HeadCell className="!px-[22px]">버전명</HeadCell>
            <HeadCell>파일명</HeadCell>
            <HeadCell>등록일</HeadCell>
            <HeadCell>수정일</HeadCell>
            <HeadCell align="right" className="!px-[22px]">
              관리
            </HeadCell>
          </tr>
        </thead>
        <tbody>
          {document.versions.map((version) => {
            const fileIcon = readFileIcon(version.fileName);
            const deleteBlockedReason = !canUpdate
              ? "버전 수정 · 삭제 권한이 없습니다"
              : isLastVersion
                ? "자료에는 버전이 1개 이상 있어야 합니다"
                : undefined;
            return (
              <tr key={version.id}>
                <BodyCell className="whitespace-nowrap !px-[22px]">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[13px] font-semibold">{version.versionName}</span>
                    {version.isLatest && (
                      <span className="rounded-full bg-primary-soft px-[7px] py-0.5 text-[11px] font-semibold text-primary">
                        최신
                      </span>
                    )}
                    {version.isDefault && (
                      <span className="rounded-full bg-success-soft px-[7px] py-0.5 text-[11px] font-semibold text-success">
                        기본
                      </span>
                    )}
                  </div>
                </BodyCell>
                <BodyCell className="whitespace-nowrap !text-[13.5px]">
                  <div className="flex items-center gap-2">
                    <i className={`ti ${fileIcon.icon} text-[17px]`} style={{ color: fileIcon.color }} aria-hidden />
                    {version.fileName}
                    <span className="text-[12px] text-faint-2">{formatFileSize(version.fileSize)}</span>
                  </div>
                </BodyCell>
                <BodyCell className="whitespace-nowrap text-sub">{formatDateTime(version.createdAt)}</BodyCell>
                <BodyCell className="whitespace-nowrap text-sub">{formatDateTime(version.updatedAt)}</BodyCell>
                <BodyCell align="right" className="!px-[22px]">
                  <div className="inline-flex gap-1.5">
                    <a
                      href={`/bff/documents/${document.id}/versions/${version.id}/download`}
                      className="inline-flex h-[30px] items-center rounded-md border border-line-input bg-white px-3 text-[12.5px] font-medium text-ink-2"
                    >
                      다운로드
                    </a>
                    <Button
                      size="sm"
                      disabled={!canUpdate}
                      title={canUpdate ? undefined : "버전 수정 · 삭제 권한이 없습니다"}
                      onClick={() => setUploadMode({ kind: "edit-version", documentId: document.id, version })}
                    >
                      수정
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      disabled={deleteBlockedReason !== undefined}
                      title={deleteBlockedReason}
                      onClick={() => setDeleting(version)}
                    >
                      삭제
                    </Button>
                  </div>
                </BodyCell>
              </tr>
            );
          })}
        </tbody>
      </DataTable>
      {uploadMode && <VersionUploadModal mode={uploadMode} onClose={() => setUploadMode(null)} />}
      {deleting && (
        <ConfirmDialog
          message={`${deleting.versionName} (${deleting.fileName}) 버전을 삭제합니다. 외부 링크에서 이 버전을 기본으로 지정한 경우 자료 설정을 따르도록 바뀝니다.`}
          isPending={isPending}
          onConfirm={() => deleteVersion(deleting)}
          onClose={() => setDeleting(null)}
        />
      )}
    </Card>
  );
}
