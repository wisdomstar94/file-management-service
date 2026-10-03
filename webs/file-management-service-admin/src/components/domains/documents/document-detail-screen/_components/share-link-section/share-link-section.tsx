"use client";

import type { DocumentDetailResponse } from "@fms/api-schemas/responses/document-responses";
import type { NamedOption } from "@fms/api-schemas/responses/option-responses";
import type { ShareLinkResponse } from "@fms/api-schemas/responses/share-link-responses";
import { Button } from "@fms/web-ui/components/button";
import { useState } from "react";
import { Card } from "@/components/commons/card";
import { ConfirmDialog } from "@/components/commons/confirm-dialog";
import { useAsyncAction } from "@/hooks/use-async-action";
import { useAdminSession } from "@/providers/admin-session-provider";
import { bffFetch } from "@/utils/bff-fetch";
import { ShareLinkCard } from "./_components/share-link-card";
import { ShareLinkFormModal } from "./_components/share-link-form-modal";

export function ShareLinkSection(props: {
  document: DocumentDetailResponse;
  links: ShareLinkResponse[];
  policyOptions: NamedOption[];
  userWebOrigin: string;
}) {
  const { document, links, policyOptions, userWebOrigin } = props;
  const { hasPermission } = useAdminSession();
  const canCreate = hasPermission("file.detail.link.create");
  const canUpdate = hasPermission("file.detail.link.update");
  const canDelete = hasPermission("file.detail.link.delete");
  const [editing, setEditing] = useState<ShareLinkResponse | "new" | null>(null);
  const [deleting, setDeleting] = useState<ShareLinkResponse | null>(null);
  const { isPending, run } = useAsyncAction();

  async function deleteLink(link: ShareLinkResponse) {
    await run(() => bffFetch(`documents/${document.id}/share-links/${link.id}`, { method: "DELETE" }), {
      successMessage: "삭제했습니다",
    });
    setDeleting(null);
  }

  return (
    <Card>
      <div className="flex items-center gap-3 border-b border-line-soft px-[22px] py-4">
        <div className="flex-1">
          <div className="text-[15px] font-bold">
            외부 공개 링크 <span className="font-medium text-faint">{links.length}</span>
          </div>
          <div className="mt-0.5 text-[12.5px] text-faint">
            링크마다 접근 정책, 비밀번호, 기간, 노출 범위를 따로 설정합니다.
          </div>
        </div>
        <Button
          variant="primary"
          icon="ti ti-link-plus"
          className="!h-9"
          disabled={!canCreate}
          title={canCreate ? undefined : "외부 공개 링크 생성 권한이 없습니다"}
          onClick={() => setEditing("new")}
        >
          링크 생성
        </Button>
      </div>
      {links.length === 0 && (
        <div className="px-[22px] py-10 text-center text-[13.5px] text-faint">생성된 링크가 없습니다.</div>
      )}
      {links.map((link) => (
        <ShareLinkCard
          key={link.id}
          link={link}
          url={`${userWebOrigin}/s/${link.token}`}
          canUpdate={canUpdate}
          canDelete={canDelete}
          onEdit={() => setEditing(link)}
          onDelete={() => setDeleting(link)}
        />
      ))}
      {editing && (
        <ShareLinkFormModal
          document={document}
          link={editing === "new" ? null : editing}
          policyOptions={policyOptions}
          onClose={() => setEditing(null)}
        />
      )}
      {deleting && (
        <ConfirmDialog
          message="이 링크를 삭제하면 링크를 받은 사용자가 더 이상 접근할 수 없습니다."
          isPending={isPending}
          onConfirm={() => deleteLink(deleting)}
          onClose={() => setDeleting(null)}
        />
      )}
    </Card>
  );
}
