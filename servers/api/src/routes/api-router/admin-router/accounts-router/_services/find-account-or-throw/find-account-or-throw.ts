import { notFoundError } from "#/utils/commons/not-found-error/index.js";
import { ADMIN_ACCOUNT_RELATIONS } from "../../_consts/admin-account-relations/index.js";
import { getAdminAccountRepository } from "../../_utils/get-admin-account-repository/index.js";

export async function findAccountOrThrow(id: string) {
  const account = await getAdminAccountRepository().findOne({ where: { id }, relations: ADMIN_ACCOUNT_RELATIONS });
  if (!account) {
    throw notFoundError("관리자 계정");
  }
  return account;
}
