import { readClientIp } from "../read-client-ip/index.js";

const DROP_HEADERS = new Set([
  "host",
  "cookie",
  "authorization",
  "connection",
  "content-length",
  "transfer-encoding",
  "keep-alive",
  "upgrade",
  "te",
  "trailer",
  "expect",
  "proxy-authorization",
  "proxy-connection",
  "x-forwarded-for",
  "x-forwarded-host",
  "x-forwarded-port",
  "x-forwarded-proto",
  "x-real-ip",
  // 서버 간 호출이라 브라우저 Origin 은 넘기지 않는다. 넘기면 api 가 브라우저 요청으로 보고 CORS 허용 목록과 대조한다.
  "origin",
]);

/**
 * 브라우저 요청 헤더를 api 로 넘길 헤더로 바꾼다. 접근 정책의 헤더 제한이 원래 요청 헤더로 평가되도록 그대로 넘기고,
 * 요청 IP 는 X-Forwarded-For 한 개로 정리해 넘긴다(api 는 웹 서버를 신뢰 프록시로 둔다).
 */
export function buildApiForwardHeaders(
  incoming: Headers,
  options: { trustedProxyHops: number; accessToken?: string },
): Headers {
  const headers = new Headers();
  incoming.forEach((value, name) => {
    if (!DROP_HEADERS.has(name.toLowerCase())) {
      headers.set(name, value);
    }
  });
  const clientIp = readClientIp(incoming, options.trustedProxyHops);
  if (clientIp) {
    headers.set("x-forwarded-for", clientIp);
  }
  if (options.accessToken) {
    headers.set("authorization", `Bearer ${options.accessToken}`);
  }
  return headers;
}
