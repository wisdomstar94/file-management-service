/**
 * 필수 환경변수를 읽습니다. 값이 없거나 빈 문자열이면 어떤 변수가 빠졌는지 담아 예외를 던집니다.
 */
export function readRequiredEnv(name: string): string {
  const value = process.env[name];
  if (value === undefined || value === "") {
    throw new Error(`환경변수 ${name} 가 설정되지 않았습니다.`);
  }
  return value;
}
