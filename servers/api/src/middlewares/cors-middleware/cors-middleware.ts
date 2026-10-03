import cors from "cors";
import type { Express } from "express";
import { apiEnv } from "../../utils/api-env/index.js";

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
      exposedHeaders: ["Content-Disposition"],
    }),
  );
}
