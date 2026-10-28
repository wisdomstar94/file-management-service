import fs from "node:fs";
import path from "node:path";

/**
 * DB 마이그레이션 파일명의 timestamp 가 TypeORM CLI 가 만든 실제 `Date.now()` 값인지 검사합니다.
 *
 * 손으로 지은 숫자(`1791001200000` 처럼 끝이 둥근 값)는 만든 시점을 알 수 없게 하므로 막고,
 * 파일명 · 클래스명 · `name` 의 숫자가 서로 어긋나 같은 DB 마이그레이션이 다시 실행되는 일도 막습니다.
 * DB 마이그레이션은 `migration:generate` 나 `migration:create` 로만 만듭니다.
 *
 * @example
 * node scripts/check-migrations.mjs   # 어긋난 곳이 있으면 exit 1
 */

const ROOT = path.resolve(import.meta.dirname, "..");
const MIGRATIONS_DIR = "servers/database-manager/src/migrations";

const FILE_PATTERN = /^(\d{13})-([A-Za-z0-9]+)\.ts$/;
// 실제 Date.now() 의 끝 5자리가 모두 0 일 확률은 10만 분의 1 이라, 이런 값은 손으로 지은 것으로 봅니다.
const ROUND_UNIT = 100_000;

const errors = [];
const seen = new Map();
const now = Date.now();

for (const fileName of fs.readdirSync(path.join(ROOT, MIGRATIONS_DIR)).sort()) {
  const filePath = path.join(MIGRATIONS_DIR, fileName);
  const match = FILE_PATTERN.exec(fileName);
  if (!match) {
    errors.push(`${filePath}: 파일명이 <13자리 timestamp>-<이름>.ts 형식이 아닙니다.`);
    continue;
  }
  const [, timestamp, name] = match;
  const source = fs.readFileSync(path.join(ROOT, filePath), "utf8");
  const expected = `${name}${timestamp}`;

  if (Number(timestamp) % ROUND_UNIT === 0) {
    errors.push(`${filePath}: timestamp 가 손으로 지은 둥근 값입니다. migration:create 로 다시 만드세요.`);
  }
  if (Number(timestamp) > now) {
    errors.push(`${filePath}: timestamp 가 현재 시각보다 미래입니다.`);
  }
  if (seen.has(timestamp)) {
    errors.push(`${filePath}: timestamp 가 ${seen.get(timestamp)} 와 같습니다.`);
  }
  seen.set(timestamp, filePath);

  if (!new RegExp(`\\bclass ${expected}\\b`).test(source)) {
    errors.push(`${filePath}: 클래스명이 ${expected} 가 아닙니다.`);
  }
  // name 이 없으면 TypeORM 이 클래스명을 쓰므로, 있을 때만 맞는지 봅니다.
  const nameValue = /\bname\s*=\s*["'`]([^"'`]+)["'`]/.exec(source)?.[1];
  if (nameValue != null && nameValue !== expected) {
    errors.push(`${filePath}: name 이 ${expected} 가 아니라 ${nameValue} 입니다.`);
  }
}

if (errors.length > 0) {
  console.error(errors.join("\n"));
  console.error(`\nDB 마이그레이션 파일 문제 ${errors.length}건.`);
  process.exit(1);
}
