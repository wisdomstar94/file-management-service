import type { ACCESS_POLICY_GROUP_DETAIL_API } from "@fms/api-schemas/schemas/access-policy-group-api-schemas";
import type { ResBody } from "@fms/api-schemas/types/api-schema-utils";
import type { AccessPolicyGroupEntity } from "@fms/database-entities/entities/access-policy-group-entity";
import { appDataSource } from "#/singleton-classes/app-data-source/index.js";
import { toAccessPolicyGroupSummaryResponse } from "../../_utils/to-access-policy-group-response/index.js";
import { countAccessPolicyGroupUsage } from "../count-access-policy-group-usage/index.js";

export async function toAccessPolicyGroupDetailResponse(
  group: AccessPolicyGroupEntity,
): Promise<ResBody<typeof ACCESS_POLICY_GROUP_DETAIL_API>["data"]> {
  return {
    ...toAccessPolicyGroupSummaryResponse(group),
    ruleTree: group.ruleTree,
    ...(await countAccessPolicyGroupUsage(appDataSource.manager, group.id)),
  };
}
