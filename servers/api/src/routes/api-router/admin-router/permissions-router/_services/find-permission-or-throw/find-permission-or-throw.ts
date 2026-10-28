import { notFoundError } from "#/utils/commons/not-found-error/index.js";
import { getPermissionRepository } from "../../_utils/get-permission-repository/index.js";

export async function findPermissionOrThrow(id: string) {
  const permission = await getPermissionRepository().findOne({ where: { id } });
  if (!permission) {
    throw notFoundError("권한");
  }
  return permission;
}
