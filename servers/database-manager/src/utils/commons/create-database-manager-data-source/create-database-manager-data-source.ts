import "reflect-metadata";
import { fileURLToPath } from "node:url";
import { createDataSourceOptions } from "@fms/database-entities/data-sources/create-data-source-options";
import { readRequiredEnv } from "@fms/server-utils/envs/read-required-env";
import { DataSource } from "typeorm";

const MIGRATIONS_GLOB = fileURLToPath(new URL("../../../migrations/*.js", import.meta.url));

export function createDatabaseManagerDataSource(): DataSource {
  return new DataSource(
    createDataSourceOptions({
      host: readRequiredEnv("DB_HOST"),
      port: Number(readRequiredEnv("DB_PORT")),
      username: readRequiredEnv("DB_USER"),
      password: readRequiredEnv("DB_PASSWORD"),
      database: readRequiredEnv("DB_NAME"),
      migrations: [MIGRATIONS_GLOB],
    }),
  );
}
