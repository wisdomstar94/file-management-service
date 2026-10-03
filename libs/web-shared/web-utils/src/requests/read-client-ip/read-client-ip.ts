/**
 * 요청 IP 를 고른다. 앞단 프록시는 자기에게 접속한 주소를 X-Forwarded-For 끝에 붙이므로,
 * 신뢰하는 프록시가 N 개면 오른쪽에서 N 번째 값이 실제 클라이언트다.
 *
 * `trustedProxyHops` 가 0(웹을 직접 노출)이면 마지막 값을 쓴다. Next 서버는 이 헤더가 비어 있을 때만 소켓 IP 로 채우므로,
 * 이때 클라이언트가 보낸 헤더는 걸러낼 수 없다.
 */
export function readClientIp(headers: Headers, trustedProxyHops: number): string {
  const entries = (headers.get("x-forwarded-for") ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
  if (entries.length === 0) {
    return "";
  }
  return entries[Math.max(0, entries.length - Math.max(1, trustedProxyHops))];
}
