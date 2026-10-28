import { AccessPolicyGroupEntity } from "@fms/database-entities/entities/access-policy-group-entity";
import type { EntityManager } from "typeorm";
import { DEFAULT_ACCESS_POLICY_GROUP_NAME } from "./_consts/default-access-policy-group-name/index.js";

/** 접근 정책 그룹이 하나도 없을 때만 제한 없는 기본 그룹을 만든다. */
export async function seedDefaultAccessPolicyGroup(manager: EntityManager): Promise<AccessPolicyGroupEntity> {
  const repository = manager.getRepository(AccessPolicyGroupEntity);
  const existing = await repository.findOne({ where: {}, order: { createdAt: "ASC" } });
  if (existing) {
    return existing;
  }

  return repository.save(repository.create({ name: DEFAULT_ACCESS_POLICY_GROUP_NAME, ruleTree: null }));
}
