import { spawn } from "node:child_process";
import { existsSync } from "node:fs";

/**
 * 루트 `.env.local` 을 환경변수로 읽은 뒤 뒤따르는 명령을 실행합니다. 이미 설정된 환경변수는 덮어쓰지 않습니다.
 * Next 는 실행 옵션을 worker 의 NODE_OPTIONS 로 넘기는데 `--env-file-if-exists` 는 NODE_OPTIONS 에 허용되지 않아 이 방식을 씁니다.
 *
 * @example node ../../scripts/run-with-root-env.mjs next build
 */
const envFile = new URL("../.env.local", import.meta.url);
if (existsSync(envFile)) {
  const preset = { ...process.env };
  process.loadEnvFile(envFile);
  Object.assign(process.env, preset);
}

const [command, ...args] = process.argv.slice(2);
const child = spawn(command, args, { stdio: "inherit", env: process.env });
child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});
