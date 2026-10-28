import { readRequiredEnv } from "@fms/server-utils/envs/read-required-env";

/** api 가 쓰는 환경변수. 기동 시 한 번 읽어 빠진 값이 있으면 바로 실패하게 한다. */
export const apiEnv = {
  port: Number(readRequiredEnv("API_PORT")),
  /** 용도마다 다른 JWT 서명 키. 하나가 새도 다른 용도의 토큰은 위조할 수 없다. */
  adminAccessTokenSecret: readRequiredEnv("JWT_SECRET_ADMIN_ACCOUNT"),
  adminShortTimeTokenSecret: readRequiredEnv("JWT_SECRET_ADMIN_SHORT_TIME"),
  shareLinkUnlockTokenSecret: readRequiredEnv("JWT_SECRET_SHARE_LINK_UNLOCK"),
  corsOrigins: (process.env.API_CORS_ORIGINS ?? "").split(",").filter(Boolean),
  /** express `trust proxy` 값. 비어 있으면 프록시를 신뢰하지 않고 직접 연결된 IP 를 쓴다. */
  trustProxy: process.env.API_TRUST_PROXY ?? "",
  refreshTokenDays: Number(process.env.ADMIN_REFRESH_TOKEN_DAYS ?? 14),
  /** 공개 링크 비밀번호를 한 번 맞히면 다시 묻지 않는 시간(초). */
  shareLinkUnlockExpiresInSeconds: Number(process.env.SHARE_LINK_UNLOCK_EXPIRES_IN_SECONDS ?? 600),
  /** 토큰 쿠키를 함께 쓸 상위 도메인. 비우면 api 호스트 한정이다. 쿠키는 포트를 구분하지 않아 로컬은 비워도 된다. */
  cookieDomain: process.env.COOKIE_DOMAIN || undefined,
  isSecureCookie: process.env.API_SECURE_COOKIE === "true",
  /** 공개 링크 다운로드에 실패하면 돌려보낼 공개 링크 화면의 origin */
  userWebOrigin: process.env.USER_WEB_ORIGIN ?? "http://localhost:3001",
  storageDir: readRequiredEnv("STORAGE_DIR"),
  maxUploadSizeMb: Number(process.env.MAX_UPLOAD_SIZE_MB ?? 1024),
};
