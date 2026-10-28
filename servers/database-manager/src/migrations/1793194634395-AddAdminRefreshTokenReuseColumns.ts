import type { MigrationInterface, QueryRunner } from "typeorm";

/** 기존 refresh token 은 행마다 따로 로그인한 것으로 보고 계열을 새로 채운다. */
export class AddAdminRefreshTokenReuseColumns1793194634395 implements MigrationInterface {
  name = "AddAdminRefreshTokenReuseColumns1793194634395";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "admin_refresh_token" ADD "family_id" uuid NOT NULL DEFAULT gen_random_uuid()`,
    );
    await queryRunner.query(`ALTER TABLE "admin_refresh_token" ALTER COLUMN "family_id" DROP DEFAULT`);
    await queryRunner.query(`ALTER TABLE "admin_refresh_token" ADD "used_at" TIMESTAMP WITH TIME ZONE`);
    await queryRunner.query(`CREATE INDEX "IDX_da5ed363cf30f0192ad1d89089" ON "admin_refresh_token" ("family_id") `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_da5ed363cf30f0192ad1d89089"`);
    await queryRunner.query(`ALTER TABLE "admin_refresh_token" DROP COLUMN "used_at"`);
    await queryRunner.query(`ALTER TABLE "admin_refresh_token" DROP COLUMN "family_id"`);
  }
}
