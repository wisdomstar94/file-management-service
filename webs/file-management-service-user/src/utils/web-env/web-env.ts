/** user-web 서버 쪽에서만 읽는 환경변수 */
export const webEnv = {
  apiInternalUrl: process.env.API_INTERNAL_URL ?? "http://127.0.0.1:4000",
  /** user-web 앞단에 있는 신뢰할 수 있는 프록시 수. X-Forwarded-For 의 오른쪽에서 이만큼 건너뛴 값을 요청 IP 로 본다. */
  trustedProxyHops: Number(process.env.WEB_TRUSTED_PROXY_HOPS ?? 0),
  isSecureCookie: process.env.WEB_SECURE_COOKIE === "true",
  /** 다운로드 실패 문구를 담아 두는 쿠키 수명(초). 문구를 띄운 화면이 바로 지우므로 리다이렉트 왕복만 버티면 된다. */
  shareDownloadErrorCookieMaxAgeSeconds: Number(process.env.SHARE_LINK_DOWNLOAD_ERROR_COOKIE_MAX_AGE_SECONDS || 10),
};
