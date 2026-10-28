import { randomUUID } from "node:crypto";
import { createAdminClient } from "./_utils/create-admin-client";

/** 테스트마다 빈 DB 를 새로 만들어, 개발 DB 와 다른 테스트의 데이터를 건드리지 않게 한다. */
export async function createIsolatedDatabase() {
  const name = `fms_e2e_${randomUUID().replaceAll("-", "").slice(0, 12)}`;
  const admin = createAdminClient(process.env.DB_NAME ?? "postgres");
  await admin.connect();
  await admin.query(`CREATE DATABASE "${name}"`);
  await admin.end();

  const client = createAdminClient(name);
  await client.connect();

  async function drop() {
    await client.end();
    const dropper = createAdminClient(process.env.DB_NAME ?? "postgres");
    await dropper.connect();
    await dropper.query(`DROP DATABASE IF EXISTS "${name}" WITH (FORCE)`);
    await dropper.end();
  }

  return { name, client, drop };
}
