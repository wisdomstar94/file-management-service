import { createDataSourceOptions } from "@fms/database-entities/data-sources/create-data-source-options";
import { readRequiredEnv } from "@fms/server-utils/envs/read-required-env";
import { DataSource } from "typeorm";

class AppDataSource extends DataSource {
  constructor() {
    super(
      createDataSourceOptions({
        host: readRequiredEnv("DB_HOST"),
        port: Number(readRequiredEnv("DB_PORT")),
        username: readRequiredEnv("DB_USER"),
        password: readRequiredEnv("DB_PASSWORD"),
        database: readRequiredEnv("DB_NAME"),
      }),
    );
  }
}

export const appDataSource = new AppDataSource();
