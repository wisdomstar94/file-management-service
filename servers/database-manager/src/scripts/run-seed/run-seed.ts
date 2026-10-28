import { createDatabaseManagerDataSource } from "#/utils/commons/create-database-manager-data-source/index.js";
import { seedDefaultAccessPolicyGroup } from "./_utils/seed-default-access-policy-group/index.js";
import { seedDefaultPermissionGroup } from "./_utils/seed-default-permission-group/index.js";
import { seedInitialAdmin } from "./_utils/seed-initial-admin/index.js";
import { seedPermissions } from "./_utils/seed-permissions/index.js";

export async function runSeed(): Promise<void> {
  const dataSource = await createDatabaseManagerDataSource().initialize();
  try {
    await dataSource.transaction(async (manager) => {
      const addedPermissionCount = await seedPermissions(manager);
      const permissionGroup = await seedDefaultPermissionGroup(manager);
      const accessPolicyGroup = await seedDefaultAccessPolicyGroup(manager);
      const initialAdmin = await seedInitialAdmin(manager, {
        permissionGroupId: permissionGroup.id,
        accessPolicyGroupId: accessPolicyGroup.id,
      });
      console.log(`[seed] 권한 ${addedPermissionCount}건 추가 · 최초 관리자 ${initialAdmin}`);
    });
  } finally {
    await dataSource.destroy();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await runSeed();
}
