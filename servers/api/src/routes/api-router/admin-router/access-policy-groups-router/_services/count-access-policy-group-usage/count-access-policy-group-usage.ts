import { AdminAccountEntity } from "@fms/database-entities/entities/admin-account-entity";
import { ShareLinkEntity } from "@fms/database-entities/entities/share-link-entity";
import type { EntityManager } from "typeorm";

export async function countAccessPolicyGroupUsage(manager: EntityManager, accessPolicyGroupId: string) {
  const [usedAccountCount, usedShareLinkCount] = await Promise.all([
    manager.getRepository(AdminAccountEntity).countBy({ accessPolicyGroupId }),
    manager.getRepository(ShareLinkEntity).countBy({ accessPolicyGroupId }),
  ]);
  return { usedAccountCount, usedShareLinkCount };
}
