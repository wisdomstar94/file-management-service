"use client";

import type { DocumentDetailResponse } from "@fms/api-schemas/responses/document-responses";
import type { NamedOption } from "@fms/api-schemas/responses/option-responses";
import type { ShareLinkResponse } from "@fms/api-schemas/responses/share-link-responses";
import { Button } from "@fms/web-ui/components/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ConfirmDialog } from "@/components/commons/confirm-dialog";
import { PageHeading } from "@/components/commons/page-heading";
import { useAsyncAction } from "@/hooks/use-async-action";
import { useAdminSession } from "@/providers/admin-session-provider";
import { bffFetch } from "@/utils/bff-fetch";
import { DocumentInfoCards } from "./_components/document-info-cards";
import { ShareLinkSection } from "./_components/share-link-section";
import { VersionTable } from "./_components/version-table";

export function DocumentDetailScreen(props: {
  document: DocumentDetailResponse;
  links: ShareLinkResponse[];
  policyOptions: NamedOption[];
  userWebOrigin: string;
}) {
  const { document, links, policyOptions, userWebOrigin } = props;
  const router = useRouter();
  const { hasPermission } = useAdminSession();
  const canUpdate = hasPermission("file.detail.update");
  const canDelete = hasPermission("file.list.delete");
  const [name, setName] = useState(document.name);
  const [defaultVersionId, setDefaultVersionId] = useState(document.defaultVersionId);
  const [isDeleting, setIsDeleting] = useState(false);
  const { isPending, run } = useAsyncAction();

  async function save() {
    await run(
      () => bffFetch(`documents/${document.id}`, { method: "PATCH", body: JSON.stringify({ name, defaultVersionId }) }),
      { successMessage: "변경사항을 저장했습니다" },
    );
  }

  async function deleteDocument() {
    const deleted = await run(() => bffFetch(`documents/${document.id}`, { method: "DELETE" }), {
      successMessage: "삭제했습니다",
    });
    setIsDeleting(false);
    if (deleted !== undefined) {
      router.push("/documents");
    }
  }

  return (
    <>
      <PageHeading
        title={document.name}
        back={{ href: "/documents", label: "자료 목록" }}
        actions={
          <>
            <Button
              variant="danger"
              disabled={!canDelete}
              title={canDelete ? undefined : "삭제 권한이 없습니다"}
              onClick={() => setIsDeleting(true)}
            >
              자료 삭제
            </Button>
            <Button
              variant="primary"
              disabled={!canUpdate || isPending}
              title={canUpdate ? undefined : "자료 정보 수정 권한이 없습니다"}
              onClick={save}
            >
              변경사항 저장
            </Button>
          </>
        }
      />
      <DocumentInfoCards
        document={document}
        name={name}
        defaultVersionId={defaultVersionId}
        isEditable={canUpdate}
        onNameChange={setName}
        onDefaultVersionChange={setDefaultVersionId}
      />
      <VersionTable document={document} />
      <ShareLinkSection document={document} links={links} policyOptions={policyOptions} userWebOrigin={userWebOrigin} />
      {isDeleting && (
        <ConfirmDialog
          message={`'${document.name}' 자료와 모든 버전(${document.versions.length}개), 외부 공개 링크(${links.length}개)가 삭제됩니다.`}
          isPending={isPending}
          onConfirm={deleteDocument}
          onClose={() => setIsDeleting(false)}
        />
      )}
    </>
  );
}
