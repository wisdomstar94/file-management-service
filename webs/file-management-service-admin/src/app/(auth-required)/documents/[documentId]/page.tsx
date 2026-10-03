import type { DocumentDetailResponse } from "@fms/api-schemas/responses/document-responses";
import type { NamedOption } from "@fms/api-schemas/responses/option-responses";
import type { ShareLinkResponse } from "@fms/api-schemas/responses/share-link-responses";
import { DocumentDetailScreen } from "@/components/domains/documents/document-detail-screen";
import { requirePagePermission } from "@/utils/require-page-permission";
import { serverApiFetch } from "@/utils/server-api-fetch";
import { webEnv } from "@/utils/web-env";

export default async function DocumentDetailPage(props: PageProps<"/documents/[documentId]">) {
  const me = await requirePagePermission("file.detail.access");
  const { documentId } = await props.params;
  const base = `/api/admin/documents/${encodeURIComponent(documentId)}`;
  const canEditLinks = (() => {
    if (me.permissionCodes.includes("file.detail.link.create")) {
      return true;
    }
    if (me.permissionCodes.includes("file.detail.link.update")) {
      return true;
    }
    return false;
  })();
  const [document, links, policyOptions] = await Promise.all([
    serverApiFetch<DocumentDetailResponse>(base),
    serverApiFetch<ShareLinkResponse[]>(`${base}/share-links`),
    canEditLinks
      ? serverApiFetch<NamedOption[]>(`${base}/share-links/assignable-access-policy-groups`)
      : Promise.resolve([]),
  ]);
  return (
    <DocumentDetailScreen
      document={document}
      links={links}
      policyOptions={policyOptions}
      userWebOrigin={webEnv.userWebOrigin}
    />
  );
}
