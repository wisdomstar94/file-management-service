import { PERMISSION_CODE_REGISTRY } from "@fms/consts/permissions/permission-code-registry";
import { PermissionEntity } from "@fms/database-entities/entities/permission-entity";
import type { EntityManager } from "typeorm";

/** 코드 레지스트리에 있는데 DB 에 없는 권한만 추가한다. 관리자가 고친 이름은 덮어쓰지 않는다. */
export async function seedPermissions(manager: EntityManager): Promise<number> {
  const repository = manager.getRepository(PermissionEntity);
  const existingCodes = new Set((await repository.find({ select: { code: true } })).map((p) => p.code));
  const missing = (Object.keys(PERMISSION_CODE_REGISTRY) as (keyof typeof PERMISSION_CODE_REGISTRY)[])
    .filter((code) => !existingCodes.has(code))
    .map((code) => repository.create({ code, ...PERMISSION_CODE_REGISTRY[code].seed }));

  await repository.save(missing);
  return missing.length;
}
