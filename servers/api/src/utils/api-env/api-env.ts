import { readRequiredEnv } from "@fms/server-utils/envs/read-required-env";

/** api 가 쓰는 환경변수. 기동 시 한 번 읽어 빠진 값이 있으면 바로 실패하게 한다. */
export const apiEnv = {
  port: Number(readRequiredEnv("API_PORT")),
  jwtSecret: readRequiredEnv("JWT_SECRET"),
  corsOrigins: (process.env.API_CORS_ORIGINS ?? "").split(",").filter(Boolean),
  /** express `trust proxy` 값. 비어 있으면 프록시를 신뢰하지 않고 직접 연결된 IP 를 쓴다. */
  trustProxy: process.env.API_TRUST_PROXY ?? "",
  refreshTokenDays: Number(process.env.ADMIN_REFRESH_TOKEN_DAYS ?? 14),
  /** 공개 링크 비밀번호를 한 번 맞히면 다시 묻지 않는 시간(초). */
  shareLinkUnlockExpiresInSeconds: Number(process.env.SHARE_LINK_UNLOCK_EXPIRES_IN_SECONDS ?? 600),
  storageDir: readRequiredEnv("STORAGE_DIR"),
  maxUploadSizeMb: Number(process.env.MAX_UPLOAD_SIZE_MB ?? 1024),
};
