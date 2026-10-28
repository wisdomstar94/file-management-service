import cors from "cors";
import type { Express } from "express";
import { apiEnv } from "#/utils/api-env/index.js";

export function corsMiddleware(props: { app: Express }) {
  const { app } = props;

  app.use(
    cors({
      origin: (origin, callback) => {
        if (typeof origin === "string" && !apiEnv.corsOrigins.includes(origin)) {
          callback(new Error("Not Allowed Origin!"));
          return;
        }
        callback(null, true);
      },
      // 로그인 · 공개 링크 잠금 해제 쿠키를 브라우저가 직접 주고받는다.
      credentials: true,
      exposedHeaders: ["Content-Disposition"],
    }),
  );
}
