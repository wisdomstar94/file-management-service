import type { MigrationInterface, QueryRunner } from "typeorm";

type ManageSplit = {
  manageCode: string;
  manageName: string;
  splits: { code: string; name: string }[];
};

/** 마이그레이션은 실행 시점의 코드와 무관하게 같은 결과를 내야 하므로 레지스트리를 import 하지 않고 값을 고정한다. */
const MANAGE_SPLITS: ManageSplit[] = [
  {
    manageCode: "file.detail.link.manage",
    manageName: "외부 공개 링크 관리 권한",
    splits: [
      { code: "file.detail.link.create", name: "외부 공개 링크 생성 권한" },
      { code: "file.detail.link.update", name: "외부 공개 링크 수정 권한" },
      { code: "file.detail.link.delete", name: "외부 공개 링크 삭제 권한" },
    ],
  },
  ...["account", "policy", "perm.group"].map((prefix) => ({
    manageCode: `${prefix}.manage`,
    manageName: "생성 · 수정 · 삭제 권한",
    splits: [
      { code: `${prefix}.create`, name: "생성 권한" },
      { code: `${prefix}.update`, name: "수정 권한" },
      { code: `${prefix}.delete`, name: "삭제 권한" },
    ],
  })),
  {
    manageCode: "perm.manage",
    manageName: "생성 · 수정 · 삭제 권한",
    splits: [{ code: "perm.update", name: "수정 권한" }],
  },
];

/** `*.manage` 를 동작별 권한으로 나누고, 기존에 `*.manage` 를 가진 권한 그룹에는 나눈 권한을 모두 부여한다. */
export class SplitManagePermissions1791001200000 implements MigrationInterface {
  name = "SplitManagePermissions1791001200000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const { manageCode, splits } of MANAGE_SPLITS) {
      for (const split of splits) {
        await queryRunner.query(
          `INSERT INTO "permission" ("category", "name", "code")
           SELECT "category", $2, $3 FROM "permission" WHERE "code" = $1
           ON CONFLICT ("code") DO NOTHING`,
          [manageCode, split.name, split.code],
        );
      }
      await queryRunner.query(
        `INSERT INTO "permission_group_permission" ("permission_group_id", "permission_id")
         SELECT pgp."permission_group_id", split."id"
         FROM "permission_group_permission" pgp
         JOIN "permission" manage ON manage."id" = pgp."permission_id" AND manage."code" = $1
         JOIN "permission" split ON split."code" = ANY($2)
         ON CONFLICT DO NOTHING`,
        [manageCode, splits.map((split) => split.code)],
      );
      await queryRunner.query(`DELETE FROM "permission" WHERE "code" = $1`, [manageCode]);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const { manageCode, manageName, splits } of MANAGE_SPLITS) {
      const splitCodes = splits.map((split) => split.code);
      await queryRunner.query(
        `INSERT INTO "permission" ("category", "name", "code")
         SELECT "category", $2, $3 FROM "permission" WHERE "code" = ANY($1) ORDER BY "created_at" LIMIT 1
         ON CONFLICT ("code") DO NOTHING`,
        [splitCodes, manageName, manageCode],
      );
      await queryRunner.query(
        `INSERT INTO "permission_group_permission" ("permission_group_id", "permission_id")
         SELECT DISTINCT pgp."permission_group_id", manage."id"
         FROM "permission_group_permission" pgp
         JOIN "permission" split ON split."id" = pgp."permission_id" AND split."code" = ANY($1)
         JOIN "permission" manage ON manage."code" = $2
         ON CONFLICT DO NOTHING`,
        [splitCodes, manageCode],
      );
      await queryRunner.query(`DELETE FROM "permission" WHERE "code" = ANY($1)`, [splitCodes]);
    }
  }
}
