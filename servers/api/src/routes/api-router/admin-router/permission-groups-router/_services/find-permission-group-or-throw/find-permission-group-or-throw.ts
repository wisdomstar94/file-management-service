import { notFoundError } from "#/utils/commons/not-found-error/index.js";
import { getPermissionGroupRepository } from "../../_utils/get-permission-group-repository/index.js";

export async function findPermissionGroupOrThrow(id: string) {
  const group = await getPermissionGroupRepository().findOne({ where: { id }, relations: { permissions: true } });
  if (!group) {
    throw notFoundError("권한 그룹");
  }
  return group;
}
