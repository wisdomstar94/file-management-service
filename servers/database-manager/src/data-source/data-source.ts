import { createDatabaseManagerDataSource } from "#/utils/create-database-manager-data-source/index.js";

// typeorm CLI(-d)가 이 파일의 default export 를 DataSource 로 읽는다.
export default createDatabaseManagerDataSource();
