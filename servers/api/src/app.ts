import "reflect-metadata";
import express from "express";
import { corsMiddleware } from "./middlewares/cors-middleware/index.js";
import { globalErrorHandlerMiddleware } from "./middlewares/global-error-middleware/index.js";
import { apiRouter } from "./routes/api-router/index.js";
import { apiEnv } from "./utils/api-env/index.js";
import { appDataSource } from "./utils/app-data-source/index.js";
import { readTrustProxySetting } from "./utils/read-trust-proxy-setting/index.js";

await appDataSource.initialize();

const app = express();

app.set("trust proxy", readTrustProxySetting(apiEnv.trustProxy));
corsMiddleware({ app });
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/api", apiRouter);
globalErrorHandlerMiddleware({ app });

app.listen(apiEnv.port, () => {
  console.log(`fms-api listening, ${apiEnv.port} port...`);
});
