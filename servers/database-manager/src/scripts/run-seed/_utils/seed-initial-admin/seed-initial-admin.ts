import { AdminAccountEntity } from "@fms/database-entities/entities/admin-account-entity";
import { hashPassword } from "@fms/password-handler/passwords/hash-password";
import type { EntityManager } from "typeorm";

/**
 * `INITIAL_ADMIN_ID` · `INITIAL_ADMIN_PASSWORD` 가 설정돼 있고 같은 아이디의 계정이 없을 때만 최초 관리자를 만든다.
 * 이미 있으면 비밀번호를 바꾸지 않는다.
 */
export async function seedInitialAdmin(
  manager: EntityManager,
  props: { permissionGroupId: string; accessPolicyGroupId: string },
): Promise<"created" | "exists" | "skipped"> {
  const loginId = process.env.INITIAL_ADMIN_ID;
  const password = process.env.INITIAL_ADMIN_PASSWORD;
  if (!loginId || !password) {
    return "skipped";
  }

  const repository = manager.getRepository(AdminAccountEntity);
  if (await repository.exists({ where: { loginId } })) {
    return "exists";
  }

  await repository.save(
    repository.create({
      loginId,
      passwordHash: await hashPassword(password),
      nickname: process.env.INITIAL_ADMIN_NICKNAME || "최초 관리자",
      permissionGroupId: props.permissionGroupId,
      accessPolicyGroupId: props.accessPolicyGroupId,
    }),
  );
  return "created";
}
