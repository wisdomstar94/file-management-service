/** admin-web 서버 쪽에서만 읽는 환경변수 */
export const webEnv = {
  apiInternalUrl: process.env.API_INTERNAL_URL ?? "http://127.0.0.1:4000",
  jwtSecret: process.env.JWT_SECRET ?? "",
  /** admin-web 앞단에 있는 신뢰할 수 있는 프록시 수. X-Forwarded-For 의 오른쪽에서 이만큼 건너뛴 값을 요청 IP 로 본다. */
  trustedProxyHops: Number(process.env.WEB_TRUSTED_PROXY_HOPS ?? 0),
  isSecureCookie: process.env.WEB_SECURE_COOKIE === "true",
  userWebOrigin: process.env.USER_WEB_ORIGIN ?? "http://localhost:3001",
};
