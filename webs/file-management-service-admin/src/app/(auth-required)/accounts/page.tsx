import type { AdminAccountResponse } from "@fms/api-schemas/responses/admin-account-responses";
import type { AssignableAccountGroupsResponse } from "@fms/api-schemas/responses/option-responses";
import type { PaginatedResponse } from "@fms/api-schemas/responses/paginated-response";
import { AccountsScreen } from "@/components/domains/accounts/accounts-screen";
import { readPageParam } from "@/utils/read-page-param";
import { requirePagePermission } from "@/utils/require-page-permission";
import { serverApiFetch } from "@/utils/server-api-fetch";

export default async function AccountsPage(props: PageProps<"/accounts">) {
  await requirePagePermission("account.access");
  const page = readPageParam((await props.searchParams).page);
  const [accounts, options] = await Promise.all([
    serverApiFetch<PaginatedResponse<AdminAccountResponse>>(`/api/admin/accounts?page=${page}&size=20`),
    serverApiFetch<AssignableAccountGroupsResponse>("/api/admin/accounts/assignable-groups"),
  ]);
  return <AccountsScreen accounts={accounts} options={options} />;
}
