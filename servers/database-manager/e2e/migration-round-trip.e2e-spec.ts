import { PERMISSION_CODE_REGISTRY } from "@fms/consts/permissions/permission-code-registry";
import { APP_TABLES } from "./_consts/app-tables";
import { createIsolatedDatabase } from "./_utils/create-isolated-database";
import { runDatabaseManagerCommand } from "./_utils/run-database-manager-command";

describe("database-manager 마이그레이션 · 시드", () => {
  let database: Awaited<ReturnType<typeof createIsolatedDatabase>>;

  beforeAll(async () => {
    database = await createIsolatedDatabase();
  });

  afterAll(async () => {
    await database.drop();
  });

  async function readTableNames() {
    const result = await database.client.query<{ table_name: string }>(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name",
    );
    return result.rows.map((row) => row.table_name);
  }

  test("빈 DB 에 migration:run 을 실행하면 모든 테이블이 생긴다", async () => {
    runDatabaseManagerCommand("migration:run", database.name);

    expect(await readTableNames()).toEqual([...APP_TABLES, "migrations"].sort());
  });

  test("seed 를 두 번 실행해도 권한 · 기본 그룹 · 최초 관리자가 한 벌만 생긴다", async () => {
    runDatabaseManagerCommand("seed", database.name);
    runDatabaseManagerCommand("seed", database.name);

    const counts = await database.client.query<{ permission: string; group_permission: string; admin: string }>(`
      SELECT
        (SELECT count(*) FROM permission) AS permission,
        (SELECT count(*) FROM permission_group_permission) AS group_permission,
        (SELECT count(*) FROM admin_account WHERE login_id = '${process.env.INITIAL_ADMIN_ID}') AS admin
    `);
    expect(counts.rows[0]).toEqual({
      permission: String(Object.keys(PERMISSION_CODE_REGISTRY).length),
      group_permission: String(Object.keys(PERMISSION_CODE_REGISTRY).length),
      admin: "1",
    });
  });

  test("권한 마이그레이션은 manage 권한을 나눠 권한 그룹에 옮기고, 코드에 없는 권한은 지운다", async () => {
    const readGroupCodes = async () => {
      const result = await database.client.query<{ code: string }>(`
        SELECT p.code FROM permission_group_permission pgp JOIN permission p ON p.id = pgp.permission_id
        WHERE p.code LIKE 'account.%' OR p.code LIKE 'asset.%' ORDER BY p.code
      `);
      return result.rows.map((row) => row.code);
    };

    runDatabaseManagerCommand("migration:revert", database.name);
    runDatabaseManagerCommand("migration:revert", database.name);
    expect(await readGroupCodes()).toEqual(["account.access", "account.manage"]);

    await database.client.query(`
      WITH unlinked AS (
        INSERT INTO permission (category, name, code) VALUES ('자산 목록 페이지', '조회 권한', 'asset.list.view') RETURNING id
      )
      INSERT INTO permission_group_permission (permission_group_id, permission_id)
      SELECT pg.id, unlinked.id FROM permission_group pg, unlinked
    `);
    expect(await readGroupCodes()).toContain("asset.list.view");

    runDatabaseManagerCommand("migration:run", database.name);
    expect(await readGroupCodes()).toEqual(["account.access", "account.create", "account.delete", "account.update"]);
    const remaining = await database.client.query("SELECT 1 FROM permission WHERE code = 'asset.list.view'");
    expect(remaining.rowCount).toBe(0);
  });

  test("migration:revert 를 마이그레이션 수만큼 실행하면 앱 테이블이 모두 사라진다", async () => {
    const executed = await database.client.query("SELECT id FROM migrations");
    for (const _ of executed.rows) {
      runDatabaseManagerCommand("migration:revert", database.name);
    }

    expect(await readTableNames()).toEqual(["migrations"]);
  });
});
