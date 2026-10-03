import type { MigrationInterface, QueryRunner } from "typeorm";

export class Init1790990442114 implements MigrationInterface {
  name = "Init1790990442114";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "access_policy_group" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "name" character varying(100) NOT NULL, "rule_tree" jsonb, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_90b5a95b18bcfe41edc7b96012d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "admin_account" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "login_id" character varying(100) NOT NULL, "password_hash" character varying(255) NOT NULL, "nickname" character varying(100) NOT NULL, "memo" text NOT NULL DEFAULT '', "permission_group_id" uuid NOT NULL, "access_policy_group_id" uuid NOT NULL, "last_accessed_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_8cb9ca9e49224689775327660be" UNIQUE ("login_id"), CONSTRAINT "PK_549a26f8a691cec95c57a036b48" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "admin_refresh_token" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "admin_account_id" uuid NOT NULL, "token_hash" character varying(128) NOT NULL, "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_be42fda82854d270331164f5847" UNIQUE ("token_hash"), CONSTRAINT "PK_2df9ac0ddc206100ae8fe38afe0" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6053ffd24e8552cbe206a53b83" ON "admin_refresh_token"  ("admin_account_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "document" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "name" character varying(300) NOT NULL, "default_version_id" uuid, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_e57d3357f83f3cdc0acffc3d777" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "document_version" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "document_id" uuid NOT NULL, "seq" integer NOT NULL, "version_name" character varying(100) NOT NULL, "file_name" character varying(500) NOT NULL, "file_size" bigint NOT NULL, "mime_type" character varying(200) NOT NULL, "storage_key" character varying(500) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_a4c39c95456c5dbb2e96cca713c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_aa04af93d713e1c4696fe6876b" ON "document_version"  ("document_id", "seq") `,
    );
    await queryRunner.query(
      `CREATE TABLE "permission" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "category" character varying(100) NOT NULL, "name" character varying(200) NOT NULL, "code" character varying(200) NOT NULL, "description" text NOT NULL DEFAULT '', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_30e166e8c6359970755c5727a23" UNIQUE ("code"), CONSTRAINT "PK_3b8b97af9d9d8807e41e6f48362" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "permission_group" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "name" character varying(100) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_b1372c1e0a14c1b45ab7cce7857" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "share_link_download_log" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "share_link_id" uuid NOT NULL, "document_version_id" uuid, "ip" character varying(64) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_1bd63338981b9523aa44c1adc1c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2d44a31882d019bbbcfc168c03" ON "share_link_download_log"  ("share_link_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "share_link" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "document_id" uuid NOT NULL, "token" character varying(64) NOT NULL, "access_policy_group_id" uuid, "password_hash" character varying(255), "max_download_count" integer, "download_count" integer NOT NULL DEFAULT '0', "available_from" TIMESTAMP WITH TIME ZONE, "available_until" TIMESTAMP WITH TIME ZONE, "default_version_mode" character varying(20) NOT NULL DEFAULT 'FOLLOW_DOCUMENT', "fixed_version_id" uuid, "is_show_other_versions" boolean NOT NULL DEFAULT false, "is_allow_other_version_download" boolean NOT NULL DEFAULT false, "is_show_download_status" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_4e4015c4bd3f969c75e37e5e0a5" UNIQUE ("token"), CONSTRAINT "PK_c20801720fbd00896c634d4aa94" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "permission_group_permission" ("permission_group_id" uuid NOT NULL, "permission_id" uuid NOT NULL, CONSTRAINT "PK_5b6a82a468f59bad98174783ff4" PRIMARY KEY ("permission_group_id", "permission_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6027dcfe1caf751c75def1066b" ON "permission_group_permission"  ("permission_group_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_478b6945d8633c4225eca17a87" ON "permission_group_permission"  ("permission_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "admin_account" ADD CONSTRAINT "FK_dfa33b4124e1afab901d8df37d4" FOREIGN KEY ("permission_group_id") REFERENCES "permission_group"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "admin_account" ADD CONSTRAINT "FK_c980d6360cbce9519f19f1c94ed" FOREIGN KEY ("access_policy_group_id") REFERENCES "access_policy_group"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "admin_refresh_token" ADD CONSTRAINT "FK_6053ffd24e8552cbe206a53b83f" FOREIGN KEY ("admin_account_id") REFERENCES "admin_account"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "document" ADD CONSTRAINT "FK_2cf90a4dc525d2d26797c521ce5" FOREIGN KEY ("default_version_id") REFERENCES "document_version"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "document_version" ADD CONSTRAINT "FK_99e07676aba693e25611b1f6c12" FOREIGN KEY ("document_id") REFERENCES "document"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "share_link_download_log" ADD CONSTRAINT "FK_2d44a31882d019bbbcfc168c036" FOREIGN KEY ("share_link_id") REFERENCES "share_link"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "share_link_download_log" ADD CONSTRAINT "FK_5c193768536f1e7b42139f263b7" FOREIGN KEY ("document_version_id") REFERENCES "document_version"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "share_link" ADD CONSTRAINT "FK_faa3c034eedb979fa6553cf289e" FOREIGN KEY ("document_id") REFERENCES "document"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "share_link" ADD CONSTRAINT "FK_88aa5f2480b067cb5fc2cd7830e" FOREIGN KEY ("access_policy_group_id") REFERENCES "access_policy_group"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "share_link" ADD CONSTRAINT "FK_764358b074121ef56dafc5d69de" FOREIGN KEY ("fixed_version_id") REFERENCES "document_version"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "permission_group_permission" ADD CONSTRAINT "FK_6027dcfe1caf751c75def1066b6" FOREIGN KEY ("permission_group_id") REFERENCES "permission_group"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "permission_group_permission" ADD CONSTRAINT "FK_478b6945d8633c4225eca17a875" FOREIGN KEY ("permission_id") REFERENCES "permission"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "permission_group_permission" DROP CONSTRAINT "FK_478b6945d8633c4225eca17a875"`,
    );
    await queryRunner.query(
      `ALTER TABLE "permission_group_permission" DROP CONSTRAINT "FK_6027dcfe1caf751c75def1066b6"`,
    );
    await queryRunner.query(`ALTER TABLE "share_link" DROP CONSTRAINT "FK_764358b074121ef56dafc5d69de"`);
    await queryRunner.query(`ALTER TABLE "share_link" DROP CONSTRAINT "FK_88aa5f2480b067cb5fc2cd7830e"`);
    await queryRunner.query(`ALTER TABLE "share_link" DROP CONSTRAINT "FK_faa3c034eedb979fa6553cf289e"`);
    await queryRunner.query(`ALTER TABLE "share_link_download_log" DROP CONSTRAINT "FK_5c193768536f1e7b42139f263b7"`);
    await queryRunner.query(`ALTER TABLE "share_link_download_log" DROP CONSTRAINT "FK_2d44a31882d019bbbcfc168c036"`);
    await queryRunner.query(`ALTER TABLE "document_version" DROP CONSTRAINT "FK_99e07676aba693e25611b1f6c12"`);
    await queryRunner.query(`ALTER TABLE "document" DROP CONSTRAINT "FK_2cf90a4dc525d2d26797c521ce5"`);
    await queryRunner.query(`ALTER TABLE "admin_refresh_token" DROP CONSTRAINT "FK_6053ffd24e8552cbe206a53b83f"`);
    await queryRunner.query(`ALTER TABLE "admin_account" DROP CONSTRAINT "FK_c980d6360cbce9519f19f1c94ed"`);
    await queryRunner.query(`ALTER TABLE "admin_account" DROP CONSTRAINT "FK_dfa33b4124e1afab901d8df37d4"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_478b6945d8633c4225eca17a87"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_6027dcfe1caf751c75def1066b"`);
    await queryRunner.query(`DROP TABLE "permission_group_permission"`);
    await queryRunner.query(`DROP TABLE "share_link"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_2d44a31882d019bbbcfc168c03"`);
    await queryRunner.query(`DROP TABLE "share_link_download_log"`);
    await queryRunner.query(`DROP TABLE "permission_group"`);
    await queryRunner.query(`DROP TABLE "permission"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_aa04af93d713e1c4696fe6876b"`);
    await queryRunner.query(`DROP TABLE "document_version"`);
    await queryRunner.query(`DROP TABLE "document"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_6053ffd24e8552cbe206a53b83"`);
    await queryRunner.query(`DROP TABLE "admin_refresh_token"`);
    await queryRunner.query(`DROP TABLE "admin_account"`);
    await queryRunner.query(`DROP TABLE "access_policy_group"`);
  }
}
