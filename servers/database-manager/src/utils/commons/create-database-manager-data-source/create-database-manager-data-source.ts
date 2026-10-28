import "reflect-metadata";
import { createDataSourceOptions } from "@fms/database-entities/data-sources/create-data-source-options";
import { readRequiredEnv } from "@fms/server-utils/envs/read-required-env";
import { DataSource } from "typeorm";
import { MIGRATIONS_GLOB } from "./_consts/migrations-glob/index.js";

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
