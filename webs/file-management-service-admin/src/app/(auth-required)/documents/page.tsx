import type { DocumentSummaryResponse } from "@fms/api-schemas/responses/document-responses";
import type { PaginatedResponse } from "@fms/api-schemas/responses/paginated-response";
import { DocumentsScreen } from "@/components/domains/documents/documents-screen";
import { readPageParam } from "@/utils/read-page-param";
import { requirePagePermission } from "@/utils/require-page-permission";
import { serverApiFetch } from "@/utils/server-api-fetch";

export default async function DocumentsPage(props: PageProps<"/documents">) {
  await requirePagePermission("file.list.access");
  const searchParams = await props.searchParams;
  const query = new URLSearchParams({ page: String(readPageParam(searchParams.page)), size: "20" });
  if (typeof searchParams.keyword === "string" && searchParams.keyword) {
    query.set("keyword", searchParams.keyword);
  }
  if (searchParams.days === "7" || searchParams.days === "30") {
    query.set("createdWithinDays", searchParams.days);
  }
  const documents = await serverApiFetch<PaginatedResponse<DocumentSummaryResponse>>(`/api/admin/documents?${query}`);
  return <DocumentsScreen documents={documents} />;
}
