import { PermissionEntity } from "@fms/database-entities/entities/permission-entity";
import { PermissionGroupEntity } from "@fms/database-entities/entities/permission-group-entity";
import type { EntityManager } from "typeorm";

export const DEFAULT_PERMISSION_GROUP_NAME = "최고 관리자";

/** 권한 그룹이 하나도 없을 때만 모든 권한을 가진 기본 그룹을 만든다. */
export async function seedDefaultPermissionGroup(manager: EntityManager): Promise<PermissionGroupEntity> {
  const repository = manager.getRepository(PermissionGroupEntity);
  const existing = await repository.findOne({ where: {}, order: { createdAt: "ASC" } });
  if (existing) {
    return existing;
  }

  const permissions = await manager.getRepository(PermissionEntity).find();
  return repository.save(repository.create({ name: DEFAULT_PERMISSION_GROUP_NAME, permissions }));
}
