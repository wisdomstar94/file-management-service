import { notFoundError } from "#/utils/commons/not-found-error/index.js";
import { getAccessPolicyGroupRepository } from "../../_utils/get-access-policy-group-repository/index.js";

export async function findAccessPolicyGroupOrThrow(id: string) {
  const group = await getAccessPolicyGroupRepository().findOne({ where: { id } });
  if (!group) {
    throw notFoundError("접근 정책 그룹");
  }
  return group;
}
